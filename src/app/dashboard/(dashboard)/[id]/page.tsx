"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ElectionData, ElectionStatus } from "@/lib/data";
import { PlayCircleIcon, CalendarIcon, UsersIcon, InfoIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { getElectionDetails, startElectionAction } from "./actions";

// Helper function to get the string key of an enum member by its value.
function getEnumKeyByValue<TEnum extends object>(
  enumObject: TEnum,
  value: TEnum[keyof TEnum]
): string | undefined {
  const allKeys = Object.keys(enumObject) as Array<string>;
  const memberNameKeys = allKeys.filter((key) => isNaN(Number(key)));
  return memberNameKeys.find((key) => enumObject[key as keyof TEnum] === value);
}

export default function DashboardElectionHomePage() {
  const params = useParams();
  const electionId = params.id as string;

  const [election, setElection] = useState<ElectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, startTransition] = useTransition();

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    const result = await getElectionDetails(electionId);
    if (result.data) {
      setElection(result.data);
    } else {
      toast.error(result.error || "Failed to load election details.");
      setElection(null); // Explicitly set to null on error
    }
    setIsLoading(false);
  }, [electionId]);

  useEffect(() => {
    if (electionId) {
      fetchDetails();
    }
  }, [electionId, fetchDetails]);

  const handleStartElection = () => {
    startTransition(async () => {
      const result = await startElectionAction(electionId);
      if (result.success) {
        toast.success(result.message);
        fetchDetails(); // Refresh election details
      } else {
        toast.error(result.error || "Failed to start election.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-xl text-muted-foreground">Election not found.</p>
      </div>
    );
  }

  const statusDisplayName =
    getEnumKeyByValue(ElectionStatus, election.status) || "Unknown Status";

  const canStartElection = election.status === ElectionStatus["Pre-Election"];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-bold text-primary">
              {election.name}
            </CardTitle>
            <Badge
              variant={
                election.status === ElectionStatus.Ongoing
                  ? "default"
                  : election.status === ElectionStatus["Pre-Election"]
                  ? "outline"
                  : "secondary"
              }
              className="text-sm"
            >
              {statusDisplayName}
            </Badge>
          </div>
          {election.description && (
            <CardDescription className="text-md text-muted-foreground pt-1">
              {election.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Start Date
              </h3>
              <p className="text-lg font-semibold">
                {new Date(election.start_date).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                End Date
              </h3>
              <p className="text-lg font-semibold">
                {new Date(election.end_date).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <UsersIcon className="mr-2 h-4 w-4" />
                Registered Voters
              </h3>
              <p className="text-lg font-semibold">
                {election.voter_count || 0}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <InfoIcon className="mr-2 h-4 w-4" />
                Election ID
              </h3>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {election.id}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          {canStartElection && (
            <Button
              onClick={handleStartElection}
              disabled={isStarting || !canStartElection}
              size="lg"
              className="w-full md:w-auto"
            >
              <PlayCircleIcon className="mr-2 h-5 w-5" />
              {isStarting ? "Starting Election..." : "Start Election"}
            </Button>
          )}
          {election.status === ElectionStatus.Ongoing && (
            <p className="text-green-600 font-semibold">
              Election is currently ongoing.
            </p>
          )}
          {(election.status === ElectionStatus["Post-Election"] ||
            election.status === ElectionStatus.Closed) && (
            <p className="text-muted-foreground font-semibold">
              This election has ended or been closed.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
