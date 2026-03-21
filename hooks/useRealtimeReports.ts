"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook to subscribe to Supabase Realtime changes on the reports table.
 * Calls `onNewReport` when an INSERT event occurs.
 * Calls `onStatusChange` when an UPDATE event occurs.
 */
export function useRealtimeReports({
  onNewReport,
  onStatusChange,
  enabled = true,
}: {
  onNewReport?: (report: any) => void;
  onStatusChange?: (report: any) => void;
  enabled?: boolean;
}) {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channel = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "reports" },
        (payload: any) => {
          onNewReport?.(payload.new);
        }
      )
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "reports" },
        (payload: any) => {
          onStatusChange?.(payload.new);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);

  return channelRef;
}
