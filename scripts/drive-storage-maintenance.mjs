#!/usr/bin/env node
/*
 * Drive storage maintenance helper.
 *
 * Default:
 *   node scripts/drive-storage-maintenance.mjs
 *
 * Optional repair after running google-drive-oauth-bootstrap.mjs and updating .env:
 *   node scripts/drive-storage-maintenance.mjs --set-secrets --deploy
 *
 * This script does not perform interactive OAuth. If Google returns invalid_grant,
 * run scripts/google-drive-oauth-bootstrap.mjs to generate a new refresh token.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FUNCTIONS = ["files-content", "files-upload", "files-delete", "avatar-upload"];

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

function projectRefFromConfig() {
  const configPath = resolve(ROOT, "config.js");
  if (!existsSync(configPath)) return "";
  const text = readFileSync(configPath, "utf8");
  const m = text.match(/supabaseUrl:\s*['"]https:\/\/([a-z0-9-]+)\.supabase\.co['"]/i);
  return m?.[1] || "";
}

function projectRefFromLink() {
  const linkPath = resolve(ROOT, "supabase", ".temp", "project-ref");
  if (!existsSync(linkPath)) return "";
  return readFileSync(linkPath, "utf8").trim();
}

function projectRef() {
  return argValue("--project-ref") || process.env.SUPABASE_PROJECT_REF || projectRefFromConfig() || projectRefFromLink();
}

async function postForm(url, form) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { ok: res.ok, status: res.status, data };
}

async function googleAccessToken() {
  const clientId = required("GOOGLE_CLIENT_ID");
  const clientSecret = required("GOOGLE_CLIENT_SECRET");
  const refreshToken = required("GOOGLE_REFRESH_TOKEN");
  const response = await postForm("https://oauth2.googleapis.com/token", {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
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

async function checkDriveRoot(accessToken) {
  const rootFolderId = required("GOOGLE_DRIVE_ROOT_FOLDER_ID");
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(rootFolderId)}?fields=id,name,mimeType,trashed`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.id || data.trashed) {
    throw new Error(`Drive root folder check failed (${res.status}): ${data?.error?.message || data?.error || "unavailable"}`);
  }
  return data;
}

function runSupabase(args) {
  const candidates = process.platform === "win32" ? ["supabase.cmd", "supabase"] : ["supabase"];
  let last;
  for (const cmd of candidates) {
    const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: false });
    if (!res.error) {
      if (res.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed with exit ${res.status}`);
      return;
    }
    last = res.error;
  }
  throw last || new Error("Could not run Supabase CLI.");
}

function warnProjectMismatch(ref) {
  const linked = projectRefFromLink();
  if (linked && ref && linked !== ref) {
    console.warn(`[warn] Local supabase link is ${linked}, but runtime config points to ${ref}. Using ${ref}.`);
  }
}

async function main() {
  loadEnv();

  const ref = projectRef();
  if (!ref && (hasFlag("--set-secrets") || hasFlag("--deploy"))) {
    throw new Error("Could not determine Supabase project ref. Pass --project-ref <ref>.");
  }
  warnProjectMismatch(ref);

  const accessToken = await googleAccessToken();
  const folder = await checkDriveRoot(accessToken);
  console.log(`[ok] Google refresh token works. Root folder: ${folder.name || folder.id}`);

  if (hasFlag("--set-secrets")) {
    runSupabase([
      "secrets",
      "set",
      "--project-ref",
      ref,
      `GOOGLE_REFRESH_TOKEN=${required("GOOGLE_REFRESH_TOKEN")}`,
      `GOOGLE_DRIVE_ROOT_FOLDER_ID=${required("GOOGLE_DRIVE_ROOT_FOLDER_ID")}`,
    ]);
    console.log("[ok] Supabase Drive secrets updated.");
  }

  if (hasFlag("--deploy")) {
    for (const fn of FUNCTIONS) {
      runSupabase(["functions", "deploy", fn, "--project-ref", ref]);
    }
    console.log("[ok] Drive storage functions deployed.");
  }
}

main().catch((err) => {
  console.error(`[error] ${err.message || err}`);
  if (err.code === "invalid_grant") {
    console.error("Run: node scripts/google-drive-oauth-bootstrap.mjs");
  }
  process.exit(1);
});
