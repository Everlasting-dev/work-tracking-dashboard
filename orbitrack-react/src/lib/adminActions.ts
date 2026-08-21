import { useCallback, useState } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type Permission } from "@/lib/permissions";
import { type ExecutiveSession } from "@/lib/session";
import { useExecutiveSession } from "@/lib/useExecutiveSession";

export interface AdminActionOptions<T> {
  permission: Permission;
  action: string;
  entityType: string;
  entityId?: number | null;
  projectId?: number | null;
  details?: Record<string, unknown>;
  confirmMessage?: string;
  successMessage?: string;
  invalidate?: QueryKey[];
  mutation: (actorId: number) => Promise<T>;
}

export interface AdminActionState {
  runningAction: string | null;
  notice: string;
  error: string;
  clearMessages: () => void;
}

async function resolveActorId(session: ExecutiveSession | null): Promise<number> {
  if (session?.id) return session.id;

  const configured = Number(import.meta.env.VITE_EXECUTIVE_ACTOR_ID || 0);
  if (configured > 0) return configured;

  const { data, error } = await supabase.from("wt_users").select("id").eq("role", "admin").order("id").limit(1).maybeSingle();
  if (error) throw error;
  if (typeof data?.id === "number") return data.id;
  throw new Error("No auditable admin user is available for this action.");
}

async function writeAudit({
  actorId,
  action,
  entityType,
  entityId = null,
  projectId = null,
  details = {},
}: {
  actorId: number;
  action: string;
  entityType: string;
  entityId?: number | null;
  projectId?: number | null;
  details?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("wt_activity_log").insert({
    user_id: actorId,
    project_id: projectId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: JSON.stringify(details),
  });
  if (error) throw error;
}

export function useAdminAction(): AdminActionState & {
  runAdminAction: <T>(options: AdminActionOptions<T>) => Promise<T | null>;
} {
  const queryClient = useQueryClient();
  const { session, hasPermission } = useExecutiveSession();
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const clearMessages = useCallback(() => {
    setNotice("");
    setError("");
  }, []);

  const runAdminAction = useCallback(
    async <T,>(options: AdminActionOptions<T>) => {
      clearMessages();
      if (!session) {
        setError("No active admin session.");
        return null;
      }
      if (!hasPermission(options.permission)) {
        setError("This session does not have permission for that action.");
        return null;
      }
      if (options.confirmMessage && !window.confirm(options.confirmMessage)) return null;

      setRunningAction(options.action);
      try {
        const actorId = await resolveActorId(session);
        const result = await options.mutation(actorId);
        await writeAudit({
          actorId,
          action: options.action,
          entityType: options.entityType,
          entityId: options.entityId,
          projectId: options.projectId,
          details: {
            ...options.details,
            executiveSource: session.source,
            executiveRole: session.role,
          },
        });
        await Promise.all((options.invalidate ?? []).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
        setNotice(options.successMessage || "Action complete.");
        return result;
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : String(caught);
        setError(message);
        return null;
      } finally {
        setRunningAction(null);
      }
    },
    [clearMessages, hasPermission, queryClient, session],
  );

  return { runningAction, notice, error, clearMessages, runAdminAction };
}
