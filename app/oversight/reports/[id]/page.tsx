"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Lightbox } from "@/components/ui/Lightbox";
import { useToast } from "@/components/providers/ToastProvider";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import {
  ArrowLeft, MapPin, Calendar, Clock, Car, AlertTriangle, Shield, Check, X, Eye,
  FileText, Loader2, ChevronRight,
} from "lucide-react";

interface ReportDetail {
  report_id: string;
  vehicle_number: string;
  vehicle_type: string | null;
  vehicle_color: string | null;
  violation_type: string;
  custom_violation: string | null;
  location_text: string;
  location_lat: number | null;
  location_lng: number | null;
  landmark: string | null;
  direction: string | null;
  date: string;
  time: string;
  severity: string | null;
  is_repeat_offender: boolean;
  description: string;
  status: string;
  rejection_reason: string | null;
  action_description: string | null;
  reporter_anonymous_id: string;
  created_at: string;
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

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useSession();
  const reportId = params.id as string;
  const isAdmin = profile?.role === "police_admin" || profile?.role === "super_admin";

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [reason, setReason] = useState("");
  const [actionDesc, setActionDesc] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

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

  const performAction = async (action: string, extra?: Record<string, string>) => {
    setActionLoading(true);
    try {
      const res = await window.fetch("/api/admin/report-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reportId, ...extra }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Action completed", `Report ${action.replace("_", " ")} successfully`);
        // Refresh
        const supabase = createClient();
        const { data: r } = await (supabase.from("reports") as any).select("*").eq("report_id", reportId).single();
        if (r) setReport(r);
        const { data: h } = await (supabase.from("report_status_history") as any).select("*").eq("report_id", reportId).order("created_at", { ascending: true });
        if (h) setHistory(h);
        setShowRejectModal(false);
        setShowWarnModal(false);
        setShowActionModal(false);
        setReason("");
        setActionDesc("");
      }
    } catch {}
    setActionLoading(false);
  };

  if (loading) return <div className="max-w-4xl mx-auto"><div className="h-96 rounded-2xl skeleton-shimmer" /></div>;
  if (!report) return <div className="max-w-4xl mx-auto text-center py-16"><p className="text-[var(--text-secondary)]">Report not found</p></div>;

  const s = statusConfig[report.status] || statusConfig.submitted;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{report.report_id}</h1>
            <p className="text-xs text-[var(--text-tertiary)]">Submitted {new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
          {s.icon} {s.label}
        </span>
      </div>

      {/* Violation Info */}
      <Card variant="glass" padding="md">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Violation Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { icon: <Car size={16} />, label: "Vehicle", value: report.vehicle_number },
            { icon: <AlertTriangle size={16} />, label: "Violation", value: report.violation_type + (report.custom_violation ? ` — ${report.custom_violation}` : "") },
            { icon: <MapPin size={16} />, label: "Location", value: report.location_text },
            { icon: <Calendar size={16} />, label: "Date & Time", value: `${report.date} at ${report.time}` },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-accent-subtle)] flex items-center justify-center text-[var(--brand-primary)] shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">{item.label}</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        {report.vehicle_type && <p className="text-xs text-[var(--text-secondary)] mt-3">Type: {report.vehicle_type} {report.vehicle_color ? `· ${report.vehicle_color}` : ""}</p>}
        {report.landmark && <p className="text-xs text-[var(--text-secondary)]">Landmark: {report.landmark}</p>}
        {report.severity && <p className="text-xs text-[var(--text-secondary)]">Severity: {report.severity}</p>}
        {report.is_repeat_offender && <p className="text-xs text-[var(--status-pending)]">⚠️ Reported as repeat offender</p>}
      </Card>

      {/* Description */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Description</h3>
        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{report.description}</p>
      </Card>

      {/* Evidence */}
      {media.length > 0 && (
        <Card variant="default" padding="md">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Evidence ({media.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {media.map((m) => (
              <button key={m.id} onClick={() => setLightboxIndex(media.indexOf(m))} className="relative rounded-xl overflow-hidden border border-[var(--border-primary)] aspect-square bg-[var(--bg-tertiary)] hover:border-[var(--brand-primary)] transition-colors cursor-zoom-in">
                {m.type === "image" ? <img src={m.url} alt="Evidence" className="w-full h-full object-cover" /> : <video src={m.url} className="w-full h-full object-cover" />}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60">
                  <p className="text-[10px] text-white truncate">{m.original_filename}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Status Timeline */}
      {history.length > 0 && (
        <Card variant="default" padding="md">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Status History</h3>
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

      {/* Reporter Info (admin only) */}
      {isAdmin && (
        <Card variant="outlined" padding="sm">
          <p className="text-xs text-[var(--text-tertiary)]">Reporter: <code className="text-[var(--brand-primary)]">{report.reporter_anonymous_id}</code></p>
        </Card>
      )}

      {/* Rejection/Action info */}
      {report.rejection_reason && (
        <Card variant="outlined" padding="sm">
          <p className="text-xs text-[var(--status-rejected)]">Rejection reason: {report.rejection_reason}</p>
        </Card>
      )}
      {report.action_description && (
        <Card variant="outlined" padding="sm">
          <p className="text-xs text-[var(--status-approved)]">Action taken: {report.action_description}</p>
        </Card>
      )}

      {/* Admin Actions */}
      {isAdmin && (report.status === "submitted" || report.status === "under_review") && (
        <Card variant="glass" padding="md">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Admin Actions</h3>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            {report.status === "submitted" && (
              <Button variant="outline" onClick={() => performAction("under_review")} disabled={actionLoading}>
                <Eye size={16} className="mr-1" /> Mark Under Review
              </Button>
            )}
            <Button variant="primary" onClick={() => performAction("approve")} disabled={actionLoading}>
              <Check size={16} className="mr-1" /> Approve
            </Button>
            <Button variant="danger" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
              <X size={16} className="mr-1" /> Reject
            </Button>
            <Button variant="outline" onClick={() => setShowActionModal(true)} disabled={actionLoading}>
              <Shield size={16} className="mr-1" /> Action Taken
            </Button>
            <Button variant="danger" onClick={async () => {
              const ok = await confirm({ title: "Warn Reporter?", message: "3 warnings = automatic ban. This is irreversible.", confirmLabel: "⚠️ Issue Warning", variant: "danger" });
              if (ok) setShowWarnModal(true);
            }} disabled={actionLoading}>
              <AlertTriangle size={16} className="mr-1" /> Warn Reporter
            </Button>
          </div>
        </Card>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setShowRejectModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-md w-full rounded-t-2xl sm:rounded-2xl">
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Reject Report</h3>
              <textarea placeholder="Reason for rejection..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors resize-none mb-4" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1">Cancel</Button>
                <Button variant="danger" onClick={() => performAction("reject", { reason })} disabled={!reason.trim() || actionLoading} className="flex-1">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : "Reject"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Warn Modal */}
      {showWarnModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setShowWarnModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-md w-full rounded-t-2xl sm:rounded-2xl">
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Issue Warning</h3>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">3 warnings = automatic ban. This is irreversible.</p>
              <textarea placeholder="Reason for warning..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors resize-none mb-4" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowWarnModal(false)} className="flex-1">Cancel</Button>
                <Button variant="danger" onClick={() => performAction("warn", { reason })} disabled={!reason.trim() || actionLoading} className="flex-1">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : "⚠️ Issue Warning"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Action Taken Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setShowActionModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-md w-full rounded-t-2xl sm:rounded-2xl">
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Mark Action Taken</h3>
              <textarea placeholder="Describe the action taken..." value={actionDesc} onChange={(e) => setActionDesc(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors resize-none mb-4" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowActionModal(false)} className="flex-1">Cancel</Button>
                <Button variant="primary" onClick={() => performAction("action_taken", { actionDescription: actionDesc })} disabled={actionLoading} className="flex-1">
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : "🛡️ Confirm"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Evidence Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={media.filter((m) => m.type === "image").map((m) => ({ url: m.url, name: m.original_filename }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

