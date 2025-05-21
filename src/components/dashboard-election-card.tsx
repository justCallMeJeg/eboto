"use client";

import { ElectionData, ElectionStatus } from "@/lib/data"; // Assuming ElectionStatus is an enum
import { CalendarClockIcon, ChevronRight, UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

// Helper function to get the string key of an enum member by its value.
// Works for both numeric and string enums.
function getEnumKeyByValue<TEnum extends object>(
  enumObject: TEnum,
  value: TEnum[keyof TEnum] // The value of the enum member (e.g., 0 or "STATUS_PENDING")
): string | undefined {
  // Get all keys from the enum object.
  // For numeric enums, this includes both member names (e.g., "Pending") and numeric strings (e.g., "0").
  // For string enums, this includes only member names.
  const allKeys = Object.keys(enumObject) as Array<string>;

  // Filter for keys that are actual member names (i.e., not numeric strings that are part of numeric enum's reverse mapping).
  const memberNameKeys = allKeys.filter((key) => isNaN(Number(key)));

  // Find the member name whose corresponding value in the enum matches the provided 'value'.
  return memberNameKeys.find((key) => enumObject[key as keyof TEnum] === value);
}

export default function DashboardElectionCard({
  election: { id, name, status, start_date, voter_count },
}: {
  election: ElectionData;
}) {
  if (!voter_count) {
    voter_count = 0;
  }

  // Get the key name for the status using the helper function.
  // Fallback to "Unknown Status" if the key cannot be determined.
  const statusDisplayName =
    getEnumKeyByValue(ElectionStatus, status) || "Unknown Status";

  return (
    <Card className="flex flex-col justify-between min-h-[200px] shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
          <ChevronRight className="text-gray-400 h-6 w-6" />
        </div>
        <CardDescription className="text-xs text-secondary-foreground">
          {id}
        </CardDescription>
      </CardHeader>
      {/* Display the determined key name of the election status */}
      <CardContent className="text-xs">{statusDisplayName}</CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <UsersIcon className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-secondary-foreground">
            {voter_count} voters
          </span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <CalendarClockIcon className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-secondary-foreground">
            {start_date}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
