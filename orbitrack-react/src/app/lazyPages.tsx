import { lazy } from "react";

export const WorkspaceHomePage = lazy(() => import("@/modules/workspace/WorkspaceHomePage").then((module) => ({ default: module.WorkspaceHomePage })));
export const ProjectsPage = lazy(() => import("@/pages/ProjectsPage").then((module) => ({ default: module.ProjectsPage })));
export const TasksPage = lazy(() => import("@/pages/TasksPage").then((module) => ({ default: module.TasksPage })));
export const ModulePage = lazy(() => import("@/modules/admin/ModulePage").then((module) => ({ default: module.ModulePage })));

export const AdminAuditPage = lazy(() => import("@/modules/admin/audit/AdminAuditPage").then((module) => ({ default: module.AdminAuditPage })));
export const AdminApprovalsPage = lazy(() => import("@/modules/admin/approvals/AdminApprovalsPage").then((module) => ({ default: module.AdminApprovalsPage })));
export const AdminFilesPage = lazy(() => import("@/modules/admin/files/AdminFilesPage").then((module) => ({ default: module.AdminFilesPage })));
export const AdminIncidentsPage = lazy(() => import("@/modules/admin/incidents/AdminIncidentsPage").then((module) => ({ default: module.AdminIncidentsPage })));
export const AdminOverviewPage = lazy(() => import("@/modules/admin/overview/AdminOverviewPage").then((module) => ({ default: module.AdminOverviewPage })));
export const AdminProjectsPage = lazy(() => import("@/modules/admin/projects/AdminProjectsPage").then((module) => ({ default: module.AdminProjectsPage })));
export const AdminDataStoragePage = lazy(() => import("@/modules/admin/storage/AdminDataStoragePage").then((module) => ({ default: module.AdminDataStoragePage })));
export const AdminUsersPage = lazy(() => import("@/modules/admin/users/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
export const AdminWorkloadPage = lazy(() => import("@/modules/admin/workload/AdminWorkloadPage").then((module) => ({ default: module.AdminWorkloadPage })));
