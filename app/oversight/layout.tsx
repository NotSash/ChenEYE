import { SessionProvider } from "@/components/providers/SessionProvider";
import OversightGuard from "@/components/admin/OversightGuard";

export default function OversightLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OversightGuard>{children}</OversightGuard>
    </SessionProvider>
  );
}
