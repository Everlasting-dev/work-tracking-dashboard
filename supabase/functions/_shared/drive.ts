// Google Drive service (scope: drive.file). Raw REST so it runs in Deno without
// the heavy googleapis SDK. Holds NO secrets in code — everything via env:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN,
//   GOOGLE_DRIVE_ROOT_FOLDER_ID
// The refresh token belongs to ONE central Orbitrack storage account.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const FOLDER_MIME = "application/vnd.google-apps.folder";
const RESUMABLE_THRESHOLD = 5 * 1024 * 1024; // 5 MB → resumable
const RESUMABLE_CHUNK = 8 * 1024 * 1024; // 8 MB chunks

export class DriveAuthRevokedError extends Error {}

// ── Access-token cache (refresh-token → short-lived access token) ───────────
let _token = "";
let _exp = 0;

async function accessToken(): Promise<string> {
  const now = Date.now();
  if (_token && now < _exp - 60_000) return _token;
  const body = new URLSearchParams({
    client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
    client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
    refresh_token: Deno.env.get("GOOGLE_REFRESH_TOKEN")!,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    if (data?.error === "invalid_grant") {
      throw new DriveAuthRevokedError(
        "Google authorization was revoked or expired; re-run the OAuth bootstrap.",
      );
    }
    throw new Error(`Token refresh failed: ${data?.error || res.status}`);
  }
  _token = data.access_token;
  _exp = now + Number(data.expires_in || 3600) * 1000;
  return _token;
}

// ── Bounded exponential backoff for transient (429/5xx/network) errors ──────
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  max = 4,
): Promise<T> {
  let attempt = 0;
  // deno-lint-ignore no-explicit-any
  let lastErr: any;
  while (attempt <= max) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (err instanceof DriveAuthRevokedError) throw err;
      const status = (err && (err as { status?: number }).status) || 0;
      const retriable =
        status === 0 || status === 429 || (status >= 500 && status < 600);
      if (!retriable || attempt === max) break;
      const delay =
        Math.min(8000, 250 * 2 ** attempt) + Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, delay));
      attempt++;
    }
  }
  throw new Error(
    `${label} failed after ${attempt + 1} attempts: ${lastErr?.message || lastErr}`,
  );
}

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  return withRetry(
    async () => {
      const token = await accessToken();
      const res = await fetch(
        path.startsWith("http") ? path : `${DRIVE}${path}`,
        {
          ...init,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(init.headers || {}),
          },
        },
      );
      if (!res.ok && res.status !== 206) {
        const text = await res.text().catch(() => "");
        const e = new Error(
          `Drive ${res.status}: ${text.slice(0, 200)}`,
        ) as Error & { status: number };
        e.status = res.status;
        throw e;
      }
      return res;
    },
    `drive ${init.method || "GET"} ${path.split("?")[0]}`,
  );
}

// ── Folders ─────────────────────────────────────────────────────────────────
export async function findFolderId(
  name: string,
  parentId: string,
): Promise<string | null> {
  const q = `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`;
  const res = await api(
    `/files?q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`,
  );
  const j = await res.json();
  return j.files?.[0]?.id || null;
}

// Share a file with "anyone with the link" (reader) so its public thumbnail URL
// (drive.google.com/thumbnail?id=...) works in an <img>. Used for avatars only.
export async function makePublic(fileId: string): Promise<void> {
  await api(`/files/${encodeURIComponent(fileId)}/permissions?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
}

export async function createFolder(
  name: string,
  parentId: string,
): Promise<string> {
  const res = await api(`/files?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  });
  return (await res.json()).id;
}

export function rootFolderId(): string {
  const id = Deno.env.get("GOOGLE_DRIVE_ROOT_FOLDER_ID");
  if (!id) throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured.");
  return id;
}

export async function storageHealth(): Promise<{
  rootFolderId: string;
  rootFolderName: string;
}> {
  const rootId = rootFolderId();
  const res = await api(
    `/files/${encodeURIComponent(rootId)}?fields=id,name,mimeType,trashed`,
  );
  const data = await res.json();
  if (!data?.id || data.trashed) {
    throw new Error("Google Drive root folder is unavailable.");
  }
  return {
    rootFolderId: data.id,
    rootFolderName: data.name || "",
  };
}

// Build the project folder tree under the root. Returns the folder IDs to be
// stored in project_storage_folders. Caller persists them (we never re-derive
// folders from names — IDs are the source of truth).
export async function createProjectFolders(projectId: number) {
  const project = await createFolder(`project_${projectId}`, rootFolderId());
  const [images, documents, videos, other] = await Promise.all([
    createFolder("images", project),
    createFolder("documents", project),
    createFolder("videos", project),
    createFolder("other", project),
  ]);
  return {
    drive_project_folder_id: project,
    drive_images_folder_id: images,
    drive_documents_folder_id: documents,
    drive_videos_folder_id: videos,
    drive_other_folder_id: other,
  };
}

// ── Upload (simple for small files, resumable for large) ────────────────────
export async function uploadFile(opts: {
  name: string;
  mimeType: string;
  parentId: string;
  data: Uint8Array;
}): Promise<{ id: string; size: number }> {
  if (opts.data.byteLength <= RESUMABLE_THRESHOLD) return simpleUpload(opts);
  return resumableUpload(opts);
}

