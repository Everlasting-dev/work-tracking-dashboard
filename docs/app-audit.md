# Application Audit

## Scope and methodology
- **Audit date:** 2026-08-19
- **Repository areas reviewed:** root Electron/vanilla application entrypoints (`index.html`, `app.js`, `db*.js`, sync modules); Electron main/preload processes; Supabase v2/v3 schemas, migrations, and Edge Function tests; GitHub Actions workflows; both dependency manifests and lockfiles; and the untracked `orbitrack-react/` application.
- **Commands/checks run and outcomes:** read-only repository listing/status inspection; manifest, lockfile, workflow, schema, and source inspection; `npm run` script discovery; and `npm --prefix orbitrack-react run lint`.
  - The React lint command **failed before linting** because `oxlint` was not available on this host (`'oxlint' is not recognized...`). It did not alter the workspace.
  - The host has no `node` executable on `PATH`, so direct Node lockfile queries could not run. `npm` script discovery did run, but package executables were unavailable.
- **Checks not run:** no builds, test suites, package installation, audit/outdated commands, migrations, or packaging commands were run. There is no root test script, React has no test script, dependencies are unavailable locally, and several available scripts explicitly build or package outputs. Those were avoided to preserve the requested read-only scope.
- **Workspace baseline:** the working tree already contained extensive modified, deleted, and untracked files before this audit. This audit created only `docs/app-audit.md`; existing changes were not edited or normalized.

## Repository overview
- **Detected stack:** a legacy browser application built as globally loaded vanilla JavaScript, Dexie/IndexedDB, Supabase, and optional Google Drive storage; packaged as Electron. A separate, currently untracked React/TypeScript/Vite application (`orbitrack-react/`) is also present and can be launched by root scripts.
- **Runtime/package manager:** npm lockfiles (lockfile v3); GitHub workflows pin Node 20. No repository runtime-version file (`.nvmrc`, `.node-version`, or engines declaration) was found.
- **Test/tooling:** Supabase Edge Function test source exists under `supabase/functions/tests/`, but neither package manifest declares a test command or test runner. React declares TypeScript build and Oxlint only.
- **Architecture:** `index.html` loads more than twenty ordered global scripts. `app.js` (about 711 KB) contains authentication, routing, state, rendering, administration, and business logic. The application also has two partially overlapping data/auth models: legacy v2 `wt_*` tables and v3 workspace tables, plus a newer React client that reads the legacy `wt_*` schema.
- **Notable structural observations:** source, generated vendor bundles, deployment material, schemas, migrations, operational scripts, and an untracked replacement UI coexist at the root. This makes the shipping boundary and authoritative implementation difficult to determine.

## Findings

### Critical

- **ID:** AUD-001
- **Category:** Security
- **Evidence:** `supabase/schema.sql:430-465` enables RLS then creates `wt_anon_all` **for all** operations on every listed `wt_*` table for both `anon` and `authenticated`, with `using (true) with check (true)`; `supabase/schema.sql:468-473` grants anonymous read/insert/delete access to the `project-files` storage bucket; `app.js:571-590` and `app.js:1927-1937` use the browser-exposed anon key to fetch and synchronize this backend.
- **Issue:** The v2 schema explicitly authorizes unauthenticated clients to read, insert, update, and delete all application records, including users, projects, tasks, sessions, activity, direct messages, settings, and bug reports. The later task-only policies do not replace the broad policy for the other tables.
- **Impact:** Anyone with the published client configuration can directly call the Supabase REST/Storage APIs without signing in, exfiltrate workspace and user data, alter or delete records, and access uploaded files. The `wt_users` table definition includes password hashes and salts (`supabase/schema.sql:4-25`), amplifying the disclosure impact.
- **Recommendation:** Treat this as an incident-level deployment issue. Replace blanket policies with per-table, least-privilege RLS based on `auth.uid()` and project membership; remove anonymous access unless a specific public endpoint requires it; protect storage by authenticated project authorization; and rotate/review credentials and affected data access after policy deployment. Verify policies against the actual deployed v2 database, not only schema files.
- **Confidence:** High

