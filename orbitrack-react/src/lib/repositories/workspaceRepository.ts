import {
  executiveDb,
  type CachedFileRecord,
  type CachedProjectRecord,
  type CachedTaskRecord,
  type CachedUserRecord,
  type PendingMutationRecord,
  type SearchIndexRecord,
} from "@/lib/localDb";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import {
  addWorkspaceTaskInSupabase,
  createWorkspaceProjectInSupabase,
  fetchWorkspaceProjectsFromSupabase,
  updateWorkspaceProjectStatusInSupabase,
  updateWorkspaceTaskBoardInSupabase,
  updateWorkspaceTaskStatusInSupabase,
  uploadWorkspaceFileToSupabase,
} from "@/lib/workspaceSupabaseAdapter";
import {
  type CreateProjectInput,
  type UpdateWorkspaceTaskBoardInput,
  type UploadWorkspaceFileInput,
  type UserSummary,
  type WorkspaceProject,
  type WorkspaceProjectData,
  type WorkspaceTask,
} from "@/lib/workspaceTypes";

export interface ReadOptions {
  forceRefresh?: boolean;
  maxAgeMs?: number;
}

export interface WorkspaceRepository {
  getProjects: (options?: ReadOptions) => Promise<WorkspaceProjectData>;
  refreshProjects: () => Promise<WorkspaceProjectData>;
  createProject: (input: CreateProjectInput) => Promise<number>;
  addTask: (projectId: number, title: string, notes: string, actorId: number | null, assigneeId: number | null) => Promise<number>;
  updateProjectStatus: (projectId: number, status: string, actorId: number | null) => Promise<void>;
  updateTaskStatus: (taskId: number, projectId: number, status: string, actorId: number | null) => Promise<void>;
  updateTaskBoard: (input: UpdateWorkspaceTaskBoardInput) => Promise<void>;
  uploadFile: (input: UploadWorkspaceFileInput) => Promise<unknown>;
  retryPendingMutations: () => Promise<void>;
}

const DEFAULT_CACHE_MAX_AGE_MS = 30_000;
let refreshPromise: Promise<WorkspaceProjectData> | null = null;
let retryPromise: Promise<void> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function mutationId(operation: string, entityType: string, entityId: string) {
  return `${Date.now()}-${operation}-${entityType}-${entityId}-${crypto.randomUUID()}`;
}

function searchText(parts: Array<string | number | null | undefined>) {
  return parts.filter((part) => part != null && part !== "").join(" ").toLowerCase();
}

function projectSearchText(project: WorkspaceProject) {
  return searchText([project.name, project.notes, project.ownerName, project.department, project.type, project.status, project.priority]);
}

function taskSearchText(task: WorkspaceTask) {
  return searchText([task.title, task.notes, task.status, task.priority, task.assigneeId, task.dueDate]);
}

function userSearchText(user: UserSummary) {
  return searchText([user.displayName, user.username, user.email, user.department, user.role]);
}

function sortProjects(projects: WorkspaceProject[]) {
  return [...projects].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "") || a.name.localeCompare(b.name));
}

function recomputeProject(project: WorkspaceProject): WorkspaceProject {
  const today = new Date().toISOString().slice(0, 10);
  const tasks = [...project.tasks].sort((a, b) => a.sortOrder - b.sortOrder || (b.updatedAt || "").localeCompare(a.updatedAt || "") || a.id - b.id);
  const doneCount = tasks.filter((task) => task.status === "done" || task.status === "completed").length;
  const doingCount = tasks.filter((task) => task.status === "doing" || task.status === "progress" || task.status === "in-progress").length;
  const overdueCount = tasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== "done" && task.status !== "completed").length;
  const currentTask = tasks.find((task) => task.status === "doing" || task.status === "progress" || task.status === "in-progress") ?? tasks.find((task) => task.status === "todo") ?? null;

  return {
    ...project,
    tasks,
    taskCount: tasks.length,
    doneCount,
    doingCount,
    overdueCount,
    progress: tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0,
    currentTask,
  };
}

async function cacheSyncedAt() {
  const records = await executiveDb.projects.orderBy("syncedAt").last();
  return records?.syncedAt ?? "";
}

async function readCache(): Promise<WorkspaceProjectData | null> {
  const [projectRecords, users] = await Promise.all([
    executiveDb.projects.toArray(),
    executiveDb.users.toArray(),
  ]);

  if (!projectRecords.length || !users.length) return null;
  return {
    projects: sortProjects(projectRecords.map((record) => record.project)),
    users: users.map(({ syncedAt: _syncedAt, searchText: _searchText, ...user }) => user),
  };
}

