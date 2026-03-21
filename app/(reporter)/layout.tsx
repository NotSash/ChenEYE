import DashboardNav from "@/components/reporter/DashboardNav";
import { SessionProvider } from "@/components/providers/SessionProvider";

export default function ReporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardNav>{children}</DashboardNav>
    </SessionProvider>
  );
}