### High

- **ID:** AUD-002
- **Category:** Security
- **Evidence:** `orbitrack-react/src/lib/auth.ts:5-7` embeds a fixed Drive/Supabase password pepper in browser source; `:27-29` deterministically derives a password from that value and numeric user ID; `:82-112` first tries that derived password, and when it cannot sign in, calls `supabase.auth.signUp` from the client and updates `wt_users.auth_user_id`; `:129-145` queries `wt_users` for password hash and salt before password verification.
- **Issue:** The React client contains a reusable credential derivation secret and client-side account-provisioning/linking flow. Because it is shipped to every client, the fixed value is not a secret. With the v2 broad RLS policy in AUD-001, user IDs and authentication-verifier data are also directly readable.
- **Impact:** An attacker can derive the application-created password for a known user ID and attempt to obtain a Supabase session, or exploit the client-controlled signup/link update path if the backend accepts it. This can enable account impersonation and invalid identity bindings. Independently, returning hashes/salts to browsers permits offline password guessing.
- **Recommendation:** Move account creation, password derivation/migration, and `auth_user_id` linking to a privileged server-side/Edge Function that validates the caller and never returns password verifiers. Remove the embedded pepper and reset/migrate any accounts created with this deterministic scheme. Ensure `wt_users` selection never exposes password hash or salt to client roles.
- **Confidence:** High

- **ID:** AUD-003
- **Category:** Security
- **Evidence:** `desktop/main.js:294-313` configures Electron auto-updates and sets `autoUpdater.verifyUpdateCodeSignature = false`; `:307-310` enables automatic download and install-on-quit. `package.json:138-148` configures GitHub release publishing, and `.github/workflows/release-desktop.yml` builds/publishes Windows artifacts.
- **Issue:** Desktop updates are automatically downloaded and installed while code-signature verification is explicitly disabled.
- **Impact:** A compromised release asset, release channel, or network/update delivery path has a substantially weaker authenticity safeguard and may lead to arbitrary code execution on desktop clients.
- **Recommendation:** Sign Windows release artifacts, configure electron-builder/electron-updater with the publisher identity, remove the signature-verification override, and validate the complete update path using a signed prerelease before re-enabling automatic installation.
- **Confidence:** High

### Medium

- **ID:** AUD-004
- **Category:** Reliability
- **Evidence:** `desktop/main.js:66-76` supports legacy, modular, and React execution modes; `:154-173` loads an untracked React build, a `modular-dist/modular/index.html` path, or legacy `index.html`. `package.json:20-22` exposes React desktop commands, while `package.json:124-167` packages React source and dist alongside the legacy app. The default React route is admin (`desktop/main.js:75`), and the React adapter accesses legacy `wt_*` tables (`orbitrack-react/src/lib/workspaceSupabaseAdapter.ts:148-152`).
- **Issue:** Three application modes and two schema/client architectures are shipped from one package without a clear release boundary or compatibility contract. One selectable mode references `modular-dist`, which is gitignored and was absent from the inspected root listing.
- **Impact:** A mode/configuration change can produce a blank or incomplete desktop experience, expose an admin-first route, or run a client against an incompatible schema. Debugging and rollback are complicated because functionality is duplicated across the 711 KB legacy `app.js` and the React tree.
- **Recommendation:** Define one production entrypoint per release artifact and make the selected UI/schema mode explicit at build time. Do not package experimental source/modes into the standard artifact until their required build output, configuration, authentication model, and regression suite are validated. Document a supported migration/cutover path between v2 and v3.
- **Confidence:** High