function projectRecord(project: WorkspaceProject, syncedAt: string): CachedProjectRecord {
  return {
    id: project.id,
    project,
    status: project.status,
    ownerId: project.ownerId,
    updatedAt: project.updatedAt,
    syncedAt,
    searchText: projectSearchText(project),
  };
}

function taskRecord(task: WorkspaceTask, syncedAt: string): CachedTaskRecord {
  return { ...task, syncedAt, searchText: taskSearchText(task) };
}

function userRecord(user: UserSummary, syncedAt: string): CachedUserRecord {
  return { ...user, syncedAt, searchText: userSearchText(user) };
}

function fileRecords(projects: WorkspaceProject[], syncedAt: string): CachedFileRecord[] {
  return projects.flatMap((project) =>
    project.files.map((file) => ({
      ...file,
      syncedAt,
      searchText: searchText([file.fileName, file.description, file.mimeType, file.source, project.name]),
    })),
  );
}

function searchIndexRecords(data: WorkspaceProjectData, syncedAt: string): SearchIndexRecord[] {
  const projectIndexes = data.projects.map((project) => ({
    id: `project:${project.id}`,
    kind: "project" as const,
    entityId: String(project.id),
    text: projectSearchText(project),
    updatedAt: syncedAt,
  }));
  const taskIndexes = data.projects.flatMap((project) =>
    project.tasks.map((task) => ({
      id: `task:${task.id}`,
      kind: "task" as const,
      entityId: String(task.id),
      text: `${taskSearchText(task)} ${project.name}`.trim(),
      updatedAt: syncedAt,
    })),
  );
  const userIndexes = data.users.map((user) => ({
    id: `user:${user.id}`,
    kind: "user" as const,
    entityId: String(user.id),
    text: userSearchText(user),
    updatedAt: syncedAt,
  }));
  const fileIndexes = data.projects.flatMap((project) =>
    project.files.map((file) => ({
      id: `file:${file.source}:${file.id}`,
      kind: "file" as const,
      entityId: `${file.source}:${file.id}`,
      text: searchText([file.fileName, file.description, file.mimeType, project.name]),
      updatedAt: syncedAt,
    })),
  );
  return [...projectIndexes, ...taskIndexes, ...userIndexes, ...fileIndexes];
}

async function writeCache(data: WorkspaceProjectData) {
  const syncedAt = nowIso();
  const projects = data.projects.map((project) => projectRecord(project, syncedAt));
  const tasks = data.projects.flatMap((project) => project.tasks.map((task) => taskRecord(task, syncedAt)));
  const users = data.users.map((user) => userRecord(user, syncedAt));
  const files = fileRecords(data.projects, syncedAt);
  const indexes = searchIndexRecords(data, syncedAt);

  await executiveDb.transaction("rw", executiveDb.projects, executiveDb.tasks, executiveDb.users, executiveDb.files, executiveDb.searchIndexes, async () => {
    await Promise.all([
      executiveDb.projects.clear(),
      executiveDb.tasks.clear(),
      executiveDb.users.clear(),
      executiveDb.files.clear(),
      executiveDb.searchIndexes.clear(),
    ]);
    await Promise.all([
      executiveDb.projects.bulkPut(projects),
      executiveDb.tasks.bulkPut(tasks),
      executiveDb.users.bulkPut(users),
      executiveDb.files.bulkPut(files),
      executiveDb.searchIndexes.bulkPut(indexes),
    ]);
  });
}

async function setProjectInCache(project: WorkspaceProject) {
  const syncedAt = nowIso();
  await executiveDb.projects.put(projectRecord(recomputeProject(project), syncedAt));
  for (const task of project.tasks) {
    await executiveDb.tasks.put(taskRecord(task, syncedAt));
  }
}

async function updateProjectInCache(projectId: number, updater: (project: WorkspaceProject) => WorkspaceProject) {
  const record = await executiveDb.projects.get(projectId);
  if (!record) return;
  await setProjectInCache(updater(record.project));
}

async function recordPendingMutation(record: Omit<PendingMutationRecord, "id" | "status" | "attempts" | "createdAt" | "updatedAt" | "error">) {
  const timestamp = nowIso();
  const pending: PendingMutationRecord = {
    ...record,
    id: mutationId(record.operation, record.entityType, record.entityId),
    status: "pending",
    attempts: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    error: "",
  };
  await executiveDb.pendingMutations.put(pending);
  return pending.id;
}

