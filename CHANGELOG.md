# Changelog

## 2.1.0-alpha.1

- Fixed cloud sync diagnostics showing "issues need attention" while the details modal reported zero queued/failed jobs — the banner and modal now read the same SyncEngine queue, with retry/clear/copy wired to it.
- Schema-mismatch sync writes (optional new columns/tables not yet migrated) are dropped instead of sticking as permanent failed jobs.
- Replaced user-facing "Supabase" wording with neutral cloud/sync language across toasts, banners, and the sync diagnostics modal.
- Global Tasks board is now a wrapping tile grid (fixed-size tiles, vertical scroll inside each) instead of a horizontal scroll strip; long project names scroll on the left, counts stay on the right.
- Projects landing page keeps header, scope, search, filters, and status pills sticky while only the project grid scrolls.
- Built-in workflow templates (Basic project, Software feature, Content/docs) auto-fill editable starting tasks when creating a project.
- Logistics shipment workflow: auto-fills preview steps in the new-project dialog, seeds workflow tasks on create without duplicates, backfills missing steps when opening a shipment project, and lets you advance steps from the workflow card.
- Removed Chat from the sidebar (dock launcher remains); grouped How-to, Report a bug, About, and Check for updates under a Help submenu.
- Chess-piece rank icons on profiles, dashboard, Users tab, and ranking explainer; black-and-white favicon.

## 2.1.0-beta.18

- Project tasks are now a board-only Kanban: drag cards between columns to change status and reorder within a column, click a card to open details, and tasks show oldest-first. The board order (`sort_order`) syncs to Supabase.
- Task titles are now editable directly in the task detail modal and sync to the cloud.
- Added editable, Supabase-backed Workflow Templates. Create/edit them in Settings, pick one when creating a project to auto-fill editable starting tasks, and save a project's current board as a new template.
- New public Users tab showing everyone's rank, bio, presence (online/offline dots via a 60s heartbeat), and an expandable explanation of how the ranking system scores contributions.
- Replaced the full-page chat with a docked hybrid chat panel: DM anyone, pin favorites, see who's online, and switch between general/project channels without leaving your current view.
- Completing a project now fires an animated celebration and notifies the whole classroom, crediting the owner and co-editors as their contributor ranks rise.
- Bug reports can now be managed in-app: admins set ticket status (open / in progress / sent / fixed / closed / won't fix), attach a GitHub issue URL, and add a resolution note that's sent back to the reporter.
- Monthly reports now list project co-authors/editors, and the Settings project-visibility controls are grouped by classroom instead of one long flat list.

## 2.1.0-beta.17

- Documents are now cloud-backed instead of copied to every device. Attachment metadata (name, type, path) syncs to each PC so files appear in projects/tasks, but the actual file is only fetched on demand from Supabase Storage when opened or downloaded — nothing bulk-downloads to users' machines.
- Uploads in cloud mode now go straight to Supabase Storage and keep only metadata locally.
- Files uploaded while offline are queued and pushed up when the device reconnects.
- Legacy files that only existed locally (from before cloud sync worked) are automatically migrated up to Supabase Storage on the next sync, so they become visible to everyone.
- File preview now works for cloud files via on-demand URLs (images, PDFs, and text).

## 2.1.0-beta.16

- Fixed the real cause of cloud sync being completely dead: `db-supabase.js` never assigned `window.SupabaseDB`, so `SyncEngine.init()` hit its `if (!window.SupabaseDB) return;` guard and silently bailed at startup — no pull, no push, no sync button, and no error. The app effectively ran local-only (sample data + master-key prompt). Added `window.SupabaseDB = SupabaseDB;`.
- This works together with the beta.15 shadow-state initialization, which is now actually reached, so projects/tasks/users/departments hydrate from Supabase.

## 2.1.0-beta.15

- Fixed the core sync bug: projects, tasks, departments, and users failed to pull from Supabase because the SyncEngine never initialized SupabaseDB's internal shadow-state cache, so every cached write threw on a null object and the pull silently dropped the data (while misreporting it as a missing-schema error). The same null cache also broke saving new projects/tasks to the cloud.
- SyncEngine now initializes SupabaseDB's shadow state and sync queue on startup, and SupabaseDB lazily re-creates its shadow state defensively so it can never be null when written.

## 2.1.0-beta.14

- Fixed installed offline builds missing `sync.js`, which prevented Supabase SyncEngine from starting.
- Bundled Dexie and Supabase client scripts locally instead of loading them from CDNs.
- Added a cloud sync/retry control to the auth screen so cloud hydration can be triggered before sign-in.

## 2.1.0-beta.13

- Moves existing built-in sample projects into Sample Classroom on startup, not only newly generated sample data.

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
