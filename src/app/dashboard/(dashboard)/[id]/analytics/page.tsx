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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ElectionData, ElectionStatus } from "@/lib/data";
import {
  BarChart3Icon,
  CalendarCheck2Icon,
  PlayCircleIcon,
  Users2Icon,
  VoteIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ElectionAnalyticsData,
  getElectionAnalyticsData,
  getElectionDetails,
  startElectionAction,
} from "../actions";

// Helper function to get the string key of an enum member by its value.
function getEnumKeyByValue<TEnum extends object>(
  enumObject: TEnum,
  value: TEnum[keyof TEnum]
): string | undefined {
  const allKeys = Object.keys(enumObject) as Array<string>;
  const memberNameKeys = allKeys.filter((key) => isNaN(Number(key)));
  return memberNameKeys.find((key) => enumObject[key as keyof TEnum] === value);
}

export default function DashboardElectionAnalyticsPage() {
  const params = useParams();
  const electionId = params.id as string;

  const [election, setElection] = useState<ElectionData | null>(null);
  const [analytics, setAnalytics] = useState<ElectionAnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, startTransition] = useTransition();

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    const [electionResult, analyticsResult] = await Promise.all([
      getElectionDetails(electionId),
      getElectionAnalyticsData(electionId),
    ]);

    if (electionResult.data) {
      setElection(electionResult.data);
    } else {
      toast.error(
        electionResult.error || "Failed to load election details."
      );
      setElection(null);
    }

    if (analyticsResult.data) {
      setAnalytics(analyticsResult.data);
    } else {
      toast.error(
        analyticsResult.error || "Failed to load election analytics."
      );
      setAnalytics(null);
    }
    setIsLoading(false);
  }, [electionId]);

  useEffect(() => {
    if (electionId) {
      fetchPageData();
    }
  }, [electionId, fetchPageData]);

  const handleStartElection = () => {
    startTransition(async () => {
      const result = await startElectionAction(electionId);
      if (result.success) {
        toast.success(result.message);
        fetchPageData(); // Refresh all page data
      } else {
        toast.error(result.error || "Failed to start election.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8 space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-1" />
                <Skeleton className="h-10 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
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
    <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">
                {election.name} - Analytics
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground pt-1">
                Overview of election engagement and statistics.
              </CardDescription>
            </div>
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
        </CardHeader>
        {canStartElection && (
          <CardFooter className="border-t pt-6">
            <Button
              onClick={handleStartElection}
              disabled={isStarting || !canStartElection}
              size="lg"
              className="w-full md:w-auto"
            >
              <PlayCircleIcon className="mr-2 h-5 w-5" />
              {isStarting ? "Starting Election..." : "Start Election"}
            </Button>
          </CardFooter>
        )}
      </Card>

      {analytics ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Registered Voters
              </CardTitle>
              <Users2Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalRegisteredVoters}
              </div>
              <p className="text-xs text-muted-foreground">
                Total users eligible to vote.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Votes Cast
              </CardTitle>
              <VoteIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalVotesCast}
              </div>
              <p className="text-xs text-muted-foreground">
                Ballots submitted so far.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Voter Turnout
              </CardTitle>
              <BarChart3Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.voterTurnoutPercentage}%
              </div>
              <Progress
                value={analytics.voterTurnoutPercentage}
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Data Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Could not load analytics data at this time.
            </p>
          </CardContent>
        </Card>
      )}

      {election.status === ElectionStatus.Ongoing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck2Icon className="mr-2 h-5 w-5 text-green-600" />
              Election In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 font-semibold">
              Election is currently ongoing. Real-time results might be
              available on the &#39;Real-time Results&#39; page.
            </p>
          </CardContent>
        </Card>
      )}
      {(election.status === ElectionStatus["Post-Election"] ||
        election.status === ElectionStatus.Closed) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck2Icon className="mr-2 h-5 w-5 text-gray-500" />
              Election Concluded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-semibold">
              This election has ended or been closed. Final results should be
              available.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