async function markMutation(id: string, status: PendingMutationRecord["status"], error = "") {
  const current = await executiveDb.pendingMutations.get(id);
  if (!current) return;
  await executiveDb.pendingMutations.put({
    ...current,
    status,
    attempts: status === "running" ? current.attempts + 1 : current.attempts,
    updatedAt: nowIso(),
    error,
  });
}

async function safeServerWrite<T>(pendingId: string, write: () => Promise<T>) {
  await markMutation(pendingId, "running");
  try {
    const result = await write();
    await markMutation(pendingId, "complete");
    return result;
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);
    await markMutation(pendingId, "failed", message);
    throw caught;
  }
}

async function publishProjectsFromCache() {
  const cached = await readCache();
  if (cached) queryClient.setQueryData(queryKeys.projectsAll, cached);
}

class DexieWorkspaceRepository implements WorkspaceRepository {
  async getProjects(options: ReadOptions = {}) {
    const cached = await readCache();
    const syncedAt = await cacheSyncedAt();
    const maxAge = options.maxAgeMs ?? DEFAULT_CACHE_MAX_AGE_MS;
    const stale = !syncedAt || Date.now() - new Date(syncedAt).getTime() > maxAge;

    if (cached && !options.forceRefresh) {
      if (stale) {
        void this.refreshProjects().catch(() => undefined);
      }
      return cached;
    }

    try {
      return await this.refreshProjects();
    } catch (caught) {
      if (cached) return cached;
      throw caught;
    }
  }

