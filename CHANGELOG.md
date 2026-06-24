# Changelog

## 3.2.4

### Changed
- **Clear Delete button** - every user card now shows a labelled **Delete** button (instead of a small, easily-missed trash icon, which was also missing from the main Admin board). It's hidden on your own card — you can't delete yourself.
- **Deletions transfer to the main admin** - when a user is deleted, their projects, updates, and files are reassigned to the main admin account (the original/primary admin) rather than orphaned.

## 3.2.3

### Fixed
- **Deleting a user didn't stick** - deletion appeared to work but the account came back after sync, because database references (activity log, project updates, uploaded files) had no delete rule and blocked the cloud delete. Deleting a user now reassigns their projects/updates/files to you and removes their activity log, so the account is actually removed. An optional migration adds the matching delete rules at the database level.

## 3.2.2

### Fixed
- **Creating users failed to sync** - new accounts hit a `wt_users_auth_user_id_uniq` constraint error because the database defaulted each new row's auth link to whoever created it (surfaced once Drive storage gave the admin a live auth session in 3.2.1). New users now insert without claiming the admin's auth identity and link their own on first sign-in. A backend migration to drop the bad column default is included.

## 3.2.1

### Fixed
- **Documents 404 / wrong storage** - the released desktop build and the hosted web app were generating a runtime config without the Google Drive flag, so the app fell back to the old Supabase Storage path and every document (PDFs, Excel, images) failed with 404. Both build pipelines now enable Drive storage, so files load from Drive again.

## 3.2.0

### Added
- **One-time password accounts** - admins create users with an auto-generated one-time password (shown to copy and share); the user is forced to set their own password on first sign-in. Members can request a password change, and admins issue a fresh one-time password to approve it.
- **Classrooms at user creation** - admins choose which classrooms a new user can access when creating the account.
- **Private personal spaces** - every user gets a private "{name}'s Space" classroom. Projects placed there are hidden from everyone else until the owner adds a collaborator.
- **User guide** - a dedicated, searchable in-app guide covering every major feature, plus a refreshed first-run tour. Admin-only help is hidden from members.
- **Profile customization** - set an avatar, a tagline, and accent + cover colors with a live preview; the profile header was redesigned.
- **Canvas owner controls** - canvas owners can edit the name and purpose. Canvases are public by default; switching one to private lets the owner pick exactly who can collaborate.

### Changed
- **Brainstorm canvas access** - replaced the duplicate private/lock toggles with a single model: public (anyone) or private (owner + chosen participants).
- **Copilot panel** - the AI Copilot drawer now follows the app's light/dark theme.
- **Notifications** - repeated toasts (e.g. notification-sound and sync messages) now collapse into a single updating toast instead of stacking across the screen.

### Fixed
- **PDF previews** - PDFs uploaded to Drive now render inline again in the desktop app (the built-in PDF viewer was disabled). Spreadsheets/Office files show a clear download action since they have no inline preview.
- **Dismiss behavior** - the chat dock closes on Escape or an outside click; Escape closes an open image first, then the document panel.
- **Floating dock icons** - no longer slide during theme switches, and are clearly visible in light theme.
- **Personal space duplication** - a personal classroom is created once at account creation (not on every login); existing duplicates are merged.
- **Profile join date** - fixed "Joined Invalid Date" and aligned the profile header.
- **Diagnostics & admin layout** - fixed diagnostics card/KPI alignment, admin user-card button overflow ("Send OTP"), and leaderboard stat alignment (now compact icons with tooltips).

## 3.1.12

### Changed
- **Project detail theme** - project pages now follow the selected light/dark theme instead of forcing a black surface.
- **Typography scale** - project headings, tabs, metric cards, task groups, task rows, notes, and chips now use a tighter standard size scale.
- **Task readability** - oversized task text and row spacing were reduced for a denser, more professional workspace.

## 3.1.11

### Added
- **Authorization health check** - the app now validates document-storage authorization and notifies the user when the storage session is invalid or linked to the wrong account.
- **Diagnostics tab** - new Diagnostics page shows storage auth, cloud sync status, sync queue failures, and user-visible warnings/errors with Copy report and Send to admin actions.

### Fixed
- **Mobile version display** - bumped app and asset versions so mobile/webview clients stop showing stale version numbers after update.
- **Mobile canvas stability** - Brainstorm canvas now uses a lightweight read-only mobile fallback instead of mounting the live editor that could crash on phones.

## 3.1.10

### Fixed
- **Document storage sign-in** - Google Drive backed documents now establish the Supabase storage session during login, preventing raw 404/authorization pages when users open files.
- **Legacy document fallback** - older Supabase Storage attachments remain visible and open while Drive migration catches up.
- **Login theme toggle** - users can now switch Light/Dark from the login and recovery screens before signing in.
- **Dark auth contrast** - login, cloud sync, and startup database-check messages are easier to read in dark mode.
- **Project header polish** - the frosted Projects header no longer crops the first project row and now keeps the same effect in dark theme.

## 3.1.8

### Fixed
- **Projects header** - sticky search/filter controls no longer crop the top of project cards, and the frosted effect works in dark theme.
- **Canvas fullscreen controls** - Boards, Notes, and Exit controls no longer cover the drawing palette.

## 3.1.7

### Added
- **Mobile canvas viewer** - Brainstorm canvas now opens as a read-only viewer on mobile, with lighter controls and safer note-drop handling.

