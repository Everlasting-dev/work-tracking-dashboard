# WorkTracker

WorkTracker is a desktop and web workspace for tracking projects, tasks, files, team activity, and lightweight team communication.

It supports local-first use for offline work and optional cloud sync for shared teams. The Windows desktop build is designed for normal end users: install it, sign in once, keep working, and receive quiet update prompts when a new patch is available.

## Current Release

**2.1.0-beta.3**

This beta focuses on desktop polish, offline sync, classroom workspaces, direct chats, profile visibility, bug reporting, and a calmer update experience.

## Highlights

- Project dashboard with ownership, editor access, and classroom filtering
- Per-project task boards, lists, timeline chain view, files, notes, and activity
- Shared cloud mode with offline cache and queued sync when the network returns
- Windows installer with automatic update checks through GitHub Releases
- General chat plus direct user-to-user chats
- User profiles with bio and avatar support
- Admin tools for users, roles, classrooms, integrations, and bug reports
- In-app bug reports with optional screenshot attachments

## Desktop App

Build the Windows installer:

```bash
npm install
npm run dist:win
```

Installer output is written to `release/`.

The desktop app keeps the same data behavior as the web app. In cloud mode, Supabase remains the shared online store. When offline, supported changes are stored locally and synced after the connection returns. Discord webhooks still work when the app has internet access. Any separate Discord bridge service should be deployed and managed separately from the desktop installer.

## Updates

Desktop updates are delivered through GitHub Releases. Each published desktop version should include the generated installer, blockmap, and update manifest from `release/`.

Users see a subtle notification when an update is ready. Manual update checks should show either an install prompt or a simple no-update message.

## Web App

The web version can run as a static site. Local-only mode stores data in the browser. Cloud mode requires a configured backend and should be deployed using your private production settings.

## Security Notes

Do not commit production secrets, private tokens, service-role keys, or administrator credentials. Keep deployment credentials in your hosting provider or CI secret store.

This repository intentionally keeps operational instructions high level. Production database policies, release credentials, and integration tokens should be managed privately by the project owner.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes.

## License

Private project. All rights reserved unless a separate license is added.
