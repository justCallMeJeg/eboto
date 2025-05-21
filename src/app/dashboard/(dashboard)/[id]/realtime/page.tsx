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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BallotData,
  ElectionStatus,
  InitialRealtimeData,
  VoteData,
} from "@/lib/data";
import { createClient } from "@/utils/supabase/client"; // Use client for real-time
import {
  BarChartHorizontalBigIcon,
  PlayCircleIcon,
  UserCheck2Icon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { getInitialRealtimeVoteData, startElectionAction } from "../actions";

// Helper function to get the string key of an enum member by its value.
function getEnumKeyByValue<TEnum extends object>(
  enumObject: TEnum,
  value: TEnum[keyof TEnum]
): string | undefined {
  const allKeys = Object.keys(enumObject) as Array<string>;
  const memberNameKeys = allKeys.filter((key) => isNaN(Number(key)));
  return memberNameKeys.find((key) => enumObject[key as keyof TEnum] === value);
}

export default function DashboardRealtimeResultsPage() {
  const params = useParams();
  const electionId = params.id as string;
  const supabase = createClient(); // For real-time subscription

  const [realtimeData, setRealtimeData] = useState<InitialRealtimeData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, startTransition] = useTransition();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    const result = await getInitialRealtimeVoteData(electionId);
    if (result.data) {
      setRealtimeData(result.data);
    } else {
      toast.error(result.error || "Failed to load initial vote data.");
      setRealtimeData(null);
    }
    setIsLoading(false);
  }, [electionId]);

  useEffect(() => {
    if (electionId) {
      fetchInitialData();
    }
  }, [electionId, fetchInitialData]);

  useEffect(() => {
    if (
      !realtimeData ||
      realtimeData.electionStatus !== ElectionStatus.Ongoing
    ) {
      return; // Only subscribe if election is ongoing
    }

    const channel = supabase
      .channel(`realtime-ballots-${electionId}`)
      .on<BallotData>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ballots",
          filter: `election_id=eq.${electionId}`,
        },
        (payload) => {
          const newBallot = payload.new;
          if (newBallot && newBallot.votes && Array.isArray(newBallot.votes)) {
            toast.info("New vote received!");
            setRealtimeData((prevData) => {
              if (!prevData) return null;

              const updatedPositions = prevData.positions.map((pos) => {
                const updatedCandidates = pos.candidates.map((cand) => {
                  let newVoteCount = cand.voteCount;
                  (newBallot.votes as VoteData[]).forEach((vote) => {
                    if (
                      vote.candidate_id === cand.id &&
                      vote.position_id === pos.id
                    ) {
                      newVoteCount++;
                    }
                  });
                  return { ...cand, voteCount: newVoteCount };
                });
                // Re-sort candidates within the position
                updatedCandidates.sort(
                  (a, b) =>
                    b.voteCount - a.voteCount ||
                    a.display_name.localeCompare(b.display_name)
                );
                return { ...pos, candidates: updatedCandidates };
              });
              return { ...prevData, positions: updatedPositions };
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to real-time ballot updates!");
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          toast.error(`Real-time connection error: ${status}. ${err?.message}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, electionId, realtimeData]);

  const handleStartElection = () => {
    startTransition(async () => {
      const result = await startElectionAction(electionId);
      if (result.success) {
        toast.success(result.message);
        fetchInitialData(); // Refresh all page data
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
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-7 w-1/2 mb-3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!realtimeData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-xl text-muted-foreground">
          Could not load election data.
        </p>
      </div>
    );
  }

  const { electionName, electionStatus, positions } = realtimeData;
  const statusDisplayName =
    getEnumKeyByValue(ElectionStatus, electionStatus) || "Unknown Status";
  const canStartElection = electionStatus === ElectionStatus["Pre-Election"];
  const totalVotesAcrossAllPositions = positions.reduce(
    (total, pos) =>
      total + pos.candidates.reduce((sum, cand) => sum + cand.voteCount, 0),
    0
  );

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">
                {electionName} - Real-time Results
              </CardTitle>
              <CardDescription className="text-md text-muted-foreground pt-1">
                Live vote counts as they come in.
              </CardDescription>
            </div>
            <Badge
              variant={
                electionStatus === ElectionStatus.Ongoing
                  ? "default"
                  : electionStatus === ElectionStatus["Pre-Election"]
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

      {electionStatus === ElectionStatus["Pre-Election"] && (
        <Card>
          <CardHeader>
            <CardTitle>Election Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The election has not started yet. Real-time results will appear
              here once the election is ongoing and votes are cast.
            </p>
          </CardContent>
        </Card>
      )}

      {(electionStatus === ElectionStatus.Ongoing ||
        electionStatus === ElectionStatus["Post-Election"] ||
        electionStatus === ElectionStatus.Closed) &&
        positions.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Data Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No positions or candidates configured, or no votes cast yet.
              </p>
            </CardContent>
          </Card>
        )}

      {positions.map((position) => {
        const totalVotesForPosition = position.candidates.reduce(
          (sum, cand) => sum + cand.voteCount,
          0
        );
        return (
          <Card key={position.id}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <span>{position.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Total Votes: {totalVotesForPosition}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {position.candidates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rank</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Votes
                      </TableHead>
                      <TableHead className="w-[150px]">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {position.candidates.map((candidate, index) => {
                      const percentage =
                        totalVotesForPosition > 0
                          ? (candidate.voteCount / totalVotesForPosition) * 100
                          : 0;
                      return (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {candidate.display_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {candidate.party}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {candidate.voteCount}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={percentage}
                                className={`h-2 flex-1 ${
                                  index === 0 && candidate.voteCount > 0
                                    ? "[&>div]:bg-green-500"
                                    : "[&>div]:bg-primary"
                                }`}
                              />
                              <span className="text-xs w-12 text-right">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No candidates for this position.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {electionStatus === ElectionStatus.Ongoing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChartHorizontalBigIcon className="mr-2 h-5 w-5 text-blue-600" />
              Election Live
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600 font-semibold">
              Listening for new votes... Total votes across all positions:{" "}
              {totalVotesAcrossAllPositions}
            </p>
          </CardContent>
        </Card>
      )}
      {(electionStatus === ElectionStatus["Post-Election"] ||
        electionStatus === ElectionStatus.Closed) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck2Icon className="mr-2 h-5 w-5 text-gray-500" />
              Election Concluded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-semibold">
              This election has ended or been closed. The results shown are
              final. Total votes cast: {totalVotesAcrossAllPositions}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
