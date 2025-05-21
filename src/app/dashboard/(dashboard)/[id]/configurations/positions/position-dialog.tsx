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
import { ElectionPosition } from "@/lib/data";
import {
  ElectionPositionFormFieldType,
  ElectionPositionFormParams,
  ElectionPositionFormSchema,
} from "@/lib/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createElectionPosition, updateElectionPosition } from "../actions";

interface PositionDialogProps {
  electionId: string;
  position?: ElectionPosition | null; // For editing
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void; // Callback to refresh data
}

export function PositionDialog({
  electionId,
  position,
  open,
  onOpenChange,
  onSave,
}: PositionDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ElectionPositionFormParams>({
    resolver: zodResolver(ElectionPositionFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (position) {
      form.reset({
        name: position.name,
      });
    } else {
      form.reset({ name: "" });
    }
  }, [position, form, open]);

  async function onSubmit(values: ElectionPositionFormParams) {
    setServerError(null);
    startTransition(async () => {
      let result;
      if (position) {
        result = await updateElectionPosition(position.id, electionId, values);
      } else {
        result = await createElectionPosition(electionId, values);
      }

      if (result.success) {
        toast.success(result.message);
        onSave();
        onOpenChange(false);
      } else {
        if (result.errorType === "validation" && result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as ElectionPositionFormFieldType, {
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
          <DialogTitle>
            {position ? "Edit Position" : "Create New Position"}
          </DialogTitle>
          <DialogDescription>
            {position
              ? "Update the details of this position."
              : "Fill in the details for the new position."}
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
                  <FormLabel>Position Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., President" {...field} />
                  </FormControl>
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
                  ? position
                    ? "Saving..."
                    : "Creating..."
                  : position
                  ? "Save Changes"
                  : "Create Position"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
