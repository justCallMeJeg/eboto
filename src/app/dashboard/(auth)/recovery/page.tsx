import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ForgotPasswordForm from "./form";

export const metadata: Metadata = {
  title: "Forgot Password | eBOTO",
  description: "Reset your eBOTO password",
};

export default async function ForgotPasswordPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Forgot password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&#39;ll send you a link.
          </p>
        </div>
        <div className="grid gap-6">
          <ForgotPasswordForm />
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/dashboard/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
