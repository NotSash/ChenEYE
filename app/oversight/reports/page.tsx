"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, FileText, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

interface Report {
  report_id: string;
  created_at: string;
  vehicle_number: string;
  violation_type: string;
  location_text: string;
  status: string;
  reporter_anonymous_id: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  submitted: { bg: "var(--status-pending-bg)", text: "var(--status-pending)", label: "Pending", dot: "#F59E0B" },
  under_review: { bg: "var(--status-review-bg)", text: "var(--status-review)", label: "Under Review", dot: "#3B82F6" },
  approved: { bg: "var(--status-approved-bg)", text: "var(--status-approved)", label: "Approved", dot: "#22C55E" },
  rejected: { bg: "var(--status-rejected-bg)", text: "var(--status-rejected)", label: "Rejected", dot: "#EF4444" },
  action_taken: { bg: "var(--status-action-bg)", text: "var(--status-action)", label: "Action Taken", dot: "#8B5CF6" },
};

const filterOptions = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Pending" },
  { value: "under_review", label: "Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "action_taken", label: "Action" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = (supabase.from("reports") as any)
        .select("report_id, created_at, vehicle_number, violation_type, location_text, status, reporter_anonymous_id")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filter !== "all") query = query.eq("status", filter);
      if (dateFrom) query = query.gte("created_at", new Date(dateFrom).toISOString());
      if (dateTo) query = query.lte("created_at", new Date(dateTo + "T23:59:59").toISOString());

      const { data } = await query;
      if (data) setReports(data);
      setLoading(false);
    };
    fetchReports();
  }, [filter, dateFrom, dateTo]);

  const filtered = reports.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.vehicle_number.toLowerCase().includes(s) || r.report_id.toLowerCase().includes(s) || r.violation_type.toLowerCase().includes(s);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-4 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-[var(--text-primary)]">All Reports</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{filtered.length} total</p>
        </div>
      </div>

      {/* Search — prominent, full-width */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          placeholder="Search vehicle, ID, or violation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all placeholder:text-[var(--text-tertiary)]"
        />
      </div>

      {/* Filter Chips — scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterOptions.map((f) => {
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 touch-target ${
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-md"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--brand-primary)]/50 active:scale-95"
              }`}
              style={isActive ? { boxShadow: "0 2px 12px rgba(234, 88, 12, 0.3)" } : {}}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--text-tertiary)] font-medium shrink-0">Date:</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors"
        />
        <span className="text-xs text-[var(--text-tertiary)]">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors"
        />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[var(--status-rejected)] hover:bg-[var(--bg-danger-subtle)] transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <Card variant="default" padding="none" className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                {["Report ID", "Date", "Vehicle No.", "Violation", "Location", "Status", "Reporter", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-[var(--text-tertiary)]">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-[var(--text-tertiary)]">No reports match your filters</td></tr>
              ) : (
                filtered.map((r) => {
                  const s = statusColors[r.status] || statusColors.submitted;
                  return (
                    <tr key={r.report_id} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-[var(--text-primary)]">{r.report_id}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td className="px-4 py-3 font-mono text-[var(--text-primary)]">{r.vehicle_number}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{r.violation_type}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[150px] truncate">{r.location_text}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[var(--text-tertiary)]">{r.reporter_anonymous_id}</td>
                      <td className="px-4 py-3">
                        <Link href={`/oversight/reports/${r.report_id}`} className="text-[var(--brand-primary)] text-xs font-medium hover:underline">View →</Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2.5 stagger-children">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center mb-3">
              <FileText size={24} className="text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No Reports Found</p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {search ? "Try a different search term" : "No reports match this filter"}
            </p>
          </div>
        ) : (
          filtered.map((r) => {
            const s = statusColors[r.status] || statusColors.submitted;
            return (
              <Link key={r.report_id} href={`/oversight/reports/${r.report_id}`} className="block">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] active:scale-[0.98] transition-all duration-150 hover:border-[var(--brand-primary)]/30">
                  {/* Top Row: ID + Status */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                      <span className="text-xs font-mono font-bold text-[var(--brand-primary)]">{r.report_id}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 uppercase tracking-wider" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                  </div>

                  {/* Main Content */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight mb-1 truncate">
                        {r.vehicle_number}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mb-0.5">{r.violation_type}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate">{r.location_text}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
