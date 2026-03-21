"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { FileText, Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  report_id: string;
  violation_type: string;
  vehicle_number: string;
  location_text: string;
  date: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: "var(--status-pending-bg)", text: "var(--status-pending)", label: "Submitted" },
  under_review: { bg: "var(--status-review-bg)", text: "var(--status-review)", label: "Under Review" },
  approved: { bg: "var(--status-approved-bg)", text: "var(--status-approved)", label: "Approved" },
  rejected: { bg: "var(--status-rejected-bg)", text: "var(--status-rejected)", label: "Rejected" },
  action_taken: { bg: "var(--status-action-bg)", text: "var(--status-action)", label: "Action Taken" },
};

const filterOptions = ["all", "submitted", "under_review", "approved", "rejected", "action_taken"];

export default function MyReportsPage() {
  const { profile, loading: sessionLoading } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchReports = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("reports")
        .select("id, report_id, violation_type, vehicle_number, location_text, date, status, created_at")
        .eq("reporter_anonymous_id", profile.anonymous_id)
        .order("created_at", { ascending: !sortNewest });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query as { data: Report[] | null; error: any };
      if (data) setReports(data);
      setLoading(false);
    };
    fetchReports();
  }, [profile, filter, sortNewest]);

  if (sessionLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Reports</h1>
        <Link
          href="/dashboard/report/new"
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[var(--brand-primary)] hover:opacity-90 transition-opacity"
        >
          + New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <Filter size={16} className="text-[var(--text-tertiary)] shrink-0" />
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            {f === "all" ? "All" : (statusConfig[f]?.label || f)}
          </button>
        ))}
        <button
          onClick={() => setSortNewest((s) => !s)}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors whitespace-nowrap"
        >
          <ArrowUpDown size={14} /> {sortNewest ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
            <FileText size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Reports Yet</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            {filter !== "all"
              ? `No reports with status "${statusConfig[filter]?.label || filter}".`
              : "You haven't submitted any reports yet. Help keep Chennai's roads safe!"}
          </p>
          <Link
            href="/dashboard/report/new"
            className="inline-flex px-6 py-3 rounded-xl text-sm font-medium text-white bg-[var(--brand-primary)] hover:opacity-90 transition-opacity"
          >
            📸 Submit Your First Report
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const s = statusConfig[report.status] || statusConfig.submitted;
            return (
              <Card key={report.id} variant="default" padding="sm" hoverable>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-accent-subtle)] flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-[var(--brand-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{report.violation_type}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">
                        {report.report_id} · {report.vehicle_number} · {report.location_text}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ml-3"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
