"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { createClient } from "@/utils/supabase/client";
import {
  ChartNoAxesColumnIcon,
  HomeIcon,
  Settings,
  UserIcon,
} from "lucide-react";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react"; // Import useEffect and useState

const supabase = createClient(); // Initialize Supabase client

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const electionID = pathname.split("/")[2] as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isValidElection, setIsValidElection] = useState(false);
  // Optional: store election data if needed in this layout or pass to children
  // const [electionData, setElectionData] = useState<ElectionData | null>(null);

  useEffect(() => {
    async function verifyAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        redirect("/dashboard/login");
      }

      if (!electionID) {
        redirect("/dashboard"); // Or a 404 page
      }

      const { data: election, error } = await supabase
        .from("elections")
        .select("id, owner_id") // Select only necessary fields for validation
        .eq("id", electionID)
        .eq("owner_id", user.id) // Ensure the current user owns this election
        .single();

      if (error || !election) {
        console.error(
          "Error fetching election or election not found/not owned:",
          error
        );
        // Redirect if election not found or user is not the owner
        redirect("/dashboard"); // Or show a specific "not found" or "access denied" page
      }

      // setElectionData(election as ElectionData); // If you need full data
      setIsValidElection(true);
      setIsLoading(false);
    }

    verifyAccess();
  }, [electionID]);

  if (isLoading) {
    return (
      <div className="grid h-full grid-cols-[250px_1fr]">
        <div className="flex w-full max-w-[300px] flex-col items-center border-r px-2 py-2 gap-1">
          {/* Skeleton for sidebar */}
          <Skeleton className="h-8 w-full mb-1" />
          <Skeleton className="h-8 w-full mb-1" />
          <Skeleton className="h-px w-full my-2" />
          <Skeleton className="h-8 w-full mb-1" />
          <Skeleton className="h-px w-full my-2" />
          <Skeleton className="h-8 w-full mb-1" />
        </div>
        <div className="p-4">
          {/* Skeleton for main content area */}
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isValidElection) {
    // This case should ideally be handled by the redirect,
    // but as a fallback or if you choose not to redirect immediately for some reason.
    // You might want to show a "Not Found" or "Access Denied" component here.
    // For now, it will likely redirect before reaching this.
    redirect("/dashboard");
  }

  return (
    <div className="grid h-full grid-cols-[250px_1fr]">
      <div className="flex w-full max-w-[300px] flex-col items-center border-r px-2 py-2 gap-1">
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}`);
          }}
        >
          <HomeIcon className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">Overview</span>
        </Button>
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}/analytics`);
          }}
        >
          <ChartNoAxesColumnIcon className="mr-2 h-4 w-4" />
          <span className="text-sm font-med">Analytics</span>
        </Button>

        <Separator className="my-2 w-full" />
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}/configurations/positions`);
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">Configurations</span>
        </Button>
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}/users/candidates`);
          }}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span className="text-sm font-med">Users</span>
        </Button>
      </div>
      <div className="">{children}</div>
    </div>
  );
}
