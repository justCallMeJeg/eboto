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
import { ElectionPosition } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteElectionPosition, getElectionPositions } from "../actions";
import { getColumns } from "./columns";
import { PositionDialog } from "./position-dialog";

export default function DashboardConfigPositionsPage({}: {
  params: { id: string };
}) {
  const routeParams = useParams();
  const electionId = routeParams.id as string;

  const [positions, setPositions] = useState<ElectionPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] =
    useState<ElectionPosition | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] =
    useState<ElectionPosition | null>(null);

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    const result = await getElectionPositions(electionId);
    if (result.data) {
      setPositions(result.data);
    } else if (result.error) {
      toast.error(`Failed to load positions: ${result.error}`);
      setPositions([]);
    }
    setIsLoading(false);
  }, [electionId]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleAddPosition = () => {
    setSelectedPosition(null);
    setIsDialogOpen(true);
  };

  const handleEditPosition = (position: ElectionPosition) => {
    setSelectedPosition(position);
    setIsDialogOpen(true);
  };

  const handleDeletePrompt = (position: ElectionPosition) => {
    setPositionToDelete(position);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePosition = async () => {
    if (!positionToDelete) return;
    const result = await deleteElectionPosition(
      positionToDelete.id,
      electionId
    );
    if (result.success) {
      toast.success(result.message);
      fetchPositions();
    } else {
      toast.error(result.message || "Failed to delete position.");
    }
    setIsDeleteDialogOpen(false);
    setPositionToDelete(null);
  };

  const columns = getColumns({
    onEdit: handleEditPosition,
    onDelete: handleDeletePrompt,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
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
        <h1 className="text-2xl font-bold">Manage Candidate Positions</h1>
        <Button onClick={handleAddPosition}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Position
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={positions}
        searchColumn="name"
        searchPlaceholder="Search positions by name..."
      />
      <PositionDialog
        electionId={electionId}
        position={selectedPosition}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={fetchPositions}
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
              position &quot;{positionToDelete?.name}&quot; and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPositionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePosition}
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
