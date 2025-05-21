"use server";

import { VoterLoginFormFields, VoterLoginFormSchema } from "@/lib/forms";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

interface VoterLoginResponse {
  success: boolean;
  message: string;
  errorType?: "validation" | "db" | "not_found" | "email_send_failed";
  errors?: Partial<Record<keyof VoterLoginFormFields, string[]>>;
}

export async function sendVoterMagicLinkAction(
  electionId: string,
  formData: VoterLoginFormFields
): Promise<VoterLoginResponse> {
  const origin = (await headers()).get("origin");
  const supabase = createClient();

  const validation = VoterLoginFormSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
      errorType: "validation",
    };
  }

  const { email } = validation.data;
  
  // 1. Check if the email is a registered voter for this election
  const { data: voter, error: voterError } = await (await supabase)
    .from("voters")
    .select("id, email")
    .eq("election_id", electionId)
    .eq("email", email) // Query with lowercased email
    .maybeSingle();

  if (voterError) {
    console.error("Error checking voter registration:", voterError);
    return {
      success: false,
      message: "Database error. Could not verify voter status.",
      errorType: "db",
    };
  }
  // Check if voter exists
  console.log("Voter data:", voter);
  if (!voter) {
    return {
      success: false,
      message:
        "This email is not registered for this election. Please check the email address or contact the election administrator.",
      errorType: "not_found",
    };
  }

  // 2. Send magic link to redirect to the actual ballot page
  const redirectTo = `${origin}/ballot/${electionId}/vote`; // Corrected redirection path

  const { error: signInError } = await (await supabase).auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  });

  if (signInError) {
    console.error("Error sending magic link:", signInError);
    return {
      success: false,
      message: `Failed to send login link: ${signInError.message}`,
      errorType: "email_send_failed",
    };
  }

  return {
    success: true,
    message:
      "Login link sent! Please check your email to access the ballot. The link will redirect you to the ballot page.",
  };
}
