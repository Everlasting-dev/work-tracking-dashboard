# Changelog

## 2.1.0-beta.12

- Fixed the Supabase schema order so first-time SQL runs no longer stop before creating project, task, milestone, and classroom tables.
- Added `Sample Classroom` to the Supabase schema and moved generated sample projects into a local Sample Classroom.
- Added an always-available manual Supabase sync action that pulls fresh cloud data, flushes pending local changes, and confirms when everything is up to date.
- Polished the classroom creation fields to match the app UI.
- Added breathing room to Task Flow and Contributor Rank dashboard graphs so labels and ranks no longer touch card edges.

## 2.1.0-beta.11

- Cloud sync now surfaces missing project/task/classroom Supabase tables as a visible sync issue instead of silently reporting up to date.
- Classroom observers can view projects and tasks in their assigned classroom while edit access remains owner/admin/editor only.
- Profile viewing now opens before editing and includes joined date, contribution stats, task completions, and chess-style rank.
- Project owner and co-editor avatars open user profiles.
- Classroom creation UI now stacks name and description clearly.
- Admin dashboard adds task-flow and contributor-rank graph bars.
- Supabase schema reruns now create `wt_sessions` before altering it, preventing older workspaces from stopping mid-schema.

## 2.1.0-beta.10

- Exposed the local Dexie database to the sync engine so initial cloud users can actually hydrate into IndexedDB before auth setup is chosen.

## 2.1.0-beta.9

- Added a direct Supabase REST bootstrap for existing users so fresh installs show sign-in instead of admin setup even if the wider sync engine cannot hydrate yet.

## 2.1.0-beta.8

- Fixed fresh desktop installs showing the Create administrator screen before the initial Supabase sync completed.
- Cloud-enabled desktop mode now treats `hybrid` consistently as cloud mode for sync status, cache refresh, and sample-data guards.

## 2.1.0-beta.6

- Added board view to the global Tasks page — projects appear as scrollable columns, read-only, clicking navigates to the project.
- Project cards now show editor member avatars stacked next to the owner name.
- Attachment indicator on project cards changed to a paperclip icon only (count shown in tooltip).
- In-progress task title on project cards is now clickable and opens the task detail modal.
- Classroom admin list now displays name and description stacked cleanly instead of concatenated.
- Classroom add form description field given proper width.
- Removed duplicate Add User button from the Team Members section header.
- User avatars and display names in the Admin panel are now clickable to open the profile modal.

## 2.1.0-beta.5

- Corrected legacy Windows package owner metadata to Everlasting.
- Updated the Windows AppUserModelID to `com.everlasting.worktracker`.
- Updated visible app owner text and profile placeholder copy.

## 2.1.0-beta.4

- Disabled update code-signature enforcement for unsigned beta installers.
- Removed publisher-name verification from the unsigned Windows beta package.
- Replaced updater signature failures with a short manual-install message.

## 2.1.0-beta.3

- Added classroom workspaces with admin assignment and project filtering.
- Added direct user-to-user chats alongside the general Discord-backed chat.
- Reworked update check errors into subtle user-facing messages instead of raw updater logs.
- Added public user profile viewing from assignee chips and profile actions.
- Added screenshot support for in-app bug reports.
- Added project and task attachment indicators across project, task, board, and global task views.
- Added a simple task chain timeline for easier project progress scanning.
- Updated the Windows beta package metadata and README for safer release publishing.
- Expanded Supabase and local schemas for classrooms, direct messages, and report screenshots.

## 2.1.0-beta.2

- Added remembered-device login for the desktop app with a 30-day trusted session.
- Added an offline cloud-sync banner and network reconnect handler.
- Supabase mode now starts from local cache when opened offline instead of falling back to browser-only storage.
- Cached projects, tasks, users, and project notes now survive desktop restarts for offline viewing.
- Project, task, and project note creates can be queued locally while offline and synced to Supabase when internet returns.

## 2.1.0-beta.1

- Added Windows beta updater polish so manual update checks use small toasts and do not block the app.
- Added team project browsing for all users.
- Added per-project editor access, access requests, approvals, and notifications.
- Fixed profile bio and avatar persistence in local and Supabase storage.
- Added fixed-size profile and report text areas.
- Added in-app bug reports with Admin visibility and optional Supabase-to-GitHub issue forwarding.
- Updated Supabase schema for profile fields, project editors, access requests, and bug reports.
