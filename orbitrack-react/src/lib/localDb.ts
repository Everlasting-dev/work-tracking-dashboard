import Dexie, { type Table } from "dexie";
import {
  type UserSummary,
  type WorkspaceFile,
  type WorkspaceProject,
  type WorkspaceTask,
} from "@/lib/workspaceTypes";

export interface CachedProjectRecord {
  id: number;
  project: WorkspaceProject;
  status: string;
  ownerId: number | null;
  updatedAt: string;
  syncedAt: string;
  searchText: string;
}

export interface CachedTaskRecord extends WorkspaceTask {
  syncedAt: string;
  searchText: string;
}

export interface CachedUserRecord extends UserSummary {
  syncedAt: string;
  searchText: string;
}

export interface CachedFileRecord extends WorkspaceFile {
  syncedAt: string;
  searchText: string;
}

export interface LocalDraftRecord {
  id: string;
  entityType: "project" | "task" | "document" | "canvas" | "ai";
  entityId: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface PreferenceRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface SavedWorkspaceLayoutRecord {
  id: string;
  route: string;
  userId: number | null;
  layout: unknown;
  shared: boolean;
  updatedAt: string;
}

export interface RecentItemRecord {
  id: string;
  entityType: "project" | "task" | "file" | "document" | "user" | "route";
  entityId: string;
  label: string;
  route: string;
  openedAt: string;
}

export interface NotificationCacheRecord {
  id: string;
  title: string;
  body: string;
  readAt: string;
  createdAt: string;
  payload: unknown;
}

export interface PendingMutationRecord {
  id: string;
  entityType: "project" | "task" | "file" | "document" | "canvas" | "automation";
  entityId: string;
  operation: string;
  payload: unknown;
  status: "pending" | "running" | "complete" | "failed";
  attempts: number;
  createdAt: string;
  updatedAt: string;
  error: string;
}

export interface SearchIndexRecord {
  id: string;
  kind: "project" | "task" | "user" | "file" | "document" | "canvas";
  entityId: string;
  text: string;
  updatedAt: string;
}

export interface CanvasDocumentRecord {
  id: string;
  projectId: number | null;
  title: string;
  document: unknown;
  updatedAt: string;
}

export interface AiHistoryRecord {
  id: string;
  projectId: number | null;
  prompt: string;
  response: string;
  contextSummary: string;
  createdAt: string;
}

class ExecutiveBlackLocalDb extends Dexie {
  projects!: Table<CachedProjectRecord, number>;
  tasks!: Table<CachedTaskRecord, number>;
  users!: Table<CachedUserRecord, number>;
  files!: Table<CachedFileRecord, string>;
  drafts!: Table<LocalDraftRecord, string>;
  preferences!: Table<PreferenceRecord, string>;
  savedWorkspaceLayouts!: Table<SavedWorkspaceLayoutRecord, string>;
  recentItems!: Table<RecentItemRecord, string>;
  notificationsCache!: Table<NotificationCacheRecord, string>;
  pendingMutations!: Table<PendingMutationRecord, string>;
  searchIndexes!: Table<SearchIndexRecord, string>;
  canvasDocuments!: Table<CanvasDocumentRecord, string>;
  aiHistory!: Table<AiHistoryRecord, string>;

  constructor() {
    super("executive-black-local");
    this.version(1).stores({
      projects: "id, status, ownerId, updatedAt, syncedAt",
      tasks: "id, projectId, status, assigneeId, dueDate, updatedAt, syncedAt",
      users: "id, username, role, department, syncedAt",
      files: "id, projectId, taskId, source, createdAt, syncedAt",
      drafts: "id, entityType, entityId, updatedAt",
      preferences: "key, updatedAt",
      savedWorkspaceLayouts: "id, route, userId, shared, updatedAt",
      recentItems: "id, entityType, entityId, openedAt",
      notificationsCache: "id, readAt, createdAt",
      pendingMutations: "id, entityType, entityId, operation, status, updatedAt",
      searchIndexes: "id, kind, entityId, updatedAt",
      canvasDocuments: "id, projectId, updatedAt",
      aiHistory: "id, projectId, createdAt",
    });
  }
}

export const executiveDb = new ExecutiveBlackLocalDb();
