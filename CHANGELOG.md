# Changelog

## 2.2.22

### Fixed
- **"User 33 not found" DM send failure** — When a device's local Dexie DB had a stale entry for a user (e.g. id=33 for someone whose real Supabase ID is 87), the first DM send correctly resolved the stale ID to the canonical one via username lookup and patched Dexie. But that patch *deleted* the id=33 row, so every subsequent send found nothing in Dexie and threw "User X not found". Fixed by: (1) a session-level resolution cache (`_resolvedUserIds` Map) — once stale ID 33 maps to canonical 87, all future calls in the session return 87 without touching Dexie; (2) a `wt-user-id-resolved` event that updates the open chat channel, contacts list, and `chatUsersMap` so `dm-33` becomes `dm-87` immediately; (3) case-insensitive username fallback in path 3 to handle original-case vs lowercase mismatches.

## 2.2.21

### Fixed
- **DMs no longer route to yourself** — `_resolveSupabaseUserId` had an auth-session fallback (Fast path 2) that ran for any user ID, including the recipient's. When the recipient's local ID wasn't found in Supabase, it fetched the current auth session and returned the **sender's** Supabase ID instead. Every DM from user 4 to user 2 was stored as `from_user_id=4, to_user_id=4`. Fast path 2 now only runs when the ID being resolved matches `sessionStorage.userId` (the sender). Recipients fall through to username lookup. A self-DM guard throws immediately if resolution still collapses both IDs to the same value.

## 2.2.20

### Fixed
- **Source-of-truth release** — `main` now contains the full 2.2.16–2.2.19 fix stack (auth ID linking, DM routing, classroom/project/task FK resolution, sync queue ordering). Prior `v2.2.19` tag pointed at older code; this build is the corrected installer.

## 2.2.19

### Fixed
- **DM FK errors — real root cause fixed** — `_persistAuthUserId` was reading `sessionStorage` to find the current user, but `setSession()` is called *after* `ensureSupabaseAuth`, so the session was always stale (previous user or null). The `auth_user_id` link was therefore never written to the correct `wt_users` row, and Supabase had no reliable way to match a WorkTracker user to their Supabase row. The new `_linkAuthUser` looks up the `wt_users` row by **username** (stable, unique), writes `auth_user_id` on it, and returns the canonical bigint `id`. `handleAuth` then patches LocalDB if the local Dexie ID differs from the Supabase ID, so every subsequent operation uses the correct ID.
- **`_resolveSupabaseUserId` auth-UUID fast path** — if the user's local ID still doesn't match Supabase's ID (e.g. on first login after installing the fix), a fallback looks up the row via `auth_user_id` from the current Supabase Auth session, patches LocalDB, and returns the real ID. Auth fallback runs **only for the logged-in user** — not recipients — so DMs no longer route to yourself when the recipient ID is unresolved.
- **Project/task FK sync** — `createProject` and `createTask` now resolve `owner_id`, `classroom_id`, `project_id`, and assignee IDs against Supabase (id-map, username/name lookup, push-if-missing) before insert. Sync queue orders classroom → project → task and patches classroom FK references when IDs remap.
- **DM delivery** — conversation pane pulls fresh from Supabase every poll; receipt labels (`deliveredAt` / `readAt`) persist across refreshes.
- `ensureSupabaseAuth` now accepts `username` as a third argument so it can link the auth account to the correct `wt_users` row immediately on login.

### Changed
- **Sync diagnostics reporting** — per-error and bulk "Report to Admin" copy errors to clipboard and file bug reports titled `{username}1`, `{username}2`, etc.

## 2.2.18

### Fixed
- **DM FK error — actual root cause resolved** — when a user is created while offline or before Supabase syncs, the local Dexie ID may differ from the Supabase auto-generated ID. All previous attempts (push-on-error, bootstrap) still used the local ID for the DM insert. Now `createDirectMessage` calls `_resolveSupabaseUserId` for both sender and recipient before inserting: it first checks Supabase by ID (fast path), then pushes from LocalDB if missing, and if a username conflict (23505) shows the user exists with a *different* Supabase ID, it looks up the real ID, patches LocalDB, and uses that ID for the DM. No more FK errors from ID drift.
- **"Report to Admin" button in sync details** — every failed sync job now has a one-click "Report to Admin" button that submits the error directly as a bug report without having to open the report form separately.

