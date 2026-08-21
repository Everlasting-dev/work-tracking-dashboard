import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { workspaceRepository } from "@/lib/repositories/workspaceRepository";
import { type WorkspaceProjectData, type WorkspaceTask } from "@/lib/workspaceTypes";
import { useUiStore } from "@/stores/uiStore";

function cacheMaxAgeForMode(mode: string) {
  if (mode === "low-power") return 5 * 60_000;
  if (mode === "balanced") return 90_000;
  return 30_000;
}

export function useWorkspaceData() {
  const performanceMode = useUiStore((state) => state.performanceMode);
  const maxAgeMs = cacheMaxAgeForMode(performanceMode);

  return useQuery({
    queryKey: queryKeys.projectsAll,
    queryFn: () => workspaceRepository.getProjects({ maxAgeMs }),
    staleTime: maxAgeMs,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: performanceMode === "full",
    retry: 1,
  });
}

export function useProjects() {
  return useWorkspaceData();
}

export function flattenTasks(data?: WorkspaceProjectData): WorkspaceTask[] {
  return data?.projects.flatMap((project) => project.tasks.map((task) => ({ ...task, projectId: project.id }))) ?? [];
}

export function useTasks() {
  const query = useWorkspaceData();
  return { ...query, data: flattenTasks(query.data) };
}

export function useTeamMembers() {
  const query = useWorkspaceData();
  return { ...query, data: query.data?.users ?? [] };
}

export function useWorkload() {
  const query = useWorkspaceData();
  const rows = (query.data?.users ?? []).map((user) => {
    const assigned = flattenTasks(query.data).filter((task) => task.assigneeId === user.id);
    const open = assigned.filter((task) => task.status !== "done" && task.status !== "completed");
    const blocked = assigned.filter((task) => task.status === "blocked");
    const done = assigned.filter((task) => task.status === "done" || task.status === "completed");
    return { user, assigned, open, blocked, done, load: open.length + blocked.length * 2 };
  });

  return { ...query, data: rows };
}
