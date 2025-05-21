"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Added Label
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Added RadioGroup
import { Skeleton } from "@/components/ui/skeleton";
import { BallotPageData, ElectionStatus } from "@/lib/data";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2, Loader2, VoteIcon } from "lucide-react"; // Added CheckCircle2, VoteIcon
import Image from "next/image"; // Added Image
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react"; // Added useRef
import { toast } from "sonner";
import { getBallotVoterAndElectionData, submitBallotAction } from "./actions"; // Relative import will work after moving actions.ts

// Helper function to get the string key of an enum member by its value.
function getEnumKeyByValue<TEnum extends object>(
  enumObject: TEnum,
  value: TEnum[keyof TEnum]
): string | undefined {
  const allKeys = Object.keys(enumObject) as Array<string>;
  const memberNameKeys = allKeys.filter((key) => isNaN(Number(key)));
  return memberNameKeys.find((key) => enumObject[key as keyof TEnum] === value);
}

export default function BallotVotePage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params.id as string;
  const supabase = createClient();

  const [ballotData, setBallotData] = useState<BallotPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>(
    {}
  );
  const [isSubmitting, startSubmitTransition] = useTransition();

  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isFetchingBallotData, setIsFetchingBallotData] = useState(false);

  // Ref to track auth status to prevent race conditions in async callbacks
  const authStatusRef = useRef(authStatus);
  useEffect(() => {
    authStatusRef.current = authStatus;
  }, [authStatus]);

  useEffect(() => {
    let isActive = true; // Prevent state updates if component unmounts
    setAuthStatus("loading"); // Reset on electionId change or initial mount

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isActive) {
          const currentEmail = session?.user?.email;
          setUserEmail(currentEmail);

          // Determine auth status based on session and event
          if (
            event === "INITIAL_SESSION" ||
            event === "SIGNED_IN" ||
            event === "SIGNED_OUT"
          ) {
            setAuthStatus(session ? "authenticated" : "unauthenticated");
          } else if (authStatusRef.current === "loading") {
            // If onAuthStateChange fires with other events (e.g. USER_UPDATED, TOKEN_REFRESHED)
            // while we are still 'loading', update based on current session.
            setAuthStatus(session ? "authenticated" : "unauthenticated");
          }
        }
      }
    );

    // Fallback: Ensure auth status is set if onAuthStateChange's INITIAL_SESSION is slow.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isActive && authStatusRef.current === "loading") {
        setUserEmail(session?.user?.email);
        setAuthStatus(session ? "authenticated" : "unauthenticated");
      }
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, electionId]);

  const fetchBallotDetails = useCallback(
    async (emailToFetch: string) => {
      if (!electionId || !emailToFetch) {
        setIsFetchingBallotData(false);
        if (authStatus === "authenticated" && !emailToFetch) {
          setError(
            "User email is not available for fetching ballot data. Please try logging in again."
          );
        }
        return;
      }

      setIsFetchingBallotData(true);
      setError(null);
      const result = await getBallotVoterAndElectionData(
        electionId,
        emailToFetch
      );
      if (result.error) {
        setError(result.error);
        setBallotData(result.data || null); // Still set data if partially returned
      } else if (result.data) {
        setBallotData(result.data);
        if (!result.data.voterInfo && result.message) {
          // If voterInfo is null but there's a message (e.g. "Voter not registered"), show it.
          setError(result.message);
        }
      } else {
        setError("Failed to load ballot data.");
      }
      setIsFetchingBallotData(false);
    },
    [electionId, authStatus] // authStatus dependency ensures callback is fresh if status logic changes how email is handled.
  );

  useEffect(() => {
    if (authStatus !== "loading") {
      if (authStatus === "authenticated" && userEmail && electionId) {
        setIsFetchingBallotData(true); // Set loading before calling fetch
        fetchBallotDetails(userEmail);
      } else if (authStatus === "unauthenticated" && electionId) {
        router.replace(`/ballot/${electionId}`);
      } else if (!electionId) {
        setError("Election ID is missing in the URL.");
        setIsFetchingBallotData(false);
      } else if (authStatus === "authenticated" && !userEmail && electionId) {
        setError(
          "Authenticated, but user email is missing. Please try logging in again."
        );
        setIsFetchingBallotData(false);
      }
    }
  }, [authStatus, userEmail, electionId, fetchBallotDetails, router]);

  const handleVoteChange = (positionId: string, candidateId: string) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }));
  };

  const handleSubmitBallot = () => {
    if (!ballotData?.voterInfo?.id) {
      toast.error("Voter information is missing. Cannot submit ballot.");
      return;
    }
    // Check if any selections made, allow empty submission if desired (current behavior)
    // if (Object.keys(selectedVotes).length === 0 && ballotData.positions.length > 0) {
    //   toast.warning("You haven't selected any candidates. Submit empty ballot?");
    // }

    startSubmitTransition(async () => {
      const result = await submitBallotAction(
        electionId,
        ballotData.voterInfo!.id, // Pass voterId
        selectedVotes
      );
      if (result.success) {
        toast.success(result.message || "Ballot submitted successfully!");
        if (userEmail) {
          fetchBallotDetails(userEmail); // Refresh data to show "hasVoted" status
        } else {
          // Handle case where userEmail is somehow undefined, though unlikely here
          // Potentially refetch auth state or show an error
          setError("User session error, cannot refresh ballot status.");
        }
        // Or redirect to a thank-you page:
        // router.push(`/ballot/${electionId}/thank-you`);
      } else {
        toast.error(result.error || "Failed to submit ballot.");
        setError(result.error || "Failed to submit ballot.");
      }
    });
  };

  if (
    authStatus === "loading" ||
    (authStatus === "authenticated" && isFetchingBallotData && !ballotData)
  ) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-1/4 mx-auto mt-4" />
      </div>
    );
  }

  // After initialAuthDone is true, and if not fetching ballot data (or userEmail is null leading to redirect)
  // we can proceed to render based on `ballotData` and `error`.

  if (error && !ballotData?.electionName) {
    // Show critical error if ballotData (especially electionName) is not available
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!ballotData && authStatus === "unauthenticated") {
    // This case should be handled by the redirect, but as a fallback UI.
    // It means auth is done, no user, so we are likely about to redirect.
    return null;
  }

  if (!ballotData && !isFetchingBallotData) {
    // Fallback if ballotData is null after loading and auth checks, and no specific error handled above.
    // This might happen if fetchBallotDetails completes but result.data is null without error.
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load ballot data. Please ensure your link is correct and
            try again or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { electionName, electionStatus, voterInfo, positions } =
    ballotData || {}; // Added || {} for safety

  if (!voterInfo && authStatus === "authenticated" && !isFetchingBallotData) {
    // Check authStatus and fetching status
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{electionName || "Election Ballot"}</CardTitle>
            <CardDescription>Access Issue</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Voter Not Found</AlertTitle>
              <AlertDescription>
                Your voter information could not be found for this election.
                This might be because you are not registered, or the email used
                does not match records. Please try logging in again via the link
                provided by the election administrator.
                {error && <p className="mt-2 text-sm">Details: {error}</p>}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (voterInfo?.hasVoted) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl font-bold">
              <CheckCircle2 className="h-7 w-7 mr-2 text-green-600" />
              {electionName}
            </CardTitle>
            <CardDescription className="text-center">
              Ballot Submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert
              variant="default"
              className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
            >
              <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-300">
                Thank You!
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                You have already cast your vote for this election. Your ballot
                has been recorded.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    electionStatus !== ElectionStatus.Ongoing &&
    authStatus === "authenticated" &&
    !isFetchingBallotData
  ) {
    // Check authStatus
    const statusKey =
      getEnumKeyByValue(ElectionStatus, electionStatus!) || "Unknown"; // Added ! for electionStatus
    let message = `This election is currently in "${statusKey}" state. Voting is not active.`;
    if (electionStatus === ElectionStatus["Pre-Election"])
      message =
        "This election has not started yet. Please check back during the official voting period.";
    if (
      electionStatus === ElectionStatus["Post-Election"] ||
      electionStatus === ElectionStatus.Closed
    )
      message = "This election has ended. Voting is no longer possible.";

    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">{electionName}</CardTitle>
            <CardDescription className="text-center">
              Election Ballot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Voting Not Active</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    positions?.length === 0 &&
    authStatus === "authenticated" &&
    !isFetchingBallotData
  ) {
    // Check authStatus and positions
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">{electionName}</CardTitle>
            <CardDescription className="text-center">
              Election Ballot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <VoteIcon className="h-4 w-4" />
              <AlertTitle>No Positions Available</AlertTitle>
              <AlertDescription>
                There are currently no positions you are eligible to vote for in
                this election. This might be a configuration issue. Please
                contact the election administrator.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {electionName}
          </CardTitle>
          <CardDescription className="text-lg">
            Official Ballot - Cast Your Vote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {(positions || []).map((position) => (
            <div key={position.id} className="p-4 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">{position.name}</h3>
              {position.candidates.length > 0 ? (
                <RadioGroup
                  value={selectedVotes[position.id] || ""}
                  onValueChange={(candidateId) =>
                    handleVoteChange(position.id, candidateId)
                  }
                  className="space-y-3"
                >
                  {position.candidates.map((candidate) => (
                    <Label
                      key={candidate.id}
                      htmlFor={`${position.id}-${candidate.id}`}
                      className={`flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer ${
                        selectedVotes[position.id] === candidate.id
                          ? "ring-2 ring-primary border-primary bg-primary/10 dark:bg-primary/20"
                          : "dark:border-slate-700"
                      }`}
                    >
                      <RadioGroupItem
                        value={candidate.id}
                        id={`${position.id}-${candidate.id}`}
                      />
                      {candidate.image_url && (
                        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={candidate.image_url}
                            alt={candidate.display_name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full"
                          />
                        </div>
                      )}
                      {!candidate.image_url && (
                        <div className="relative h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                          <VoteIcon className="w-6 h-6" />{" "}
                          {/* Placeholder Icon */}
                        </div>
                      )}
                      <div>
                        <span className="font-medium block">
                          {candidate.display_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {candidate.party}
                        </span>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No candidates for this position.
                </p>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col items-center pt-6 border-t">
          <Button
            onClick={handleSubmitBallot}
            disabled={isSubmitting}
            size="lg"
            className="w-full max-w-xs"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <VoteIcon className="mr-2 h-5 w-5" />
            )}
            {isSubmitting ? "Submitting..." : "Submit My Vote"}
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Ensure all your selections are final before submitting. This action
            cannot be undone.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
