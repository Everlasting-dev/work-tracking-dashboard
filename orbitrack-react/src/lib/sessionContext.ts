import { createContext } from "react";
import { type SessionContextValue } from "@/lib/sessionTypes";

export const SessionContext = createContext<SessionContextValue | null>(null);