async function simpleUpload(opts: {
  name: string;
  mimeType: string;
  parentId: string;
  data: Uint8Array;
}) {
  const boundary = `orbi${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const meta = JSON.stringify({ name: opts.name, parents: [opts.parentId] });
  const enc = new TextEncoder();
  const head = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
      `--${boundary}\r\nContent-Type: ${opts.mimeType}\r\n\r\n`,
  );
  const tail = enc.encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(head.length + opts.data.length + tail.length);
  body.set(head, 0);
  body.set(opts.data, head.length);
  body.set(tail, head.length + opts.data.length);
  const res = await api(`${UPLOAD}/files?uploadType=multipart&fields=id,size`, {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  const j = await res.json();
  return { id: j.id, size: Number(j.size || opts.data.byteLength) };
}

async function resumableUpload(opts: {
  name: string;
  mimeType: string;
  parentId: string;
  data: Uint8Array;
}) {
  // 1) Open a resumable session.
  const start = await api(
    `${UPLOAD}/files?uploadType=resumable&fields=id,size`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": opts.mimeType,
        "X-Upload-Content-Length": String(opts.data.byteLength),
      },
      body: JSON.stringify({ name: opts.name, parents: [opts.parentId] }),
    },
  );
  const session = start.headers.get("Location");
  if (!session) throw new Error("Resumable session URI missing.");
  // 2) PUT chunks (each chunk retried independently).
  const total = opts.data.byteLength;
  let offset = 0;
  while (offset < total) {
    const end = Math.min(offset + RESUMABLE_CHUNK, total);
    const chunk = opts.data.subarray(offset, end);
    const res = await withRetry(async () => {
      const token = await accessToken();
      const r = await fetch(session, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Length": String(chunk.byteLength),
          "Content-Range": `bytes ${offset}-${end - 1}/${total}`,
        },
        body: chunk,
      });
      if (r.status !== 200 && r.status !== 201 && r.status !== 308) {
        const e = new Error(`Resumable PUT ${r.status}`) as Error & {
          status: number;
        };
        e.status = r.status;
        throw e;
      }
      return r;
    }, "resumable chunk");
    if (res.status === 200 || res.status === 201) {
      const j = await res.json();
      return { id: j.id, size: Number(j.size || total) };
    }
    offset = end;
  }
  throw new Error("Resumable upload did not complete.");
}

// ── Download / stream (forwards Range for video seeking) ────────────────────
export async function downloadStream(
  fileId: string,
  range?: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (range) headers["Range"] = range;
  return api(
    `/files/${encodeURIComponent(fileId)}?alt=media&acknowledgeAbuse=false`,
    { headers },
  );
}

// Low-res preview from Drive's auto-generated thumbnail (images/PDFs/videos).
// Returns a fetched image Response, or null if the file has no thumbnail (caller
// then falls back to streaming the full file). `size` = max edge in px.
export async function thumbnailResponse(
  fileId: string,
  size = 1024,
): Promise<Response | null> {
  let link = "";
  try {
    const meta = await api(
      `/files/${encodeURIComponent(fileId)}?fields=thumbnailLink`,
    );
    link = (await meta.json()).thumbnailLink || "";
  } catch (_) {
    return null;
  }
  if (!link) return null;
  // thumbnailLink ends with "=sNNN" (and maybe "-c"); request a larger size.
  const sized = /=s\d+/.test(link)
    ? link.replace(/=s\d+(-[a-z]+)?/, `=s${size}`)
    : `${link}=s${size}`;
  // These are short-lived pre-signed Google URLs — usually no auth needed; try
  // plain first, then with the access token as a fallback.
  try {
    let r = await fetch(sized);
    if (!r.ok) {
      const token = await accessToken();
      r = await fetch(sized, { headers: { Authorization: `Bearer ${token}` } });
    }
    return r.ok ? r : null;
  } catch (_) {
    return null;
  }
}

export async function getMeta(
  fileId: string,
): Promise<{ id: string; name: string; size: number; mimeType: string }> {
  const res = await api(
    `/files/${encodeURIComponent(fileId)}?fields=id,name,size,mimeType,md5Checksum`,
  );
  const j = await res.json();
  return {
    id: j.id,
    name: j.name,
    size: Number(j.size || 0),
    mimeType: j.mimeType,
  };
}

export async function trashFile(fileId: string): Promise<void> {
  await api(`/files/${encodeURIComponent(fileId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trashed: true }),
  });
}

export async function deleteForever(fileId: string): Promise<void> {
  await api(`/files/${encodeURIComponent(fileId)}`, { method: "DELETE" });
}

export async function renameFile(fileId: string, name: string): Promise<void> {
  await api(`/files/${encodeURIComponent(fileId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function moveFile(
  fileId: string,
  addParent: string,
  removeParent: string,
): Promise<void> {
  await api(
    `/files/${encodeURIComponent(fileId)}?addParents=${addParent}&removeParents=${removeParent}`,
    { method: "PATCH" },
  );
}
