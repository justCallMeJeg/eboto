"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ElectionGroup, VotersData } from "@/lib/data";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

// Enhanced VotersData to reflect the nested group name
export type VoterWithGroupName = VotersData & {
  usergroups: Pick<ElectionGroup, "name"> | null;
};

export type VoterActionProps = {
  voter: VoterWithGroupName;
  onEdit: (voter: VoterWithGroupName) => void;
  onDelete: (voter: VoterWithGroupName) => void;
};

export const getColumns = ({
  onEdit,
  onDelete,
}: Omit<VoterActionProps, "voter">): ColumnDef<VoterWithGroupName>[] => [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "usergroups.name", // Access nested group name
    header: "Group",
    cell: ({ row }) => {
      const voter = row.original;
      return voter.usergroups?.name || "N/A";
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const voter = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(voter)}>
              Edit Voter
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(voter)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              Delete Voter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
