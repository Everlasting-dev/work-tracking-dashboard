#!/usr/bin/env node
/*
 * Migrate existing Supabase Storage attachments → Google Drive.
 *
 *   node scripts/migrate-storage-to-drive.mjs [--limit=50] [--dry-run]
 *
 * Reads wt_attachments rows that have a storage_path, downloads each from the
 * 'project-files' bucket, uploads it to the correct Drive project folder, and
 * inserts a project_files metadata row. It is IDEMPOTENT (stored_name carries
 * `legacy-<attachmentId>-…`; already-migrated rows are skipped), VERIFIES each
 * upload via Drive metadata, and writes drive-migration-report.json.
 *
 * It NEVER deletes the original Supabase files — keep them until you've verified.
 * Requires .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_CLIENT_ID,
 * GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_DRIVE_ROOT_FOLDER_ID.
 * Node 18+ (built-in fetch); no npm dependencies.
 */
import { readFileSync, writeFileSync } from "node:fs";

for (const line of (() => { try { return readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n"); } catch { return []; } })()) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const E = process.env;
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const LIMIT = Number(args.limit || 1000);
const DRY = !!args["dry-run"];
const BUCKET = "project-files";
const SB = E.SUPABASE_URL?.replace(/\/$/, "");
const SVC = E.SUPABASE_SERVICE_ROLE_KEY;
if (!SB || !SVC) { console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const sbHeaders = { apikey: SVC, Authorization: `Bearer ${SVC}` };
const rest = (path, init = {}) => fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { ...sbHeaders, "Content-Type": "application/json", ...(init.headers || {}) } });

// ── Minimal Drive client (mirrors supabase/functions/_shared/drive.ts) ──
let _tok = "", _exp = 0;
async function driveToken() {
  if (_tok && Date.now() < _exp - 60000) return _tok;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: E.GOOGLE_CLIENT_ID, client_secret: E.GOOGLE_CLIENT_SECRET, refresh_token: E.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token" }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`token ${d.error || r.status}`);
  _tok = d.access_token; _exp = Date.now() + d.expires_in * 1000; return _tok;
}
async function driveCreateFolder(name, parent) {
  const r = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST", headers: { Authorization: `Bearer ${await driveToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parent] }),
  });
  if (!r.ok) throw new Error(`folder ${r.status}`);
  return (await r.json()).id;
}
async function driveUpload(name, mime, parent, bytes) {
  const boundary = `mig${Date.now()}`;
  const meta = JSON.stringify({ name, parents: [parent] });
  const head = Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`);
  const tail = Buffer.from(`\r\n--${boundary}--`);
  const body = Buffer.concat([head, Buffer.from(bytes), tail]);
  const r = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,size", {
    method: "POST", headers: { Authorization: `Bearer ${await driveToken()}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body,
  });
  const d = await r.json(); if (!r.ok) throw new Error(`upload ${d.error?.message || r.status}`); return d;
}
async function driveMeta(id) {
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=id,size,name`, { headers: { Authorization: `Bearer ${await driveToken()}` } });
  return r.ok ? r.json() : null;
}

const CATEGORY = (m = "") => m.startsWith("image/") ? "images" : m.startsWith("video/") ? "videos"
  : (m === "application/pdf" || m.startsWith("text/") || /word|excel|sheet|presentation|powerpoint|json/.test(m)) ? "documents" : "other";
const COLCAT = { images: "drive_images_folder_id", documents: "drive_documents_folder_id", videos: "drive_videos_folder_id", other: "drive_other_folder_id" };

const foldersCache = new Map();
async function ensureFolders(projectId) {
  if (foldersCache.has(projectId)) return foldersCache.get(projectId);
  let f = (await (await rest(`project_storage_folders?project_id=eq.${projectId}&select=*`)).json())[0];
  if (!f?.drive_project_folder_id) {
    const proj = await driveCreateFolder(`project_${projectId}`, E.GOOGLE_DRIVE_ROOT_FOLDER_ID);
    const [images, documents, videos, other] = await Promise.all([
      driveCreateFolder("images", proj), driveCreateFolder("documents", proj),
      driveCreateFolder("videos", proj), driveCreateFolder("other", proj),
    ]);
    f = { project_id: projectId, drive_project_folder_id: proj, drive_images_folder_id: images, drive_documents_folder_id: documents, drive_videos_folder_id: videos, drive_other_folder_id: other };
    if (!DRY) await rest("project_storage_folders?on_conflict=project_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(f) });
  }
  foldersCache.set(projectId, f); return f;
}

const report = { startedAt: new Date().toISOString(), migrated: [], skipped: [], failed: [], dryRun: DRY };

const rows = await (await rest(`wt_attachments?select=id,project_id,task_id,uploaded_by,file_name,mime_type,storage_path&storage_path=not.is.null&order=id.asc&limit=${LIMIT}`)).json();
console.log(`Found ${rows.length} cloud attachment(s) to consider${DRY ? " (dry run)" : ""}.`);

for (const a of rows) {
  const marker = `legacy-${a.id}-`;
  try {
    // Idempotency: already migrated?
    const existing = await (await rest(`project_files?select=id&stored_name=like.${encodeURIComponent(marker + "*")}&limit=1`)).json();
    if (existing.length) { report.skipped.push({ attachmentId: a.id, reason: "already-migrated" }); continue; }

    const dl = await fetch(`${SB}/storage/v1/object/${BUCKET}/${a.storage_path}`, { headers: sbHeaders });
    if (!dl.ok) { report.failed.push({ attachmentId: a.id, reason: `download ${dl.status}` }); continue; }
    const bytes = Buffer.from(await dl.arrayBuffer());
    const mime = a.mime_type || "application/octet-stream";
    const cat = CATEGORY(mime);
    const storedName = `${marker}${(a.file_name || "file").replace(/[^\w.\- ]+/g, "_")}`;

    if (DRY) { report.migrated.push({ attachmentId: a.id, projectId: a.project_id, category: cat, bytes: bytes.length, dryRun: true }); continue; }

    const folders = await ensureFolders(a.project_id);
    const folderId = folders[COLCAT[cat]] || folders.drive_other_folder_id;
    const up = await driveUpload(storedName, mime, folderId, bytes);
    const meta = await driveMeta(up.id);
    if (!meta || Number(meta.size) !== bytes.length) { report.failed.push({ attachmentId: a.id, reason: "verify-failed", driveFileId: up.id }); continue; }

    const ins = await rest("project_files", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({
      project_id: a.project_id, task_id: a.task_id || null, uploaded_by: a.uploaded_by || null,
      provider: "google_drive", drive_file_id: up.id, drive_folder_id: folderId,
      original_name: a.file_name, stored_name: storedName, mime_type: mime, size_bytes: bytes.length, file_category: cat,
    }) });
    if (!ins.ok) { report.failed.push({ attachmentId: a.id, reason: `metadata ${ins.status}`, driveFileId: up.id }); continue; }
    report.migrated.push({ attachmentId: a.id, projectId: a.project_id, driveFileId: up.id, category: cat, bytes: bytes.length });
    console.log(`✓ migrated attachment ${a.id} → drive ${up.id}`);
  } catch (e) {
    report.failed.push({ attachmentId: a.id, reason: String(e?.message || e) });
    console.error(`✗ attachment ${a.id}: ${e?.message || e}`);
  }
}

report.finishedAt = new Date().toISOString();
report.summary = { migrated: report.migrated.length, skipped: report.skipped.length, failed: report.failed.length };
writeFileSync(new URL("../drive-migration-report.json", import.meta.url), JSON.stringify(report, null, 2));
console.log("\nReport:", report.summary, "→ drive-migration-report.json");
console.log("Original Supabase files were left intact. Verify, then remove them separately when ready.");
