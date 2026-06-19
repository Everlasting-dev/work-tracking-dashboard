#!/usr/bin/env node
/*
 * Delete the now-redundant file bytes from Supabase Storage AFTER migration.
 *
 *   node scripts/cleanup-supabase-storage.mjs            # DRY RUN (default, deletes nothing)
 *   node scripts/cleanup-supabase-storage.mjs --confirm  # actually delete
 *
 * SAFETY: only deletes a Storage object if its wt_attachments row has a matching
 * MIGRATED project_files row (stored_name `legacy-<attachmentId>-...`). Anything
 * not confirmed-migrated (e.g. the failed attachment 29) is left untouched.
 * Writes supabase-storage-cleanup-report.json. Node 18+, no npm deps.
 */
import { readFileSync, writeFileSync } from "node:fs";

for (const line of (() => { try { return readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n"); } catch { return []; } })()) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const E = process.env;
const CONFIRM = process.argv.includes("--confirm");
const BUCKET = "project-files";
const SB = E.SUPABASE_URL?.replace(/\/$/, "");
const SVC = E.SUPABASE_SERVICE_ROLE_KEY;
if (!SB || !SVC) { console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env"); process.exit(1); }
const H = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json" };
const rest = (p, init = {}) => fetch(`${SB}/rest/v1/${p}`, { ...init, headers: { ...H, ...(init.headers || {}) } });

const report = { startedAt: new Date().toISOString(), confirm: CONFIRM, deleted: [], kept: [], failed: [] };

// 1. All cloud attachments with a storage path.
const atts = await (await rest(`wt_attachments?select=id,storage_path&storage_path=not.is.null&limit=10000`)).json();
console.log(`Found ${atts.length} Supabase Storage object(s).`);

// 2. Keep only those confirmed migrated to Drive.
const toDelete = [];
for (const a of atts) {
  const migrated = await (await rest(`project_files?select=id&stored_name=like.${encodeURIComponent(`legacy-${a.id}-*`)}&limit=1`)).json();
  if (migrated.length) toDelete.push(a.storage_path);
  else report.kept.push({ attachmentId: a.id, reason: "not-confirmed-migrated" });
}
console.log(`${toDelete.length} confirmed-migrated and eligible for deletion; ${report.kept.length} kept.`);

if (!CONFIRM) {
  report.wouldDelete = toDelete.length;
  writeFileSync(new URL("../supabase-storage-cleanup-report.json", import.meta.url), JSON.stringify(report, null, 2));
  console.log("\nDRY RUN — nothing deleted. Re-run with --confirm to delete the eligible files.");
  process.exit(0);
}

// 3. Delete in batches via the Storage remove endpoint.
for (let i = 0; i < toDelete.length; i += 50) {
  const batch = toDelete.slice(i, i + 50);
  const res = await fetch(`${SB}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: batch }),
  });
  if (res.ok) { report.deleted.push(...batch); console.log(`✓ deleted ${Math.min(i + 50, toDelete.length)}/${toDelete.length}`); }
  else { const t = await res.text().catch(() => ""); report.failed.push({ batchStart: i, status: res.status, error: t.slice(0, 150) }); console.error(`✗ batch ${i}: ${res.status}`); }
}

report.finishedAt = new Date().toISOString();
report.summary = { deleted: report.deleted.length, kept: report.kept.length, failed: report.failed.length };
writeFileSync(new URL("../supabase-storage-cleanup-report.json", import.meta.url), JSON.stringify(report, null, 2));
console.log("\nDone:", report.summary, "→ supabase-storage-cleanup-report.json");
