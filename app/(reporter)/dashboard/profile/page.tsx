"use client";

import React from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, Mail, Phone, Calendar, AlertTriangle, Copy, Check, Globe, Palette } from "lucide-react";

export default function ProfilePage() {
  const { profile, loading } = useSession();
  const [copied, setCopied] = React.useState(false);

  const copyId = () => {
    if (profile?.anonymous_id) {
      navigator.clipboard.writeText(profile.anonymous_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-[var(--text-secondary)]">Could not load profile. Please login again.</p>
      </div>
    );
  }

  const maskedEmail = profile.email.replace(/(.{3}).*(@.*)/, "$1***$2");
  const createdDate = new Date(profile.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Profile</h1>

      {/* Anonymous ID Card */}
      <Card variant="glass" padding="lg">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">
              {profile.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{profile.full_name}</h2>
          <p className="text-sm text-[var(--text-tertiary)] capitalize">{profile.role.replace("_", " ")}</p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
            <Shield size={16} className="text-[var(--brand-primary)]" />
            <code className="text-lg font-mono font-bold text-[var(--brand-primary)]">
              {profile.anonymous_id}
            </code>
            <button onClick={copyId} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              {copied ? <Check size={16} className="text-[var(--status-approved)]" /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            This ID represents you to police. Your real identity stays hidden.
          </p>
        </div>
      </Card>

      {/* Personal Info */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-accent-subtle)] flex items-center justify-center">
              <Mail size={18} className="text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Email</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{maskedEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-accent-subtle)] flex items-center justify-center">
              <Phone size={18} className="text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Phone</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">Verified ✅ (hidden for privacy)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-accent-subtle)] flex items-center justify-center">
              <Calendar size={18} className="text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Member Since</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{createdDate}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Status */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Account Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
            <p className="text-xs text-[var(--text-tertiary)]">Status</p>
            <p className={`text-sm font-semibold ${
              profile.status === "active" ? "text-[var(--status-approved)]"
              : profile.status === "banned" ? "text-[var(--status-rejected)]"
              : "text-[var(--status-pending)]"
            }`}>
              {profile.status === "active" ? "✅ Active" : profile.status === "banned" ? "🚫 Banned" : "⚠️ Suspended"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
            <p className="text-xs text-[var(--text-tertiary)]">Warnings</p>
            <p className={`text-sm font-semibold ${
              profile.warnings === 0 ? "text-[var(--status-approved)]"
              : profile.warnings < 3 ? "text-[var(--status-pending)]"
              : "text-[var(--status-rejected)]"
            }`}>
              {profile.warnings}/3 {profile.warnings === 0 ? "🎉" : "⚠️"}
            </p>
          </div>
        </div>
        {profile.warnings > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-[var(--bg-warning-subtle)] border border-[var(--status-pending)]/20">
            <p className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-[var(--status-pending)]" />
              {profile.warnings < 3
                ? `You have ${3 - profile.warnings} warning(s) remaining before account ban.`
                : "Your account has been banned. You may file an appeal."}
            </p>
          </div>
        )}
      </Card>

      {/* Preferences */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[var(--text-tertiary)]" />
              <span className="text-sm text-[var(--text-primary)]">Language</span>
            </div>
            <span className="text-sm text-[var(--text-secondary)] capitalize">
              {profile.language === "en" ? "English" : profile.language === "ta" ? "தமிழ் (Tamil)" : "हिन्दी (Hindi)"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-[var(--text-tertiary)]" />
              <span className="text-sm text-[var(--text-primary)]">Theme</span>
            </div>
            <span className="text-sm text-[var(--text-secondary)] capitalize">{profile.theme}</span>
          </div>
        </div>
      </Card>

      {/* Safety Reminder */}
      <Card variant="outlined" padding="sm">
        <p className="text-xs text-[var(--text-tertiary)] flex items-start gap-2">
          <Shield size={14} className="shrink-0 mt-0.5" />
          Your identity is protected under India's DPDP Act 2023. Police officials only see your Anonymous ID.
        </p>
      </Card>
    </div>
  );
}
