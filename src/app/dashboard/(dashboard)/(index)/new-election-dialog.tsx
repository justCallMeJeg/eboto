"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ElectionData } from "@/lib/data";
import {
  NewElectionFormFieldType,
  NewElectionFormParams,
  NewElectionFormSchema,
} from "@/lib/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createNewElection } from "./actions";

interface NewElectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onElectionCreated: (newElection: ElectionData) => void;
}

export function NewElectionDialogForm({
  open,
  onOpenChange,
  onElectionCreated,
}: NewElectionDialogProps) {
  const [loading, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<NewElectionFormParams>({
    resolver: zodResolver(NewElectionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
    },
  });

  async function onSubmit(values: NewElectionFormParams) {
    setServerError(null);
    startTransition(async () => {
      const result = await createNewElection(values);
      if (result.error) {
        if (
          typeof result.error === "object" &&
          result.error !== null &&
          "db" in result.error
        ) {
          setServerError(
            String((result.error as { db: string }).db) ||
              "An unknown database error occurred."
          );
        } else if (typeof result.error === "object" && result.error !== null) {
          Object.entries(result.error).forEach(([field, messages]) => {
            form.setError(field as NewElectionFormFieldType, {
              type: "server",
              message: Array.isArray(messages) ? messages[0] : String(messages),
            });
          });
        } else {
          setServerError(result.message || "An unknown error occurred.");
        }
        toast.error(result.message || "Failed to create election.");
      } else if (result.success && result.data) {
        toast.success("Election created successfully!");
        onElectionCreated(result.data);
        form.reset();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.reset();
          setServerError(null);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Election</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new election. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Election Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Student Council Election 2024"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the election."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && (
              <p className="text-sm text-red-600">{serverError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setServerError(null);
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Election"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
