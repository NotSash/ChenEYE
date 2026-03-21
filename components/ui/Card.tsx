"use client";

import React from "react";
import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/* ═════════════════════════════════════════════
   Card
   ═════════════════════════════════════════════ */

export interface CardProps {
  variant?: "default" | "glass" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const cardVariants: Record<string, string> = {
  default: "bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-sm",
  glass: "glass",
  elevated: "bg-[var(--bg-elevated)] shadow-lg",
  outlined: "bg-transparent border-2 border-[var(--border-secondary)]",
};

const cardPadding: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  variant = "default",
  padding = "md",
  hoverable = false,
  clickable = false,
  onClick,
  className,
  children,
}: CardProps) {
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); } : undefined}
      className={clsx(
        "rounded-2xl transition-all duration-200",
        cardVariants[variant],
        cardPadding[padding],
        hoverable && "hover:-translate-y-0.5 hover:shadow-lg",
        clickable && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ═════════════════════════════════════════════
   StatCard
   ═════════════════════════════════════════════ */

const colorMap: Record<string, { border: string; gradient: string }> = {
  blue: { border: "border-l-[var(--brand-primary)]", gradient: "from-[var(--bg-accent-subtle)]" },
  teal: { border: "border-l-[var(--brand-secondary)]", gradient: "from-[var(--bg-success-subtle)]" },
  gold: { border: "border-l-[var(--brand-accent)]", gradient: "from-[var(--bg-warning-subtle)]" },
  red: { border: "border-l-[var(--status-rejected)]", gradient: "from-[var(--bg-danger-subtle)]" },
  green: { border: "border-l-[var(--status-approved)]", gradient: "from-[var(--bg-success-subtle)]" },
  purple: { border: "border-l-[var(--status-action)]", gradient: "from-[var(--status-action-bg)]" },
};

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  children?: React.ReactNode;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  color?: keyof typeof colorMap;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  icon, label, value, children, change, changeType = "neutral", color = "blue", className, onClick,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      className={clsx(
        "glass rounded-2xl p-5 border-l-4 transition-all duration-200",
        colors.border,
        `bg-gradient-to-br ${colors.gradient} to-transparent`,
        onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-glow",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[var(--text-secondary)]">{icon}</span>
        {change !== undefined && (
          <span
            className={clsx(
              "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
              changeType === "positive" && "text-[var(--status-approved)] bg-[var(--status-approved-bg)]",
              changeType === "negative" && "text-[var(--status-rejected)] bg-[var(--status-rejected-bg)]",
              changeType === "neutral" && "text-[var(--text-tertiary)] bg-[var(--bg-tertiary)]"
            )}
          >
            {changeType === "positive" && <TrendingUp size={12} />}
            {changeType === "negative" && <TrendingDown size={12} />}
            {changeType === "neutral" && <Minus size={12} />}
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{children || value}</p>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

/* ═════════════════════════════════════════════
   InfoCard
   ═════════════════════════════════════════════ */

export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step?: number;
  className?: string;
}

export function InfoCard({ icon, title, description, step, className }: InfoCardProps) {
  return (
    <div
      className={clsx(
        "glass rounded-2xl p-6 text-center relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {step !== undefined && (
        <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--brand-primary)] text-white text-xs font-bold flex items-center justify-center">
          {step}
        </span>
      )}
      <div className="flex justify-center mb-4 text-[var(--brand-primary)]">{icon}</div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}
