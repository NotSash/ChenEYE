"use client";

import React, { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect based on role
      window.location.href = data.redirectTo || "/dashboard";
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-[var(--bg-danger-subtle)] border border-[var(--status-rejected)]/20">
          <p className="text-sm text-[var(--status-rejected)]">{error}</p>
        </div>
      )}
      <Input
        label="Email Address"
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={16} />}
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        required
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={16} />}
        placeholder="Enter your password"
      />
      <div className="flex items-center justify-between">
        <Checkbox label="Remember me" checked={remember} onChange={setRemember} />
        <Link href="/forgot-password" className="text-sm text-[var(--text-link)] hover:underline">
          Forgot Password?
        </Link>
      </div>
      <Button fullWidth type="submit" loading={loading} rightIcon={<ArrowRight size={16} />}>
        Login
      </Button>
    </form>
  );
}
