// GET /functions/v1/files-content?id=<project_files.id>[&download=1]
// Streams the file from Google Drive through the backend. Supports Range.
// Auth: Supabase Auth JWT. The project is derived from the DB row, never the
// client — so changing ids cannot reach another project's file.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, json, preflight, log } from "../_shared/cors.ts";
import { getAuthedUser, serviceClient, loadProject, isMember } from "../_shared/auth.ts";
import { downloadStream, DriveAuthRevokedError } from "../_shared/drive.ts";

serve(async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const recordId = url.searchParams.get("id");
    const asDownload = url.searchParams.get("download") === "1";
    if (!recordId) return json({ error: "id is required" }, 400);

    const svc = serviceClient();
    const { data: row } = await svc.from("project_files")
      .select("id, project_id, drive_file_id, original_name, mime_type, size_bytes, deleted_at")
      .eq("id", recordId).maybeSingle();
    if (!row || row.deleted_at) return json({ error: "Not found" }, 404);

    const project = await loadProject(svc, Number(row.project_id));
    if (!(await isMember(svc, user, project))) return json({ error: "Forbidden" }, 403);

    // ETag short-circuit (browser cache revalidation).
    const etag = `"pf-${row.id}"`;
    if (req.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: { ...corsHeaders, ETag: etag } });
    }

    const driveRes = await downloadStream(row.drive_file_id, req.headers.get("range"));

    const disposition = `${asDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(row.original_name)}"`;
    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", row.mime_type || driveRes.headers.get("content-type") || "application/octet-stream");
    headers.set("Content-Disposition", disposition);
    headers.set("Cache-Control", "private, max-age=300");
    headers.set("ETag", etag);
    headers.set("Accept-Ranges", "bytes");
    const cr = driveRes.headers.get("content-range"); if (cr) headers.set("Content-Range", cr);
    const cl = driveRes.headers.get("content-length"); if (cl) headers.set("Content-Length", cl);

    return new Response(driveRes.body, { status: driveRes.status === 206 ? 206 : 200, headers });
  } catch (err) {
    if (err instanceof DriveAuthRevokedError) return json({ error: "Storage authorization error." }, 502);
    log("content.error", { err: String(err) });
    return json({ error: "Could not load file." }, 500);
  }
});
