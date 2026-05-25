# WorkTracker

A lightweight project and task tracker for individuals and small teams. Track projects, tasks, milestones, documents, and activity — in the browser with optional cloud sync via [Supabase](https://supabase.com).

**Live demo:** [https://everlasting-dev.github.io/work-tracking-dashboard/](https://everlasting-dev.github.io/work-tracking-dashboard/)

**Repository:** [github.com/Everlasting-dev/work-tracking-dashboard](https://github.com/Everlasting-dev/work-tracking-dashboard)

---

## Features

- **Projects dashboard** — card grid with filters (Active, Completed, On Hold, Archived) and workspace scope (Mine / Everyone)
- **Tasks** — per-project and global task lists with status, priority, and due dates
- **Milestones** — weighted milestones per project
- **Documents** — upload PDFs, images, and files; preview in-browser; right-side document panel
- **Activity log** — automatic audit trail (visible to you and admins)
- **Multi-user** — admin-managed accounts with roles (Admin / Member)
- **Import / Export** — JSON backup (admin only, from user menu)
- **Two storage modes:**
  - **Local** — IndexedDB in the browser (default, no server)
  - **Cloud** — Supabase PostgreSQL + Storage (shared data across devices)

---

## Quick start (local, no install)

1. Clone the repo:
   ```bash
   git clone https://github.com/Everlasting-dev/work-tracking-dashboard.git
   cd work-tracking-dashboard
   ```
2. Serve the folder with any static server, for example:
   ```bash
   npx serve .
   ```
3. Open the URL shown (e.g. `http://localhost:3000`).
4. On first visit, create the **administrator account** and a **master recovery key**.
5. Sign in and start creating projects.

No `npm install` is required for local mode — dependencies load from CDN.

---

## Go live on GitHub Pages

This repo includes a GitHub Actions workflow that deploys on every push to `main`.

### 1. Enable Pages

1. Open the repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` (or run the **Deploy GitHub Pages** workflow manually)

Your site will be published at:

`https://everlasting-dev.github.io/work-tracking-dashboard/`

### 2. Connect Supabase (recommended for production)

Without Supabase, the live site uses **IndexedDB per browser** (data stays on each device). To use a shared cloud database:

#### A. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. Open **SQL Editor** → **New query**.
3. Paste and run the full script from [`supabase/schema.sql`](supabase/schema.sql).
4. Confirm **Storage** has a bucket named `project-files` (the script creates it).

#### B. Get API keys

In Supabase → **Project Settings** → **API**:

- **Project URL** → `supabaseUrl`
- **anon public** key → `supabaseAnonKey`

#### C. Add GitHub secrets

In your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Value |
|--------|--------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Your anon key |

Push to `main` again (or re-run the deploy workflow). The build writes `config.js` with Supabase credentials. The app footer shows **@username · Cloud** when connected.

#### D. Local development with Supabase

```bash
cp config.example.js config.js
# Edit config.js with your URL and anon key
npx serve .
```

---

## Configuration

| File | Purpose |
|------|---------|
| [`config.js`](config.js) | Runtime config (committed default: `storage: 'local'`) |
| [`config.example.js`](config.example.js) | Template for Supabase credentials |

```javascript
window.WT_CONFIG = {
  storage: 'supabase',  // 'local' | 'supabase'
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY'
};
```

When no users exist yet, the public landing page shows only the sign-in screen. To create the first administrator account, open `#/setup` directly.

---

## Project structure

```
work-tracking-dashboard/
├── index.html          # App shell
├── app.js              # UI, routing, auth, views
├── db.js               # IndexedDB (Dexie) — LocalDB
├── db-supabase.js      # Supabase adapter
├── db-bridge.js        # Picks local vs cloud backend
├── config.js           # Runtime storage config
├── styles.css          # Styles
├── supabase/
│   └── schema.sql      # PostgreSQL schema + RLS policies
└── .github/workflows/
    └── deploy-pages.yml
```

---

## Security notes

- Passwords are hashed with **PBKDF2** (100,000 iterations, SHA-256) before storage.
- The Supabase **anon key** is public in the browser (expected for static apps). The included RLS policies are **permissive for development**. Before production use with sensitive data, tighten policies or move auth to [Supabase Auth](https://supabase.com/docs/guides/auth) and Edge Functions.
- The **master recovery key** is set at admin setup and used at `#/recovery` for password resets. Store it safely.
- This app does not send email; see [`EMAIL-NOTES.md`](EMAIL-NOTES.md).

---

## Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full edit access, user management, import/export, sees all activity on projects |
| **Member** | Edit own projects; view others’ projects/tasks read-only via **Everyone** scope |

---

## Import / export

Admins: click your **profile** in the sidebar → **Export Data** or **Import Data**.

- Export downloads `worktracker-YYYY-MM-DD.json` (projects, tasks, users metadata, attachments as base64 in local mode).
- Import replaces all project data (users are preserved unless included in the file).

---

## Tech stack

- Vanilla HTML / CSS / JavaScript (no build step)
- [Dexie.js](https://dexie.org) + IndexedDB (local mode)
- [Supabase](https://supabase.com) — PostgreSQL + Storage (cloud mode)
- [Inter](https://fonts.google.com/specimen/Inter) font

---

## Roadmap

- Tighter Supabase RLS and Supabase Auth integration
- Task edit UI
- User profile / self-service password change

---

## License

MIT — use freely for personal and team work tracking.
