"use server";

import {
  ElectionCandidateFormParams,
  ElectionCandidateFormSchema,
  ElectionVoterFormParams,
  ElectionVoterFormSchema,
} from "@/lib/forms";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- Election Candidate Actions ---

export async function getElectionCandidates(electionId: string) {
  const supabaseInstance = await createClient();
  const { data, error } = await supabaseInstance
    .from("candidates")
    .select(
      `
      id,
      election_id,
      position_id,
      party,
      display_name,
      image_url,
      created_at,
      updated_at,
      group_id, 
      positions ( name ),
      usergroups ( name )
    `
    )
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }
  return { data };
}

export async function createElectionCandidate(
  electionId: string,
  formData: ElectionCandidateFormParams
) {
  const supabaseInstance = await createClient();
  const validation = ElectionCandidateFormSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  const { display_name, party, position_id, image_url, group_id } = validation.data;
  const { data: newCandidate, error } = await supabaseInstance
    .from("candidates")
    .insert([
      {
        election_id: electionId,
        display_name,
        party,
        position_id,
        image_url: image_url || null,
        group_id: group_id || null, // Save group_id
      },
    ])
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/users/candidates`);
  return {
    success: true,
    message: "Candidate created successfully.",
    data: newCandidate,
  };
}

export async function updateElectionCandidate(
  candidateId: string,
  electionId: string,
  formData: ElectionCandidateFormParams
) {
  const supabaseInstance = await createClient();
  const validation = ElectionCandidateFormSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  const { display_name, party, position_id, image_url, group_id } = validation.data;
  const { data: updatedCandidate, error } = await supabaseInstance
    .from("candidates")
    .update({
      display_name,
      party,
      position_id,
      image_url: image_url || null,
      group_id: group_id || null, // Update group_id
      updated_at: new Date().toISOString(),
    })
    .eq("id", candidateId)
    .eq("election_id", electionId)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/users/candidates`);
  return {
    success: true,
    message: "Candidate updated successfully.",
    data: updatedCandidate,
  };
}

export async function deleteElectionCandidate(
  candidateId: string,
  electionId: string
) {
  const supabaseInstance = await createClient();
  const { error } = await supabaseInstance
    .from("candidates")
    .delete()
    .eq("id", candidateId)
    .eq("election_id", electionId);

  if (error) {
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/users/candidates`);
  return { success: true, message: "Candidate deleted successfully." };
}

// --- Election Voter Actions ---

export async function getElectionVoters(electionId: string) {
  const supabaseInstance = await createClient();
  const { data, error } = await supabaseInstance
    .from("voters")
    .select(
      `
      id,
      election_id,
      email,
      group_id,
      created_at,
      updated_at,
      usergroups ( name ) 
    `
    )
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }
  return { data };
}

export async function createElectionVoter(
  electionId: string,
  formData: ElectionVoterFormParams
) {
  const supabaseInstance = await createClient();
  const validation = ElectionVoterFormSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  let { email } = validation.data;
  const { group_id } = validation.data;
  email = email.toLowerCase(); // Convert email to lowercase

  // Check if voter with this email already exists for this election
  const { data: existingVoter, error: existingVoterError } = await supabaseInstance
    .from("voters")
    .select("id")
    .eq("election_id", electionId)
    .eq("email", email)
    .maybeSingle();

  if (existingVoterError && existingVoterError.code !== "PGRST116") {
    // PGRST116 means no rows found, which is fine. Any other error is a problem.
    console.error(
      "Error checking for existing voter in createElectionVoter:",
      existingVoterError
    );
    return {
      success: false,
      message: "Database error checking for existing voter.",
      errorType: "db",
    };
  }

  if (existingVoter) {
    return {
      success: false,
      message: "A voter with this email already exists in this election.",
      errorType: "validation",
      errors: { email: ["Email already registered for this election."] },
    };
  }

  const { data: newVoter, error: insertError } = await supabaseInstance
    .from("voters")
    .insert([
      {
        election_id: electionId,
        email, // Already lowercased
        group_id: group_id || null, 
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error("Error creating new voter in createElectionVoter:", insertError);
    return {
      success: false,
      message: insertError.message,
      errorType: "db",
    };
  }

  // Increment voter_count in the elections table
  const { error: rpcError } = await supabaseInstance.rpc(
    "increment_election_voter_count",
    { election_id_param: electionId, amount: 1 }
  );

  if (rpcError) {
    console.error("Error incrementing voter count in createElectionVoter:", rpcError);
    // Non-critical error for the user, but log it. The voter was added.
  }

  revalidatePath(`/dashboard/${electionId}/users/voters`);
  revalidatePath(`/dashboard/${electionId}`); // For overview/analytics cards
  revalidatePath(`/dashboard/${electionId}/analytics`);
  revalidatePath("/dashboard"); // For the main dashboard election cards
  return {
    success: true,
    message: "Voter created successfully.",
    data: newVoter,
  };
}

export async function updateElectionVoter(
  voterId: string,
  electionId: string,
  formData: ElectionVoterFormParams
) {
  const supabaseInstance = await createClient();
  const validation = ElectionVoterFormSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  let { email } = validation.data;
  const { group_id } = validation.data;
  email = email.toLowerCase(); // Convert email to lowercase

  const { data: updatedVoter, error } = await supabaseInstance
    .from("voters")
    .update({
      email, // Already lowercased
      group_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", voterId)
    .eq("election_id", electionId)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/users/voters`);
  return {
    success: true,
    message: "Voter updated successfully.",
    data: updatedVoter,
  };
}

