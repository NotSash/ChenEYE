"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Copy, ArrowRight, Shield, AlertTriangle, Check } from "lucide-react";
import { Card, StatCard } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import AnalyticsSection from "@/components/reporter/AnalyticsSection";

interface RecentReport {
  report_id: string;
  violation_type: string;
  created_at: string;
  status: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: "var(--status-pending-bg)", text: "var(--status-pending)", label: "Submitted" },
  under_review: { bg: "var(--status-review-bg)", text: "var(--status-review)", label: "Under Review" },
  approved: { bg: "var(--status-approved-bg)", text: "var(--status-approved)", label: "Approved" },
  rejected: { bg: "var(--status-rejected-bg)", text: "var(--status-rejected)", label: "Rejected" },
  action_taken: { bg: "var(--status-action-bg)", text: "var(--status-action)", label: "Action Taken" },
};

export default function DashboardPage() {
  const { profile, loading: sessionLoading } = useSession();
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [stats, setStats] = useState({ total: 0, underReview: 0, actionTaken: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      // Fetch recent reports
      const { data: reports } = await supabase
        .from("reports")
        .select("report_id, violation_type, created_at, status")
        .eq("reporter_anonymous_id", profile.anonymous_id)
        .order("created_at", { ascending: false })
        .limit(5) as { data: RecentReport[] | null };

      if (reports) {
        setRecentReports(reports);
        setStats({
          total: reports.length,
          underReview: reports.filter((r) => r.status === "under_review" || r.status === "submitted").length,
          actionTaken: reports.filter((r) => r.status === "action_taken").length,
        });
      }

      // Get total count
      const { count } = await supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("reporter_anonymous_id", profile.anonymous_id);

      if (count !== null) {
        // Also get specific counts
        const { count: reviewCount } = await supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("reporter_anonymous_id", profile.anonymous_id)
          .in("status", ["submitted", "under_review"]);

        const { count: actionCount } = await supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("reporter_anonymous_id", profile.anonymous_id)
          .eq("status", "action_taken");

        setStats({
          total: count,
          underReview: reviewCount || 0,
          actionTaken: actionCount || 0,
        });
      }

      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const copyId = () => {
    if (profile?.anonymous_id) {
      navigator.clipboard.writeText(profile.anonymous_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
    if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
    if (hour < 21) return { text: "Good Evening", emoji: "🌅" };
    return { text: "Good Night", emoji: "🌙" };
  };
  const greeting = getGreeting();

  if (sessionLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 md:pb-6 page-enter">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {greeting.text}{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}! {greeting.emoji}
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-[var(--text-secondary)]">Your Anonymous ID:</span>
          <code className="px-2 py-0.5 rounded-lg bg-[var(--bg-tertiary)] text-sm font-mono text-[var(--brand-primary)] font-medium">
            {profile?.anonymous_id || "..."}
          </code>
          <button
            onClick={copyId}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            aria-label="Copy ID"
          >
            {copied ? <Check size={14} className="text-[var(--status-approved)]" /> : <Copy size={14} />}
          </button>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          This ID is how police track your reports without knowing your identity.
        </p>
      </div>

      {/* Quick Action */}
      <Card variant="glass" padding="lg" hoverable clickable onClick={() => window.location.href = "/dashboard/report/new"}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-primary)] flex items-center justify-center shrink-0">
            <Plus size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">📸 Report a Violation</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Spotted a traffic violation? Submit a report with photo evidence.
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-primary)]">
                New Report <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        <StatCard icon={<FileText size={20} />} label="Total Reports" value={loading ? "—" : undefined} color="blue" className="animate-fade-in-up">
          {!loading && <CountUp end={stats.total} className="text-2xl font-bold" />}
        </StatCard>
        <StatCard icon={<AlertTriangle size={20} />} label="Under Review" value={loading ? "—" : undefined} color="gold" className="animate-fade-in-up">
          {!loading && <CountUp end={stats.underReview} className="text-2xl font-bold" />}
        </StatCard>
        <StatCard icon={<Shield size={20} />} label="Action Taken" value={loading ? "—" : undefined} color="green" className="animate-fade-in-up">
          {!loading && <CountUp end={stats.actionTaken} className="text-2xl font-bold" />}
        </StatCard>
      </div>

      {/* Recent Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Reports</h3>
          <Link href="/dashboard/reports" className="text-sm text-[var(--text-link)] hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        ) : recentReports.length === 0 ? (
          <Card variant="outlined" padding="md">
            <div className="text-center py-6">
              <FileText size={28} className="mx-auto text-[var(--text-tertiary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">
                No reports yet. Submit your first report to help keep Chennai safe!
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3 stagger-children">
            {recentReports.map((report) => {
              const s = statusColors[report.status] || statusColors.submitted;
              return (
                <Card key={report.report_id} variant="default" padding="sm" hoverable clickable>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-accent-subtle)] flex items-center justify-center">
                        <FileText size={18} className="text-[var(--brand-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{report.violation_type}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {report.report_id} · {new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
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

      {/* Analytics */}
      <AnalyticsSection />

      {/* Safety Reminder */}
      <Card variant="outlined" padding="sm">
        <p className="text-xs text-[var(--text-tertiary)] flex items-start gap-2">
          <Shield size={14} className="shrink-0 mt-0.5" />
          Remember: Only submit genuine violations with clear evidence. False reports result in warnings and potential ban.
        </p>
      </Card>
    </div>
  );
}
