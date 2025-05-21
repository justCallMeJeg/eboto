"use client";

import { DataTable } from "@/components/data-table"; // Generic DataTable
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
import { ElectionGroup } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { useParams } from "next/navigation"; // Import useParams
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteElectionGroup, getElectionGroups } from "../actions";
import { getColumns } from "./columns";
import { GroupDialog } from "./group-dialog";

export default function DashboardConfigGroupsPage({}: // params prop is no longer used directly for route parameters
{
  params: { id: string }; // Prop definition remains for type consistency if passed, but we'll use the hook
}) {
  const routeParams = useParams(); // Use the hook
  const electionId = routeParams.id as string; // Get id from the hook's result

  const [groups, setGroups] = useState<ElectionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ElectionGroup | null>(
    null
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ElectionGroup | null>(
    null
  );

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    const result = await getElectionGroups(electionId);
    if (result.data) {
      setGroups(result.data);
    } else if (result.error) {
      toast.error(`Failed to load groups: ${result.error}`);
      setGroups([]); // Clear groups on error
    }
    setIsLoading(false);
  }, [electionId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddGroup = () => {
    setSelectedGroup(null); // Ensure no group is pre-filled for "add"
    setIsDialogOpen(true);
  };

  const handleEditGroup = (group: ElectionGroup) => {
    setSelectedGroup(group);
    setIsDialogOpen(true);
  };

  const handleDeletePrompt = (group: ElectionGroup) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    const result = await deleteElectionGroup(groupToDelete.id, electionId);
    if (result.success) {
      toast.success(result.message);
      fetchGroups(); // Refresh list
    } else {
      toast.error(result.message || "Failed to delete group.");
    }
    setIsDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  const columns = getColumns({
    onEdit: handleEditGroup,
    onDelete: handleDeletePrompt,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" /> {/* For search input */}
        <Skeleton className="h-[300px] w-full" /> {/* For table body */}
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
        <h1 className="text-2xl font-bold">Manage User Groups</h1>
        <Button onClick={handleAddGroup}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Group
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={groups}
        searchColumn="name"
        searchPlaceholder="Search groups by name..."
      />
      <GroupDialog
        electionId={electionId}
        group={selectedGroup}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={fetchGroups}
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
              group &quot;{groupToDelete?.name}&quot; and remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGroupToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGroup}
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
