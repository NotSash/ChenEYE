"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FileText, CheckCircle, XCircle, Shield, AlertTriangle, BarChart3, Clock, ArrowRight } from "lucide-react";
import { StatCard, Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeReports } from "@/hooks/useRealtimeReports";
import { useToast } from "@/components/providers/ToastProvider";

interface Report {
  report_id: string;
  created_at: string;
  vehicle_number: string;
  violation_type: string;
  location_text: string;
  status: string;
  reporter_anonymous_id: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: "var(--status-pending-bg)", text: "var(--status-pending)", label: "Pending" },
  under_review: { bg: "var(--status-review-bg)", text: "var(--status-review)", label: "Under Review" },
  approved: { bg: "var(--status-approved-bg)", text: "var(--status-approved)", label: "Approved" },
  rejected: { bg: "var(--status-rejected-bg)", text: "var(--status-rejected)", label: "Rejected" },
  action_taken: { bg: "var(--status-action-bg)", text: "var(--status-action)", label: "Action Taken" },
};

export default function AdminDashboardPage() {
  const { profile } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, actionTaken: 0 });
  const [topViolations, setTopViolations] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const { data: allReports } = await (supabase.from("reports") as any)
      .select("report_id, created_at, vehicle_number, violation_type, location_text, status, reporter_anonymous_id")
      .order("created_at", { ascending: false })
      .limit(10);

    if (allReports) {
      setReports(allReports);
      const violationCounts: Record<string, number> = {};
      (allReports as Report[]).forEach((r) => {
        violationCounts[r.violation_type] = (violationCounts[r.violation_type] || 0) + 1;
      });
      const sorted = Object.entries(violationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      setTopViolations(sorted.map(([name, count]) => ({ name, count })));
    }

    const counts = await Promise.all([
      (supabase.from("reports") as any).select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
      (supabase.from("reports") as any).select("id", { count: "exact", head: true }).eq("status", "approved"),
      (supabase.from("reports") as any).select("id", { count: "exact", head: true }).eq("status", "rejected"),
      (supabase.from("reports") as any).select("id", { count: "exact", head: true }).eq("status", "action_taken"),
    ]);

    setStats({
      pending: counts[0].count || 0,
      approved: counts[1].count || 0,
      rejected: counts[2].count || 0,
      actionTaken: counts[3].count || 0,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime — auto-refresh when new reports come in
  useRealtimeReports({
    onNewReport: (report) => {
      toast.info("New Report", `${report.vehicle_number || "Unknown"} — ${report.violation_type || "New violation"}`);
      fetchData();
    },
    onStatusChange: () => {
      fetchData();
    },
    enabled: !loading,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
    if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
    if (hour < 21) return { text: "Good Evening", emoji: "🌅" };
    return { text: "Good Night", emoji: "🌙" };
  };
  const greeting = getGreeting();

  const maxViolation = topViolations.length > 0 ? topViolations[0].count : 1;

  return (
    <div className="max-w-7xl mx-auto space-y-5 page-enter">
      <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
        {greeting.text}{profile ? `, ${profile.full_name.split(" ")[0]}` : ""}! {greeting.emoji}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 stagger-children">
        <StatCard icon={<Clock size={20} />} label="Pending" color="gold" className="animate-fade-in-up">
          {loading ? "—" : <CountUp end={stats.pending} />}
        </StatCard>
        <StatCard icon={<CheckCircle size={20} />} label="Approved" color="green" className="animate-fade-in-up">
          {loading ? "—" : <CountUp end={stats.approved} />}
        </StatCard>
        <StatCard icon={<XCircle size={20} />} label="Rejected" color="red" className="animate-fade-in-up">
          {loading ? "—" : <CountUp end={stats.rejected} />}
        </StatCard>
        <StatCard icon={<Shield size={20} />} label="Action Taken" color="blue" className="animate-fade-in-up">
          {loading ? "—" : <CountUp end={stats.actionTaken} />}
        </StatCard>
      </div>

      {/* Recent Reports — Desktop Table */}
      <Card variant="default" padding="none" className="hidden md:block">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><FileText size={16} /> Recent Reports</h2>
          <Link href="/oversight/reports" className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1">View All <ArrowRight size={12} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                {["Report ID", "Date", "Vehicle", "Violation", "Location", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--text-tertiary)]">Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--text-tertiary)]">No reports yet</td></tr>
              ) : (
                reports.map((r) => {
                  const s = statusColors[r.status] || statusColors.submitted;
                  return (
                    <tr key={r.report_id} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer animate-fade-in-up">
                      <td className="px-4 py-3 font-mono font-medium text-[var(--text-primary)]">
                        <Link href={`/oversight/reports/${r.report_id}`} className="hover:text-[var(--brand-primary)]">{r.report_id}</Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td className="px-4 py-3 font-mono text-[var(--text-primary)]">{r.vehicle_number}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{r.violation_type}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[150px] truncate">{r.location_text}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/oversight/reports/${r.report_id}`} className="text-[var(--brand-primary)] text-xs hover:underline">View →</Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Reports — Mobile Cards */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Reports</h2>
          <Link href="/oversight/reports" className="text-xs text-[var(--brand-primary)] flex items-center gap-1">View All <ArrowRight size={12} /></Link>
        </div>
        {loading ? (
          <div className="space-y-2.5">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl skeleton-shimmer" />)}</div>
        ) : reports.length === 0 ? (
          <Card variant="default" padding="md"><p className="text-sm text-[var(--text-tertiary)] text-center py-4">No reports yet</p></Card>
        ) : (
          <div className="space-y-2.5 stagger-children">
            {reports.map((r) => {
              const s = statusColors[r.status] || statusColors.submitted;
              return (
                <Link key={r.report_id} href={`/oversight/reports/${r.report_id}`} className="block animate-fade-in-up">
                  <Card variant="default" padding="sm" className="active:scale-[0.98] transition-transform">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs font-mono font-bold text-[var(--brand-primary)]">{r.report_id}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{r.vehicle_number} — {r.violation_type}</p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">{r.location_text}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Violations */}
      {topViolations.length > 0 && (
        <Card variant="default" padding="md">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4"><BarChart3 size={16} /> Top Violations</h2>
          <div className="space-y-3">
            {topViolations.map((v, i) => (
              <div key={v.name} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)]">{v.name}</span>
                  <span className="font-medium text-[var(--text-primary)]">{v.count}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] transition-all duration-700"
                    style={{ width: `${(v.count / maxViolation) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
