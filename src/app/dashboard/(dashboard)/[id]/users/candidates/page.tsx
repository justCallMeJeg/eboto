"use client";

import { DataTable } from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteElectionCandidate,
  getElectionCandidates,
} from "../actions";
import { CandidateDialog } from "./candidate-dialog";
import { CandidateWithPositionName, getColumns } from "./columns";

export default function DashboardUserCandidatePage() {
  const routeParams = useParams();
  const electionId = routeParams.id as string;

  const [candidates, setCandidates] = useState<CandidateWithPositionName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateWithPositionName | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] =
    useState<CandidateWithPositionName | null>(null);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    const result = await getElectionCandidates(electionId);
    if (result.data) {
      setCandidates(result.data as CandidateWithPositionName[]); // Cast as data includes position name
    } else if (result.error) {
      toast.error(`Failed to load candidates: ${result.error}`);
      setCandidates([]);
    }
    setIsLoading(false);
  }, [electionId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleAddCandidate = () => {
    setSelectedCandidate(null);
    setIsDialogOpen(true);
  };

  const handleEditCandidate = (candidate: CandidateWithPositionName) => {
    setSelectedCandidate(candidate);
    setIsDialogOpen(true);
  };

  const handleDeletePrompt = (candidate: CandidateWithPositionName) => {
    setCandidateToDelete(candidate);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    const result = await deleteElectionCandidate(
      candidateToDelete.id,
      electionId
    );
    if (result.success) {
      toast.success(result.message);
      fetchCandidates();
    } else {
      toast.error(result.message || "Failed to delete candidate.");
    }
    setIsDeleteDialogOpen(false);
    setCandidateToDelete(null);
  };

  const columns = getColumns({
    onEdit: handleEditCandidate,
    onDelete: handleDeletePrompt,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[300px] w-full" />
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Candidates</h1>
        <Button onClick={handleAddCandidate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Candidate
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={candidates}
        searchColumn="display_name"
        searchPlaceholder="Search candidates by name..."
      />
      <CandidateDialog
        electionId={electionId}
        candidate={selectedCandidate}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={fetchCandidates}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              candidate &quot;{candidateToDelete?.display_name}&quot; and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCandidateToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCandidate}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