### Changed
- **Canvas theme alignment** - canvas colors now follow the app theme more closely in light and black themes.
- **Canvas fullscreen controls** - Boards, Notes, and Exit controls were repositioned so they do not cover the drawing palette.

### Fixed
- **Project tabs** - Tasks, Board, Timeline, and Map tabs no longer jump in height or width while switching views.

## 3.1.6

### Added
- **Canvas note drops** - notes can be dragged from the Notes panel onto desktop canvas boards as sticky/text boxes.
- **Canvas fullscreen controls** - Brainstorm canvas gained a Figma-style fullscreen mode with direct Notes access.

### Fixed
- **Notes editor reliability** - the editor now falls back to a built-in formatter when the rich editor cannot mount.
- **Canvas room stability** - fixed boards closing themselves during background sync.
- **Project dependency editing** - task details now include a tick-box "Blocked by" picker for Map links.

## 3.1.5

### Added
- **Notebook-style Notes** — searchable note list, note titles, focused Quill editor pane, autosave, and a fallback editor for packaged builds.
- **Quick task creation** — title-first entry, multiline paste for bulk tasks, advanced details on demand, and note/meeting-text task import with preview.
- **Momentum task view** — focus filters, completion/risk summary, next-task CTA, and cleaner task metadata across list, board, and table views.
- **Project brief refresh** — clearer progress, current focus, structure counts, and a simpler project creation flow.

### Changed
- **Local vendor bundles** — SortableJS, jsPDF, jsPDF AutoTable, D3, Floating UI, and Quill are packaged locally instead of loaded from CDNs.

## 3.1.4

### Added
- **Project Map upgrades** — fullscreen mode, fit-to-view, add-task action, richer cards, and dependency unlinking by clicking a link or pressing Delete.
- **Dashboard widgets** — Brainstorm, weekly activity, and quick notes.

### Fixed
- **Notes editor reliability** — the notes editor always loads and remains typeable with bold, italic, and list controls.
- **Brainstorm canvas** — fixed leaving a board and added live teammate avatars.

## 3.1.2

### Added
- **Faster image previews** — images now open instantly at low resolution, with a **View HD** button to load full quality on demand.

### Fixed
- **Cloud sync errors on file delete** ("invalid input syntax for type bigint") — the legacy attachment sync no longer runs alongside Drive storage.
- **"Object not found" on opening files** — stale legacy file records are no longer used in Drive mode, so files load reliably.

## 3.1.1

### Fixed
- **Files not loading ("Object not found")** — the desktop build was missing the storage client, so it fell back to the old (now-empty) storage and couldn't show images or documents. Files now load correctly from Google Drive.

## 3.1.0

### Added
- **Google Drive file storage** — uploaded files (images, PDFs, videos, documents, archives) are now stored in the team's Google Drive instead of the app database. Faster, more scalable, and keeps the database lean. Existing files were migrated automatically.
- **Delete button on project documents** in the project panel (editors only).

### Changed
- File content is streamed through a secure backend (Supabase Edge Functions) — file access is gated by your existing project membership/roles, and no storage credentials are exposed in the app.
- More reliable cloud sign-in, so files load, preview, and upload consistently.

## 3.0.11

### Fixed
- **In-app updater** — the "Check for updates" button no longer falls back to "Updates are managed in the installed desktop app" on installed builds. The sandboxed preload no longer calls `require()` on a file path, so the `workTrackerDesktop` bridge loads correctly.

### Changed
- **Self-healing updates** — downloaded updates now install automatically on quit (`autoInstallOnAppQuit`), so a failed update prompt can't permanently block updates.

## 3.0.10

### Added
- **Themed confirm dialogs** — native browser/desktop confirmation windows were replaced with Orbitask-styled dialogs that work in both light and dark themes.
- **Project side drawer** — Properties, Milestones, Activity, and Documents now live in a Notes-style slide panel with Overview, Milestones, Activity, and Documents tabs.
- **Interactive calendar refresh** — month cells now show meaningful chips, summary cards, filters, and an always-visible agenda panel.
- **Expanded team activity map** — the Users page map now fills its workspace and adds D3 zoom/pan, drag, fit/reset controls, filters, tooltips, online pulse, activity heat, department clustering, and collaboration links.
- **Brief-style reports** — generated HTML, monthly previews, PDF export styling, and AI report prompts now follow the attached progress-brief design.

### Changed
- **Ranking help drawer** — ranking help no longer opens automatically and now appears as a floating slide panel.
- **Project workspace tabs** — Tasks, Board, Timeline, and Map remain in the main workspace while project metadata and documents move into the drawer.
- **Production packaging** — the local AI Copilot drawer and Ollama bridge are excluded from the shipped app.
- **GitHub Pages metadata** — public app/page version references were refreshed for this update.

## 3.0.8

### Fixed
- **Task assignee sync** — `updateTask` now resolves assignee IDs through `_resolveSupabaseUserId` (matching `createTask`), so reassigned users like Usmani no longer revert to the wrong person (e.g. zain) after cloud sync.
- **Sync ID map collision** — stable numeric IDs (users, projects, tasks) no longer pass through the shared offline idmap; legacy flat entries are purged on load. Fixes cases where `assigneeId: 7` was silently rewritten to `3`.
- **Classroom access stale cache** — cloud pull replaces the full `userClassrooms` table instead of merge-only upsert, so revoked classroom access is removed from IndexedDB on the user's device.
- **Push sync for classroom changes** — when an admin updates a user's classrooms and the change reaches Supabase, affected online clients receive a realtime broadcast and pull fresh membership data within about one second.

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
