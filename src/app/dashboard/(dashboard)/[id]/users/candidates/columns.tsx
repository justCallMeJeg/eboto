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
import { CandidatesData, ElectionGroup, ElectionPosition } from "@/lib/data"; // Added ElectionGroup
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

// Enhanced CandidatesData to reflect the nested position name and group name
export type CandidateWithDetails = CandidatesData & {
  positions: Pick<ElectionPosition, "name"> | null;
  usergroups: Pick<ElectionGroup, "name"> | null; // Candidate's target group
};

export type CandidateActionProps = {
  candidate: CandidateWithDetails;
  onEdit: (candidate: CandidateWithDetails) => void;
  onDelete: (candidate: CandidateWithDetails) => void;
};

export const getColumns = ({
  onEdit,
  onDelete,
}: Omit<
  CandidateActionProps,
  "candidate"
>): ColumnDef<CandidateWithDetails>[] => [
  {
    accessorKey: "display_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Display Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "party",
    header: "Party",
  },
  {
    accessorKey: "positions.name", // Access nested position name
    header: "Position",
    cell: ({ row }) => {
      const candidate = row.original;
      return candidate.positions?.name || "N/A";
    },
  },
  {
    accessorKey: "usergroups.name", // Access nested group name
    header: "Target Group",
    cell: ({ row }) => {
      const candidate = row.original;
      return candidate.usergroups?.name || "All Voters"; // Display group name or "All Voters"
    },
  },
  {
    accessorKey: "image_url",
    header: "Image URL",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image_url") as string;
      return imageUrl ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View Image
        </a>
      ) : (
        "No image"
      );
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
      const candidate = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(candidate)}>
              Edit Candidate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(candidate)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              Delete Candidate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
