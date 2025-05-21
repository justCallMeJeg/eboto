"use server";

import {
  ElectionGroupFormParams,
  ElectionGroupFormSchema,
  ElectionPositionFormParams,
  ElectionPositionFormSchema,
} from "@/lib/forms"; // Added ElectionPosition types
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- Election Group Actions ---

export async function getElectionGroups(electionId: string) {
  const supabaseInstance = await createClient();

  const { data, error } = await supabaseInstance
    .from("usergroups")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }
  return { data };
}

export async function createElectionGroup(
  electionId: string,
  formData: ElectionGroupFormParams
) {
  const supabaseInstance = await createClient();

  const validation = ElectionGroupFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  const { name } = validation.data;
  const { data: newGroup, error } = await supabaseInstance
    .from("usergroups")
    .insert([{ election_id: electionId, name: name }])
    .select()
    .single();

  if (error) {
    console.error("Error creating new group:", error);
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/configurations/groups`);
  return {
    success: true,
    message: "Group created successfully.",
    data: newGroup,
  };
}

export async function updateElectionGroup(
  groupId: string,
  electionId: string,
  formData: ElectionGroupFormParams
) {
  const supabaseInstance = await createClient();

  const validation = ElectionGroupFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  const { name } = validation.data;
  const { data: updatedGroup, error } = await supabaseInstance
    .from("usergroups")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", groupId)
    .eq("election_id", electionId) // Ensure it's for the correct election
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/configurations/groups`);
  return {
    success: true,
    message: "Group updated successfully.",
    data: updatedGroup,
  };
}

export async function deleteElectionGroup(groupId: string, electionId: string) {
  const supabaseInstance = await createClient();

  const { error } = await supabaseInstance
    .from("usergroups")
    .delete()
    .eq("id", groupId)
    .eq("election_id", electionId);

  if (error) {
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/configurations/groups`);
  return { success: true, message: "Group deleted successfully." };
}

// --- Election Position Actions ---

export async function getElectionPositions(electionId: string) {
  const supabaseInstance = await createClient();

  const { data, error } = await supabaseInstance
    .from("positions")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }
  return { data };
}

export async function createElectionPosition(
  electionId: string,
  formData: ElectionPositionFormParams
) {
  const supabaseInstance = await createClient();

  const validation = ElectionPositionFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  const { name } = validation.data;
  const { data: newPosition, error } = await supabaseInstance
    .from("positions")
    .insert([
      {
        election_id: electionId,
        name,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating new position:", error);
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/configurations/positions`);
  return {
    success: true,
    message: "Position created successfully.",
    data: newPosition,
  };
}

export async function updateElectionPosition(
  positionId: string,
  electionId: string,
  formData: ElectionPositionFormParams
) {
  const supabaseInstance = await createClient();

  const validation = ElectionPositionFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  const { name } = validation.data;
  const { data: updatedPosition, error } = await supabaseInstance
    .from("positions")
    .update({
      name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", positionId)
    .eq("election_id", electionId)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/configurations/positions`);
  return {
    success: true,
    message: "Position updated successfully.",
    data: updatedPosition,
  };
}

export async function deleteElectionPosition(positionId: string, electionId: string) {
  const supabaseInstance = await createClient();

  const { error } = await supabaseInstance
    .from("positions")
    .delete()
    .eq("id", positionId)
    .eq("election_id", electionId);

  if (error) {
    return { success: false, message: error.message, errorType: "db" };
  }
  revalidatePath(`/dashboard/${electionId}/configurations/positions`);
  return { success: true, message: "Position deleted successfully." };
}