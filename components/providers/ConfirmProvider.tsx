"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handleConfirm = () => { state?.resolve(true); setState(null); };
  const handleCancel = () => { state?.resolve(false); setState(null); };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={handleCancel}>
          <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl confirm-enter">
            <Card variant="elevated" padding="lg">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-[var(--status-pending-bg)] flex items-center justify-center mb-4">
                  <AlertTriangle size={28} className="text-[var(--status-pending)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{state.options.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">{state.options.message}</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancel} fullWidth>{state.options.cancelLabel || "Cancel"}</Button>
                  <Button variant={state.options.variant || "danger"} onClick={handleConfirm} fullWidth>{state.options.confirmLabel || "Confirm"}</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes confirmEnter {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .confirm-enter { animation: confirmEnter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </ConfirmContext.Provider>
  );
}
