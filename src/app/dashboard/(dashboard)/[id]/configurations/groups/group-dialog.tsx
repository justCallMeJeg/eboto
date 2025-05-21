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
import { ElectionGroup } from "@/lib/data";
import {
  ElectionGroupFormFieldType,
  ElectionGroupFormParams,
  ElectionGroupFormSchema,
} from "@/lib/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createElectionGroup, updateElectionGroup } from "../actions";

interface GroupDialogProps {
  electionId: string;
  group?: ElectionGroup | null; // For editing
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void; // Callback to refresh data
}

export function GroupDialog({
  electionId,
  group,
  open,
  onOpenChange,
  onSave,
}: GroupDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ElectionGroupFormParams>({
    resolver: zodResolver(ElectionGroupFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        description: group.description || "",
      });
    } else {
      form.reset({ name: "", description: "" });
    }
  }, [group, form, open]); // Reset form when group or open state changes

  async function onSubmit(values: ElectionGroupFormParams) {
    setServerError(null);
    startTransition(async () => {
      let result;
      if (group) {
        // Editing existing group
        result = await updateElectionGroup(group.id, electionId, values);
      } else {
        // Creating new group
        result = await createElectionGroup(electionId, values);
      }
      console.log("Result:", result);
      if (result.success) {
        toast.success(result.message);
        onSave(); // Trigger data refresh
        onOpenChange(false); // Close dialog
      } else {
        if (result.errorType === "validation" && result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as ElectionGroupFormFieldType, {
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
          <DialogTitle>{group ? "Edit Group" : "Create New Group"}</DialogTitle>
          <DialogDescription>
            {group
              ? "Update the details of this group."
              : "Fill in the details for the new group."}
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
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Year Level Representatives"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the group."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
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
                  ? group
                    ? "Saving..."
                    : "Creating..."
                  : group
                  ? "Save Changes"
                  : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
