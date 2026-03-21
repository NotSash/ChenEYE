"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  Home, FileText, Clock, LogOut, Key, ChevronLeft, Shield, Loader2, Menu, X,
} from "lucide-react";
import { ChenEYELogoFull, ChenEYELogo } from "../icons/ChenEYELogo";
import { useSession } from "@/components/providers/SessionProvider";

const adminNav = [
  { label: "Dashboard", href: "/oversight/dashboard", icon: Home },
  { label: "All Reports", href: "/oversight/reports", icon: FileText },
  { label: "Pending", href: "/oversight/reports?status=pending", icon: Clock },
];

const superAdminNav = [
  { label: "Invite Codes", href: "/oversight/invites", icon: Key },
];

// Mobile bottom nav items
const mobileNav = [
  { label: "Home", href: "/oversight/dashboard", icon: Home },
  { label: "Reports", href: "/oversight/reports", icon: FileText },
  { label: "Pending", href: "/oversight/reports?status=pending", icon: Clock },
];

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSuperAdmin = profile?.role === "super_admin";

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href.includes("?")) {
      const base = href.split("?")[0];
      const params = new URLSearchParams(href.split("?")[1]);
      return pathname === base && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("status") === params.get("status");
    }
    if (href === "/oversight/dashboard") return pathname === "/oversight/dashboard";
    if (href === "/oversight/reports") return pathname === "/oversight/reports" && (typeof window === "undefined" || !window.location.search);
    return pathname.startsWith(href);
  };

  const renderNav = (items: typeof adminNav) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          title={collapsed ? item.label : undefined}
          onClick={() => setMobileMenuOpen(false)}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            active
              ? "bg-[var(--bg-accent-subtle)] text-[var(--brand-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
            collapsed && "justify-center px-0"
          )}
        >
          <Icon size={18} className="shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      );
    });

  return (
    <div className="admin-layout">
      {/* Desktop Sidebar */}
      <aside className={clsx(
        "hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-[var(--border-primary)] bg-[var(--bg-card)] transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        <div className={clsx("flex items-center h-16 px-4 border-b border-[var(--border-primary)]", collapsed && "justify-center")}>
          {collapsed ? <ChenEYELogo size={28} /> : <ChenEYELogoFull size="sm" />}
        </div>

        {!collapsed && (
          <div className="px-4 py-2">
            <span className={clsx(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              isSuperAdmin
                ? "bg-[var(--status-action-bg)] text-[var(--status-action)]"
                : "bg-[var(--status-review-bg)] text-[var(--status-review)]"
            )}>
              <Shield size={10} />
              {isSuperAdmin ? "Super Admin" : "Police Admin"}
            </span>
          </div>
        )}

        <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
          {renderNav(adminNav)}
          {isSuperAdmin && (
            <>
              <div className="h-px bg-[var(--border-primary)] my-3" />
              {!collapsed && <p className="px-3 text-[10px] font-semibold uppercase text-[var(--text-tertiary)] mb-1">Administration</p>}
              {renderNav(superAdminNav)}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-[var(--border-primary)]">
          <button onClick={handleLogout} disabled={loggingOut} className={clsx("flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-[var(--status-rejected)] hover:bg-[var(--bg-danger-subtle)] transition-colors disabled:opacity-50", collapsed && "justify-center px-0")}>
            {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            {!collapsed && <span>{loggingOut ? "Logging out..." : "Logout"}</span>}
          </button>
          <button onClick={() => setCollapsed((c) => !c)} className="flex items-center justify-center w-full py-2 mt-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            <ChevronLeft size={16} className={clsx("transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
      </aside>

      {/* Mobile Slide-out Menu (overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--bg-card)] border-r border-[var(--border-primary)] flex flex-col shadow-2xl" style={{ animation: "slideInLeft 0.2s ease-out" }}>
            <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border-primary)]">
              <ChenEYELogoFull size="sm" />
              <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] active:scale-95 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-[var(--border-primary)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white flex items-center justify-center text-sm font-bold shadow-md">{initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{profile?.full_name || "Admin"}</p>
                  <span className={clsx(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-0.5",
                    isSuperAdmin ? "bg-[var(--status-action-bg)] text-[var(--status-action)]" : "bg-[var(--status-review-bg)] text-[var(--status-review)]"
                  )}>
                    <Shield size={8} />
                    {isSuperAdmin ? "Super Admin" : "Police Admin"}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
              {renderNav(adminNav)}
              {isSuperAdmin && (
                <>
                  <div className="h-px bg-[var(--border-primary)] my-3" />
                  <p className="px-3 text-[10px] font-semibold uppercase text-[var(--text-tertiary)] mb-1">Administration</p>
                  {renderNav(superAdminNav)}
                </>
              )}
            </nav>

            <div className="p-3 border-t border-[var(--border-primary)]">
              <button onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--status-rejected)] hover:bg-[var(--bg-danger-subtle)] transition-colors disabled:opacity-50">
                {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Header - visible distinction from page */}
        <header className="sticky top-0 z-50 h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b-2 border-[var(--brand-primary)]/20 glass-frost">
          <div className="flex items-center gap-3">
            <button className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] active:scale-95 transition-all touch-target" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <span className="md:hidden"><ChenEYELogo size={26} /></span>
            <h2 className="hidden md:block text-base font-semibold text-[var(--text-primary)]">ChenEYE Oversight Panel</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx(
              "hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold",
              isSuperAdmin ? "bg-[var(--status-action-bg)] text-[var(--status-action)]" : "bg-[var(--status-review-bg)] text-[var(--status-review)]"
            )}>
              <Shield size={10} />
              {isSuperAdmin ? "Super Admin" : "Police Admin"}
            </span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white flex items-center justify-center text-xs font-bold shadow-md">{initials}</div>
          </div>
        </header>

        {/* Content - extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation — high contrast, always visible */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-frost border-t-2 border-[var(--brand-primary)]/20 safe-area-bottom" style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-around h-16 px-1">
          {[...mobileNav, ...(isSuperAdmin ? [{ label: "Invites", href: "/oversight/invites", icon: Key }] : [])].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-14 rounded-xl transition-all duration-200 touch-target",
                  active
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--text-tertiary)] active:text-[var(--text-secondary)]"
                )}
              >
                <div className={clsx(
                  "w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200",
                  active && "bg-[var(--bg-accent-subtle)]"
                )}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className={clsx("text-[10px]", active ? "font-bold" : "font-medium")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx global>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .admin-layout {
          min-height: 100vh;
          display: flex;
          background: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
}
