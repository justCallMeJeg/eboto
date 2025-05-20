import { Metadata } from "next";
import { redirect } from "next/navigation";
import PasswordRecoveryForm from "./form";

export const metadata: Metadata = {
  title: "Update Password | eBOTO",
  description: "Recover your eBOTO password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { code } = await searchParams;
  if (!code) {
    redirect("/dashboard/recovery");
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Setup New Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password to update your account.
          </p>
        </div>
        <div className="grid gap-6">
          <PasswordRecoveryForm />
        </div>
      </div>
    </div>
  );
}
