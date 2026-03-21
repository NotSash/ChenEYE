"use client";

import React from "react";

export function ChenEYELogo({ size = 40, variant = "color" }: { size?: number; variant?: "color" | "mono-light" | "mono-dark" }) {
  const primary = variant === "mono-light" ? "#FFFFFF" : variant === "mono-dark" ? "#1E3A5F" : "var(--brand-primary)";
  const secondary = variant === "mono-light" ? "#FFFFFF" : variant === "mono-dark" ? "#1E3A5F" : "var(--brand-secondary)";
  const accent = variant === "mono-light" ? "#FFFFFF" : variant === "mono-dark" ? "#1E3A5F" : "var(--brand-accent)";

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Eye outer shape */}
      <path
        d="M32 14C18 14 8 32 8 32s10 18 24 18 24-18 24-18S46 14 32 14z"
        fill={primary}
        opacity={0.15}
      />
      <path
        d="M32 14C18 14 8 32 8 32s10 18 24 18 24-18 24-18S46 14 32 14z"
        stroke={primary}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Iris */}
      <circle cx="32" cy="32" r="10" fill={secondary} opacity={0.2} />
      <circle cx="32" cy="32" r="10" stroke={secondary} strokeWidth="2.5" fill="none" />
      {/* Pupil / camera lens */}
      <circle cx="32" cy="32" r="5" fill={primary} />
      {/* Lens flare highlight */}
      <circle cx="29" cy="29" r="2" fill={accent} />
      {/* Road line in lower lid */}
      <path d="M20 42h6M30 42h4M38 42h6" stroke={primary} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
    </svg>
  );
}

export function ChenEYELogoFull({
  size = "md",
  showTagline = false,
  variant = "color",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  variant?: "color" | "mono-light" | "mono-dark";
}) {
  const sizeMap = { sm: 28, md: 36, lg: 48, xl: 64 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl", xl: "text-3xl" };
  const iconSize = sizeMap[size];

  const chen = variant === "mono-light" ? "text-white" : variant === "mono-dark" ? "text-[#1E3A5F]" : "text-[var(--brand-primary)]";
  const eye = variant === "mono-light" ? "text-white" : variant === "mono-dark" ? "text-[#0D9488]" : "text-[var(--brand-secondary)]";

  return (
    <div className="flex items-center gap-2">
      <ChenEYELogo size={iconSize} variant={variant} />
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-bold tracking-tight leading-none`}>
          <span className={chen}>Chen</span>
          <span className={eye}>EYE</span>
        </span>
        {showTagline && (
          <span className={`text-xs mt-0.5 ${variant === "mono-light" ? "text-white/70" : "text-[var(--text-tertiary)]"}`}>
            Be the eyes of Chennai&apos;s roads
          </span>
        )}
      </div>
    </div>
  );
}
