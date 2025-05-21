"use server";

import { ElectionGroupFormParams, ElectionGroupFormSchema } from "@/lib/forms";
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

export async function createElectionGroup(electionId: string, formData: ElectionGroupFormParams) {
  const supabaseInstance = await createClient();

  const validation = ElectionGroupFormSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, message: "Validation failed.", errors: validation.error.flatten().fieldErrors, errorType: "validation" };
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
  return { success: true, message: "Group created successfully.", data: newGroup };
}

export async function updateElectionGroup(groupId: string, electionId: string, formData: ElectionGroupFormParams) {
  const supabaseInstance = await createClient();

  const validation = ElectionGroupFormSchema.safeParse(formData);
  if (!validation.success) {
     return { success: false, message: "Validation failed.", errors: validation.error.flatten().fieldErrors, errorType: "validation" };
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
  return { success: true, message: "Group updated successfully.", data: updatedGroup };
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

// --- Election Position Actions (Placeholder structure) ---
// Similar CRUD actions for Election Positions will go here
// createElectionPosition, getElectionPositions, updateElectionPosition, deleteElectionPosition
