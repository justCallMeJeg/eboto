"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChartNoAxesColumnIcon,
  HomeIcon,
  Settings,
  UserIcon,
} from "lucide-react";
import { redirect, usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const electionID = pathname.split("/")[2] as string;

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
            redirect(`/dashboard/${electionID}/configurations`);
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">Configurations</span>
        </Button>
        <Separator className="my-2 w-full" />
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          onClick={() => {
            redirect(`/dashboard/${electionID}/users`);
          }}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span className="text-sm font-med">Users</span>
        </Button>
        <Separator className="my-2 w-full" />
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
      </div>
      <div className="">{children}</div>
    </div>
  );
}
