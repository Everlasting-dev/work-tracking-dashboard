export interface UserSummary {
  id: number;
  username: string;
  displayName: string;
  email: string;
  department: string;
  color: string;
  avatarDriveId: string;
  role: string;
  lastSeenAt?: string;
}

export interface WorkspaceTask {
  id: number;
  projectId: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: number | null;
  notes: string;
  sortOrder: number;
  updatedAt: string;
}

export interface WorkspaceFile {
  id: string;
  projectId: number;
  taskId: number | null;
  fileName: string;
  source: "drive" | "legacy";
  mimeType: string;
  sizeBytes: number | null;
  description: string;
  storageRef: string;
  driveFileId: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface WorkspaceProject {
  id: number;
  name: string;
  notes: string;
  type: string;
  status: string;
  priority: string;
  ownerId: number | null;
  classroomId: number | null;
  department: string;
  workflowTemplate: string;
  isOngoing: boolean;
  cadence: string;
  editorIds: number[];
  hiddenFromIds: number[];
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
  ownerInitial: string;
  memberUsers: UserSummary[];
  tasks: WorkspaceTask[];
  files: WorkspaceFile[];
  taskCount: number;
  doneCount: number;
  doingCount: number;
  overdueCount: number;
  progress: number;
  currentTask: WorkspaceTask | null;
}

export interface WorkspaceProjectData {
  projects: WorkspaceProject[];
  users: UserSummary[];
}

export interface CreateProjectInput {
  name: string;
  notes: string;
  type: string;
  priority: string;
  department: string;
  ownerId: number;
}

export interface UpdateWorkspaceTaskBoardInput {
  taskId: number;
  projectId: number;
  status: string;
  orderedIds: number[];
  actorId: number | null;
}

export interface UploadWorkspaceFileInput {
  projectId: number;
  taskId?: number | null;
  description?: string;
  file: File;
}
