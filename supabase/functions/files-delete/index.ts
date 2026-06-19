// POST|DELETE /functions/v1/files-delete?id=<project_files.id>
// Trashes the Drive file and soft-deletes the metadata. Authorization is checked
// against the DB row's project — changing the id cannot delete another project's
// file. Allowed: uploader, project editor/owner, or admin.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight, log } from "../_shared/cors.ts";
import { getAuthedUser, serviceClient, loadProject, canEdit } from "../_shared/auth.ts";
import { trashFile, DriveAuthRevokedError } from "../_shared/drive.ts";

serve(async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== "POST" && req.method !== "DELETE") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const recordId = new URL(req.url).searchParams.get("id");
    if (!recordId) return json({ error: "id is required" }, 400);

    const svc = serviceClient();
    const { data: row } = await svc.from("project_files")
      .select("id, project_id, drive_file_id, uploaded_by, deleted_at").eq("id", recordId).maybeSingle();
    if (!row) return json({ error: "Not found" }, 404);
    if (row.deleted_at) return json({ ok: true, alreadyDeleted: true }, 200);

    const project = await loadProject(svc, Number(row.project_id));
    const allowed = Number(row.uploaded_by) === user.userId || canEdit(user, project);
    if (!allowed) return json({ error: "Forbidden" }, 403);

    // Trash on Drive first; only soft-delete metadata if that succeeded.
    try {
      await trashFile(row.drive_file_id);
    } catch (e) {
      if (e instanceof DriveAuthRevokedError) return json({ error: "Storage authorization error." }, 502);
      log("delete.drive_failed", { fileId: row.id, err: String(e) });
      return json({ error: "Could not remove the file from storage; nothing was deleted." }, 502);
    }

    const { error: updErr } = await svc.from("project_files")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", row.id);
    if (updErr) {
      // Drive file already trashed but metadata not flipped — record for reconciliation.
      log("delete.metadata_failed_after_trash", { fileId: row.id, driveFileId: row.drive_file_id });
      return json({ error: "Partial delete; please retry." }, 500);
    }

    log("delete.ok", { fileId: row.id });
    return json({ ok: true }, 200);
  } catch (err) {
    log("delete.error", { err: String(err) });
    return json({ error: "Delete failed." }, 500);
  }
});