- **ID:** AUD-005
- **Category:** Testing
- **Evidence:** root `package.json:11-42` contains no test/lint/type-check script; `orbitrack-react/package.json:6-11` contains build and lint scripts but no test script; repository test discovery found only `supabase/functions/tests/auth_test.ts` and `supabase/functions/tests/validation_test.ts`; `.github/workflows/release-desktop.yml:24-67` runs `npm ci`, packages, and validates selected asar contents but does not run tests, lint, or type checking. The React lint command could not execute because dependencies/tool executable were unavailable.
- **Issue:** There is no runnable, repository-declared automated test suite for the main application, and CI release gating does not execute existing function tests or React static checks.
- **Impact:** Authentication, authorization, offline synchronization, conflict handling, schema compatibility, and packaging regressions can reach releases undetected. The current security-sensitive behavior has no visible automated regression barrier.
- **Recommendation:** Add non-mutating CI commands and deterministic test tooling first. Prioritize: (1) Supabase RLS policy tests for anon/member/admin access, (2) legacy and React login/logout/session restoration and failed-auth behavior, (3) project/task authorization and cross-user access denial, (4) offline queue/retry/conflict flows in `sync.js`/`sync-v3.js`, and (5) Electron update configuration and selected app-mode smoke tests. Make lint/type-check/test steps required before desktop publishing.
- **Confidence:** High

- **ID:** AUD-006
- **Category:** Structure
- **Evidence:** `index.html:229-266` depends on globally ordered loading of configuration, persistence, sync, UI, reports, storage, and feature bundles. `app.js` is approximately 711 KB and includes authentication (`:1725-2058`), routing (`:12634+`), rendering via extensive `innerHTML` usage, persistence caches, admin operations, and reporting. `db.js:1-356` contains fourteen Dexie schema versions plus migrations and data access helpers.
- **Issue:** The legacy application concentrates unrelated concerns in a small number of global files and depends on script-load order and `window.*` contracts instead of module boundaries.
- **Impact:** Changes have a wide blast radius; hidden initialization-order coupling and implicit globals make defects difficult to isolate and test. This is especially risky while the React rewrite and multiple sync/schema modes coexist.
- **Recommendation:** Incrementally isolate stable domain interfaces (auth/session, project/task repository, sync transport, rendering) behind ES modules or a tested adapter layer. Preserve behavior with characterization tests before splitting `app.js`; avoid a big-bang rewrite. Make loading dependencies explicit and reduce global write access.
- **Confidence:** High

### Low

- **ID:** AUD-007
- **Category:** Tooling
- **Evidence:** workflows use Node 20 (`.github/workflows/auto-version.yml:20-23`, `.github/workflows/release-desktop.yml:19-23`), but both `package.json` files lack an `engines` declaration and the repository has no `.nvmrc`/`.node-version`. Root and React package manifests use different React major versions (`package.json:79-80` declares React 18; `orbitrack-react/package.json:40-41` declares React 19).
- **Issue:** Developer runtime expectations are implicit, and the two build surfaces have divergent framework majors.
- **Impact:** Local behavior can differ from CI, while shared/bundled UI packages can become harder to reason about during the migration.
- **Recommendation:** Declare supported Node/npm versions in both manifests (and optionally a version file) matching CI. Keep React dependency ownership isolated by app boundary; do not attempt a cross-major consolidation without mode-specific build and UI regression testing.
- **Confidence:** High

## Test assessment
- **Existing coverage and quality:** No main-app unit, integration, or end-to-end tests were found. Two Supabase Edge Function test files exist, indicating some validation/auth helper coverage, but no repository script or CI step invokes them. The legacy application’s critical paths are global browser code and do not expose an evident test harness.
- **Critical missing scenarios, in priority order:**
  1. Database RLS and Storage policy integration tests covering anonymous, signed-out, member, editor/owner, and administrator attempts to read/write/delete each sensitive `wt_*` resource.
  2. React and legacy authentication tests: invalid password, user enumeration resistance, missing/expired Supabase session, local-storage tampering/stale session, logout, and account-link failure.
  3. Authorization tests for projects/tasks/files, particularly hidden projects, ownership transfer, editor membership, direct messages, user/profile edits, and administration actions.
  4. Offline sync tests for queued creates/updates/deletes, retry ordering, duplicate prevention, canonical-ID reconciliation, and conflict resolution in `sync.js`, `sync-v3.js`, and `db-supabase.js`.
  5. Electron smoke tests for each supported launch mode, failed React/modular build output, external navigation restrictions, and signed updater behavior.
