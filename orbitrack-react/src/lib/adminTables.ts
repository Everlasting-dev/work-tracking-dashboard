export interface AdminTableMeta {
  name: string;
  label: string;
  area: "Core" | "Governance" | "Storage" | "Operations" | "Messaging" | "Security";
  critical?: boolean;
}

export const ADMIN_TABLES: AdminTableMeta[] = [
  { name: "wt_users", label: "Users", area: "Core", critical: true },
  { name: "wt_projects", label: "Projects", area: "Core", critical: true },
  { name: "wt_tasks", label: "Tasks", area: "Core", critical: true },
  { name: "wt_milestones", label: "Milestones", area: "Core" },
  { name: "wt_updates", label: "Project Updates", area: "Core" },
  { name: "wt_activity_log", label: "Activity Log", area: "Governance", critical: true },
  { name: "wt_notifications", label: "Notifications", area: "Messaging" },
  { name: "wt_bug_reports", label: "Incidents", area: "Operations" },
  { name: "wt_project_access_requests", label: "Approvals", area: "Governance" },
  { name: "wt_classrooms", label: "Classrooms", area: "Core" },
  { name: "wt_user_classrooms", label: "User Classrooms", area: "Core" },
  { name: "wt_departments", label: "Departments", area: "Core" },
  { name: "wt_workflow_templates", label: "Workflow Templates", area: "Operations" },
  { name: "wt_attachments", label: "Legacy Attachments", area: "Storage" },
  { name: "project_files", label: "Drive Files", area: "Storage" },
  { name: "project_storage_folders", label: "Drive Folders", area: "Storage" },
  { name: "wt_sessions", label: "Sessions", area: "Security" },
  { name: "wt_webhooks", label: "Webhooks", area: "Operations" },
  { name: "wt_personal_notes", label: "Personal Notes", area: "Core" },
  { name: "wt_calendar_events", label: "Calendar Events", area: "Operations" },
];
