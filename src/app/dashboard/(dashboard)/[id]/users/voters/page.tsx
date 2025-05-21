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
import { deleteElectionVoter, getElectionVoters } from "../actions";
import { VoterWithGroupName, getColumns } from "./columns";
import { VoterDialog } from "./voter-dialog";

export default function DashboardUserVoterPage() {
  const routeParams = useParams();
  const electionId = routeParams.id as string;

  const [voters, setVoters] = useState<VoterWithGroupName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<VoterWithGroupName | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [voterToDelete, setVoterToDelete] = useState<VoterWithGroupName | null>(
    null
  );

  const fetchVoters = useCallback(async () => {
    setIsLoading(true);
    const result = await getElectionVoters(electionId);
    if (result.data) {
      setVoters(result.data as unknown as VoterWithGroupName[]); // Cast as data includes group name
    } else if (result.error) {
      toast.error(`Failed to load voters: ${result.error}`);
      setVoters([]);
    }
    setIsLoading(false);
  }, [electionId]);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  const handleAddVoter = () => {
    setSelectedVoter(null);
    setIsDialogOpen(true);
  };

  const handleEditVoter = (voter: VoterWithGroupName) => {
    setSelectedVoter(voter);
    setIsDialogOpen(true);
  };

  const handleDeletePrompt = (voter: VoterWithGroupName) => {
    setVoterToDelete(voter);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteVoter = async () => {
    if (!voterToDelete) return;
    const result = await deleteElectionVoter(voterToDelete.id, electionId);
    if (result.success) {
      toast.success(result.message);
      fetchVoters();
    } else {
      toast.error(result.message || "Failed to delete voter.");
    }
    setIsDeleteDialogOpen(false);
    setVoterToDelete(null);
  };

  const columns = getColumns({
    onEdit: handleEditVoter,
    onDelete: handleDeletePrompt,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
        <h1 className="text-2xl font-bold">Manage Voters</h1>
        <Button onClick={handleAddVoter}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Voter
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={voters}
        searchColumn="email"
        searchPlaceholder="Search voters by email..."
      />
      <VoterDialog
        electionId={electionId}
        voter={selectedVoter}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={fetchVoters}
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
              voter &quot;{voterToDelete?.email}&quot; and remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVoterToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVoter}
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
