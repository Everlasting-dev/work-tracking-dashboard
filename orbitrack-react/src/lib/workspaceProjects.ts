import { workspaceRepository } from "@/lib/repositories/workspaceRepository";
import {
  type CreateProjectInput,
  type UpdateWorkspaceTaskBoardInput,
  type UploadWorkspaceFileInput,
} from "@/lib/workspaceTypes";

export type {
  CreateProjectInput,
  UpdateWorkspaceTaskBoardInput,
  UploadWorkspaceFileInput,
  UserSummary,
  WorkspaceFile,
  WorkspaceProject,
  WorkspaceProjectData,
  WorkspaceTask,
} from "@/lib/workspaceTypes";

export function fetchWorkspaceProjects() {
  return workspaceRepository.getProjects();
}

export function refreshWorkspaceProjects() {
  return workspaceRepository.refreshProjects();
}

export function createWorkspaceProject(input: CreateProjectInput) {
  return workspaceRepository.createProject(input);
}

export function addWorkspaceTask(projectId: number, title: string, notes: string, actorId: number | null, assigneeId: number | null) {
  return workspaceRepository.addTask(projectId, title, notes, actorId, assigneeId);
}

export function updateWorkspaceProjectStatus(projectId: number, status: string, actorId: number | null) {
  return workspaceRepository.updateProjectStatus(projectId, status, actorId);
}

export function updateWorkspaceTaskStatus(taskId: number, projectId: number, status: string, actorId: number | null) {
  return workspaceRepository.updateTaskStatus(taskId, projectId, status, actorId);
}

export function updateWorkspaceTaskBoard(input: UpdateWorkspaceTaskBoardInput) {
  return workspaceRepository.updateTaskBoard(input);
}

export function uploadWorkspaceFile(input: UploadWorkspaceFileInput) {
  return workspaceRepository.uploadFile(input);
}

export function retryWorkspacePendingMutations() {
  return workspaceRepository.retryPendingMutations();
}
