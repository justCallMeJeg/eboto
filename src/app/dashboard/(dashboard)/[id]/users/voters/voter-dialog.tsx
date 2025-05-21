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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ElectionGroup } from "@/lib/data";
import {
  ElectionVoterFormFieldType,
  ElectionVoterFormParams,
  ElectionVoterFormSchema,
} from "@/lib/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getElectionGroups } from "../../configurations/actions"; // Action to get groups
import { createElectionVoter, updateElectionVoter } from "../actions";
import { VoterWithGroupName } from "./columns";

interface VoterDialogProps {
  electionId: string;
  voter?: VoterWithGroupName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function VoterDialog({
  electionId,
  voter,
  open,
  onOpenChange,
  onSave,
}: VoterDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [groups, setGroups] = useState<ElectionGroup[]>([]);

  const form = useForm<ElectionVoterFormParams>({
    resolver: zodResolver(ElectionVoterFormSchema),
    defaultValues: {
      email: "",
      group_id: "",
    },
  });

  useEffect(() => {
    async function fetchGroups() {
      if (open) {
        const result = await getElectionGroups(electionId);
        if (result.data) {
          setGroups(result.data);
        } else {
          toast.error("Failed to load groups for selection.");
        }
      }
    }
    fetchGroups();
  }, [electionId, open]);

  useEffect(() => {
    if (voter && open) {
      form.reset({
        email: voter.email,
        group_id: voter.group_id,
      });
    } else if (!voter && open) {
      form.reset({
        email: "",
        group_id: "",
      });
    }
  }, [voter, form, open]);

  async function onSubmit(values: ElectionVoterFormParams) {
    setServerError(null);
    startTransition(async () => {
      let result;
      if (voter) {
        result = await updateElectionVoter(voter.id, electionId, values);
      } else {
        result = await createElectionVoter(electionId, values);
      }

      if (result.success) {
        toast.success(result.message);
        onSave();
        onOpenChange(false);
      } else {
        if (result.errorType === "validation" && result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as ElectionVoterFormFieldType, {
              type: "server",
              message: Array.isArray(messages) ? messages[0] : String(messages),
            });
          });
        }
        setServerError(result.message || "An error occurred.");
        toast.error(result.message || "An error occurred.");
      }
    });
  }

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setServerError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{voter ? "Edit Voter" : "Add New Voter"}</DialogTitle>
          <DialogDescription>
            {voter
              ? "Update the details of this voter."
              : "Fill in the details for the new voter."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., jane.smith@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={groups.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((grp) => (
                        <SelectItem key={grp.id} value={grp.id}>
                          {grp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? voter
                    ? "Saving..."
                    : "Adding..."
                  : voter
                  ? "Save Changes"
                  : "Add Voter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
