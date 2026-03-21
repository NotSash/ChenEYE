"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Check, X, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <Check size={18} />,
  error: <X size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "var(--status-approved-bg)", border: "var(--status-approved)", icon: "var(--status-approved)" },
  error: { bg: "var(--status-rejected-bg)", border: "var(--status-rejected)", icon: "var(--status-rejected)" },
  warning: { bg: "var(--status-pending-bg)", border: "var(--status-pending)", icon: "var(--status-pending)" },
  info: { bg: "var(--status-review-bg)", border: "var(--status-review)", icon: "var(--status-review)" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const value: ToastContextType = {
    toast: addToast,
    success: (t, m) => addToast("success", t, m),
    error: (t, m) => addToast("error", t, m),
    warning: (t, m) => addToast("warning", t, m),
    info: (t, m) => addToast("info", t, m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none" style={{ maxWidth: "min(380px, calc(100vw - 32px))" }}>
        {toasts.map((t) => {
          const c = colors[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto rounded-2xl p-3.5 shadow-xl border flex items-start gap-3 toast-enter"
              style={{
                background: `var(--bg-card)`,
                borderColor: c.border,
                borderLeftWidth: "3px",
                boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px ${c.border}20`,
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg, color: c.icon }}>
                {icons[t.type]}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{t.title}</p>
                {t.message && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes toastEnter {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .toast-enter {
          animation: toastEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </ToastContext.Provider>
  );
}
