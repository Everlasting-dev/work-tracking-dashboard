// POST /functions/v1/avatar-upload   (multipart/form-data)
//   fields: file (required, image)
// Auth: Supabase Auth JWT. Uploads the caller's profile picture to a shared
// "avatars" folder on the central Drive account, makes it link-public, and
// returns { driveFileId }. The client stores that on wt_users.avatar_drive_id
// and renders it via https://drive.google.com/thumbnail?id=<id>. No project scope.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight, log } from "../_shared/cors.ts";
import { getAuthedUser } from "../_shared/auth.ts";
import { rootFolderId, findFolderId, createFolder, uploadFile, makePublic, DriveAuthRevokedError } from "../_shared/drive.ts";

serve(async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: "file is required" }, 400);
    const mime = file.type || "application/octet-stream";
    if (!mime.startsWith("image/")) return json({ error: "Avatar must be an image." }, 422);
    if (file.size > 3 * 1024 * 1024) return json({ error: "Avatar too large (max 3 MB)." }, 422);

    const root = rootFolderId();
    const folderId = (await findFolderId("avatars", root)) || (await createFolder("avatars", root));

    const ext = (mime.split("/")[1] || "img").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "img";
    const storedName = `avatar_${user.userId}_${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const uploaded = await uploadFile({ name: storedName, mimeType: mime, parentId: folderId, data: bytes });
    await makePublic(uploaded.id);

    log("avatar.ok", { userId: user.userId, driveFileId: uploaded.id, size: uploaded.size });
    return json({ driveFileId: uploaded.id }, 201);
  } catch (err) {
    if (err instanceof DriveAuthRevokedError) {
      return json({ code: "drive_auth_revoked", error: "Storage authorization error. Reconnect the Google Drive storage account." }, 502);
    }
    log("avatar.error", { err: String(err) });
    return json({ error: "Avatar upload failed." }, 500);
  }
});
