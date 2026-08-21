import { useEffect, useMemo, useState, type ReactNode } from "react";
import { clearStoredSession, loginWithPassword, logout as logoutAuth, readStoredSession, sessionFromCurrentSupabase, writeStoredSession } from "@/lib/auth";
import { SessionContext } from "@/lib/sessionContext";
import { type ExecutiveSession, type LoginResponse, type SessionContextValue } from "@/lib/sessionTypes";
import { supabase } from "@/lib/supabase";
import { permissionsForRole } from "@/lib/permissions";

export type { ExecutiveSession, LoginResponse, SessionContextValue } from "@/lib/sessionTypes";

const LOCAL_OWNER_MODE = import.meta.env.VITE_EXECUTIVE_OWNER_MODE === "1";

const LOCAL_OWNER: ExecutiveSession = {
  id: null,
  authUserId: null,
  username: "owner",
  displayName: "Executive Owner",
  email: "",
  role: "super_admin",
  department: "Executive",
  permissions: permissionsForRole("super_admin"),
  source: "local-owner",
};

async function loadSession(): Promise<ExecutiveSession | null> {
  const supabaseSession = await sessionFromCurrentSupabase().catch(() => null);
  if (supabaseSession) {
    writeStoredSession(supabaseSession);
    return supabaseSession;
  }
  return readStoredSession() ?? (LOCAL_OWNER_MODE ? LOCAL_OWNER : null);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ExecutiveSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setSession(await loadSession());
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    setLoading(true);
    try {
      const result = await loginWithPassword(username, password);
      setSession(result.session);
      return { ok: true, error: "", warning: result.authWarning, mustChangePassword: result.mustChangePassword };
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setSession(null);
      clearStoredSession();
      return { ok: false, error: message, warning: "", mustChangePassword: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutAuth();
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const boot = async () => {
      const next = await loadSession();
      if (active) {
        setSession(next);
        setLoading(false);
      }
    };
    void boot();
    const { data } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      loading,
      login,
      logout,
      refresh,
      hasPermission: (permission) => Boolean(session && session.permissions.includes(permission)),
    }),
    [loading, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
