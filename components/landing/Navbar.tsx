"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Menu, X } from "lucide-react";
import { ChenEYELogoFull, ChenEYELogo } from "../icons/ChenEYELogo";
import { LinkButton } from "../ui/Button";
import { AnimatedThemeToggle } from "../ui/animated-theme-toggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);



  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Safety", href: "#safety" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={clsx(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 safe-area-top",
          scrolled
            ? "glass-frost shadow-md py-2 sm:py-3"
            : "bg-transparent py-3 sm:py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="hidden sm:block">
              <ChenEYELogoFull size="md" />
            </span>
            <span className="sm:hidden">
              <ChenEYELogo size={28} />
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={clsx(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors touch-target",
                  scrolled
                    ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            <AnimatedThemeToggle scrolled={scrolled} />
            <LinkButton href="/login" variant="outline" size="sm"
              className={clsx(!scrolled && "!border-white/40 !text-white hover:!bg-white/10")}
            >
              Login
            </LinkButton>
            <LinkButton href="/register" variant="primary" size="sm">
              Get Started
            </LinkButton>
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-1">
            <AnimatedThemeToggle scrolled={scrolled} />
            <button
              onClick={() => setMobileOpen(true)}
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors touch-target",
                scrolled
                  ? "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  : "text-white hover:bg-white/10"
              )}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu — glass-frost */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="absolute inset-0 bg-[var(--bg-overlay)]"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute inset-y-0 right-0 w-full max-w-sm glass-frost shadow-2xl flex flex-col safe-area-top safe-area-bottom animate-slideIn"
            style={{ animationDuration: "0.25s" }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
              <ChenEYELogoFull size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] touch-target"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto scroll-momentum">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-colors text-base font-medium touch-target"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--border-primary)] flex flex-col gap-3">
              <LinkButton href="/login" variant="outline" fullWidth>Login</LinkButton>
              <LinkButton href="/register" variant="primary" fullWidth>Get Started</LinkButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
