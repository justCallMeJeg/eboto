"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoterLoginFormFields, VoterLoginFormSchema } from "@/lib/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { sendVoterMagicLinkAction } from "./actions";

export default function VoterLoginPage() {
  const params = useParams();
  const electionId = params.id as string;

  const [isPending, startTransition] = useTransition();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const form = useForm<VoterLoginFormFields>({
    resolver: zodResolver(VoterLoginFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: VoterLoginFormFields) => {
    setFormMessage(null);
    startTransition(async () => {
      const result = await sendVoterMagicLinkAction(electionId, data);
      if (result.success) {
        toast.success(result.message);
        setFormMessage(result.message);
        setMessageType("success");
        form.reset(); // Clear the form on success
      } else {
        console.error("Error sending magic link:", result);
        toast.error(result.message);
        setFormMessage(result.message);
        setMessageType("error");
        if (result.errors?.email) {
          form.setError("email", { message: result.errors.email.join(", ") });
        }
      }
    });
  };

  if (!electionId) {
    // Should not happen if routing is correct
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted p-4">
        <p>Election ID is missing. Invalid page.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <MailIcon className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-2xl font-bold">
            Voter Access
          </CardTitle>
          <CardDescription>
            Enter your email to receive a secure link to access the election
            ballot.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
                disabled={isPending || messageType === "success"}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            {formMessage && (
              <p
                className={`text-sm ${
                  messageType === "success"
                    ? "text-green-600"
                    : "text-destructive"
                }`}
              >
                {formMessage}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || messageType === "success"}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {messageType === "success" ? "Link Sent!" : "Send Login Link"}
            </Button>
            {messageType === "success" && (
              <p className="mt-4 text-sm text-muted-foreground">
                You can close this page now. Check your email.
              </p>
            )}
          </CardFooter>
        </form>
        <div className="mt-4 px-6 pb-6 text-center text-sm">
          <Link href="/" className="text-primary hover:underline">
            Back to Homepage
          </Link>
        </div>
      </Card>
    </div>
  );
}
