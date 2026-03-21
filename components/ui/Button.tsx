"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { clsx } from "clsx";

/* ═══ Spinner ═══ */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="20"
      height="20"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ═══ Variant & size maps ═══ */
const variantStyles: Record<string, string> = {
  primary:
    "bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)] focus-visible:ring-[var(--brand-primary)]",
  secondary:
    "bg-[var(--brand-secondary)] text-[var(--text-inverse)] hover:bg-[var(--brand-secondary-hover)] focus-visible:ring-[var(--brand-secondary)]",
  outline:
    "bg-transparent border-2 border-[var(--border-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] focus-visible:ring-[var(--brand-primary)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus-visible:ring-[var(--brand-primary)]",
  danger:
    "bg-[var(--status-rejected)] text-white hover:opacity-90 focus-visible:ring-[var(--status-rejected)]",
  success:
    "bg-[var(--status-approved)] text-white hover:opacity-90 focus-visible:ring-[var(--status-approved)]",
};

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  xl: "h-14 px-8 text-lg gap-3",
};

/* ═══ Button ═══ */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={clsx(
          // base
          "relative inline-flex items-center justify-center font-medium rounded-xl",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "active:scale-[0.98]",
          "min-w-[44px] min-h-[44px]",
          // variant & size
          variantStyles[variant],
          sizeStyles[size],
          // states
          isDisabled && "opacity-50 pointer-events-none",
          !isDisabled && "hover:scale-[1.02] hover:shadow-md",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && <Spinner className="mr-2" />}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{loading ? "Processing..." : children}</span>
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

/* ═══ IconButton ═══ */
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: "sm" | "md" | "lg";
  icon: React.ReactNode;
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "ghost", size = "md", icon, label, className, ...props }, ref) => {
    const iconSizes: Record<string, string> = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={clsx(
          "inline-flex items-center justify-center rounded-full",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "active:scale-[0.95]",
          "min-w-[44px] min-h-[44px]",
          variantStyles[variant],
          iconSizes[size],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

/* ═══ LinkButton ═══ */
export interface LinkButtonProps {
  href: string;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "relative inline-flex items-center justify-center font-medium rounded-xl",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
        "min-w-[44px] min-h-[44px]",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </Link>
  );
}
