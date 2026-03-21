"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Key, Eye, EyeOff, Loader2, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChenEYELogoFull } from "@/components/icons/ChenEYELogo";

type Step = "code" | "form" | "success";

export default function AdminRegisterPage() {
  const [step, setStep] = useState<Step>("code");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteInfo, setInviteInfo] = useState<{ role: string; generatedFor: string } | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateCode = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/validate-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setInviteInfo({ role: data.role, generatedFor: data.generatedFor });
        setStep("form");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setError("");

    if (!form.fullName || !form.email || !form.phone || !form.password) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      setError("Password must contain at least 1 special character");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setStep("success");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  const roleLabel = inviteInfo?.role === "super_admin" ? "Super Admin" : "Police Admin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <ChenEYELogoFull size="md" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Admin Registration</p>
        </div>

        {/* Step: Enter Invite Code */}
        {step === "code" && (
          <Card variant="glass" padding="lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-accent-subtle)] flex items-center justify-center mb-3">
                <Key size={28} className="text-[var(--brand-primary)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Enter Invite Code</h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">You need an invite code from a Super Admin to register as an admin.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Invite Code *</label>
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. INV-POLICE-A1B2C3D4"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-center text-lg font-mono font-bold text-[var(--text-primary)] tracking-widest outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>

              {error && <p className="text-sm text-[var(--status-rejected)] text-center">{error}</p>}

              <Button fullWidth onClick={validateCode} disabled={!inviteCode.trim() || loading}>
                {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <ArrowRight size={18} className="mr-2" />}
                {loading ? "Validating..." : "Continue"}
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-primary)] text-center">
              <p className="text-xs text-[var(--text-tertiary)]">
                Regular user? <Link href="/register" className="text-[var(--text-link)] hover:underline">Register here</Link>
              </p>
            </div>
          </Card>
        )}

        {/* Step: Registration Form */}
        {step === "form" && (
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep("code")} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Create Account</h2>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Registering as <span className={`font-medium ${inviteInfo?.role === "super_admin" ? "text-[var(--status-action)]" : "text-[var(--brand-primary)]"}`}>
                    {roleLabel}
                  </span> for {inviteInfo?.generatedFor}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Full Name *</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Inspector Rajan"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@police.gov.in"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 chars, 1 special character"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>

              {error && <p className="text-sm text-[var(--status-rejected)]">{error}</p>}

              <Button fullWidth onClick={handleRegister} disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Shield size={18} className="mr-2" />}
                {loading ? "Creating Account..." : `Register as ${roleLabel}`}
              </Button>
            </div>
          </Card>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <Card variant="glass" padding="lg">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-[var(--status-approved-bg)] flex items-center justify-center mb-4">
                <Check size={36} className="text-[var(--status-approved)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Account Created! 🎉</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                You have been registered as <strong className={inviteInfo?.role === "super_admin" ? "text-[var(--status-action)]" : "text-[var(--brand-primary)]"}>{roleLabel}</strong>
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mb-6">You can now log in and access the Oversight Panel.</p>

              <Link href="/login">
                <Button fullWidth>
                  <ArrowRight size={18} className="mr-2" /> Go to Login
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-tertiary)]">
          <Link href="/" className="hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
