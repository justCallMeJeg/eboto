"use client";

import { ElectionData } from "@/lib/data"; // Import ElectionData
import { createClient } from "@/utils/supabase/client";
import {
  BoxIcon,
  ChevronDown,
  PlusIcon,
  Shield,
  Slash,
  UsersIcon,
} from "lucide-react"; // Added PlusIcon
import { redirect, usePathname, useRouter } from "next/navigation"; // Added useRouter
import { useCallback, useEffect, useState } from "react"; // Added useCallback
import { AvatarDropdown } from "./avatar-dropdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const supabase = createClient();

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize useRouter

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [userElections, setUserElections] = useState<ElectionData[]>([]);
  const [selectedElection, setSelectedElection] = useState<ElectionData | null>(
    null
  );
  const [isLoadingElections, setIsLoadingElections] = useState(true);

  // Fetch user's elections
  const fetchUserElections = useCallback(async (userId: string) => {
    setIsLoadingElections(true);
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching elections:", error);
      setUserElections([]);
    } else {
      setUserElections(data || []);
    }
    setIsLoadingElections(false);
  }, []);

  // Effect for auth and initial election fetch
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!sessionData.session) {
        redirect("/dashboard/login");
      } else if (sessionData.session.user && isMounted) {
        fetchUserElections(sessionData.session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          redirect("/dashboard/login");
        } else if (
          (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
          session?.user &&
          isMounted
        ) {
          fetchUserElections(session.user.id);
        } else if (
          !session?.user &&
          (event === "INITIAL_SESSION" || event === "USER_UPDATED") &&
          isMounted
        ) {
          // If after initial check or update, there's no user, redirect.
          // This handles cases where the session might expire or user gets deleted.
          redirect("/dashboard/login");
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserElections]);

  // Effect to update selectedElection based on pathname and fetched elections
  useEffect(() => {
    if (userElections.length > 0) {
      const pathSegments = pathname.split("/");
      const currentElectionId = pathSegments[2]; // Assuming URL is /dashboard/[electionId]/...

      if (
        currentElectionId &&
        pathSegments.length > 2 &&
        pathSegments[1] === "dashboard"
      ) {
        const foundElection = userElections.find(
          (election) => election.id === currentElectionId
        );
        setSelectedElection(foundElection || null);
      } else {
        setSelectedElection(null); // Or a default if on /dashboard page
      }
    } else if (!isLoadingElections && userElections.length === 0) {
      // If loading is finished and there are no elections, ensure selectedElection is null
      setSelectedElection(null);
    }
  }, [pathname, userElections, isLoadingElections]);

  const handleElectionSelect = (election: ElectionData) => {
    setSelectedElection(election);
    setIsPopoverOpen(false);
    router.push(`/dashboard/${election.id}`);
  };

  const handleNewElection = () => {
    setIsPopoverOpen(false);
    router.push("/dashboard"); // Navigate to dashboard where New Election Dialog is managed
  };

  const displayLabel =
    selectedElection?.name ||
    (userElections.length > 0 ? "Select an Election" : "No Elections");

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">
                {" "}
                {/* Changed href */}
                <Shield className="h-6 w-6" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {/* Show popover if there are elections or if on an election-specific page */}
            {(userElections.length > 0 || selectedElection) && (
              <>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2 text-base font-semibold"
                        disabled={
                          isLoadingElections && userElections.length === 0
                        }
                      >
                        <BoxIcon className="mr-2 h-4 w-4" />
                        {isLoadingElections && userElections.length === 0
                          ? "Loading..."
                          : displayLabel}
                        <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-64" align="start">
                      <Command>
                        <CommandInput placeholder="Find election..." />
                        <CommandList>
                          {isLoadingElections ? (
                            "Fetching elections..."
                          ) : (
                            <CommandEmpty>No elections found.</CommandEmpty>
                          )}
                          {!isLoadingElections && userElections.length > 0 && (
                            <CommandGroup>
                              {userElections.map((election) => (
                                <CommandItem
                                  key={election.id}
                                  value={election.name} // Use name for search, or id if preferred
                                  onSelect={() =>
                                    handleElectionSelect(election)
                                  }
                                >
                                  <BoxIcon className="mr-2 h-4 w-4" />
                                  <span>{election.name}</span>
                                  {selectedElection?.id === election.id && (
                                    <span className="ml-auto text-primary">
                                      ✔
                                    </span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          <CommandGroup>
                            <CommandItem
                              onSelect={handleNewElection}
                              className="text-sm"
                            >
                              <PlusIcon className="mr-2 h-4 w-4" />
                              <span>New Election</span>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        {/* Spacer */}
        <div className="flex-1" />

        {selectedElection && ( // Show Invite Admins button only if an election is selected
          <Button variant="default" size="default" className="mr-2">
            <UsersIcon className="mr-2 h-4 w-4" />{" "}
            {/* Added mr-2 for spacing */}
            <span className="text-sm font-medium">Invite Admins</span>
          </Button>
        )}

        {/* Avatar */}
        <AvatarDropdown />
      </div>
    </header>
  );
}
