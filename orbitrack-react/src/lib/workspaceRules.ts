export interface RuleActor {
  id: number | null;
  role?: string | null;
}

export interface RuleProject {
  id: number;
  ownerId: number | null;
  editorIds: number[];
  hiddenFromIds: number[];
  classroomId: number | null;
  status?: string;
  createdAt?: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface RuleTask {
  id: number;
  projectId: number;
  status: string;
  dueDate?: string;
}

export interface RuleFile {
  id: string;
  projectId: number;
  deletedAt?: string | null;
}

export interface SyncQueueItem {
  id: string;
  entity: "project" | "task" | "file" | "report";
  entityId: string | number;
  op: "create" | "update" | "delete";
  updatedAt: string;
}

function isAdminRole(role?: string | null) {
  return role === "admin" || role === "super_admin" || role === "owner";
}

export function isSessionUsable(actor: RuleActor | null | undefined) {
  return Boolean(actor?.id || isAdminRole(actor?.role));
}

export function canReadProject(actor: RuleActor | null, project: RuleProject, classroomIds: number[] = []) {
  if (!actor?.id && !isAdminRole(actor?.role)) return false;
  if (isAdminRole(actor.role)) return true;
  const actorId = actor.id;
  if (actorId == null) return false;
  if (project.ownerId === actorId) return true;
  if (project.editorIds.includes(actorId)) return true;
  if (project.classroomId != null && classroomIds.includes(project.classroomId) && !project.hiddenFromIds.includes(actorId)) return true;
  return false;
}

export function canEditProject(actor: RuleActor | null, project: RuleProject) {
  if (!actor?.id && !isAdminRole(actor?.role)) return false;
  if (isAdminRole(actor.role)) return true;
  const actorId = actor.id;
  if (actorId == null) return false;
  return project.ownerId === actorId || project.editorIds.includes(actorId);
}

export function canReadFile(actor: RuleActor | null, project: RuleProject, file: RuleFile, classroomIds: number[] = []) {
  return !file.deletedAt && file.projectId === project.id && canReadProject(actor, project, classroomIds);
}

export function canWriteFile(actor: RuleActor | null, project: RuleProject) {
  return canEditProject(actor, project);
}

export function canMoveTask(actor: RuleActor | null, project: RuleProject, task: RuleTask, nextStatus: string) {
  if (!canEditProject(actor, project)) return false;
  if (task.projectId !== project.id) return false;
  if (!["todo", "doing", "done", "completed"].includes(nextStatus)) return false;
  return true;
}

export function reorderIds(ids: Array<number | string>, movedId: number | string, beforeId: number | string | null) {
  const withoutMoved = ids.filter((id) => id !== movedId);
  const targetIndex = beforeId == null ? withoutMoved.length : withoutMoved.indexOf(beforeId);
  const insertAt = targetIndex < 0 ? withoutMoved.length : targetIndex;
  return [...withoutMoved.slice(0, insertAt), movedId, ...withoutMoved.slice(insertAt)];
}

export function compactSyncQueue(items: SyncQueueItem[]) {
  const latest = new Map<string, SyncQueueItem>();
  for (const item of items) {
    const key = `${item.entity}:${item.entityId}`;
    const current = latest.get(key);
    if (!current || item.updatedAt >= current.updatedAt) latest.set(key, item);
  }
  return [...latest.values()].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
}

export function monthRange(month: string) {
  const safe = /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7);
  const [year, monthIndex] = safe.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return { safe, start, end };
}

function inRange(value: string | undefined, start: Date, end: Date) {
  if (!value) return false;
  const date = new Date(value);
  return date >= start && date < end;
}

export function reportSummary(projects: RuleProject[], month: string) {
  const { safe, start, end } = monthRange(month);
  const started = projects.filter((project) => inRange(project.createdAt, start, end)).length;
  const completed = projects.filter((project) => inRange(project.completedAt || (project.status === "completed" ? project.updatedAt : ""), start, end)).length;
  return { month: safe, total: projects.length, started, completed };
}