export async function addElectionVoter(
  electionId: string,
  formData: ElectionVoterFormParams
) {
  const supabaseInstance = await createClient();
  const validation = ElectionVoterFormSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  let { email } = validation.data;
  const { group_id } = validation.data;
  email = email.toLowerCase(); // Convert email to lowercase

  // Check if voter with this email already exists for this election
  const { data: existingVoter, error: existingVoterError } = await supabaseInstance
    .from("voters")
    .select("id")
    .eq("election_id", electionId)
    .eq("email", email)
    .maybeSingle();

  if (existingVoterError && existingVoterError.code !== "PGRST116") {
    // PGRST116 means no rows found, which is fine. Any other error is a problem.
    console.error("Error checking for existing voter:", existingVoterError);
    return {
      success: false,
      message: "Database error checking for existing voter.",
      errorType: "db",
    };
  }

  if (existingVoter) {
    return {
      success: false,
      message: "A voter with this email already exists in this election.",
      errorType: "validation", // Or a custom error type
      errors: { email: ["Email already registered for this election."] },
    };
  }

  const { data: newVoter, error: insertError } = await supabaseInstance
    .from("voters")
    .insert([
      {
        election_id: electionId,
        email, // Already lowercased
        group_id: group_id || null, 
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error("Error creating new voter:", insertError);
    return {
      success: false,
      message: insertError.message,
      errorType: "db",
    };
  }

  // Increment voter_count in the elections table
  const { error: rpcError } = await supabaseInstance.rpc(
    "increment_election_voter_count",
    { election_id_param: electionId, amount: 1 }
  );

  if (rpcError) {
    console.error("Error incrementing voter count:", rpcError);
    // Non-critical error for the user, but log it. The voter was added.
    // Optionally, you could try to revert the voter addition or handle this more gracefully.
  }

  revalidatePath(`/dashboard/${electionId}/users/voters`);
  revalidatePath(`/dashboard/${electionId}`); // For overview/analytics cards
  revalidatePath(`/dashboard/${electionId}/analytics`);
  revalidatePath("/dashboard"); // For the main dashboard election cards
  return {
    success: true,
    message: "Voter added successfully.",
    data: newVoter,
  };
}

export async function deleteElectionVoter(voterId: string, electionId: string) {
  const supabaseInstance = await createClient();

  // Optional: Check if the voter belongs to the electionId for added security, though RLS should handle this.

  const { error: deleteError } = await supabaseInstance
    .from("voters")
    .delete()
    .eq("id", voterId)
    .eq("election_id", electionId); // Ensure voter belongs to this election

  if (deleteError) {
    return { success: false, message: deleteError.message, errorType: "db" };
  }

  // Decrement voter_count in the elections table
  const { error: rpcError } = await supabaseInstance.rpc(
    "increment_election_voter_count",
    { election_id_param: electionId, amount: -1 }
  );

  if (rpcError) {
    console.error("Error decrementing voter count:", rpcError);
    // Non-critical error for the user, but log it. The voter was deleted.
  }

  revalidatePath(`/dashboard/${electionId}/users/voters`);
  revalidatePath(`/dashboard/${electionId}`); // For overview/analytics cards
  revalidatePath(`/dashboard/${electionId}/analytics`);
  revalidatePath("/dashboard"); // For the main dashboard election cards
  return { success: true, message: "Voter deleted successfully." };
}

// --- Candidate Actions ---
