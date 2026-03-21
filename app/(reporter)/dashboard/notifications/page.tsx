"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Bell, BellOff, CheckCheck, FileText, AlertTriangle, Shield, Sparkles } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  report_id: string | null;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  report_update: <FileText size={18} className="text-[var(--brand-primary)]" />,
  warning: <AlertTriangle size={18} className="text-[var(--status-pending)]" />,
  welcome: <Sparkles size={18} className="text-[var(--brand-secondary)]" />,
  action_taken: <Shield size={18} className="text-[var(--status-approved)]" />,
};

export default function NotificationsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }) as { data: Notification[] | null };
    if (data) setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await (supabase.from("notifications") as any).update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    if (!user || notifications.filter((n) => !n.read).length === 0) return;
    const supabase = createClient();
    await (supabase.from("notifications") as any).update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (sessionLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--brand-primary)] bg-[var(--bg-accent-subtle)] hover:opacity-80 transition-opacity"
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
            <BellOff size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Notifications</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            You&apos;ll receive notifications when your reports are reviewed and when actions are taken.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => !notif.read && markAsRead(notif.id)}
              className="w-full text-left"
            >
              <Card
                variant={notif.read ? "default" : "glass"}
                padding="sm"
                hoverable
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.read ? "bg-[var(--bg-tertiary)]" : "bg-[var(--bg-accent-subtle)]"
                  }`}>
                    {typeIcons[notif.type] || <Bell size={18} className="text-[var(--text-tertiary)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${
                        notif.read ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"
                      }`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {new Date(notif.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
