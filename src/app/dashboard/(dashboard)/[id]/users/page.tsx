import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DashboardElectionHomePage() {
  return (
    // <div className="flex h-full w-full items-center justify-center">
    //   <h1 className="text-2xl font-bold">Dashboard Election Users Page</h1>
    // </div>

    <div className="grid h-full grid-cols-[200px_1fr]">
      <div className="flex w-full max-w-[300px] flex-col items-center border-r px-2 py-2 gap-1">
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          // onClick={() => {
          //   redirect(`/dashboard/${electionID}`);
          // }}
        >
          <span className="text-sm font-medium">User Groups</span>
        </Button>
        <Separator className="my-2 w-full" />
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          // onClick={() => {
          //   redirect(`/dashboard/${electionID}`);
          // }}
        >
          <span className="text-sm font-medium">Candidates</span>
        </Button>
        <Button
          className="w-full justify-start"
          variant="ghost"
          size="sm"
          // onClick={() => {
          //   redirect(`/dashboard/${electionID}`);
          // }}
        >
          <span className="text-sm font-medium">Voters</span>
        </Button>
      </div>
      {/* <div className="">{children}</div> */}
    </div>
  );
}