## 2.2.17

### Fixed
- **DM FK error — root cause found** — the emergency user-push (`_ensureUserInSupabase`) was silently failing in two ways: (1) the user's avatar photo (sometimes several MB of base64) was included in the payload, causing Supabase's REST endpoint to reject the request with a 413 that was swallowed; (2) if the user existed locally but the push still failed, the code retried the DM insert anyway, producing the same FK error every time. Now: avatar is excluded from emergency pushes (it syncs separately), the real error is surfaced in the console, and the DM retry is skipped when the user push itself failed — so the SyncEngine gets a clean throw and won't spin through three pointless retries.
- Same avatar-size fix applied to `bootstrapMissingUsers` (startup sync).

## 2.2.16

### Fixed
- **DM messages now appear within 5 seconds** — the conversation pane now fetches directly from Supabase on every poll tick instead of reading from the local IndexedDB cache. Previously, if Supabase Realtime wasn't delivering events (no JWT, channel error, network hiccup), the local cache stayed stale and new messages wouldn't appear until a full app reload. The polling interval is now a fixed 5 s regardless of realtime connection status.
- **Receipt ticks disappeared after pane refresh** — `deliveredAt` and `readAt` were not included in the local-cache message mapping, so "Sent / Delivered / Read" labels would vanish every time the conversation refreshed. Now included in all code paths.

## 2.2.15

### Fixed
- **Project creation FK error** — creating a project whose classroom hasn't yet synced to Supabase now automatically retries without the classroom assignment instead of failing entirely. The project (and all its tasks) reach the cloud; the classroom link is a soft loss only.
- **DM FK error** — sending a DM to a user who isn't in Supabase yet now auto-pushes the recipient (and sender) from local storage to Supabase before retrying the message. No more silent DM delivery failures.
- **Startup user sync** — on every login, the app now quietly compares local users against Supabase and pushes any that are missing. This prevents the FK errors from occurring at all after the first successful launch.

### Why this was happening
Users and classrooms created while offline (or before Supabase was fully connected) were stored in the local IndexedDB but never made it to the cloud. When Supabase later tried to write data that referenced those missing rows, it threw foreign key constraint errors, which were silently swallowed by the sync queue.

## 2.2.14

### Fixed
- **Realtime reconnection for trusted sessions** — devices that log in via remembered session no longer fail to subscribe because they don't have a Supabase Auth JWT yet. The channel now checks for an active session first and falls back to a public channel transparently. Once the user explicitly logs in again, the private channel takes over.
- **Sidebar nav clipping** — nav items on shorter screens were being cut off by `overflow: hidden`. Changed to `overflow-y: auto` (scrollbar hidden) so all items remain reachable without layout breakage.

### Changed
- **DM receipts now show label text** — sent DMs display "✓ Sent", "✓✓ Delivered", or "✓✓ Read" (blue) instead of just tick marks, making the status unambiguous at a glance.

## 2.2.13

### Added
- **Supabase Auth integration** — WorkTracker now signs users into Supabase Auth (`signInWithPassword` / `signUp`) immediately after PBKDF2 login verification. The resulting JWT enables private Realtime channels and lays the groundwork for JWT-based RLS policies.
- **Private Realtime channels** — The `wt-live-{userId}` channel is now created with `{ config: { private: true } }`. Private channels require authentication and are more secure than public ones.
- **`auth_user_id` column on `wt_users`** — links each WorkTracker account to its `auth.users` UUID so RLS policies can use `auth.uid()` in future.
- **`wt_my_id()` SQL helper** — resolves `auth.uid()` (UUID) → `wt_users.id` (bigint) for use in RLS rules.
- **`realtime.messages` RLS** — authorises private-channel broadcast; requires a valid JWT.

### Changed
- Logout now calls `supabase.auth.signOut()` to invalidate the Supabase session alongside clearing the local WorkTracker session.
- `supabase/schema.sql`: run the new migration block in the Supabase SQL editor (**disable email confirmation first** in Auth → Settings).

## 2.2.12

