# WorkTracker

WorkTracker is a desktop workspace for tracking projects, tasks, files, team activity, and lightweight team communication.

It is **local-first**: work offline on your machine, then sync to the cloud when you are online. The Windows desktop build is aimed at everyday use — install once, sign in, and receive quiet update prompts when a newer build is available.

## Current Release

**[2.1.0-beta.18](https://github.com/Everlasting-dev/work-tracking-dashboard/releases/tag/v2.1.0-beta.18)** (latest)

| | |
|---|---|
| **Download** | [WorkTracker-Setup-2.1.0-beta.18.exe](https://github.com/Everlasting-dev/work-tracking-dashboard/releases/download/v2.1.0-beta.18/WorkTracker-Setup-2.1.0-beta.18.exe) |
| **Check for updates** | User menu → **Help** → **Check for updates** (or the desktop menu) |
| **Requires** | Windows 10/11, x64 |

> **Versioning note:** Releases use semver. Stay on the `beta` line (`beta.18`, `beta.19`, …) so the in-app updater can offer patches to existing beta installs. An `alpha` tag ranks *below* `beta` and will not be offered automatically.

## Highlights

### Projects & tasks
- Project dashboard with ownership, editor access, classrooms, departments, and sticky search/filters
- Per-project **Kanban board** — drag cards to change status or reorder; click to open details; editable task titles
- Global **Tasks** view with wrapping project tiles and per-tile vertical scroll
- Built-in and custom **workflow templates** that auto-fill starting tasks when creating a project
- **Logistics shipment workflow** with document uploads and step-by-step handoff
- Project completion celebration and classroom-wide notifications

### Team & collaboration
- **Users** tab — ranks (chess tiers), bios, presence, ranking explainer
- **Docked chat** — DMs, favorites, online users, general and project channels (launcher bottom-right)
- User profiles with avatar, bio, and contribution stats
- Contributor ranking computed from projects, tasks, and co-editing

### Files & sync
- Cloud-backed attachments — metadata syncs locally; files fetch on demand when opened
- Offline-first with queued sync when the network returns; unified sync diagnostics (retry / clear / details)
- Discord webhooks for project and general channels (when online)

### Admin
- User, role, classroom, department, and project-visibility management (grouped by classroom)
- Editable workflow templates in Settings
- In-app bug reports with admin ticket status, GitHub issue link, and resolution notes
- Monthly reports with co-authors/editors; export and AI report (cloud)

## Install (end users)

1. Download **WorkTracker-Setup-2.1.0-beta.18.exe** from [Releases](https://github.com/Everlasting-dev/work-tracking-dashboard/releases/latest).
2. Run the installer (Windows may show a SmartScreen prompt — the build is unsigned).
3. Sign in. In cloud mode, use **Sync** on the auth screen or after login if you need to pull team data first.

## Development

```bash
npm install
npm start          # run Electron locally
npm run dist:win   # build installer → release/
npm run publish:win  # build + publish to GitHub Releases (needs GH_TOKEN)
```

Installer output: `release/WorkTracker-Setup-<version>.exe`

### Cloud backend (team mode)

Cloud mode needs a configured backend and schema. Apply `supabase/schema.sql` on a fresh or existing database before expecting new features (workflow templates, sort order, bug resolution notes, etc.) to sync end-to-end.

Do **not** commit production secrets, service-role keys, or admin credentials. Keep tokens in your host or CI secret store.

## Updates

Desktop updates are delivered through **GitHub Releases**. Each published build includes the installer, `.blockmap`, and `latest.yml` for `electron-updater`.

- Prerelease updates are enabled (`allowPrerelease: true`).
- **Help → Check for updates** runs a manual check; automatic checks run shortly after app start.
- If an update is available but cannot install automatically (e.g. unsigned build), download the latest installer from Releases.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

## License

Private project. All rights reserved unless a separate license is added.
