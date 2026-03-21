"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function OversightGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile && profile.role === "reporter") {
      router.replace("/dashboard");
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="w-10 h-10 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profile?.role === "reporter") return null;

  return <AdminSidebar>{children}</AdminSidebar>;
}
