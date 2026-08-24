#!/usr/bin/env node
/*
 * Audit and safely clean duplicate Orbitrack Storage root folders.
 *
 * Dry run, writes drive-root-cleanup-report.json:
 *   node scripts/drive-storage-root-cleanup.mjs
 *
 * Move only empty duplicate root folders to Google Drive trash:
 *   node scripts/drive-storage-root-cleanup.mjs --confirm-empty-trash
 *
 * Safety rules:
 * - Never touches GOOGLE_DRIVE_ROOT_FOLDER_ID.
 * - Never touches a duplicate root that contains any descendant files.
 * - Uses Drive trash, not permanent deletion.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FOLDER_MIME = "application/vnd.google-apps.folder";
const REPORT_PATH = resolve(ROOT, "drive-root-cleanup-report.json");

function loadEnv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function argValue(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : "";
}

function required(name) {
  const value = process.env[name];
  if (!value || value === "...") throw new Error(`${name} is missing or still set to "...".`);
  return value;
}

function driveQueryString(value) {
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(size >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

async function postForm(url, form) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function googleAccessToken() {
  const response = await postForm("https://oauth2.googleapis.com/token", {
    client_id: required("GOOGLE_CLIENT_ID"),
    client_secret: required("GOOGLE_CLIENT_SECRET"),
    refresh_token: required("GOOGLE_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });
  if (!response.ok) {
    const code = response.data?.error || `http_${response.status}`;
    const description = response.data?.error_description || "Token refresh failed.";
    const err = new Error(`${code}: ${description}`);
    err.code = code;
    throw err;
  }
  return response.data.access_token;
}

async function driveJson(accessToken, url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Drive API request failed (${res.status})`);
  }
  return data;
}

async function listDriveFiles(accessToken, q, fields, orderBy = "name") {
  const files = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      q,
      fields: `nextPageToken,files(${fields})`,
      orderBy,
      pageSize: "1000",
      spaces: "drive",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await driveJson(accessToken, `https://www.googleapis.com/drive/v3/files?${params}`);
    files.push(...(data.files || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return files;
}

async function getDriveFile(accessToken, fileId) {
  if (!fileId) return null;
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,trashed,createdTime,modifiedTime`;
  try {
    return await driveJson(accessToken, url);
  } catch {
    return null;
  }
}

async function findRootFolders(accessToken, rootFolderName) {
  return listDriveFiles(
    accessToken,
    `name = ${driveQueryString(rootFolderName)} and mimeType = ${driveQueryString(FOLDER_MIME)} and trashed = false`,
    "id,name,mimeType,createdTime,modifiedTime,trashed",
    "createdTime",
  );
}

async function scanTree(accessToken, rootId) {
  const seen = new Set([rootId]);
  const stack = [rootId];
  let descendantFolders = 0;
  let descendantFiles = 0;
  let totalBytes = 0;
  const sampleFiles = [];
  const sampleFolders = [];

  while (stack.length) {
    const parentId = stack.pop();
    const children = await listDriveFiles(
      accessToken,
      `${driveQueryString(parentId)} in parents and trashed = false`,
      "id,name,mimeType,size,createdTime,modifiedTime",
      "folder,name",
    );

    for (const child of children) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      if (child.mimeType === FOLDER_MIME) {
        descendantFolders += 1;
        if (sampleFolders.length < 5) sampleFolders.push({ id: child.id, name: child.name });
        stack.push(child.id);
      } else {
        const size = Number(child.size || 0);
        descendantFiles += 1;
        totalBytes += Number.isFinite(size) ? size : 0;
        if (sampleFiles.length < 5) {
          sampleFiles.push({ id: child.id, name: child.name, mimeType: child.mimeType, size });
        }
      }
    }
  }

  return { descendantFolders, descendantFiles, totalBytes, sampleFiles, sampleFolders };
}

async function trashFolder(accessToken, folderId) {
  return driveJson(accessToken, `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}?fields=id,name,trashed`, {
    method: "PATCH",
    body: JSON.stringify({ trashed: true }),
  });
}

function printHelp() {
  console.log(`
Usage:
  node scripts/drive-storage-root-cleanup.mjs
  node scripts/drive-storage-root-cleanup.mjs --confirm-empty-trash

Options:
  --name <folder name>        Override GOOGLE_DRIVE_ROOT_FOLDER_NAME / "Orbitrack Storage".
  --confirm-empty-trash       Move empty duplicate roots to Google Drive trash.

The script never touches GOOGLE_DRIVE_ROOT_FOLDER_ID and never touches a duplicate
root that contains any descendant files.
`);
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    printHelp();
    return;
  }

  loadEnv();

  const rootFolderName = argValue("--name") || process.env.GOOGLE_DRIVE_ROOT_FOLDER_NAME || "Orbitrack Storage";
  const activeRootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "";
  const confirmEmptyTrash = hasFlag("--confirm-empty-trash");
  const accessToken = await googleAccessToken();

  const rootsById = new Map();
  for (const root of await findRootFolders(accessToken, rootFolderName)) {
    rootsById.set(root.id, root);
  }

  if (activeRootId && !rootsById.has(activeRootId)) {
    const active = await getDriveFile(accessToken, activeRootId);
    if (active && active.mimeType === FOLDER_MIME && !active.trashed) {
      rootsById.set(active.id, active);
    }
  }

  const roots = [...rootsById.values()].sort((a, b) => String(a.createdTime || "").localeCompare(String(b.createdTime || "")));
  const report = {
    startedAt: new Date().toISOString(),
    rootFolderName,
    activeRootId,
    confirmEmptyTrash,
    roots: [],
    trashed: [],
    warnings: [],
  };

  if (!activeRootId) {
    report.warnings.push("GOOGLE_DRIVE_ROOT_FOLDER_ID is missing. Cleanup is disabled; this run is audit-only.");
  }

  for (const root of roots) {
    const scan = await scanTree(accessToken, root.id);
    const isActive = activeRootId === root.id;
    const canTrashEmptyDuplicate = Boolean(activeRootId) && !isActive && scan.descendantFiles === 0;
    report.roots.push({
      id: root.id,
      name: root.name,
      createdTime: root.createdTime || "",
      modifiedTime: root.modifiedTime || "",
      isActive,
      descendantFolders: scan.descendantFolders,
      descendantFiles: scan.descendantFiles,
      totalBytes: scan.totalBytes,
      totalBytesHuman: formatBytes(scan.totalBytes),
      safeAction: isActive
        ? "keep-active-root"
        : canTrashEmptyDuplicate
          ? "trash-empty-duplicate"
          : "keep-review-nonempty-or-no-active-root",
      sampleFolders: scan.sampleFolders,
      sampleFiles: scan.sampleFiles,
    });
  }

  const eligible = report.roots.filter((root) => root.safeAction === "trash-empty-duplicate");
  console.table(report.roots.map((root) => ({
    id: root.id,
    active: root.isActive,
    folders: root.descendantFolders,
    files: root.descendantFiles,
    bytes: root.totalBytesHuman,
    action: root.safeAction,
  })));

  if (confirmEmptyTrash && !activeRootId) {
    throw new Error("Refusing cleanup without GOOGLE_DRIVE_ROOT_FOLDER_ID. Set the active root folder id in .env first.");
  }

  if (confirmEmptyTrash) {
    for (const root of eligible) {
      const trashed = await trashFolder(accessToken, root.id);
      report.trashed.push({ id: trashed.id, name: trashed.name, trashed: trashed.trashed });
      console.log(`[ok] Trashed empty duplicate root: ${trashed.name} (${trashed.id})`);
    }
  } else if (eligible.length) {
    console.log(`[dry-run] ${eligible.length} empty duplicate root folder(s) can be moved to trash with --confirm-empty-trash.`);
  } else {
    console.log("[ok] No empty duplicate root folders are eligible for automatic cleanup.");
  }

  if (report.roots.some((root) => !root.isActive && root.descendantFiles > 0)) {
    console.warn("[warn] One or more duplicate roots contain files. They were kept for manual review.");
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`Report written: ${REPORT_PATH}`);
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(`[error] ${err.message || err}`);
  if (err.code === "invalid_grant") {
    console.error("Run: node scripts/google-drive-oauth-bootstrap.mjs");
  }
  process.exit(1);
});
