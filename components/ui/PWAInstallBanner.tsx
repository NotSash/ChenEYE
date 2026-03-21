"use client";

import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { ChenEYELogo } from "@/components/icons/ChenEYELogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Check if previously dismissed (24-hour cooldown)
    const lastDismissed = localStorage.getItem("pwa-install-dismissed");
    if (lastDismissed && Date.now() - Number(lastDismissed) < 24 * 60 * 60 * 1000) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
  };

  if (installed || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[55] md:left-auto md:right-6 md:bottom-6 md:max-w-sm animate-fade-in-up">
      <div className="rounded-2xl p-4 glass-frost border border-[var(--brand-primary)]/20" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center shrink-0 shadow-md">
            <ChenEYELogo size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--text-primary)]">Install ChenEYE</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Add to home screen for the best experience</p>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={handleInstall} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-primary)] hover:opacity-90 active:scale-95 transition-all">
                <Download size={14} /> Install App
              </button>
              <button onClick={handleDismiss} className="px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
