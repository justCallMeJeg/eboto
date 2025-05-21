"use server";

import { ElectionData, ElectionStatus } from "@/lib/data";
import { NewElectionFormParams, NewElectionFormSchema } from "@/lib/forms";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createNewElection(formData: NewElectionFormParams): Promise<{ success?: boolean; message?: string; error?: unknown, data?: ElectionData }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: "User not authenticated.", error: { auth: "User not authenticated." } };
  }

  const validationResults = NewElectionFormSchema.safeParse(formData);
  if (!validationResults.success) {
    const errors = validationResults.error.flatten();
    return { message: "Validation failed.", error: errors.fieldErrors };
  }

  const { name, description, start_date, end_date } = validationResults.data;

  const { data: newElection, error: insertError } = await supabase
    .from("elections")
    .insert([
      {
        name,
        description: description || null,
        start_date,
        end_date,
        owner_id: user.id,
        status: ElectionStatus["Pre-Election"]
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error("Error creating new election:", insertError);
    return { message: `Failed to create election: ${insertError.message}`, error: { db: insertError.message } };
  }

  revalidatePath("/dashboard"); // Revalidate the dashboard page to show the new election
  return { success: true, message: "Election created successfully!", data: newElection };
}
