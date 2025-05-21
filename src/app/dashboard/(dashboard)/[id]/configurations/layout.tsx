"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { redirect, usePathname } from "next/navigation";

export default function DashboardElectionConfigPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const electionID = pathname.split("/")[2] as string;

  return (
    // <div className="flex h-full w-full items-center justify-center">
    //   <h1 className="text-2xl font-bold">Dashboard Election Users Page</h1>
    // </div>

    <div className="grid h-full grid-cols-[250px_1fr]">
      <div className="flex w-full max-w-[300px] flex-col border-r px-2 py-2 gap-1">
        <h1 className="text-md font-bold p-2">Election Configuration</h1>
        <Separator className="my-2 w-full" />
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}/configurations/positions`);
          }}
        >
          <span className="text-sm font-medium">Candidate Positions</span>
        </Button>
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}/configurations/groups`);
          }}
        >
          <span className="text-sm font-medium">User Groups</span>
        </Button>
      </div>
      <div>{children}</div>
    </div>
  );
}