### Added
- **DM delivered / read receipts** — sent DMs show ✓ (sent), ✓✓ (delivered), ✓✓ blue (read). Delivered fires automatically when recipient's realtime subscription receives the message; read fires when they open the conversation.
- **Instant DM send** — messages appear immediately in the pane (optimistic UI) before the Supabase round-trip completes. Own-INSERT realtime events are deduped to avoid duplicates.
- **Work-hours arc on clock** — a shrinking arc on the analog clock face shows remaining time in the 9am–7pm work day. Countdown text ("4h 12m left today") updates live below the digital time.
- **Bug report realtime** — admins now receive a live toast + notification sound the moment a bug report is submitted, without needing to refresh.

### Fixed
- **Project task creation resilience** — each bulk task is now wrapped in its own try/catch; partial failures show a clear warning ("3 of 9 tasks failed to save") instead of silently crashing.
- **DM send no longer re-fetches** — removed the expensive full-pane reload after every DM send.
- **Own-message dedup** — realtime INSERT events for messages the sender already sees are ignored; UPDATE events (receipt status) trigger a targeted refresh.

### Changed
- `wt_direct_messages` table: added `delivered_at` and `read_at` columns (**run the schema migration in Supabase SQL editor**).
- `wt_bug_reports` added to Supabase Realtime subscription.

## 2.2.11

### Added
- **Chat unread section** — contacts with unread messages bubble to the top of the chat list with a dedicated "Unread" section; they are removed from their original section to avoid duplicates.
- **Unread count badges** — each unread contact shows a live count pill (number of messages received since last read); falls back to a dot indicator when the app reconnects after a session gap.
- **Chat notification sounds** — sounds now fire for polling-detected unreads in addition to real-time events; improved double-ping tone is more distinct.

### Fixed
- **Chat sync latency** — unread badge now refreshes every 15 s (was 60 s) and conversation view every 10 s (was 45 s) when Supabase Realtime is connected; fallback polling is 5 s / 4 s when offline.
- **Unread check performance** — all channel latest-message queries now run in parallel (`Promise.all`) instead of sequentially, eliminating N+1 round trips on workspaces with many members.

### Changed
- Unread contacts show a black left border and bold name for clearer at-a-glance scanning.

## 2.2.10

### Added
- **Notification sounds** — distinct Web Audio tones per notification type (assignment, access request, chat, task done, etc.); mute toggle in user menu.
- **Documents panel animation** — smooth slide-in/out when opening the Files side panel.

### Fixed
- **Activity log** — project events (tasks, files, milestones, updates) now record to the in-app Updates tab, not only Discord backlog.
- **Full activity sync** — pull and Supabase Realtime hydrate the complete activity log across devices.
- **Realtime communications** — DMs, chat, notifications, and access requests sync and update live without manual Sync.

### Changed
- Sidebar shows **Live** when Supabase Realtime is connected; fallback sync every 60s / 5 min safety pull.

## 2.2.9

### Added
- Supabase Realtime layer (`realtime-sync.js`) for notifications, chat, DMs, access requests, and dashboard data.
- Extended sync pull for direct messages, chat activity, and Discord mirror messages.

### Fixed
- Sync queue now pushes `createDirectMessage`, `requestProjectAccess`, and `respondProjectAccess` to the cloud.
- Access-request owner notifications include the requester's message text.

## 2.2.8

### Fixed
- Session and logout persistence — signed-out state survives restarts; clean client reset on logout.
- Member task visibility — assigned tasks show correctly for non-admin members.
- Member notification bell — in-app alerts for relevant team activity.
- Chat unread indicators — bold rows and launcher badge for unread messages.
- Co-editor alerts — notifications when someone joins as a co-editor on your project.
- Tasks board filters — status and search filters apply correctly in board view.
- Splash screen — scrollbar alignment during startup loading.

### Changed
- Profile fields — email and department display with appropriate edit locks for members.
- Admin sidebar — shield icon for admin-only areas.
- Save-as-template modal and black-and-white sticky notes styling (2.2.6–2.2.7 carry-over).

### Distribution
- **Stable go-live:** v2.2.8 is the only publicly downloadable release; auto-updater follows stable Latest only.

## 2.2.1

### Changed — UI overhaul
- Black & white minimalist theme with Pinterest-style icon sidebar and hover tooltips.
- Student Life OS analog clock with digital time and Year / Month / Week progress bars.
- Classroom auto-randomized colour palettes; main content tints when a classroom filter is active.
- Personal Notes slide-out panel (per-user, cloud sync) for quick todos and reminders.
- Enhanced bootstrap splash with real loading step labels.
- Route and card entrance animations; scrollable panels polish.

