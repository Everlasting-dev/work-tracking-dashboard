# Changelog

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
