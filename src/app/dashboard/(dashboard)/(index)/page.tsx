"use client";

import DashboardElectionCard from "@/components/dashboard-election-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { ElectionData } from "@/lib/data";
import { createClient } from "@/utils/supabase/client";
import { Filter, PlusIcon, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react"; // Added useCallback
import { NewElectionDialogForm } from "./new-election-dialog"; // Import the new dialog

const supabase = createClient();

function LoadingSkeleton() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <Skeleton className="h-10 w-36" />{" "}
        {/* Skeleton for New Election Button */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-72" /> {/* Skeleton for Search Input */}
          <Skeleton className="h-10 w-10" /> {/* Skeleton for Filter Button */}
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default function DashboardHomePage() {
  const [electionData, setElectionData] = useState<ElectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewElectionDialogOpen, setIsNewElectionDialogOpen] = useState(false);

  const fetchElections = useCallback(async () => {
    setIsLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      redirect("/dashboard/login");
      return;
    }
    if (userData.user.id) {
      const { data, error } = await supabase
        .from("elections")
        .select("*")
        .eq("owner_id", userData.user.id)
        .order("created_at", { ascending: false }); // Fetch newest first

      if (!error && data) {
        setElectionData(data);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []); // No dependencies needed for supabase client from createClient()

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  const handleElectionCreated = (newElection: ElectionData) => {
    redirect(`/dashboard/${newElection.id}/`);
  };

  if (isLoading && electionData.length === 0) {
    // Show skeleton only on initial load
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="p-8">
        <header className="flex items-center justify-between mb-8">
          <Button
            className="text-sm font-semibold text-primary-foreground"
            onClick={() => setIsNewElectionDialogOpen(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> {/* Added mr-2 for spacing */}
            New Election
          </Button>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for a project"
                className="pl-10 w-72 text-sm"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </header>
        <main className="grid grid-cols-1 gap-6">
          {isLoading &&
            electionData.length > 0 && ( // Show a subtle loading indicator if refreshing
              <div className="col-span-full text-center text-muted-foreground">
                Refreshing elections...
              </div>
            )}
          {!isLoading && electionData.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
              {" "}
              {/* Added min-h for better centering */}
              <p className="text-lg font-semibold text-muted-foreground">
                {" "}
                {/* Used muted-foreground for semantic color */}
                No elections found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {electionData.map((election) => (
                <Link key={election.id} href={`/dashboard/${election.id}`}>
                  <DashboardElectionCard election={election} />
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      <NewElectionDialogForm
        open={isNewElectionDialogOpen}
        onOpenChange={setIsNewElectionDialogOpen}
        onElectionCreated={handleElectionCreated}
      />
    </>
  );
}
