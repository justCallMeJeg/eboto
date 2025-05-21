"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation"; // Import useParams

export default function ConfigurationsLayout({
  children,
}: // params prop is no longer used directly for route parameters
{
  children: React.ReactNode;
  params: { id: string }; // Prop definition remains for type consistency if passed, but we'll use the hook
}) {
  const pathname = usePathname();
  const routeParams = useParams(); // Use the hook
  const electionId = routeParams.id as string; // Get id from the hook's result

  // Determine active tab based on pathname
  let activeTab = "groups"; // Default tab
  if (pathname.includes("/positions")) {
    activeTab = "positions";
  } else if (pathname.includes("/settings")) {
    // Example for a future settings tab
    activeTab = "settings";
  }

  return (
    <div className="p-4 md:p-6">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px] mb-4">
          <TabsTrigger value="groups" asChild>
            <Link href={`/dashboard/${electionId}/configurations/groups`}>
              Groups
            </Link>
          </TabsTrigger>
          <TabsTrigger value="positions" asChild>
            <Link href={`/dashboard/${electionId}/configurations/positions`}>
              Positions
            </Link>
          </TabsTrigger>
          {/* <TabsTrigger value="settings">General Settings</TabsTrigger> */}
        </TabsList>
        {/* TabsContent is not strictly needed here if Link navigation is used,
            but children will render the active page based on the route */}
        {children}
      </Tabs>
    </div>
  );
}
