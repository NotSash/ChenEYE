"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  Home, Plus, FileText, Map, Bell, User, LogOut, Menu, ChevronLeft, Sun, Moon,
} from "lucide-react";
import { ChenEYELogoFull, ChenEYELogo } from "../icons/ChenEYELogo";
import { useSession } from "../providers/SessionProvider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "New Report", href: "/dashboard/report/new", icon: Plus },
  { label: "My Reports", href: "/dashboard/reports", icon: FileText },
  { label: "Violation Map", href: "/dashboard/map", icon: Map },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading: sessionLoading } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(current);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("cheneye-theme", next);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen-real flex bg-[var(--bg-secondary)]">
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          "hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-[var(--border-primary)] glass-frost transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={clsx("flex items-center h-16 px-4 border-b border-[var(--border-primary)]", collapsed && "justify-center")}>
          {collapsed ? <ChenEYELogo size={28} /> : <ChenEYELogoFull size="sm" />}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 touch-target",
                  active
                    ? "bg-[var(--bg-accent-subtle)] text-[var(--brand-primary)] border-l-[3px] border-[var(--brand-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[var(--border-primary)] space-y-1">
          <button
            onClick={toggleTheme}
            className={clsx(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors",
              collapsed && "justify-center px-0"
            )}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            {!collapsed && <span>Toggle Theme</span>}
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={clsx(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--status-rejected)] hover:bg-[var(--bg-danger-subtle)] transition-colors",
              collapsed && "justify-center px-0",
              loggingOut && "opacity-50 cursor-wait"
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span>{loggingOut ? "Logging out..." : "Logout"}</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center justify-center w-full py-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <ChevronLeft size={18} className={clsx("transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen-real">
        {/* Top bar */}
        <header className="sticky top-0 z-50 h-14 sm:h-16 flex items-center justify-between px-4 md:px-6 border-b border-[var(--border-primary)] glass-frost safe-area-top">
          <div className="flex items-center gap-3">
            <span className="md:hidden"><ChenEYELogo size={28} /></span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] hidden md:block">
              {navItems.find((n) => isActive(n.href))?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors touch-target"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link
              href="/dashboard/notifications"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors touch-target"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--status-rejected)] animate-pulse" />
            </Link>
            <Link
              href="/dashboard/profile"
              className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-medium"
            >
              {userInitial}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-frost border-t border-[var(--border-primary)] safe-area-bottom">
          <div className="flex items-center justify-around py-2">
            {[navItems[0], navItems[2], navItems[1], navItems[3], navItems[5]].map((item, i) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const isCenter = i === 2;

              if (isCenter) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative -mt-6 w-14 h-14 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform" style={{ boxShadow: '0 4px 20px rgba(234, 88, 12, 0.35)' }}
                  >
                    <Plus size={24} />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[56px] touch-target",
                    active ? "text-[var(--brand-primary)]" : "text-[var(--text-tertiary)]"
                  )}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
