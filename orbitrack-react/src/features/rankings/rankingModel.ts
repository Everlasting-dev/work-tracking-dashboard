import { type UserSummary, type WorkspaceProject, type WorkspaceTask } from "@/lib/workspaceTypes";

export interface RankingWeights {
  completedWork: number;
  onTime: number;
  quality: number;
  collaboration: number;
  milestone: number;
  consistency: number;
}

export const defaultRankingWeights: RankingWeights = {
  completedWork: 35,
  onTime: 20,
  quality: 15,
  collaboration: 15,
  milestone: 10,
  consistency: 5,
};

export interface RankingRow {
  rank: number;
  user: UserSummary;
  score: number;
  weightedTasks: number;
  onTimeRate: number;
  quality: number;
  collaboration: number;
  milestone: number;
  consistency: number;
  completedTasks: number;
  trend: "up" | "steady" | "new";
}

function pct(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.round(Math.min(1, value / max) * 100);
}

function taskDone(task: WorkspaceTask) {
  return task.status === "done" || task.status === "completed";
}

export function computeRankings(users: UserSummary[], projects: WorkspaceProject[], weights: RankingWeights = defaultRankingWeights): RankingRow[] {
  const tasks = projects.flatMap((project) => project.tasks);
  const completedByUser = new Map<number, number>();
  const onTimeByUser = new Map<number, number>();
  const dueDoneByUser = new Map<number, number>();
  const currentWeekUpdates = new Map<number, number>();
  const collaborationByUser = new Map<number, number>();
  const milestoneByUser = new Map<number, number>();
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  for (const task of tasks) {
    if (task.assigneeId == null) continue;
    if (taskDone(task)) completedByUser.set(task.assigneeId, (completedByUser.get(task.assigneeId) ?? 0) + 1);
    if (taskDone(task) && task.dueDate) {
      dueDoneByUser.set(task.assigneeId, (dueDoneByUser.get(task.assigneeId) ?? 0) + 1);
      if (task.dueDate >= new Date().toISOString().slice(0, 10)) {
        onTimeByUser.set(task.assigneeId, (onTimeByUser.get(task.assigneeId) ?? 0) + 1);
      }
    }
    if (task.updatedAt && now - Date.parse(task.updatedAt) < weekMs) {
      currentWeekUpdates.set(task.assigneeId, (currentWeekUpdates.get(task.assigneeId) ?? 0) + 1);
    }
  }

  for (const project of projects) {
    if (project.ownerId != null) {
      collaborationByUser.set(project.ownerId, (collaborationByUser.get(project.ownerId) ?? 0) + project.memberUsers.length);
      if (project.status === "completed" || project.completedAt) {
        milestoneByUser.set(project.ownerId, (milestoneByUser.get(project.ownerId) ?? 0) + 1);
      }
    }
    for (const member of project.memberUsers) {
      collaborationByUser.set(member.id, (collaborationByUser.get(member.id) ?? 0) + 1);
    }
  }

  const maxCompleted = Math.max(1, ...users.map((user) => completedByUser.get(user.id) ?? 0));
  const maxCollaboration = Math.max(1, ...users.map((user) => collaborationByUser.get(user.id) ?? 0));
  const maxMilestone = Math.max(1, ...users.map((user) => milestoneByUser.get(user.id) ?? 0));
  const maxConsistency = Math.max(1, ...users.map((user) => currentWeekUpdates.get(user.id) ?? 0));

  return users
    .map((user) => {
      const completedTasks = completedByUser.get(user.id) ?? 0;
      const dueDone = dueDoneByUser.get(user.id) ?? 0;
      const completedWork = pct(completedTasks, maxCompleted);
      const onTimeRate = dueDone ? Math.round(((onTimeByUser.get(user.id) ?? 0) / dueDone) * 100) : 70;
      const quality = 70;
      const collaboration = pct(collaborationByUser.get(user.id) ?? 0, maxCollaboration);
      const milestone = pct(milestoneByUser.get(user.id) ?? 0, maxMilestone);
      const consistency = pct(currentWeekUpdates.get(user.id) ?? 0, maxConsistency);
      const score =
        completedWork * (weights.completedWork / 100) +
        onTimeRate * (weights.onTime / 100) +
        quality * (weights.quality / 100) +
        collaboration * (weights.collaboration / 100) +
        milestone * (weights.milestone / 100) +
        consistency * (weights.consistency / 100);

      return {
        rank: 0,
        user,
        score: Math.round(score),
        weightedTasks: completedWork,
        onTimeRate,
        quality,
        collaboration,
        milestone,
        consistency,
        completedTasks,
        trend: completedTasks ? "steady" : "new",
      } satisfies RankingRow;
    })
    .sort((a, b) => b.score - a.score || b.completedTasks - a.completedTasks || a.user.displayName.localeCompare(b.user.displayName))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
