"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { redirect, usePathname } from "next/navigation";

export default function DashboardElectionUsersPage({
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
        <h1 className="text-md font-bold p-2">User Management</h1>
        <Separator className="my-2 w-full" />
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}/users/candidates`);
          }}
        >
          <span className="text-sm font-medium">Candidates</span>
        </Button>
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}/users/voters`);
          }}
        >
          <span className="text-sm font-medium">Voters</span>
        </Button>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
