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

  function enabled() { return cfg().storageProvider === "google_drive"; }

  // The backend needs a real Supabase Auth JWT. Call this during login (after the
  // app's own auth) to establish/refresh the Supabase Auth session under the
  // hood. Email is synthesized from username when the user has none — the login
  // UI is unchanged.
  async function ensureAuthSession({ username, email, password }) {
    const client = sb();
    if (!client?.auth) return null;
    const mail = (email && email.includes("@")) ? email : `${String(username || "user").toLowerCase().replace(/[^a-z0-9._-]/g, "")}@orbitrack.local`;
    // Supabase Auth needs >= 6 char passwords; derive a valid one for short ones.
    const pw = (password && password.length >= 6) ? password : `wtk_${password || ""}_orbitrack`;
    let { data } = await client.auth.getSession();
    if (data?.session?.access_token) {
      const appUid = window.getSession?.()?.userId || window.WT_getActiveSession?.()?.userId;
      if (appUid && data.session.user?.id) {
        const { data: linked } = await client.from("wt_users")
          .select("id")
          .eq("auth_user_id", data.session.user.id)
          .maybeSingle();
        if (Number(linked?.id) === Number(appUid)) return data.session;
        await client.auth.signOut().catch(() => {});
      } else {
        return data.session;
      }
    }
    // Try sign-in; if the account doesn't exist yet, sign up then sign in.
    let res = await client.auth.signInWithPassword({ email: mail, password: pw });
    if (res.error) {
      await client.auth.signUp({ email: mail, password: pw });
      res = await client.auth.signInWithPassword({ email: mail, password: pw });
    }
    if (res.error) return null;
    // Link the auth uuid to the app user row so wt_my_id()/RLS resolve.
    try {
      const uid = window.getSession?.()?.userId;
      if (uid && res.data?.user?.id && window.SupabaseDB?._client) {
        await window.SupabaseDB._client.from("wt_users").update({ auth_user_id: res.data.user.id }).eq("id", uid);
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

  async function token() {
    const client = sb();
    const { data } = await client.auth.getSession();
    const t = data?.session?.access_token;
    if (!t) throw new Error("Not signed in to storage. Please sign out and back in.");
    return t;
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
      authEmail: session?.user?.email || null,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      linkedUserId: null,
    };
    if (!session?.access_token) {
      return { ...detail, ok: false, code: "missing_session", message: "Document storage authorization is missing. Use “Reconnect storage”, or sign out and back in." };
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
        return { ...detail, ok: false, code: "wrong_user", message: "Document storage is signed in as a different user. Sign out and back in to refresh authorization." };
      }
    }

    return {
      ...detail,
      ok: true,
      code: "ok",
      message: "Document storage authorization is valid.",
      userId: session.user?.id || null
    };
  }

  async function responseError(res, fallback) {
    let body = {};
    let text = "";
    try { body = await res.clone().json(); } catch (_) {
      try { text = (await res.text()).trim(); } catch (_) {}
    }
    const detail = body.error || body.message || text || fallback || `Request failed (${res.status})`;
    if (res.status === 401) return new Error("Storage sign-in expired. Please sign out and back in.");
    if (res.status === 403) return new Error("You do not have access to this file.");
    if (res.status === 404) return new Error("File not found in storage. It may need to be re-uploaded or migrated.");
    return new Error(detail);
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
        else reject(new Error(body.error || `Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.send(form);
    });
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
      .select("*").eq("project_id", projectId).is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // One metadata row by id (uuid).
  async function getOne(id) {
    const client = sb();
    const { data } = await client.from("project_files").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    return data || null;
  }

  window.DriveStorage = { enabled, ensureAuthSession, recoverSession, checkAuthStatus, upload, objectUrl, remove, list, getOne };
})();
