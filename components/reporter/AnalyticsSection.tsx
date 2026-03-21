"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { BarChart3, TrendingUp, PieChart, Calendar } from "lucide-react";

interface Report {
  report_id: string;
  violation_type: string;
  status: string;
  created_at: string;
}

export default function AnalyticsSection() {
  const { profile } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await (supabase.from("reports") as any)
        .select("report_id, violation_type, status, created_at")
        .eq("reporter_anonymous_id", profile.anonymous_id)
        .order("created_at", { ascending: false });
      if (data) setReports(data);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  if (loading) return null;
  if (reports.length === 0) return null;

  // Compute analytics
  const statusCounts: Record<string, number> = {};
  const violationCounts: Record<string, number> = {};
  const monthlyCounts: Record<string, number> = {};

  reports.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    violationCounts[r.violation_type] = (violationCounts[r.violation_type] || 0) + 1;
    const month = new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    submitted: { label: "Submitted", color: "var(--status-pending)" },
    under_review: { label: "Under Review", color: "var(--status-review)" },
    approved: { label: "Approved", color: "var(--status-approved)" },
    rejected: { label: "Rejected", color: "var(--status-rejected)" },
    action_taken: { label: "Action Taken", color: "var(--status-action)" },
  };

  const topViolations = Object.entries(violationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxViolation = topViolations.length > 0 ? topViolations[0][1] : 1;

  const monthlyEntries = Object.entries(monthlyCounts).slice(-6);
  const maxMonthly = Math.max(...monthlyEntries.map(([, c]) => c), 1);

  const approvalRate = reports.length > 0 ? Math.round(((statusCounts["approved"] || 0) + (statusCounts["action_taken"] || 0)) / reports.length * 100) : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
        <TrendingUp size={20} /> Your Analytics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-center">
          <p className="text-2xl font-bold text-[var(--text-primary)]">{reports.length}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Total Reports</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-center">
          <p className="text-2xl font-bold text-[var(--status-approved)]">{approvalRate}%</p>
          <p className="text-xs text-[var(--text-tertiary)]">Approval Rate</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-center">
          <p className="text-2xl font-bold text-[var(--status-action)]">{statusCounts["action_taken"] || 0}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Actions Taken</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-center">
          <p className="text-2xl font-bold text-[var(--status-pending)]">{(statusCounts["submitted"] || 0) + (statusCounts["under_review"] || 0)}</p>
          <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Status Breakdown */}
        <Card variant="glass" padding="md">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <PieChart size={14} /> Status Breakdown
          </h4>
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const info = statusLabels[status] || { label: status, color: "var(--text-secondary)" };
              const pct = Math.round((count / reports.length) * 100);
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                  <span className="text-xs text-[var(--text-secondary)] flex-1">{info.label}</span>
                  <span className="text-xs font-mono text-[var(--text-primary)]">{count}</span>
                  <div className="w-16 h-1.5 rounded-full bg-[var(--bg-tertiary)]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: info.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Violations */}
        <Card variant="glass" padding="md">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <BarChart3 size={14} /> Top Violations
          </h4>
          <div className="space-y-3">
            {topViolations.map(([name, count], i) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--text-secondary)]">{name}</span>
                  <span className="text-xs font-mono text-[var(--text-primary)]">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)]">
                  <div className="h-full rounded-full bg-[var(--brand-primary)] transition-all" style={{ width: `${(count / maxViolation) * 100}%`, opacity: 1 - i * 0.15 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Trend */}
      {monthlyEntries.length > 1 && (
        <Card variant="glass" padding="md">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Calendar size={14} /> Monthly Trend
          </h4>
          <div className="flex items-end gap-2 h-24">
            {monthlyEntries.map(([month, count]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono text-[var(--text-primary)]">{count}</span>
                <div className="w-full rounded-t-lg bg-[var(--brand-primary)] transition-all" style={{ height: `${(count / maxMonthly) * 100}%`, minHeight: 4 }} />
                <span className="text-[9px] text-[var(--text-tertiary)]">{month}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
