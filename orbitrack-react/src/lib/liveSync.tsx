import { createContext, useContext } from "react";

export type LiveSyncStatus = "idle" | "connecting" | "live" | "offline" | "error";

export interface LiveSyncContextValue {
  status: LiveSyncStatus;
  lastEventAt: string;
}

export const LiveSyncContext = createContext<LiveSyncContextValue | null>(null);

export function useLiveSync() {
  const value = useContext(LiveSyncContext);
  if (!value) throw new Error("useLiveSync must be used inside LiveSyncProvider");
  return value;
}
