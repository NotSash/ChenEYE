"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, MapPin, Calendar, Clock, Car, AlertTriangle, Shield, Check, X, Eye } from "lucide-react";

interface ReportDetail {
  report_id: string; vehicle_number: string; vehicle_type: string | null; vehicle_color: string | null;
  violation_type: string; custom_violation: string | null; location_text: string;
  date: string; time: string; severity: string | null; is_repeat_offender: boolean;
  description: string; status: string; rejection_reason: string | null;
  action_description: string | null; created_at: string;
}
interface MediaItem { id: string; url: string; type: string; original_filename: string; }
interface StatusHistory { id: string; status: string; note: string | null; created_at: string; }

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  submitted: { bg: "var(--status-pending-bg)", text: "var(--status-pending)", label: "Submitted", icon: <Clock size={14} /> },
  under_review: { bg: "var(--status-review-bg)", text: "var(--status-review)", label: "Under Review", icon: <Eye size={14} /> },
  approved: { bg: "var(--status-approved-bg)", text: "var(--status-approved)", label: "Approved", icon: <Check size={14} /> },
  rejected: { bg: "var(--status-rejected-bg)", text: "var(--status-rejected)", label: "Rejected", icon: <X size={14} /> },
  action_taken: { bg: "var(--status-action-bg)", text: "var(--status-action)", label: "Action Taken", icon: <Shield size={14} /> },
};

export default function ReporterReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data: r } = await (supabase.from("reports") as any).select("*").eq("report_id", reportId).single();
      if (r) setReport(r);
      const { data: m } = await (supabase.from("report_media") as any).select("*").eq("report_id", reportId);
      if (m) setMedia(m);
      const { data: h } = await (supabase.from("report_status_history") as any).select("*").eq("report_id", reportId).order("created_at", { ascending: true });
      if (h) setHistory(h);
      setLoading(false);
    };
    fetch();
  }, [reportId]);

  if (loading) return <div className="max-w-3xl mx-auto"><div className="h-96 rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" /></div>;
  if (!report) return <div className="max-w-3xl mx-auto text-center py-16"><p className="text-[var(--text-secondary)]">Report not found</p></div>;

  const s = statusConfig[report.status] || statusConfig.submitted;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{report.report_id}</h1>
            <p className="text-xs text-[var(--text-tertiary)]">{new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: s.bg, color: s.text }}>{s.icon} {s.label}</span>
      </div>

      <Card variant="glass" padding="md">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Violation Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { icon: <Car size={16} />, label: "Vehicle", value: report.vehicle_number },
            { icon: <AlertTriangle size={16} />, label: "Violation", value: report.violation_type },
            { icon: <MapPin size={16} />, label: "Location", value: report.location_text },
            { icon: <Calendar size={16} />, label: "Date & Time", value: `${report.date} at ${report.time}` },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-accent-subtle)] flex items-center justify-center text-[var(--brand-primary)] shrink-0">{item.icon}</div>
              <div><p className="text-xs text-[var(--text-tertiary)]">{item.label}</p><p className="text-sm font-medium text-[var(--text-primary)]">{item.value}</p></div>
            </div>
          ))}
        </div>
        {report.severity && <p className="text-xs text-[var(--text-secondary)] mt-3">Severity: {report.severity}</p>}
      </Card>

      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Description</h3>
        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{report.description}</p>
      </Card>

      {media.length > 0 && (
        <Card variant="default" padding="md">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Evidence ({media.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {media.map((m) => (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="relative rounded-xl overflow-hidden border border-[var(--border-primary)] aspect-square bg-[var(--bg-tertiary)]">
                {m.type === "image" ? <img src={m.url} alt="Evidence" className="w-full h-full object-cover" /> : <video src={m.url} className="w-full h-full object-cover" />}
              </a>
            ))}
          </div>
        </Card>
      )}

      {history.length > 0 && (
        <Card variant="default" padding="md">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Timeline</h3>
          <div className="space-y-3">
            {history.map((h, i) => {
              const hs = statusConfig[h.status] || statusConfig.submitted;
              return (
                <div key={h.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: hs.bg, color: hs.text }}>{hs.icon}</div>
                    {i < history.length - 1 && <div className="w-0.5 h-6 bg-[var(--border-primary)]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{hs.label}</p>
                    {h.note && <p className="text-xs text-[var(--text-secondary)]">{h.note}</p>}
                    <p className="text-xs text-[var(--text-tertiary)]">{new Date(h.created_at).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {report.rejection_reason && <Card variant="outlined" padding="sm"><p className="text-xs text-[var(--status-rejected)]">❌ Rejected: {report.rejection_reason}</p></Card>}
      {report.action_description && <Card variant="outlined" padding="sm"><p className="text-xs text-[var(--status-approved)]">🛡️ Action: {report.action_description}</p></Card>}
    </div>
  );
}
