"use server";

import { RecoveryFormParams, RecoveryFormSchema } from "@/lib/forms";
import { createClient } from "@/utils/supabase/server";

export async function recoverPassword(
  formData: RecoveryFormParams
): Promise<{ success?: boolean; message?: string; error?: unknown }> {
  const supabase = await createClient();
  const { email } = formData;

  // Validate form data using Zod schema
  const validationResults = RecoveryFormSchema.safeParse(formData);
  if (!validationResults.success) {
    const errors = validationResults.error.flatten();
    return { error: errors.fieldErrors };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/update-password`,
  });

  if (error) {
    if (error.code === "user_not_found") {
      return { error: { email: ["Email not found"] } };
    }
    console.error("Error sending recovery email:", error);
    return {
      message: `An error occurred while sending the recovery email with error code: ${error.code}`,
    };
  }

  // Simulate success
  return { success: true };
}