  async refreshProjects() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      await this.retryPendingMutations();
      const data = await fetchWorkspaceProjectsFromSupabase();
      await writeCache(data);
      queryClient.setQueryData(queryKeys.projectsAll, data);
      return data;
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  }

  async createProject(input: CreateProjectInput) {
    const tempId = -Date.now();
    const timestamp = nowIso();
    const project: WorkspaceProject = recomputeProject({
      id: tempId,
      name: input.name.trim(),
      notes: input.notes.trim(),
      type: input.type,
      status: "active",
      priority: input.priority,
      ownerId: input.ownerId,
      classroomId: null,
      department: input.department.trim(),
      workflowTemplate: "",
      isOngoing: false,
      cadence: "",
      editorIds: [],
      hiddenFromIds: [],
      completedAt: "",
      createdAt: timestamp,
      updatedAt: timestamp,
      ownerName: "Pending owner",
      ownerInitial: "?",
      memberUsers: [],
      tasks: [],
      files: [],
      taskCount: 0,
      doneCount: 0,
      doingCount: 0,
      overdueCount: 0,
      progress: 0,
      currentTask: null,
    });
    await setProjectInCache(project);
    await publishProjectsFromCache();

    const pendingId = await recordPendingMutation({
      entityType: "project",
      entityId: String(tempId),
      operation: "create-project",
      payload: input,
    });

    try {
      const serverId = await safeServerWrite(pendingId, () => createWorkspaceProjectInSupabase(input));
      await this.refreshProjects();
      return serverId;
    } catch {
      return tempId;
    }
  }

  async addTask(projectId: number, title: string, notes: string, actorId: number | null, assigneeId: number | null) {
    const tempId = -Date.now();
    const timestamp = nowIso();
    await updateProjectInCache(projectId, (project) =>
      recomputeProject({
        ...project,
        updatedAt: timestamp,
        tasks: [
          ...project.tasks,
          {
            id: tempId,
            projectId,
            title: title.trim(),
            notes: notes.trim(),
            status: "todo",
            priority: "medium",
            dueDate: "",
            assigneeId,
            sortOrder: project.tasks.length,
            updatedAt: timestamp,
          },
        ],
      }),
    );
    await publishProjectsFromCache();

    const pendingId = await recordPendingMutation({
      entityType: "task",
      entityId: String(tempId),
      operation: "create-task",
      payload: { projectId, title, notes, actorId, assigneeId },
    });

    try {
      const serverId = await safeServerWrite(pendingId, () => addWorkspaceTaskInSupabase(projectId, title, notes, actorId, assigneeId));
      await this.refreshProjects();
      return serverId;
    } catch {
      return tempId;
    }
  }

  async updateProjectStatus(projectId: number, status: string, actorId: number | null) {
    const timestamp = nowIso();
    await updateProjectInCache(projectId, (project) => ({
      ...project,
      status,
      updatedAt: timestamp,
      completedAt: status === "completed" ? timestamp : "",
    }));
    await publishProjectsFromCache();

    const pendingId = await recordPendingMutation({
      entityType: "project",
      entityId: String(projectId),
      operation: "update-project-status",
      payload: { projectId, status, actorId },
    });
    await safeServerWrite(pendingId, () => updateWorkspaceProjectStatusInSupabase(projectId, status, actorId));
    await this.refreshProjects();
  }

  async updateTaskStatus(taskId: number, projectId: number, status: string, actorId: number | null) {
    const timestamp = nowIso();
    await updateProjectInCache(projectId, (project) =>
      recomputeProject({
        ...project,
        updatedAt: timestamp,
        tasks: project.tasks.map((task) => (task.id === taskId ? { ...task, status, updatedAt: timestamp } : task)),
      }),
    );
    await publishProjectsFromCache();

    const pendingId = await recordPendingMutation({
      entityType: "task",
      entityId: String(taskId),
      operation: "update-task-status",
      payload: { taskId, projectId, status, actorId },
    });
    await safeServerWrite(pendingId, () => updateWorkspaceTaskStatusInSupabase(taskId, projectId, status, actorId));
    await this.refreshProjects();
  }

  async updateTaskBoard(input: UpdateWorkspaceTaskBoardInput) {
    const timestamp = nowIso();
    await updateProjectInCache(input.projectId, (project) => {
      const order = new Map(input.orderedIds.map((id, index) => [id, index]));
      return recomputeProject({
        ...project,
        updatedAt: timestamp,
        tasks: project.tasks.map((task) => {
          if (task.id === input.taskId) {
            return { ...task, status: input.status, sortOrder: order.get(task.id) ?? task.sortOrder, updatedAt: timestamp };
          }
          if (order.has(task.id)) {
            return { ...task, sortOrder: order.get(task.id) ?? task.sortOrder, updatedAt: timestamp };
          }
          return task;
        }),
      });
    });
    await publishProjectsFromCache();

    const pendingId = await recordPendingMutation({
      entityType: "task",
      entityId: String(input.taskId),
      operation: "update-task-board",
      payload: input,
    });
    await safeServerWrite(pendingId, () => updateWorkspaceTaskBoardInSupabase(input));
    await this.refreshProjects();
  }

  async uploadFile(input: UploadWorkspaceFileInput) {
    const pendingId = await recordPendingMutation({
      entityType: "file",
      entityId: `${input.projectId}:${input.file.name}`,
      operation: "upload-file",
      payload: { projectId: input.projectId, taskId: input.taskId ?? null, description: input.description ?? "", name: input.file.name, size: input.file.size },
    });
    const result = await safeServerWrite(pendingId, () => uploadWorkspaceFileToSupabase(input));
    await this.refreshProjects();
    return result;
  }

  async retryPendingMutations() {
    if (retryPromise) return retryPromise;

    retryPromise = (async () => {
      const safeOperations = new Set(["update-project-status", "update-task-status", "update-task-board"]);
      const rows = await executiveDb.pendingMutations
        .where("status")
        .anyOf("pending", "failed")
        .toArray();

      for (const row of rows.filter((item) => safeOperations.has(item.operation) && item.attempts < 3)) {
        try {
          if (row.operation === "update-project-status") {
            const payload = row.payload as { projectId: number; status: string; actorId: number | null };
            await safeServerWrite(row.id, () => updateWorkspaceProjectStatusInSupabase(payload.projectId, payload.status, payload.actorId));
          } else if (row.operation === "update-task-status") {
            const payload = row.payload as { taskId: number; projectId: number; status: string; actorId: number | null };
            await safeServerWrite(row.id, () => updateWorkspaceTaskStatusInSupabase(payload.taskId, payload.projectId, payload.status, payload.actorId));
          } else if (row.operation === "update-task-board") {
            await safeServerWrite(row.id, () => updateWorkspaceTaskBoardInSupabase(row.payload as UpdateWorkspaceTaskBoardInput));
          }
        } catch {
          // The pending mutation remains visible in Dexie for future retry and conflict surfacing.
        }
      }
    })();

    try {
      await retryPromise;
    } finally {
      retryPromise = null;
    }
  }
}

export const workspaceRepository: WorkspaceRepository = new DexieWorkspaceRepository();
