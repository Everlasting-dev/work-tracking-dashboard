# WorkTracker — Comprehensive Improvement Plan
**Prepared:** 2026-06-06  
**Version Target:** 2.2.0  
**Scope:** Offline-first architecture, web access, profile system, classroom permissions, admin/settings split, UI overhaul, dashboard graphs

---

## Table of Contents

1. [Current State Diagnosis](#1-current-state-diagnosis)
2. [Offline-First Architecture](#2-offline-first-architecture)
3. [Sync Engine Design](#3-sync-engine-design)
4. [Web Access (Any Device)](#4-web-access-any-device)
5. [User Profile System (Discord-style)](#5-user-profile-system-discord-style)
6. [Classroom Permission Model](#6-classroom-permission-model)
7. [Admin / Settings Split](#7-admin--settings-split)
8. [Dashboard Graphs](#8-dashboard-graphs)
9. [UI Overhaul & Animations](#9-ui-overhaul--animations)
10. [Classroom Creation UI Fix](#10-classroom-creation-ui-fix)
11. [Database Schema Changes](#11-database-schema-changes)
12. [Implementation Order](#12-implementation-order)

---

## 1. Current State Diagnosis

### Why the broken screen happens

```
User opens app (offline)
        │
        ▼
   bootstrapDB()
        │
        ▼
   SupabaseDB.init()
        │
        ├─── navigator.onLine === false ?
        │         YES → _initLocalSync()  ← sets up queue only
        │                     │
        │                     ▼
        │             init() runs → router() → loads page
        │                     │
        │                     ▼
        │             DB.getProjects()  ← calls Supabase HTTP
        │                     │
        │                     ▼
        │             fetch() → FAILS (no internet)
        │                     │
        │                     ▼
        │              ❌ BROKEN SCREEN ❌
        │
        └─── navigator.onLine === true (but no internet)
                    → fetch() to Supabase → TIMES OUT
                               │
                               ▼
                        ❌ BROKEN SCREEN ❌
```

### Root cause

`SupabaseDB` does NOT fall back to local data for reads. When offline, every
`DB.getProjects()`, `DB.getTasks()`, etc. attempts a live HTTP fetch to Supabase
and crashes. The shadow/cache only covers projects, tasks, departments, users,
and updates — and only for 45 seconds TTL. There is no persistent local store
backing SupabaseDB reads.

`db.js` (Dexie/IndexedDB) has a full local implementation. `db-bridge.js`
picks ONE adapter and sticks with it for the session. If it picks SupabaseDB,
there is no local fallback for reads.

### The fix philosophy

> IndexedDB is always the primary store.  
> Supabase is always the sync target.  
> Never fetch from Supabase to answer a read request.

---

## 2. Offline-First Architecture

### High-level data flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        WorkTracker App                          │
│                                                                 │
│  ┌──────────────┐    reads/writes    ┌──────────────────────┐  │
│  │   app.js     │ ◄────────────────► │   db-bridge.js       │  │
│  │  (UI layer)  │                    │   window.DB          │  │
│  └──────────────┘                    └──────────┬───────────┘  │
│                                                 │               │
│                                    always uses  │               │
│                                                 ▼               │
│                                   ┌─────────────────────────┐  │
│                                   │   LocalDB (db.js)       │  │
│                                   │   IndexedDB via Dexie   │  │
│                                   │   ← source of truth     │  │
│                                   └────────────┬────────────┘  │
│                                                │                │
│                                   writes also  │                │
│                                   queue here   │                │
│                                                ▼                │
│                                   ┌─────────────────────────┐  │
│                                   │   SyncEngine            │  │
│                                   │   (new: sync.js)        │  │
│                                   │   localStorage queue    │  │
│                                   └────────────┬────────────┘  │
│                                                │                │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
                              online?            │
                         ┌───────────────────────┤
                         │ YES                   │ NO
                         ▼                       ▼
              ┌─────────────────┐    ┌───────────────────────┐
              │  Supabase DB    │    │  Queue persisted to   │
              │  (remote sync)  │    │  localStorage until   │
              │                 │    │  internet returns     │
              └─────────────────┘    └───────────────────────┘
```

### New db-bridge.js strategy

```javascript
// NEW LOGIC — always boots LocalDB first
async function bootstrapDB() {
  // Step 1: Always init IndexedDB (instant, no network)
  await LocalDB.init();
  window.DB = LocalDB;
  window.WT_STORAGE_MODE = 'local';

  // Step 2: If Supabase is configured, run sync engine in background
  const cfg = window.WT_CONFIG || {};
  if (cfg.storage === 'supabase' && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    window.WT_STORAGE_MODE = 'hybrid';
    SyncEngine.init(cfg.supabaseUrl, cfg.supabaseAnonKey);
    // SyncEngine runs silently — it does NOT block the app
  }
}
```

### What this means for the user

| Scenario | Before | After |
|---|---|---|
| Offline, first launch | ❌ Broken screen | ✅ Empty workspace, create projects locally |
| Offline, returning user | ❌ Broken screen | ✅ All local data loads instantly |
| Online, Supabase set | ✅ Works | ✅ Works + faster (local reads) |
| Online → goes offline mid-session | ⚠️ Partial failure | ✅ Seamless, queue builds up |
| Returns online | ⚠️ Manual refresh | ✅ Auto-sync, banner shows progress |
| Web browser (new device) | ❌ No local data | ✅ Full sync from Supabase on first load |

---

## 3. Sync Engine Design

### sync.js — the new file

```
sync.js
├── SyncEngine.init(url, key)         bootstrap, bind online/offline events
├── SyncEngine.pull()                 download ALL Supabase data → LocalDB
├── SyncEngine.push()                 flush queued writes → Supabase
├── SyncEngine.enqueue(op)            add operation to queue
├── SyncEngine.getStatus()            { pending, failed, syncing, lastSync }
└── SyncEngine.resolveConflict(local, remote)   merge strategy
```

### Operation queue structure

Each queued operation is a JSON object stored in localStorage:

```json
{
  "id": "op_1717632000123_abc",
  "table": "wt_projects",
  "action": "create" | "update" | "delete",
  "localId": 99001,
  "remoteId": null,
  "payload": { "name": "My Project", "status": "active", ... },
  "createdAt": "2026-06-06T10:00:00Z",
  "attempts": 0,
  "lastError": null
}
```

### Pull strategy (first sync / reconnect)

```
SyncEngine.pull()
    │
    ├── fetch wt_users      → upsert into LocalDB.users
    ├── fetch wt_projects   → upsert into LocalDB.projects
    ├── fetch wt_tasks      → upsert into LocalDB.tasks
    ├── fetch wt_milestones → upsert into LocalDB.milestones
    ├── fetch wt_updates    → upsert into LocalDB.updates
    ├── fetch wt_classrooms → upsert into LocalDB.classrooms
    ├── fetch wt_departments → upsert into LocalDB.departments
    └── emit 'wt-sync-complete' → app re-renders current view
```

Pull is **incremental**: each collection stores `lastPulledAt` timestamp.
On reconnect, only records updated since that timestamp are fetched.

```
GET wt_projects WHERE updated_at > lastPulledAt
```

### Push strategy (writing to Supabase)

```
User creates a project (offline)
        │
        ▼
LocalDB.createProject({ name: "X" })
  → assigns localId = offlineId() (e.g. 999001)
  → saves to IndexedDB immediately
  → SyncEngine.enqueue({ table, action: 'create', localId: 999001, payload })
        │
internet returns
        │
        ▼
SyncEngine.push()
  → for each queued 'create':
      POST to Supabase → get real remoteId back (e.g. 42)
      → update LocalDB record: id 999001 → 42
      → update all tasks/updates that reference projectId 999001 → 42
      → remove op from queue
  → for each queued 'update':
      PATCH to Supabase by remoteId
      → remove op from queue
  → for each queued 'delete':
      DELETE from Supabase by remoteId
      → remove op from queue
```

### ID management

Offline-created records get a **temporary large ID** (> 900000000) so they never
collide with real Supabase IDs. When the create op syncs, all foreign key
references across tables are updated atomically in IndexedDB.

```
offline ID: 999_001_001  (epoch-based, unique per device)
remote ID:  42           (assigned by Supabase sequence)

After sync: everywhere that referenced 999_001_001 now reads 42
```

### Conflict resolution

Strategy: **Last Write Wins** with a tombstone exception.

| Situation | Resolution |
|---|---|
| Same field edited locally and remotely | Remote wins (Supabase is authoritative) |
| Local record deleted, remote updated | Local delete wins — delete remotely too |
| Remote record deleted, local updated | Remote delete wins — remove locally |
| New local record, no remote equivalent | Push as create |
| New remote record, no local equivalent | Pull as insert |

For project notes and task notes (long text): use **3-way merge** — show diff
banner to user if both sides changed the same field.

### Sync status indicator

Located in the top bar, replaces the existing sync banner:

```
┌──────────────────────────────────────────────────────┐
│  ☁ Syncing 3 changes...   [▓▓▓▓░░░░░░]  60%         │  ← syncing
│  ✓ All changes saved to cloud    (fades after 3s)    │  ← done
│  ⚡ Offline — 5 changes saved locally                │  ← offline
│  ⚠ 2 sync errors — click to review                  │  ← error
└──────────────────────────────────────────────────────┘
```

The progress bar animates like Google Photos — smooth fill, not jumpy.

### Local cache persistence (without attachments)

All synced data is stored in IndexedDB (Dexie). This persists across:
- App restarts
- Browser tab closes
- System reboots (IndexedDB survives)

Attachments (files) are NOT stored locally — only metadata (filename, size,
mime type, storage path). When offline, attachment thumbnails show a
"Attachment unavailable offline" placeholder. Uploads are queued and sent
when back online.

---

## 4. Web Access (Any Device)

### Current situation

The app is Electron-only. The web URL (`index.html`) is served from the
Electron renderer. There is no public web server.

### Proposed solution: Static Web Host

The app's `index.html`, `app.js`, `db.js`, `db-supabase.js`, `db-bridge.js`,
`styles.css` are already self-contained vanilla files. They can be deployed
as-is to any static host.

#### Recommended: GitHub Pages or Netlify (free)

```
GitHub repo
    └── /docs/ (or gh-pages branch)
            ├── index.html
            ├── app.js
            ├── db.js
            ├── db-supabase.js
            ├── db-bridge.js
            ├── sync.js       ← NEW
            ├── styles.css
            └── config.js     ← sets WT_CONFIG (Supabase keys)
```

config.js is committed WITHOUT the actual keys. The real config is injected
via a CI/CD environment variable or a `.env` file excluded from git.

#### Service Worker (web offline support)

A service worker (`sw.js`) is registered on web load:

```
Browser loads WorkTracker web
        │
        ▼
sw.js registered
        │
        ├── caches: index.html, app.js, styles.css, db.js, sync.js
        │          (app shell — works offline)
        │
        └── for Supabase API calls:
               online  → fetch, cache response
               offline → serve cached response + queue writes
```

This means a user who visited the web app at least once can continue working
fully offline from the browser — identical to the Electron experience.

#### Login flow on web (new device)

```
User opens web URL on phone/laptop
        │
        ▼
App loads from service worker cache (or network)
        │
        ▼
Login screen — enter username + password
        │
        ▼
DB.verifyPassword() — checks Supabase wt_users
        │
        ▼
SyncEngine.pull() — downloads their data to local IndexedDB
        │
        ▼
App is fully functional — now works offline too
```

---

## 5. User Profile System (Discord-style)

### Profile modal layout

```
╔════════════════════════════════════════════════════════╗
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← banner/cover  ║
║  ░░░░░░░░░░░░ gradient banner ░░░░░░                   ║
╠══════╦═════════════════════════════════════════════════╣
║  ┌─┐ ║  Akram                           [Edit Profile] ║
║  │A│ ║  @akram  ·  Admin  ·  R&D                       ║
║  └─┘ ║  "Bio text goes here..."                        ║
║      ║  📅 Member since May 2026                       ║
╠══════╩═════════════════════════════════════════════════╣
║  RANKING                                               ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │  🏆 Project Champion  [████████░░░░] Rank 3/6   │  ║
║  └─────────────────────────────────────────────────┘  ║
╠════════════════════════════════════════════════════════╣
║  STATS                                                 ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ║
║  │    12    │ │    8     │ │    3     │ │    5     │ ║
║  │ Projects │ │Completed │ │  Active  │ │Co-editor │ ║
║  │ Founded  │ │          │ │          │ │          │ ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘ ║
╠════════════════════════════════════════════════════════╣
║  RECENT ACTIVITY                                       ║
║  ── Created "ECUTEK dongle replacement"  2 days ago   ║
║  ── Completed task "Receive New Dongle"  3 days ago   ║
║  ── Joined classroom "R&D"              May 12        ║
╚════════════════════════════════════════════════════════╝
```

### Ranking system

Ranks are computed from a **score** based on activity:

| Action | Points |
|---|---|
| Create a project | +10 |
| Complete a project | +25 |
| Complete a task | +3 |
| Add a project update | +2 |
| Receive co-editor access | +5 |
| Account age (per month) | +1 |

Rank tiers:

| Score | Title | Badge |
|---|---|---|
| 0–20 | Newcomer | 🌱 |
| 21–60 | Contributor | ⭐ |
| 61–150 | Team Player | 🔥 |
| 151–300 | Project Champion | 🏆 |
| 301–600 | Senior Lead | 💎 |
| 601+ | Legendary | 👑 |

Score is computed live from existing DB data — no new DB column needed.

### Who can open a profile

Any user avatar is clickable and opens the profile modal:

- Owner avatar on project cards
- Co-editor avatars on project cards
- Assignee on task cards
- User in Admin panel team list
- User in DM list
- Activity log entries

### "View Profile" vs "Edit Profile"

- **Other user's profile:** Read-only. Shows all stats, rank, activity.
- **Own profile:** "Edit Profile" button appears in top-right of modal.
  Clicking switches modal into edit mode — inline fields appear for
  display name, bio, avatar, color, department.
- Own profile accessible via sidebar avatar click.

---

## 6. Classroom Permission Model

### Current state

All users in a classroom see all projects. There is no granular access control
beyond project `owner_id` and `editor_ids`.

### Proposed: Observer vs Editor

```
Classroom
    │
    ├── Project A
    │       ├── Owner: akram        (full control)
    │       ├── Editor: jawad       (edit tasks/updates, no delete)
    │       └── Observer: zain      (read-only, can request access)
    │
    └── Project B
            ├── Owner: jawad
            └── Observer: akram, zain
```

#### Access levels

| Action | Observer | Editor | Owner | Admin |
|---|---|---|---|---|
| View project | ✅ | ✅ | ✅ | ✅ |
| View tasks | ✅ | ✅ | ✅ | ✅ |
| Create task | ❌ | ✅ | ✅ | ✅ |
| Edit task | ❌ | ✅ | ✅ | ✅ |
| Delete task | ❌ | ❌ | ✅ | ✅ |
| Add update | ❌ | ✅ | ✅ | ✅ |
| Edit project | ❌ | ❌ | ✅ | ✅ |
| Delete project | ❌ | ❌ | ✅ | ✅ |
| Manage editors | ❌ | ❌ | ✅ | ✅ |
| Request access | ✅ | — | — | — |

#### How observer is assigned

Any user who is a member of a classroom but NOT the owner and NOT in
`editor_ids` is automatically an observer for that project. No new DB column
needed — the logic is derived.

#### Access request flow (improved UX)

```
Observer clicks "Request Editor Access" on a project
        │
        ▼
Slide-up panel appears with a message field
        │
        ▼
Request saved to wt_project_access_requests
        │
        ▼
Owner gets a notification with accept/deny buttons inline
        │
        ├── Accept → observer added to editor_ids, notification sent back
        └── Deny   → requester notified with optional reason
```

The notification card shows the requester's avatar, name, message, and
accept/deny buttons — no need to navigate to admin to handle it.

---

## 7. Admin / Settings Split

### Current admin panel sections

```
Admin Panel
├── Bug Reports
├── Classrooms
├── Team Members (list + edit)
├── Departments (edit labels/colors)
├── Workflow Templates
├── Webhooks
├── Activity Log
└── Sessions
```

### Proposed split

```
┌─────────────────────────────────────┐
│  ADMIN           │  SETTINGS         │
├─────────────────────────────────────┤
│ Bug Reports      │ Classrooms        │
│ Team Members     │ Departments       │
│ Access Requests  │ Workflow Templates│
│ Sessions         │ Webhooks          │
│ Activity Log     │ App Preferences   │
│                  │ Import / Export   │
└─────────────────────────────────────┘
```

**Admin tab** = People & monitoring  
**Settings tab** = Configuration & workspace setup

Both tabs are admin-only. The nav item changes from "Admin" to showing two
sub-items when the admin user is logged in:

```
Sidebar (admin user)
├── Dashboard
├── Projects
├── Tasks
├── Chat
├── ──────
├── Admin        ← people management
└── Settings     ← workspace config
```

Regular users see neither.

---

## 8. Dashboard Graphs

### Charts to add (using Chart.js — lightweight, no backend needed)

#### 1. Project Status Donut

```
    ╭───────╮
   ╱ Active  ╲    ● Active    8
  │   ████   │    ● Completed 12
   ╲ Completed╱   ● Overdue   2
    ╰───────╯
```

#### 2. Task Completion Over Time (line chart)

```
Tasks
  │
12│     ·──·
  │  ·─╯   ╲──·
 6│─╯           ╲
  └──────────────── weeks
  W1  W2  W3  W4
```

Shows tasks completed per week for the past 4 weeks.

#### 3. Team Activity Heatmap (GitHub-style)

```
Mon │ ░ ░ ▓ ░ ░ ▓ ░
Tue │ ░ ▓ ▓ ░ ▓ ░ ░
Wed │ ▓ ░ ░ ▓ ▓ ░ ░
    └──────────────
      week 1 → now
```

Shows which days had the most activity (task creates, updates, completions).

#### 4. Member Contribution Bar

```
akram  ██████████ 24 tasks
jawad  ███████    18 tasks
zain   ████       9 tasks
```

#### 5. Project Progress Summary Cards (top of dashboard)

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  8 Active    │ │ 12 Completed │ │ 45 Tasks Due │ │ 3 Overdue    │
│  projects    │ │  this month  │ │  this week   │ │  projects    │
│  ↑2 vs last  │ │  ↑5 vs last  │ │              │ │  ↓1 vs last  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

All data is computed from existing DB records — no new tables needed.
Chart.js is loaded from CDN (one `<script>` tag addition).

---

## 9. UI Overhaul & Animations

### Animation strategy

Use CSS `@keyframes` and `transition` only — no JS animation libraries.
Animations respect `prefers-reduced-motion`.

#### Specific animations

| Element | Animation |
|---|---|
| Page navigation | Fade-in + slight upward slide (150ms ease-out) |
| Modal open/close | Scale 0.96→1 + fade (200ms) |
| Project card hover | Lift shadow + 2px translate-y (150ms) |
| Task status toggle | Checkmark draws in (200ms stroke-dashoffset) |
| Sync indicator | Smooth progress bar fill (no jumps) |
| Notification badge | Pulse ring when new notification arrives |
| Sidebar menu items | Subtle left-border grow on hover (100ms) |
| Toast messages | Slide in from bottom-right, fade out (300ms) |
| Profile modal | Bottom sheet on mobile, centered on desktop |
| Rank progress bar | Animated fill on first view (600ms ease) |

#### Color system refinement

```
Current:  flat indigo (#4f46e5)
Proposed: keep indigo as primary, add:
  - Subtle glass cards: background rgba(255,255,255,0.7) + backdrop-blur
  - Gradient accents on stat cards (per department color)
  - Dark mode foundation: CSS variables already structured for it
```

#### Mobile UI (responsive overhaul)

Current mobile: desktop layout squashed into small screen.

Proposed:

```
Mobile (< 768px)
┌────────────────────┐
│  WorkTracker    🔔 │  ← minimal top bar
├────────────────────┤
│                    │
│   [page content]   │  ← full width cards
│                    │
│                    │
├────────────────────┤
│ 🏠  📋  💬  👤    │  ← bottom tab bar (iOS style)
└────────────────────┘
```

- Bottom tab navigation replaces sidebar on mobile
- Cards stack vertically with swipe-friendly touch targets
- Modals become bottom sheets (slide up from bottom)
- FAB (floating action button) for primary actions

---

## 10. Classroom Creation UI Fix

### Current (broken) layout

```
┌─────────────────────────────────┬──────────┬────────┐
│ Classroom name                  │ Short des│ [color]│
└─────────────────────────────────┴──────────┴────────┘
```
Name and description shown on same line as existing classrooms: **Main ClassroomDefault workspace**

### Fixed layout

```
Classrooms
Separate project canvases for different teams.

● Main Classroom
  Default workspace                        [Remove]

● R&D Team
  Research and development projects        [Remove]

┌───────────────────────────────────────────────────┐
│  Classroom name                                   │
├───────────────────────────────────────────────────┤
│  Short description (optional)                     │
├──────────────────────┬────────────────────────────┤
│  [● Color picker   ] │  [+ Add Classroom]         │
└──────────────────────┴────────────────────────────┘
```

Fix: the existing classroom list items need `display: flex; flex-direction: column`
with the name in bold and description as a smaller subtitle.

---

## 11. Database Schema Changes

### New columns needed

```sql
-- Classroom membership roles (observer is default, no column needed — derived)
-- No schema change required for basic observer/editor model since
-- editor_ids jsonb already exists on wt_projects.

-- User stats (computed from existing data, no new columns)

-- Profile enhancements — already have: bio, avatar_base64, color, department

-- Rank score caching (optional optimization)
ALTER TABLE public.wt_users 
  ADD COLUMN IF NOT EXISTS rank_score int NOT NULL DEFAULT 0;

-- Last sync tracking per device (for incremental pull)
ALTER TABLE public.wt_sessions
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Project updated_at index for incremental sync
CREATE INDEX IF NOT EXISTS wt_projects_updated_idx ON public.wt_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS wt_tasks_updated_idx ON public.wt_tasks(updated_at DESC);
CREATE INDEX IF NOT EXISTS wt_updates_updated_idx ON public.wt_updates(created_at DESC);
```

### Schema diff to run in Supabase SQL Editor

```sql
-- 1. Rank score cache
ALTER TABLE public.wt_users 
  ADD COLUMN IF NOT EXISTS rank_score int NOT NULL DEFAULT 0;

-- 2. Sync tracking
ALTER TABLE public.wt_sessions
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- 3. Performance indexes for incremental sync
CREATE INDEX IF NOT EXISTS wt_projects_updated_idx 
  ON public.wt_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS wt_tasks_updated_idx 
  ON public.wt_tasks(updated_at DESC);
CREATE INDEX IF NOT EXISTS wt_milestones_created_idx 
  ON public.wt_milestones(created_at DESC);

-- 4. Reload PostgREST cache
NOTIFY pgrst, 'reload schema';
```

This is the ONLY SQL you need to run. Everything else is handled in app code.

---

## 12. Implementation Order

### Phase 1 — Critical fixes (do first, ship as beta.7)
1. **Offline broken screen fix** — Change db-bridge.js so LocalDB always loads first
2. **Classroom creation UI fix** — CSS fix, 30 minutes
3. **Admin/Settings tab split** — Reorganize existing HTML, 2 hours

### Phase 2 — Data layer (beta.8)
4. **sync.js** — New sync engine (SyncEngine object)
5. **Update db-bridge.js** — Hybrid mode
6. **Sync indicator** — Progress bar UI in top bar
7. **Run schema SQL** — Add the 3 columns listed above

### Phase 3 — Profile system (beta.9)
8. **Profile modal** — Discord-style view with stats and rank
9. **Clickable avatars** — Wire up everywhere
10. **Ranking computation** — Score formula, tier badges

### Phase 4 — Dashboard & graphs (beta.10)
11. **Chart.js integration** — Add CDN script tag
12. **Dashboard stat cards** — Replace current simple stats
13. **Charts** — Donut, line, heatmap, bar

### Phase 5 — Web access (v2.2.0)
14. **Web deploy config** — config.js, Netlify/GitHub Pages setup
15. **Service worker** — sw.js for offline web support

### Phase 6 — UI overhaul (v2.2.0)
16. **Animation system** — CSS keyframes, transition tokens
17. **Card/modal redesign** — Glass effect, gradient accents
18. **Mobile bottom nav** — Replace sidebar on small screens
19. **Classroom permissions UI** — Observer badge, request access button

---

## Questions to Confirm Before Building

1. **Web host preference** — GitHub Pages (free, same repo) or Netlify (free, custom domain)?
2. **Offline-created data ownership** — If user A creates a project offline and user B (same Supabase) also created something while A was offline, and they sync at the same time — should we merge both, or does last-sync-wins apply?
3. **Rank visibility** — Is the ranking visible to all members, or only admins?
4. **Observer default** — Should a user added to a classroom be observer on ALL existing projects by default, or only new projects created after they joined?

---

*This document is a living plan. Update it as decisions are made.*
