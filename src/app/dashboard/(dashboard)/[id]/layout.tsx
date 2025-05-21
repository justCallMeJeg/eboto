import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChartNoAxesColumnIcon,
  HomeIcon,
  Settings,
  UserIcon,
} from "lucide-react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-full grid-cols-[250px_1fr]">
      <div className="flex w-full max-w-[300px] flex-col items-center border-r px-2 py-2 gap-1">
        <Button className="w-full justify-start" variant="ghost" size="sm">
          <HomeIcon className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">Overview</span>
        </Button>
        <Button className="w-full justify-start" variant="ghost" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          <span className="text-sm font-medium">Configurations</span>
        </Button>
        <Separator className="my-2 w-full" />
        <Button className="w-full justify-start" variant="ghost" size="sm">
          <UserIcon className="mr-2 h-4 w-4" />
          <span className="text-sm font-med">Users</span>
        </Button>
        <Separator className="my-2 w-full" />
        <Button className="w-full justify-start" variant="ghost" size="sm">
          <ChartNoAxesColumnIcon className="mr-2 h-4 w-4" />
          <span className="text-sm font-med">Analytics</span>
        </Button>
      </div>
      <div className="">{children}</div>
    </div>
  );
}
