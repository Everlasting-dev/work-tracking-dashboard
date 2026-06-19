#!/usr/bin/env node
/*
 * One-time Google Drive OAuth bootstrap for Orbitrack's central storage account.
 *
 * Run ONCE, signed in as the dedicated storage Google account:
 *   node scripts/google-drive-oauth-bootstrap.mjs
 *
 * It performs the offline OAuth flow (scope: drive.file), prints the REFRESH
 * TOKEN, and creates the "Orbitrack Storage" root folder (prints its ID).
 * Put the refresh token + folder id into Supabase Edge Function secrets:
 *   supabase secrets set GOOGLE_REFRESH_TOKEN=... GOOGLE_DRIVE_ROOT_FOLDER_ID=...
 *
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env
 * or the environment. No npm dependencies (Node 18+ built-ins only).
 */
import http from "node:http";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

function loadEnv() {
  try {
    for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* .env optional */ }
}
loadEnv();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:53682/oauth2callback";
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

    // Create (or note) the root folder.
    const folderRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Orbitrack Storage", mimeType: "application/vnd.google-apps.folder" }),
    });
    const folder = await folderRes.json();

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