- **Commands run and result summaries:** `npm --prefix orbitrack-react run lint` failed before linting because `oxlint` was unavailable. No test command exists in either manifest; no suite was run successfully.
- **Suggested additions:** establish a Node-based test runner for pure utilities/domain adapters; use a disposable Supabase project or local Supabase environment for policy and Edge Function integration tests; and add a small Electron/Vite smoke test layer. Add CI checks only after confirming their commands do not write tracked output.

## Safe upgrade opportunities

| Package/tool/runtime | Current version | Suggested target or upgrade range | Reason | Risk level | Confidence | Validation required |
|---|---:|---|---|---|---|---|
| Node.js runtime policy | CI uses Node 20; no declared local requirement | Declare and standardize on the existing Node 20 LTS line before considering a newer LTS | Repository evidence shows CI already relies on Node 20, while developers have no enforced compatible runtime. | Low | High | Run clean install, React type-check/build, lint, and Electron packaging in CI under the declared version. |
| Dependencies/frameworks | Mixed, with current lockfile versions and two separate application trees | No immediate dependency upgrade recommended from local evidence | The audit could not use a local package executable or non-mutating registry audit, and compatibility/security posture is dominated by application-level authorization defects rather than a verified vulnerable package. | N/A | High | After fixing authorization and establishing tests, run a non-mutating dependency audit/outdated review in a controlled environment and upgrade one bounded package group at a time. |

## Prioritized remediation plan
1. **Immediate actions**
   - Remove the v2 blanket anonymous RLS and storage policies (AUD-001), deploy verified least-privilege replacements, and investigate/rotate access where required.
   - Eliminate browser-held deterministic authentication credentials and client-controlled account linking (AUD-002).
   - Restore signed desktop update verification before the next automatic-update release (AUD-003).
2. **Near-term actions**
   - Add RLS/auth/authz integration tests and make them blocking CI checks (AUD-005).
   - Establish one supported production application mode and schema per release artifact; remove or isolate unavailable/experimental packaged modes (AUD-004).
   - Pin/document the Node runtime used by CI and developers (AUD-007).
3. **Longer-term improvements**
   - Incrementally extract the legacy global application into testable domain/repository/UI boundaries while retaining behavior through characterization tests (AUD-006).
   - Complete a documented, tested v2-to-v3 cutover or explicitly retire the unused path; avoid maintaining two independently evolving authorization/data models.

## Positive observations
- Electron renderer hardening is enabled: `desktop/main.js:141-147` uses a preload bridge, context isolation, sandboxing, disabled Node integration, and web security.
- External navigation is allowlisted to HTTP(S)/mailto and new windows are denied (`desktop/main.js:98-105`, `:191-210`).
- Password hashing uses Web Crypto PBKDF2 with random 16-byte salts and 100,000 iterations in the legacy local database (`db.js:358-372`), rather than storing plaintext passwords.
- The Electron preload exposes a narrow IPC surface (`desktop/preload.js:1-23`) rather than exposing Node APIs directly.
- The project has useful deployment safeguards: desktop CI verifies selected packaged assets and version/tag consistency (`.github/workflows/release-desktop.yml:37-61`), and `.gitignore` explicitly excludes common credential/token artifacts.
- React configuration uses a relative Vite base for Electron `file://` loading (`orbitrack-react/vite.config.ts:7-39`) and strict unused-local/parameter TypeScript options (`orbitrack-react/tsconfig.app.json:22-25`).

## Limitations
- This was a static, read-only audit. No deployed Supabase project, RLS policy state, GitHub secret, Google Drive service, desktop installer, or live update channel was accessed.
- The report does not reproduce or include sensitive configuration values. Runtime `config.js` was inspected only with values redacted; only the browser-source credential derivation design is described.
- The workspace began substantially dirty and contains an untracked React application, so git history alone could not establish which uncommitted implementation is intended for the next release.
- No builds, functional tests, Edge Function tests, linters, or package vulnerability scans completed successfully because the host lacked Node/package executables and the repository lacks runnable test scripts. Findings therefore distinguish directly evidenced defects from unvalidated runtime behavior.
