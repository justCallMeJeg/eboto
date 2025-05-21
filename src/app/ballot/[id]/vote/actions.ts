"use server";

import { BallotPageData, BallotPosition, ElectionStatus, VoterInfoForBallot } from "@/lib/data";
import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";

interface ServerResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string | null;
    errorType?: "db" | "not_found" | "validation" | "auth" | "unknown";
    message?: string; // For success messages or more detailed error messages
}

// Function to fetch all necessary data for the ballot page
export async function getBallotVoterAndElectionData(
    electionId: string,
    userEmail: string
  ): Promise<ServerResponse<BallotPageData>> {
    const supabase = await createClient(); // Corrected: createClient is not async
  
    try {
      // 1. Get Election Details
      const { data: electionData, error: electionError } = await supabase
        .from("elections")
        .select("id, name, status")
        .eq("id", electionId)
        .single(); 
  
      if (electionError) {
        console.error("Error fetching election details in getBallotVoterAndElectionData:", electionError);
        if (electionError.message.includes("JSON object requested, multiple (or no) rows returned")) {
          return { 
            success: false, 
            error: `Election with ID '${electionId}' not found. Please ensure the election link is correct.`, 
            errorType: "not_found" 
          };
        }
        // For other types of errors fetching election details
        throw electionError; // Rethrow to be caught by the main catch block
      }
      // This check might seem redundant if electionError handles "no rows", but it's a safeguard.
      if (!electionData) {
        return { 
          success: false, 
          error: `Election with ID '${electionId}' not found.`, 
          errorType: "not_found" 
        };
      }
  
      // 2. Get Voter Information (including if they have voted)
      let voterInfo: VoterInfoForBallot | null = null;
      const normalizedUserEmail = userEmail.toLowerCase(); // Ensure email is lowercased for query
      const { data: voterData, error: voterError } = await supabase
        .from("voters")
        .select("id, email, group_id, has_voted")
        .eq("election_id", electionId)
        .eq("email", normalizedUserEmail) // Query with lowercased email
        .maybeSingle(); // Use .maybeSingle()
  
      if (voterError) {
        // PGRST114: Multiple rows returned by maybeSingle()
        if (voterError.code === "PGRST114") {
            console.error("Multiple voter records found:", voterError);
            return { 
                success: false, 
                error: "Multiple voter records found for this email in this election. Please contact the election administrator.", 
                errorType: "db" 
            };
        }
        // For other errors, re-throw to be caught by the generic catch block
        console.error("Error fetching voter data:", voterError);
        throw voterError;
      }
      
      if (voterData) {
        voterInfo = {
          id: voterData.id,
          email: voterData.email,
          groupId: voterData.group_id,
          hasVoted: voterData.has_voted || false,
        };
      } else {
        // Voter not found for this election with this email
        return {
          success: true, // Request succeeded, but voter not part of election
          data: {
            electionId: electionData.id,
            electionName: electionData.name,
            electionStatus: electionData.status as ElectionStatus,
            voterInfo: null, // Explicitly null
            positions: [], // No positions if voter not found or not eligible
          },
          message: "This email is not registered for this election. Please check the email address or contact the election administrator."
        };
      }
  
      // If voter has already voted, or election is not ongoing, no need to fetch positions/candidates
      if (voterInfo.hasVoted || electionData.status !== ElectionStatus.Ongoing) {
        return {
          success: true,
          data: {
            electionId: electionData.id,
            electionName: electionData.name,
            electionStatus: electionData.status as ElectionStatus,
            voterInfo: voterInfo,
            positions: [], // No need to show positions if already voted or election not ongoing
          },
        };
      }
  
      // 3. Get Positions and their Candidates for this election
      //    (Potentially filtered by voter's group_id if applicable - current schema doesn't link positions to groups directly)
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select(
          `
          id,
          name,
          candidates (
            id,
            display_name,
            party,
            image_url,
            group_id 
          )
        `
        )
        .eq("election_id", electionId)
        .order("created_at", { ascending: true }); // Order positions
        // TODO: If candidates need ordering: .order("created_at", { foreignTable: "candidates", ascending: true });
  
      if (positionsError) throw positionsError;
  
      const ballotPositions: BallotPosition[] = (positionsData || []).map((p) => {
        const filteredCandidates = (p.candidates || []).filter((cand) => {
          // Candidate is available if:
          // 1. Candidate has no specific group_id (available to all)
          // 2. Candidate's group_id matches the voter's group_id
          return !cand.group_id || cand.group_id === voterInfo?.groupId;
        }).map((c) => ({ 
          id: c.id,
          display_name: c.display_name,
          party: c.party,
          image_url: c.image_url,
        }));
        
        return {
          id: p.id,
          name: p.name,
          candidates: filteredCandidates,
        };
      }).filter(p => p.candidates.length > 0); // Optionally, only include positions that have eligible candidates for this voter  
  
      return {
        success: true,
        data: {
          electionId: electionData.id,
          electionName: electionData.name,
          electionStatus: electionData.status as ElectionStatus,
          voterInfo: voterInfo,
          positions: ballotPositions,
        },
      };
    } catch (e) {
      const error = e as PostgrestError | Error;
      console.error("Error fetching ballot data:", error);
      return {
        success: false,
        error: `Failed to load ballot information: ${error.message}`,
        errorType: "db",
      };
    }
}

