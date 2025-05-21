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
} from "@/components/ui/select"; // Import Select components
import { ElectionGroup, ElectionPosition } from "@/lib/data"; // Added ElectionGroup
import {
  ElectionCandidateFormFieldType,
  ElectionCandidateFormParams,
  ElectionCandidateFormSchema,
} from "@/lib/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  getElectionGroups,
  getElectionPositions,
} from "../../configurations/actions"; // Action to get positions and groups
import { createElectionCandidate, updateElectionCandidate } from "../actions";
import { CandidateWithDetails } from "./columns"; // Updated type

interface CandidateDialogProps {
  electionId: string;
  candidate?: CandidateWithDetails | null; // Updated type
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function CandidateDialog({
  electionId,
  candidate,
  open,
  onOpenChange,
  onSave,
}: CandidateDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [positions, setPositions] = useState<ElectionPosition[]>([]);
  const [groups, setGroups] = useState<ElectionGroup[]>([]); // State for groups

  const form = useForm<ElectionCandidateFormParams>({
    resolver: zodResolver(ElectionCandidateFormSchema),
    defaultValues: {
      display_name: "",
      party: "",
      position_id: "",
      image_url: "",
      group_id: null, // Default group_id to null
    },
  });

  useEffect(() => {
    async function fetchData() {
      if (open) {
        const positionsResult = await getElectionPositions(electionId);
        if (positionsResult.data) {
          setPositions(positionsResult.data);
        } else {
          toast.error("Failed to load positions for selection.");
        }
        const groupsResult = await getElectionGroups(electionId); // Fetch groups
        if (groupsResult.data) {
          setGroups(groupsResult.data);
        } else {
          toast.error("Failed to load groups for selection.");
        }
      }
    }
    fetchData();
  }, [electionId, open]);

  useEffect(() => {
    if (candidate && open) {
      form.reset({
        display_name: candidate.display_name,
        party: candidate.party,
        position_id: candidate.position_id,
        image_url: candidate.image_url || "",
        group_id: candidate.group_id || null, // Set group_id
      });
    } else if (!candidate && open) {
      form.reset({
        display_name: "",
        party: "",
        position_id: "",
        image_url: "",
        group_id: null, // Reset group_id
      });
    }
  }, [candidate, form, open]);

  async function onSubmit(values: ElectionCandidateFormParams) {
    setServerError(null);
    startTransition(async () => {
      let result;
      if (candidate) {
        result = await updateElectionCandidate(
          candidate.id,
          electionId,
          values
        );
      } else {
        result = await createElectionCandidate(electionId, values);
      }

      if (result.success) {
        toast.success(result.message);
        onSave();
        onOpenChange(false);
      } else {
        if (result.errorType === "validation" && result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as ElectionCandidateFormFieldType, {
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
            {candidate ? "Edit Candidate" : "Add New Candidate"}
          </DialogTitle>
          <DialogDescription>
            {candidate
              ? "Update the details of this candidate."
              : "Fill in the details for the new candidate."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="party"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Party</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Independent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value || ""} // Ensure value is controlled
                    disabled={positions.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Voter Group (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "all" ? null : value)
                    }
                    value={field.value || "all"} // Handle null by defaulting to "all" or an empty string if preferred
                    disabled={groups.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group or leave for all voters" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Voters</SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.png"
                      {...field}
                    />
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
                  ? candidate
                    ? "Saving..."
                    : "Adding..."
                  : candidate
                  ? "Save Changes"
                  : "Add Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
