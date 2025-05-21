"use server";

import {
  ElectionData,
  ElectionStatus,
  InitialRealtimeData,
  RealtimeCandidateData,
  RealtimePositionData,
  VoteData,
} from "@/lib/data";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getElectionDetails(
  electionId: string
): Promise<{ data?: ElectionData | null; error?: string }> {
  const supabase = await createClient(); // Initialize client inside the function and await
  const { data: election, error } = await supabase
    .from("elections")
    .select("*")
    .eq("id", electionId)
    .single();

  if (error) {
    console.error("Error fetching election details:", error);
    return { error: error.message };
  }
  return { data: election };
}

export interface ElectionAnalyticsData {
  totalRegisteredVoters: number;
  totalVotesCast: number;
  voterTurnoutPercentage: number;
  // We can add more detailed analytics later, e.g., votesPerCandidate
}

export async function getElectionAnalyticsData(
  electionId: string
): Promise<{ data?: ElectionAnalyticsData; error?: string }> {
  const supabase = await createClient();

  // 1. Get total registered voters from the election itself
  const { data: electionData, error: electionError } = await supabase
    .from("elections")
    .select("voter_count")
    .eq("id", electionId)
    .single();

  if (electionError || !electionData) {
    console.error("Error fetching election for analytics:", electionError);
    return { error: "Could not fetch election data for analytics." };
  }
  const totalRegisteredVoters = electionData.voter_count || 0;

  // 2. Get total votes cast (count of distinct voters who submitted a ballot)
  // Assuming 'ballots' table has 'election_id' and 'voter_id'
  const { count: totalVotesCast, error: votesError } = await supabase
    .from("ballots")
    .select("voter_id", { count: "exact", head: true })
    .eq("election_id", electionId);

  if (votesError) {
    console.error("Error fetching total votes cast:", votesError);
    // If election hasn't started or no votes yet, count might be null, not an error.
    // However, a true db error should be reported. For now, we'll assume 0 if error.
    // A more robust solution would differentiate.
  }

  const votesCast = totalVotesCast || 0;
  const voterTurnoutPercentage =
    totalRegisteredVoters > 0
      ? (votesCast / totalRegisteredVoters) * 100
      : 0;

  return {
    data: {
      totalRegisteredVoters,
      totalVotesCast: votesCast,
      voterTurnoutPercentage: parseFloat(voterTurnoutPercentage.toFixed(2)),
    },
  };
}

export async function getInitialRealtimeVoteData(
  electionId: string
): Promise<{ data?: InitialRealtimeData; error?: string }> {
  const supabase = await createClient();

  // 1. Get Election Details (Name and Status)
  const { data: electionInfo, error: electionInfoError } = await supabase
    .from("elections")
    .select("name, status")
    .eq("id", electionId)
    .single();

  if (electionInfoError || !electionInfo) {
    return { error: "Failed to fetch election details." };
  }

  // 2. Get all positions for the election
  const { data: positions, error: positionsError } = await supabase
    .from("positions")
    .select("id, name")
    .eq("election_id", electionId)
    .order("name", { ascending: true });

  if (positionsError) {
    return { error: "Failed to fetch positions." };
  }
  if (!positions) {
    return { data: { electionName: electionInfo.name, electionStatus: electionInfo.status, positions: [] } };
  }

  // 3. Get all candidates for the election
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, position_id, display_name, party, image_url")
    .eq("election_id", electionId);

  if (candidatesError) {
    return { error: "Failed to fetch candidates." };
  }

  // 4. Get all ballots and count votes
  const { data: ballots, error: ballotsError } = await supabase
    .from("ballots")
    .select("votes") // votes is a JSONB array: [{ candidate_id, position_id }, ...]
    .eq("election_id", electionId);

  if (ballotsError) {
    return { error: "Failed to fetch ballots for vote counting." };
  }

  const voteCounts: Record<string, number> = {}; // candidate_id -> count
  if (ballots) {
    for (const ballot of ballots) {
      if (ballot.votes && Array.isArray(ballot.votes)) {
        const votesArray = ballot.votes as VoteData[]; // Cast to VoteData[]
        for (const vote of votesArray) {
          voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
        }
      }
    }
  }

  // 5. Structure the data
  const structuredPositions: RealtimePositionData[] = positions.map(
    (pos) => {
      const positionCandidates: RealtimeCandidateData[] = (
        candidates || []
      )
        .filter((cand) => cand.position_id === pos.id)
        .map((cand) => ({
          id: cand.id,
          display_name: cand.display_name,
          party: cand.party,
          image_url: cand.image_url,
          voteCount: voteCounts[cand.id] || 0,
        }))
        .sort((a, b) => b.voteCount - a.voteCount || a.display_name.localeCompare(b.display_name)); // Sort by vote count, then name

      return {
        id: pos.id,
        name: pos.name,
        candidates: positionCandidates,
      };
    }
  );

  return {
    data: {
      electionName: electionInfo.name,
      electionStatus: electionInfo.status,
      positions: structuredPositions,
    },
  };
}

export async function startElectionAction(
  electionId: string
): Promise<{ success?: boolean; message?: string; error?: string }> {
  const supabase = await createClient(); // Initialize client inside the function and await
  // First, verify the user is the owner (optional, but good practice if not handled by RLS)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User not authenticated." };
  }

  const { data: election, error: fetchError } = await supabase
    .from("elections")
    .select("owner_id, status")
    .eq("id", electionId)
    .single();

  if (fetchError || !election) {
    return { error: "Election not found or error fetching it." };
  }

  if (election.owner_id !== user.id) {
    return { error: "You are not authorized to start this election." };
  }

  if (election.status !== ElectionStatus["Pre-Election"]) {
    return { error: "Election cannot be started from its current state." };
  }

  const { error: updateError } = await supabase
    .from("elections")
    .update({ status: ElectionStatus["Ongoing"] })
    .eq("id", electionId);

  if (updateError) {
    console.error("Error starting election:", updateError);
    return { error: updateError.message };
  }

  revalidatePath(`/dashboard/${electionId}`);
  revalidatePath(`/dashboard/${electionId}/overview`); // if you have a specific overview sub-route
  return { success: true, message: "Election started successfully." };
}
