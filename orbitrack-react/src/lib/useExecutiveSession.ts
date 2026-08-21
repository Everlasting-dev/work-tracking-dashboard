import { useContext } from "react";
import { SessionContext } from "@/lib/sessionContext";

export function useExecutiveSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useExecutiveSession must be used inside SessionProvider");
  return value;
}