## 2.2.0-alpha.2

### Fixed
- **Departments:** Default departments (IT, Logistics, etc.) are now persisted locally instead of shown as placeholders; adding a custom department no longer makes the others disappear. Cloud sync correctly merges departments by `key`.
- **Bug reports:** Admin status updates (e.g. marking fixed) no longer revert to open after reload — sync pull respects newer local changes and pending updates.
- **Settings:** Project Visibility panel is scrollable (~4 projects visible) instead of stretching the whole page.

## 2.2.0-alpha.1

Alpha line for the 2.2 feature set (semver **2.2.0-alpha.1** is newer than **2.1.0-beta.*** — the in-app updater can offer it when prereleases are enabled).

### Fixed
- Cloud sync: background `updateTask` no longer fails with "Task not found" when advancing workflow steps.
- Project **Edit** opens **Edit Project** with your data instead of an empty **New Project** dialog.
- Logistics UI restored (workflow card + Tasks/Timeline tabs); removed retired **Attach approved shipping list** step; orphaned `shipping-list` tasks auto-deleted on project open.

### Added
- Native right-click spell-check suggestions in text fields (Electron desktop).
- **Tasks** view shows project owner, classroom, and department on list groups, filtered cards, and board columns.

## 2.1.0-beta.20

### Fixed
- Reverted beta.19 logistics split-panel layout — workflow card and Tasks/Timeline tabs are back in the main project view; documents panel is documents-only again (toggleable).
- Removed retired **Attach approved shipping list** workflow step; **Packaging complete** is now the first step. Orphaned `shipping-list` tasks are auto-deleted when opening a logistics project.

### Kept from beta.19
- Cloud sync fix for `updateTask` "Task not found" errors.
- Project **Edit** modal no longer opens as empty **New Project**.

### Added
- Native right-click spell-check suggestions in text fields (Electron desktop).
- **Tasks** view shows project owner, classroom, and department on list groups, filtered cards, and board columns.

## 2.1.0-beta.19

### Fixed
- Cloud sync: background `updateTask` no longer fails with "Task not found" when advancing logistics workflow steps; creates are queued with local IDs and sorted before updates.
- Project **Edit** no longer opens an empty **New Project** dialog when the project ID cannot be resolved.

### Changed
- Logistics shipment projects: right panel split into **Documents** (top) and **Shipment workflow** (bottom); duplicate workflow card and Tasks/Timeline tabs removed from the main view. Click a step title to edit task notes/details.

## 2.1.0-beta.18

Re-versioned from 2.1.0-alpha.1 so the in-app updater recognizes it as newer than 2.1.0-beta.17 (semver ranks `alpha` below `beta`).

- Project tasks are now a board-only Kanban: drag cards between columns to change status and reorder within a column, click a card to open details, and tasks show oldest-first. Board order syncs to the cloud.
- Task titles are editable directly in the task detail modal.
- Editable workflow templates in Settings; built-in templates (Basic project, Software feature, Content/docs) and custom templates auto-fill starting tasks when creating a project. Save a project's board as a new template.
- Logistics shipment workflow: preview steps in the new-project dialog, seed workflow tasks on create, backfill on open, advance steps from the workflow card.
- New public Users tab — ranks (chess tiers), bios, presence heartbeat, ranking explainer.
- Docked hybrid chat (DMs, favorites, channels); chat removed from sidebar — use the bottom-right launcher.
- Project completion celebration and classroom notifications; contributor ranks update live.
- Fixed cloud sync diagnostics — banner and details modal now read the same queue; retry/clear/copy wired; schema-mismatch writes no longer stick as permanent failures.
- Neutral cloud/sync wording in the UI (no backend product names in user messages).
- Global Tasks board: wrapping tiles with per-tile vertical scroll; Projects page sticky header/filters.
- Help submenu: How-to, Report a bug, About, Check for updates.
- Admin bug ticket status, GitHub issue URL, resolution notes; monthly reports list co-authors/editors; visibility grouped by classroom.
- Chess-piece rank icons; black-and-white favicon.

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
