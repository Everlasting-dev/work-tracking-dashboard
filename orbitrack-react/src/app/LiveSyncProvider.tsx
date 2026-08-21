import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LIVE_TABLES, RealtimeCoordinator, type RealtimeTablePayload } from "@/lib/realtimeCoordinator";
import { supabase } from "@/lib/supabase";
import { useExecutiveSession } from "@/lib/useExecutiveSession";
import { LiveSyncContext, type LiveSyncStatus } from "@/lib/liveSync";
import { useUiStore } from "@/stores/uiStore";

export function LiveSyncProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { session } = useExecutiveSession();
  const performanceMode = useUiStore((state) => state.performanceMode);
  const realtimeEnabled = useUiStore((state) => state.realtimeEnabled);
  const [status, setStatus] = useState<LiveSyncStatus>("idle");
  const [lastEventAt, setLastEventAt] = useState("");
  const [visible, setVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!session || !visible || !realtimeEnabled || performanceMode === "low-power") {
      setStatus("idle");
      if (!session) setLastEventAt("");
      return;
    }

    setStatus("connecting");
    const coordinator = new RealtimeCoordinator(queryClient);
    const channel = supabase.channel("executive-black-live");
    for (const table of LIVE_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          setLastEventAt(new Date().toISOString());
          coordinator.handle(payload as RealtimeTablePayload);
        },
      );
    }
    channel.subscribe((nextStatus) => {
      if (nextStatus === "SUBSCRIBED") setStatus("live");
      else if (nextStatus === "CHANNEL_ERROR") setStatus("error");
      else if (nextStatus === "TIMED_OUT" || nextStatus === "CLOSED") setStatus("offline");
      else setStatus("connecting");
    });

    return () => {
      coordinator.dispose();
      void supabase.removeChannel(channel);
    };
  }, [performanceMode, queryClient, realtimeEnabled, session, visible]);

  const value = useMemo(() => ({ status, lastEventAt }), [lastEventAt, status]);

  return <LiveSyncContext.Provider value={value}>{children}</LiveSyncContext.Provider>;
}
