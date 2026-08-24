/* storage-drive.js — frontend client for the hybrid Google Drive storage.
 *
 * Talks ONLY to the authenticated Supabase Edge Functions (files-upload,
 * files-content, files-delete) — never to Google directly, never holding any
 * Google/secret material. Requires a real Supabase Auth session so the backend
 * can validate the caller (window.DriveStorage.ensureAuthSession()).
 *
 * Activated only when window.WT_CONFIG.storageProvider === 'google_drive', so
 * the existing Supabase Storage path keeps working until you flip the flag
 * after deploying the functions and running the migration.
 */
(function () {
  const cfg = () => (window.WT_CONFIG || {});
  const sb = () => window.SupabaseDB?._client || null;
  const fnBase = () => `${String(cfg().supabaseUrl || "").replace(/\/$/, "")}/functions/v1`;
  const anonKey = () => cfg().supabaseAnonKey || "";
  const FILE_META_COLS = "id,project_id,task_id,uploaded_by,original_name,mime_type,size_bytes,created_at";

  function enabled() { return cfg().storageProvider === "google_drive"; }

  // Stable Drive-storage Auth password for a user id. Independent of the app
  // password so password changes never break Drive. The admin resync sets every
  // Supabase Auth account's password to this exact value — keep the pepper in sync.
  const DRIVE_PEPPER = "Orb1track$Drive$2026$kx9";
  function drivePassword(uid) { return `orbtrk_${Number(uid)}_${DRIVE_PEPPER}`; }
  function legacyPassword(password) { return (password && password.length >= 6) ? password : `wtk_${password || ""}_orbitrack`; }
  function cleanUsername(username) {
    return String(username || "user").toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user";
  }
  function authEmailCandidates(username, email) {
    if (email && String(email).includes("@")) return [String(email).trim().toLowerCase()];
    const clean = cleanUsername(username);
    // @worktracker.app is the legacy Auth identity used by the vanilla app and
    // auth-password-login. Keep @orbitrack.local as a compatibility fallback for
    // builds that briefly generated Orbitrack-branded synthetic emails.
    return [`${clean}@worktracker.app`, `${clean}@orbitrack.local`];
  }
  function activeUserId(userId) {
    return Number(userId || window.getSession?.()?.userId || window.WT_getActiveSession?.()?.userId || 0);
  }
  // A rate-limit or server error says nothing about which identity is correct,
  // so continuing through the candidate matrix just spends more of a budget that
  // is already exhausted — and repeated bursts are what trips Supabase's auth
  // limiter in the first place.
  function isFatalAuthError(error) {
    if (!error) return false;
    const status = Number(error.status || 0);
    if (status === 429 || status >= 500) return true;
    return /rate limit|too many requests/i.test(String(error.message || ''));
  }

  async function signInWithCandidates(client, emails, passwords) {
    let last = null;
    for (const email of emails) {
      for (const password of passwords) {
        if (!email || !password) continue;
        const res = await client.auth.signInWithPassword({ email, password });
        last = { ...res, email, password };
        if (!res.error && res.data?.session) return last;
        if (isFatalAuthError(res.error)) {
          console.warn('[drive-auth] aborting sign-in attempts:', res.error?.message || res.error);
          return last;
        }
      }
    }
    return last;
  }

  // The backend needs a real Supabase Auth JWT. Call this during login (after the
  // app's own auth) to establish/refresh the Supabase Auth session under the
  // hood. Email is synthesized from username when the user has none — the login
  // UI is unchanged.
  async function ensureAuthSession({ username, email, password, userId }) {
    const client = sb();
    if (!client?.auth) return null;
    const emails = authEmailCandidates(username, email);
    // The Drive-storage Auth password is a STABLE per-user value derived from the
    // user's id — INDEPENDENT of the app password. This is the durable fix for the
    // recurring "authorization missing": app password changes (OTP/reset) used to
    // desync the Auth password and lock the user out of Drive forever. Must match
    // the one-time admin resync (drivePassword in the resync script). Falls back to
    // the legacy app-password derivation only if the user id is unknown.
    const uid = activeUserId(userId);
    const stablePw = uid ? drivePassword(uid) : "";
    const passwords = [...new Set([stablePw, legacyPassword(password)].filter(Boolean))];
    let { data } = await client.auth.getSession();
    if (data?.session?.access_token) {
      const appUid = activeUserId(uid);
      if (appUid && data.session.user?.id) {
        const { data: linked } = await client.from("wt_users")
          .select("id")
          .eq("auth_user_id", data.session.user.id)
          .maybeSingle();
        if (Number(linked?.id) === Number(appUid)) {
          if (stablePw) client.auth.updateUser({ password: stablePw }).catch(() => {});
          return data.session;
        }
        await client.auth.signOut().catch(() => {});
      } else {
        return data.session;
      }
    }
    // Try sign-in first. Stable password is preferred; legacy app-password auth
    // remains as a rescue path for accounts that have not been resynced yet.
    let res = await signInWithCandidates(client, emails, passwords);
    if (res?.error && !isFatalAuthError(res.error)) {
      const { error: signUpError } = await client.auth.signUp({ email: emails[0], password: passwords[0] });
      // Only the identity that was just provisioned can newly succeed, so retry
      // that one pair instead of replaying the whole candidate matrix.
      if (!isFatalAuthError(signUpError)) {
        res = await signInWithCandidates(client, [emails[0]], [passwords[0]]);
      }
    }
    if (!res || res.error) return null;
    if (stablePw && res.password !== stablePw) {
      await client.auth.updateUser({ password: stablePw }).catch(() => {});
    }
    // Link the auth uuid to the app user row so wt_my_id()/RLS resolve.
    try {
      const appUid = activeUserId(uid);
      if (appUid && res.data?.user?.id && window.SupabaseDB?._client) {
        await window.SupabaseDB._client.from("wt_users").update({ auth_user_id: res.data.user.id }).eq("id", appUid);
      }
    } catch (_) {}
    return res.data?.session || null;
  }

  // Silently restore a lapsed session on app start using the persisted refresh
  // token, so users aren't told to "sign out and back in" after a relaunch.
  // Returns true if a valid session is available afterwards.
  async function recoverSession() {
    if (!enabled()) return false;
    const client = sb();
    if (!client?.auth) return false;
    try {
      const { data } = await client.auth.getSession();
      if (data?.session?.access_token) return true;
    } catch (_) {}
    try {
      const { data } = await client.auth.refreshSession();
      if (data?.session?.access_token) return true;
    } catch (_) {}
    return false;
  }

  async function resetSession() {
    const client = sb();
    if (!client?.auth) return false;
    try { await client.auth.signOut({ scope: "local" }); }
    catch (_) { try { await client.auth.signOut(); } catch (_) {} }
    return true;
  }

  async function token() {
    const client = sb();
    const { data } = await client.auth.getSession();
    const t = data?.session?.access_token;
    if (!t) throw new Error('Not signed in to storage. Use "Reconnect storage" in Settings > Diagnostics.');
    return t;
  }

  async function checkCentralDriveHealth(jwt) {
    const res = await fetch(`${fnBase()}/files-content?health=1`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey() },
    });
    const { body, text } = await readResponseBody(res);
    if (!res.ok) {
      const oldFunction = res.status === 400 && String(body.error || text || "").toLowerCase().includes("id is required");
      return {
        ok: false,
        code: oldFunction ? "health_check_unavailable" : (body.code || `backend_${res.status}`),
        backendStatus: res.status,
        backendError: body.error || body.message || text || "",
        message: oldFunction
          ? "Document storage sign-in is valid, but this build cannot verify the central Google Drive account until the files-content Edge Function is redeployed."
          : storageErrorMessage(res.status, body, `Could not verify central Google Drive storage (${res.status})`, text)
      };
    }
    return {
      ok: true,
      code: body.code || "ok",
      centralStorageOk: true,
      backendStatus: res.status,
      rootFolderId: body.rootFolderId || null,
      rootFolderName: body.rootFolderName || null
    };
  }

  async function checkAuthStatus() {
    const base = { provider: cfg().storageProvider || "default", functionsBase: fnBase() };
    if (!enabled()) {
      return { ...base, ok: true, code: "disabled", message: "Document storage is not using the Drive bridge in this build." };
    }
    const client = sb();
    if (!client?.auth) {
      return { ...base, ok: false, code: "missing_client", message: "Document storage client is not ready." };
    }

    const appUid = window.WT_getActiveSession?.()?.userId || window.getSession?.()?.userId || null;
    const { data, error } = await client.auth.getSession();
    if (error) {
      return { ...base, ok: false, code: "session_error", message: error.message || "Could not read document storage authorization.", hasSession: false, appUserId: appUid };
    }
    const session = data?.session;
    const detail = {
      ...base,
      appUserId: appUid,
      hasSession: !!session?.access_token,
      authUserId: session?.user?.id || null,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      linkedUserId: null,
    };
    if (!session?.access_token) {
      return { ...detail, ok: false, code: "missing_session", message: 'Document storage authorization is missing. Use "Reconnect storage" to restore file access on this device.' };
    }

    if (appUid && session.user?.id && client.from) {
      const { data: linked, error: linkError } = await client.from("wt_users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();
      if (linkError) {
        return { ...detail, ok: false, code: "link_check_failed", message: linkError.message || "Could not verify document storage account link." };
      }
      detail.linkedUserId = linked?.id != null ? Number(linked.id) : null;
      if (Number(linked?.id) !== Number(appUid)) {
        return { ...detail, ok: false, code: "wrong_user", message: 'Document storage is linked to a different local session. Use "Reconnect storage" to refresh authorization.' };
      }
    }

    const central = await checkCentralDriveHealth(session.access_token);
    if (!central.ok) {
      return {
        ...detail,
        ...central,
        ok: false,
        centralStorageOk: false,
      };
    }

    return {
      ...detail,
      ...central,
      ok: true,
      code: "ok",
      message: "Document storage authorization is valid.",
      userId: session.user?.id || null
    };
  }

  function storageErrorMessage(status, body = {}, fallback = "", text = "") {
    const detail = body.error || body.message || text || fallback || `Request failed (${status})`;
    if (body.code === "drive_auth_revoked") {
      return "Document storage authorization has expired. Reconnect the central Google Drive storage account.";
    }
    if (status === 401) return 'Storage sign-in expired. Use "Reconnect storage" in Settings > Diagnostics.';
    if (status === 403) return "You do not have access to this file.";
    if (status === 404) return "File not found in storage. It may need to be re-uploaded or migrated.";
    return detail;
  }

  async function readResponseBody(res) {
    let body = {};
    let text = "";
    try { body = await res.clone().json(); } catch (_) {
      try { text = (await res.text()).trim(); } catch (_) {}
    }
    return { body, text };
  }

  async function responseError(res, fallback) {
    const { body, text } = await readResponseBody(res);
    return new Error(storageErrorMessage(res.status, body, fallback, text));
  }

  // Upload with progress via XHR. Returns the project_files metadata row.
  async function upload(projectId, { file, taskId = null, description = "" }, onProgress) {
    const jwt = await token();
    const form = new FormData();
    form.append("projectId", String(projectId));
    if (taskId) form.append("taskId", String(taskId));
    if (description) form.append("description", description);
    form.append("file", file, file.name);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${fnBase()}/files-upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);
      xhr.setRequestHeader("apikey", anonKey());
      if (onProgress) xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
      xhr.onload = () => {
        let body = {}; try { body = JSON.parse(xhr.responseText); } catch (_) {}
        if (xhr.status >= 200 && xhr.status < 300) resolve(body.file);
        else reject(new Error(storageErrorMessage(xhr.status, body, `Upload failed (${xhr.status})`, xhr.responseText || "")));
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.send(form);
    });
  }

  // Upload a profile picture to the central Drive "avatars" folder. Returns the
  // Drive file id — store on wt_users.avatar_drive_id and render it via the public
  // thumbnail URL. Requires the Drive auth session like every other call here.
  async function uploadAvatar(file) {
    const jwt = await token();
    const form = new FormData();
    form.append("file", file, file.name || "avatar.png");
    const res = await fetch(`${fnBase()}/avatar-upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey() },
      body: form,
    });
    let body = {}; try { body = await res.json(); } catch (_) {}
    if (!res.ok) throw new Error(storageErrorMessage(res.status, body, `Avatar upload failed (${res.status})`, ""));
    return body.driveFileId;
  }

  // Fetch file content through the backend and return an object URL (caller must
  // URL.revokeObjectURL when done). `download` toggles inline vs attachment.
  async function objectUrl(fileRecordId, { download = false, thumb = false, size } = {}) {
    const jwt = await token();
    const params = new URLSearchParams({ id: fileRecordId });
    if (download) params.set("download", "1");
    if (thumb) { params.set("thumb", "1"); if (size) params.set("sz", String(size)); }
    const res = await fetch(`${fnBase()}/files-content?${params.toString()}`, {
      headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey() },
    });
    if (!res.ok) throw await responseError(res, `Could not load file (${res.status})`);
    return URL.createObjectURL(await res.blob());
  }

  async function remove(fileRecordId) {
    const jwt = await token();
    const res = await fetch(`${fnBase()}/files-delete?id=${encodeURIComponent(fileRecordId)}`, {
      method: "POST", headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey() },
    });
    let body = {}; try { body = await res.json(); } catch (_) {}
    if (!res.ok) throw await responseError(res, body.error || `Delete failed (${res.status})`);
    return body;
  }

  // List metadata for a project (RLS-protected; needs the auth session).
  async function list(projectId) {
    const client = sb();
    const { data, error } = await client.from("project_files")
      .select(FILE_META_COLS).eq("project_id", projectId).is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // One metadata row by id (uuid).
  async function getOne(id) {
    const client = sb();
    const { data } = await client.from("project_files").select(FILE_META_COLS).eq("id", id).is("deleted_at", null).maybeSingle();
    return data || null;
  }

  window.DriveStorage = { enabled, ensureAuthSession, recoverSession, resetSession, checkAuthStatus, upload, uploadAvatar, objectUrl, remove, list, getOne };
})();
