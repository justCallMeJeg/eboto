"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RecoveryFormSchema } from "@/lib/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { recoverPassword } from "./actions";

export default function ForgotPasswordForm() {
  const [loading, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof RecoveryFormSchema>>({
    resolver: zodResolver(RecoveryFormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof RecoveryFormSchema>) {
    setServerError(null);
    startTransition(async () => {
      const result = await recoverPassword(values);
      console.log("result", result);
      if (result?.error) {
        if (typeof result.error === "object") {
          Object.entries(result.error).forEach(([field, messages]) => {
            form.setError(field as keyof typeof values, {
              type: "server",
              message: Array.isArray(messages) ? messages[0] : String(messages),
            });
          });
        }
      } else if (result?.message) {
        setServerError(result.message);
      } else if (result?.success) {
        toast.success("Recovery email sent successfully!");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {serverError && (
            <div className="text-sm text-red-600">{serverError}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
