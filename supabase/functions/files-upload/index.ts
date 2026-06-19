// POST /functions/v1/files-upload   (multipart/form-data)
//   fields: projectId (required), taskId?, description?, file (required)
// Auth: Supabase Auth JWT (Authorization: Bearer <token>).
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, json, preflight, log } from "../_shared/cors.ts";
import { getAuthedUser, serviceClient, loadProject, isMember, canEdit } from "../_shared/auth.ts";
import { validateUpload, sanitizeName, categoryForMime } from "../_shared/validation.ts";
import { createProjectFolders, uploadFile, trashFile, DriveAuthRevokedError } from "../_shared/drive.ts";

const CATEGORY_COLUMN: Record<string, string> = {
  images: "drive_images_folder_id",
  documents: "drive_documents_folder_id",
  videos: "drive_videos_folder_id",
  other: "drive_other_folder_id",
};

serve(async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const form = await req.formData();
    const projectId = Number(form.get("projectId"));
    const taskIdRaw = form.get("taskId");
    const taskId = taskIdRaw ? Number(taskIdRaw) : null;
    const description = (form.get("description") as string) || null;
    const file = form.get("file");
    if (!projectId || !(file instanceof File)) return json({ error: "projectId and file are required" }, 400);

    // Authorize against the DB project (never trust client-sent ids).
    const svc = serviceClient();
    const project = await loadProject(svc, projectId);
    if (!project || !(await isMember(svc, user, project))) return json({ error: "Forbidden" }, 403);
    if (!canEdit(user, project)) return json({ error: "You do not have upload permission for this project." }, 403);

    const original = file.name;
    const mime = file.type || "application/octet-stream";
    const size = file.size;
    const bad = validateUpload({ name: original, mime, size });
    if (bad) return json({ error: bad }, 422);

    // Retry/double-submit guard: return an existing identical recent row instead
    // of creating a duplicate (no schema change needed).
    const since = new Date(Date.now() - 2 * 60_000).toISOString();
    const { data: dup } = await svc.from("project_files").select("*")
      .eq("project_id", projectId).eq("uploaded_by", user.userId)
      .eq("original_name", original).eq("size_bytes", size)
      .is("deleted_at", null).gte("created_at", since).limit(1).maybeSingle();
    if (dup) { log("upload.dedup", { projectId, userId: user.userId }); return json({ file: dup }, 200); }

    // Ensure the project's Drive folders exist (IDs stored in Supabase).
    let folders = (await svc.from("project_storage_folders").select("*").eq("project_id", projectId).maybeSingle()).data;
    if (!folders?.drive_project_folder_id) {
      const created = await createProjectFolders(projectId);
      folders = (await svc.from("project_storage_folders")
        .upsert({ project_id: projectId, ...created, updated_at: new Date().toISOString() }, { onConflict: "project_id" })
        .select("*").single()).data;
    }

    const category = categoryForMime(mime);
    const folderId = folders[CATEGORY_COLUMN[category]] || folders.drive_other_folder_id;
    const storedName = `${Date.now()}_${sanitizeName(original)}`;

    // Upload bytes to Drive.
    const bytes = new Uint8Array(await file.arrayBuffer());
    const uploaded = await uploadFile({ name: storedName, mimeType: mime, parentId: folderId, data: bytes });

    // Persist metadata. If this fails, clean up the orphaned Drive file.
    const { data: row, error: insErr } = await svc.from("project_files").insert({
      project_id: projectId, task_id: taskId, uploaded_by: user.userId,
      provider: "google_drive", drive_file_id: uploaded.id, drive_folder_id: folderId,
      original_name: original, stored_name: storedName, mime_type: mime,
      size_bytes: uploaded.size, file_category: category, description,
    }).select("*").single();

    if (insErr || !row) {
      try { await trashFile(uploaded.id); log("upload.cleanup_orphan", { driveFileId: uploaded.id }); }
      catch (e) { log("upload.orphan_cleanup_failed", { driveFileId: uploaded.id, err: String(e) }); }
      return json({ error: "Failed to save file metadata; upload rolled back." }, 500);
    }

    log("upload.ok", { projectId, fileId: row.id, category, size: uploaded.size });
    return json({ file: row }, 201);
  } catch (err) {
    if (err instanceof DriveAuthRevokedError) return json({ error: "Storage authorization error. Contact an administrator." }, 502);
    log("upload.error", { err: String(err) });
    return json({ error: "Upload failed." }, 500);
  }
});
