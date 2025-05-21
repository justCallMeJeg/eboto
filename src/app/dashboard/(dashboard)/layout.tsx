import { DashboardHeader } from "@/components/dashboard-header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full flex flex-col">
      <div className="sticky top-0 z-40">
        <DashboardHeader />
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
