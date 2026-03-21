"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { Mail, Phone, User, Lock, ArrowRight, ArrowLeft, Check, Shield } from "lucide-react";
import { Input } from "../ui/Input";
import { Checkbox } from "../ui/Input";
import { Button } from "../ui/Button";
import { getPasswordStrength, normalizePhone } from "@/lib/auth";
import Link from "next/link";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  otp: string;
  phoneVerified: boolean;
  age: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  falseReportAck: boolean;
  anonymityAck: boolean;
}

const initialData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  otp: "",
  phoneVerified: false,
  age: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
  privacyAccepted: false,
  falseReportAck: false,
  anonymityAck: false,
};

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ anonymousId: string } | null>(null);

  const update = (field: keyof FormData, value: string | boolean) => {
    setData((d) => ({ ...d, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setGlobalError("");
  };

  const validateStep1 = () => {
    const errs: typeof errors = {};
    if (data.fullName.length < 2) errs.fullName = "Name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Invalid email address";
    if (!/^(\+91)?[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) errs.phone = "Enter a valid Indian phone number";
    if (!data.phoneVerified) errs.otp = "Please verify your phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: typeof errors = {};
    const age = parseInt(data.age);
    if (!data.age || isNaN(age) || age < 18) errs.age = "You must be 18 or older to use ChenEYE";
    if (data.password.length < 8) errs.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(data.password)) errs.password = "Must contain at least 1 uppercase letter";
    else if (!/[a-z]/.test(data.password)) errs.password = "Must contain at least 1 lowercase letter";
    else if (!/[0-9]/.test(data.password)) errs.password = "Must contain at least 1 number";
    else if (!/[^A-Za-z0-9]/.test(data.password)) errs.password = "Must contain at least 1 special character (e.g. @#$!%)";
    if (data.password !== data.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOTP = async () => {
    // Validate phone and email first
    if (!/^(\+91)?[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
      setErrors({ phone: "Enter a valid Indian phone number" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setErrors({ email: "Enter a valid email to receive the OTP" });
      return;
    }

    setLoading(true);
    setGlobalError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(data.phone),
          email: data.email,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setGlobalError(result.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setOtpSent(true);
    } catch {
      setGlobalError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!data.otp || data.otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit code" });
      return;
    }

    setLoading(true);
    setGlobalError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(data.phone),
          otp: data.otp.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrors({ otp: result.error || "Verification failed" });
        setLoading(false);
        return;
      }

      // Set phoneVerified directly to ensure state is updated
      setData((d) => ({ ...d, phoneVerified: true }));
      setErrors({});
    } catch {
      setGlobalError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    if (!data.termsAccepted || !data.privacyAccepted || !data.falseReportAck || !data.anonymityAck) return;

    setLoading(true);
    setGlobalError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: normalizePhone(data.phone),
          password: data.password,
          confirmPassword: data.confirmPassword,
          age: data.age,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setGlobalError(result.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Show success with anonymous ID before redirecting
      setSuccessInfo({ anonymousId: result.anonymousId });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 4000);
    } catch {
      setGlobalError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const strength = getPasswordStrength(data.password);

  // Success screen
  if (successInfo) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--status-approved-bg)] flex items-center justify-center">
          <Check size={32} className="text-[var(--status-approved)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Account Created! 🎉</h2>
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Your Anonymous ID</p>
          <p className="text-2xl font-mono font-bold text-[var(--brand-primary)]">{successInfo.anonymousId}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            This ID represents you to police. Your real identity stays hidden.
          </p>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          A welcome email has been sent. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Global error */}
      {globalError && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--bg-danger-subtle)] border border-[var(--status-rejected)]/20">
          <p className="text-sm text-[var(--status-rejected)]">{globalError}</p>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                s < step && "bg-[var(--status-approved)] text-white",
                s === step && "bg-[var(--brand-primary)] text-white",
                s > step && "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
              )}
            >
              {s < step ? <Check size={16} /> : s}
            </div>
            {s < 3 && (
              <div className={clsx("w-12 h-0.5 rounded-full", s < step ? "bg-[var(--status-approved)]" : "bg-[var(--border-primary)]")} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Contact */}
      {step === 1 && (
        <div className="space-y-4">
          <Input
            label="Full Name"
            required
            value={data.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            error={errors.fullName}
            leftIcon={<User size={16} />}
            placeholder="Enter your full name"
          />
          <Input
            label="Email Address"
            required
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
            leftIcon={<Mail size={16} />}
            placeholder="you@example.com"
          />
          <div className="space-y-2">
            <Input
              label="Phone Number"
              required
              type="tel"
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              error={errors.phone}
              leftIcon={<Phone size={16} />}
              placeholder="+91 98765 43210"
              rightIcon={
                data.phoneVerified ? (
                  <Check size={16} className="text-[var(--status-approved)]" />
                ) : undefined
              }
            />
            {!data.phoneVerified && (
              <div className="flex gap-2">
                {!otpSent ? (
                  <Button size="sm" variant="secondary" onClick={handleSendOTP} loading={loading}>
                    Send OTP
                  </Button>
                ) : (
                  <>
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={data.otp}
                      onChange={(e) => update("otp", e.target.value)}
                      error={errors.otp}
                      className="flex-1"
                    />
                    <Button size="sm" variant="secondary" onClick={handleVerifyOTP} loading={loading}>
                      Verify
                    </Button>
                  </>
                )}
              </div>
            )}
            {otpSent && !data.phoneVerified && (
              <p className="text-xs text-[var(--text-secondary)]">
                📧 OTP sent to <strong>{data.email}</strong>. Check your inbox.
              </p>
            )}
          </div>
          <Button fullWidth onClick={handleNext} rightIcon={<ArrowRight size={16} />}>
            Next
          </Button>
        </div>
      )}

      {/* Step 2: Password */}
      {step === 2 && (
        <div className="space-y-4">
          <Input
            label="Age"
            required
            type="number"
            value={data.age}
            onChange={(e) => update("age", e.target.value)}
            error={errors.age}
            placeholder="Your age"
          />
          <div className="space-y-2">
            <Input
              label="Password"
              required
              type="password"
              value={data.password}
              onChange={(e) => update("password", e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              placeholder="Create a strong password"
            />
            {data.password && (
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(strength.score / 6) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
          </div>
          <Input
            label="Confirm Password"
            required
            type="password"
            value={data.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            leftIcon={<Lock size={16} />}
            placeholder="Confirm your password"
          />
          <div className="flex gap-3">
            <Button fullWidth variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Button fullWidth onClick={handleNext} rightIcon={<ArrowRight size={16} />}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">Name</span>
              <span className="text-[var(--text-primary)] font-medium">{data.fullName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">Email</span>
              <span className="text-[var(--text-primary)] font-medium">{data.email.replace(/(.{3}).*(@.*)/, "$1***$2")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">Phone</span>
              <span className="text-[var(--text-primary)] font-medium">{data.phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2")}</span>
            </div>
          </div>

          <div className="glass rounded-xl p-4 text-center">
            <Shield size={24} className="mx-auto text-[var(--brand-secondary)] mb-2" />
            <p className="text-xs text-[var(--text-secondary)]">Your anonymous ID will be generated upon registration</p>
          </div>

          <div className="space-y-3">
            <Checkbox
              label="I agree to the Terms of Service"
              checked={data.termsAccepted}
              onChange={(v) => update("termsAccepted", v)}
            />
            <Checkbox
              label="I agree to the Privacy Policy"
              checked={data.privacyAccepted}
              onChange={(v) => update("privacyAccepted", v)}
            />
            <Checkbox
              label="I understand that filing false reports is punishable under IPC Section 182 and will result in account ban after 3 warnings"
              checked={data.falseReportAck}
              onChange={(v) => update("falseReportAck", v)}
            />
            <Checkbox
              label="I understand my identity will remain anonymous but my reports will be reviewed by police officials"
              checked={data.anonymityAck}
              onChange={(v) => update("anonymityAck", v)}
            />
          </div>

          <div className="flex gap-3">
            <Button fullWidth variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
              loading={loading}
              disabled={!data.termsAccepted || !data.privacyAccepted || !data.falseReportAck || !data.anonymityAck}
            >
              Create Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