export async function submitBallotAction(
    electionId: string,
    voterId: string, // Added voterId
    votes: Record<string, string> // { positionId: candidateId }
  ): Promise<ServerResponse> {
    const supabase = await createClient(); // Corrected: createClient is not async
  
    try {
      // 0. Verify election status and if voter has already voted (again, server-side)
      const { data: election, error: electionCheckError } = await supabase
        .from("elections")
        .select("status")
        .eq("id", electionId)
        .single();

      if (electionCheckError) throw electionCheckError;
      if (!election) return { success: false, error: "Election not found.", errorType: "not_found" };
      if (election.status !== ElectionStatus.Ongoing) {
        return { success: false, error: "This election is not currently active for voting.", errorType: "validation" };
      }

      const { data: voter, error: voterCheckError } = await supabase
        .from("voters")
        .select("has_voted")
        .eq("id", voterId)
        .eq("election_id", electionId)
        .single();

      if (voterCheckError) throw voterCheckError;
      if (!voter) return { success: false, error: "Voter not found for this election.", errorType: "not_found" };
      if (voter.has_voted) {
        return { success: false, error: "You have already submitted your vote for this election.", errorType: "validation" };
      }

      // 1. Prepare votes for insertion
      const votesToInsert = Object.entries(votes).map(([position_id, candidate_id]) => ({
        election_id: electionId,
        voter_id: voterId, // Use the authenticated voter's ID
        position_id,
        candidate_id,
      }));
  
      if (votesToInsert.length === 0) {
        // Handle empty ballot submission - mark as voted without inserting votes
        // Or return a message if empty ballots are not allowed for filled positions
      } else {
         // 2. Insert votes into the 'ballot_entries' table (or your equivalent votes table)
        const { error: insertVotesError } = await supabase
            .from("ballot_entries") // Assuming your table for individual votes is 'ballot_entries'
            .insert(votesToInsert);
    
        if (insertVotesError) throw insertVotesError;
      }
  
      // 3. Mark the voter as 'has_voted' in the 'voters' table
      const { error: updateVoterError } = await supabase
        .from("voters")
        .update({ has_voted: true, voted_at: new Date().toISOString() })
        .eq("id", voterId)
        .eq("election_id", electionId);
  
      if (updateVoterError) throw updateVoterError;
  
      return { success: true, message: "Your ballot has been successfully submitted." };
  
    } catch (e) {
      const error = e as PostgrestError | Error;
      console.error("Error submitting ballot:", error);
      // Check for specific Supabase error codes if needed
      if ("code" in error && error.code === "23505") { // unique_violation
        return { success: false, error: "It appears you have already voted or there was a conflict submitting your vote.", errorType: "db" };
      }
      return { success: false, error: `Failed to submit ballot: ${error.message}`, errorType: "db" };
    }
}
