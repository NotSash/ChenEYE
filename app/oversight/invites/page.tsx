"use client";

import React, { useEffect, useState } from "react";
import { Key, Plus, Copy, Check, Clock, XCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";

interface InviteCode {
  id: string;
  code_hash: string;
  role: string;
  generated_for: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const statusStyles: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  active: { bg: "var(--status-approved-bg)", text: "var(--status-approved)", label: "Active", icon: <Check size={12} /> },
  used: { bg: "var(--status-review-bg)", text: "var(--status-review)", label: "Used", icon: <Check size={12} /> },
  expired: { bg: "var(--bg-tertiary)", text: "var(--text-tertiary)", label: "Expired", icon: <Clock size={12} /> },
  revoked: { bg: "var(--status-rejected-bg)", text: "var(--status-rejected)", label: "Revoked", icon: <XCircle size={12} /> },
};

export default function InviteCodesPage() {
  const { profile } = useSession();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("police_admin");
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const fetchCodes = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await (supabase.from("invite_codes") as any)
      .select("id, code_hash, role, generated_for, status, created_at, expires_at")
      .order("created_at", { ascending: false });
    if (data) setCodes(data);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", generatedFor: name, role, expiresInDays: 7 }),
      });
      const result = await res.json();
      if (res.ok) {
        setGeneratedCode(result.code);
        fetchCodes();
      }
    } catch {}
    setGenerating(false);
  };

  const revokeCode = async (codeHash: string) => {
    await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke", codeHash }),
    });
    fetchCodes();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (profile?.role !== "super_admin") {
    return <div className="text-center py-16"><p className="text-[var(--text-secondary)]">Super Admin access required</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Invite Codes</h1>
        <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => { setShowModal(true); setGeneratedCode(""); setName(""); }}>Generate</Button>
      </div>

      <p className="text-xs text-[var(--text-tertiary)]">
        Share the registration link: <code className="text-[var(--brand-primary)]">/register/admin</code>
      </p>

      {/* Desktop Table */}
      <Card variant="default" padding="none" className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                {["Role", "Generated For", "Status", "Created", "Expires", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--text-tertiary)]">Loading...</td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--text-tertiary)]">No invite codes generated yet</td></tr>
              ) : (
                codes.map((c) => {
                  const s = statusStyles[c.status] || statusStyles.active;
                  return (
                    <tr key={c.id} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-hover)]">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.role === "super_admin" ? "bg-[var(--status-action-bg)] text-[var(--status-action)]" : "bg-[var(--status-review-bg)] text-[var(--status-review)]"}`}>
                          {c.role === "super_admin" ? "Super Admin" : "Police Admin"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-primary)]">{c.generated_for}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>{s.icon} {s.label}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(c.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td className="px-4 py-3">
                        {c.status === "active" && <Button variant="danger" size="sm" onClick={() => revokeCode(c.code_hash)}>Revoke</Button>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">Loading...</div>
        ) : codes.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">No invite codes generated yet</div>
        ) : (
          codes.map((c) => {
            const s = statusStyles[c.status] || statusStyles.active;
            return (
              <Card key={c.id} variant="default" padding="sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{c.generated_for}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${c.role === "super_admin" ? "bg-[var(--status-action-bg)] text-[var(--status-action)]" : "bg-[var(--status-review-bg)] text-[var(--status-review)]"}`}>
                      {c.role === "super_admin" ? "Super Admin" : "Police Admin"}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>{s.icon} {s.label}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
                  <span>Created: {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  <span>Expires: {new Date(c.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
                {c.status === "active" && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-primary)]">
                    <Button variant="danger" size="sm" fullWidth onClick={() => revokeCode(c.code_hash)}>Revoke Code</Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4" onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full md:max-w-md md:rounded-2xl rounded-t-2xl">
            <Card variant="elevated" padding="lg">
            {generatedCode ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--status-approved-bg)] flex items-center justify-center mb-4">
                  <Key size={28} className="text-[var(--status-approved)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Code Generated!</h3>
                <p className="text-xs text-[var(--text-tertiary)] mb-4">Share this code with {name}. It expires in 7 days.</p>
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] mb-2">
                  <code className="text-lg font-mono font-bold text-[var(--brand-primary)]">{generatedCode}</code>
                  <button onClick={() => copyCode(generatedCode)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                    {copied === generatedCode ? <Check size={16} className="text-[var(--status-approved)]" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mb-4">Registration page: /register/admin</p>
                <Button variant="outline" onClick={() => setShowModal(false)} fullWidth>Done</Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Generate Invite Code</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Intended For *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Inspector Rajan"
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Role *</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]">
                      <option value="police_admin">Police Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button fullWidth variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button fullWidth onClick={generateCode} disabled={!name.trim() || generating} leftIcon={generating ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}>
                      {generating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </div>
              </>
            )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
