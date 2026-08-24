#!/usr/bin/env node
/*
 * One-time Google Drive OAuth bootstrap for Orbitrack's central storage account.
 *
 * Run ONCE, signed in as the dedicated storage Google account:
 *   node scripts/google-drive-oauth-bootstrap.mjs
 *   node scripts/google-drive-oauth-bootstrap.mjs --write-env
 *
 * It performs the offline OAuth flow (scope: drive.file), prints the REFRESH
 * TOKEN, and reuses or creates the "Orbitrack Storage" root folder (prints its ID).
 * With --write-env, it also updates .env with the returned token and folder id.
 * Put the refresh token + folder id into Supabase Edge Function secrets:
 *   supabase secrets set GOOGLE_REFRESH_TOKEN=... GOOGLE_DRIVE_ROOT_FOLDER_ID=...
 *
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env
 * or the environment. No npm dependencies (Node 18+ built-ins only).
 */
import http from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";

const ENV_PATH = new URL("../.env", import.meta.url);
const WRITE_ENV = process.argv.includes("--write-env");

function loadEnv() {
  try {
    for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* .env optional */ }
}
loadEnv();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:53682/oauth2callback";
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "";
const ROOT_FOLDER_NAME = process.env.GOOGLE_DRIVE_ROOT_FOLDER_NAME || "Orbitrack Storage";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (in .env or env) first.");
  process.exit(1);
}

const redirect = new URL(REDIRECT_URI);
const port = Number(redirect.port || 53682);

function openBrowser(url) {
  // NOTE: never hand the URL to `cmd start` — Windows splits it at the first `&`,
  // dropping response_type/scope. rundll32 passes the URL through verbatim.
  try {
    if (process.platform === "win32") {
      spawn("rundll32", ["url.dll,FileProtocolHandler", url], { stdio: "ignore", detached: true }).unref();
    } else {
      spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { stdio: "ignore", detached: true }).unref();
    }
  } catch { /* user can copy the printed URL instead */ }
}

async function postJSON(url, form) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}

function updateEnvFile(updates) {
  let text = "";
  try {
    text = readFileSync(ENV_PATH, "utf8");
  } catch {
    text = "";
  }

  const lines = text ? text.split(/\r?\n/) : [];
  const pending = new Map(Object.entries(updates));
  const next = lines.map((line) => {
    const m = line.match(/^(\s*)([A-Z0-9_]+)(\s*=\s*)(.*)$/);
    if (!m || !pending.has(m[2])) return line;
    const value = pending.get(m[2]);
    pending.delete(m[2]);
    return `${m[1]}${m[2]}${m[3]}${value}`;
  });

  if (pending.size && next.length && next[next.length - 1].trim()) {
    next.push("");
  }
  for (const [key, value] of pending) {
    next.push(`${key}=${value}`);
  }

  writeFileSync(ENV_PATH, `${next.join("\n").replace(/\n+$/, "")}\n`);
}

function driveQueryString(value) {
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
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

async function getDriveFolder(accessToken, folderId) {
  if (!folderId) return null;
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}?fields=id,name,mimeType,trashed,createdTime`;
  try {
    const folder = await driveJson(accessToken, url);
    if (folder.mimeType !== "application/vnd.google-apps.folder" || folder.trashed) return null;
    return folder;
  } catch {
    return null;
  }
}

async function findRootFolders(accessToken) {
  const folders = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      q: `name = ${driveQueryString(ROOT_FOLDER_NAME)} and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "nextPageToken,files(id,name,createdTime)",
      orderBy: "createdTime",
      pageSize: "100",
      spaces: "drive",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await driveJson(accessToken, `https://www.googleapis.com/drive/v3/files?${params}`);
    folders.push(...(data.files || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return folders;
}

async function ensureRootFolder(accessToken) {
  const configured = await getDriveFolder(accessToken, ROOT_FOLDER_ID);
  if (configured) {
    console.log(`[ok] Reusing root folder from GOOGLE_DRIVE_ROOT_FOLDER_ID: ${configured.name} (${configured.id})`);
    return configured;
  }
  if (ROOT_FOLDER_ID) {
    console.warn("[warn] GOOGLE_DRIVE_ROOT_FOLDER_ID is set, but that folder was not reachable. Searching by name instead.");
  }

  const existing = await findRootFolders(accessToken);
  if (existing.length) {
    const folder = existing[0];
    if (existing.length > 1) {
      console.warn(`[warn] Found ${existing.length} folders named "${ROOT_FOLDER_NAME}". Reusing the oldest one: ${folder.id}`);
      console.warn("[warn] Run scripts/drive-storage-root-cleanup.mjs after this to audit safe cleanup candidates.");
    } else {
      console.log(`[ok] Reusing existing root folder: ${folder.name} (${folder.id})`);
    }
    return folder;
  }

  console.log(`[info] Creating new root folder: ${ROOT_FOLDER_NAME}`);
  return driveJson(accessToken, "https://www.googleapis.com/drive/v3/files?fields=id,name,createdTime", {
    method: "POST",
    body: JSON.stringify({ name: ROOT_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
  });
}

const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
  client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: "code",
  scope: SCOPE, access_type: "offline", prompt: "consent", include_granted_scopes: "true",
});

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${port}`);
  if (u.pathname !== redirect.pathname) { res.writeHead(404).end(); return; }
  const code = u.searchParams.get("code");
  if (!code) { res.writeHead(400).end("Missing code"); return; }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h2>Orbitrack storage connected.</h2><p>You can close this tab and return to the terminal.</p>");

  try {
    const tok = await postJSON("https://oauth2.googleapis.com/token", {
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI, grant_type: "authorization_code",
    });
    if (!tok.ok || !tok.data.refresh_token) {
      console.error("\nToken exchange failed:", tok.data);
      console.error("Tip: revoke prior access at https://myaccount.google.com/permissions then retry (prompt=consent forces a refresh token).");
      process.exit(1);
    }
    const accessToken = tok.data.access_token;

    const folder = await ensureRootFolder(accessToken);
    if (!folder.id) {
      throw new Error(`Could not resolve a ${ROOT_FOLDER_NAME} folder id.`);
    }
    if (WRITE_ENV) {
      updateEnvFile({
        GOOGLE_REFRESH_TOKEN: tok.data.refresh_token,
        GOOGLE_DRIVE_ROOT_FOLDER_ID: folder.id,
      });
      console.log("[ok] Updated .env with GOOGLE_REFRESH_TOKEN and GOOGLE_DRIVE_ROOT_FOLDER_ID.");
    }

    console.log("\n──────────────────────────────────────────────");
    console.log("GOOGLE_REFRESH_TOKEN=", tok.data.refresh_token);
    console.log("GOOGLE_DRIVE_ROOT_FOLDER_ID=", folder.id || "(folder create failed — create 'Orbitrack Storage' manually)");
    console.log("──────────────────────────────────────────────");
    console.log("\nSet them as Edge Function secrets:");
    console.log(`  supabase secrets set GOOGLE_REFRESH_TOKEN=${tok.data.refresh_token} GOOGLE_DRIVE_ROOT_FOLDER_ID=${folder.id || ""}`);
    console.log("\nDo NOT commit these values.");
  } catch (e) {
    console.error("Bootstrap error:", e);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(port, () => {
  console.log(`Listening on ${REDIRECT_URI}`);
  console.log("Opening Google consent screen (sign in as the dedicated storage account)...");
  console.log("If it doesn't open, visit:\n", authUrl, "\n");
  openBrowser(authUrl);
});
