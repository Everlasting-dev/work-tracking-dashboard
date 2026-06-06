import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { bugReportId } = await req.json();
    if (!bugReportId) throw new Error("bugReportId is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const githubRepo = Deno.env.get("GITHUB_REPO") || "Everlasting-dev/work-tracking-dashboard";

    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service credentials are not configured");
    if (!githubToken) throw new Error("GITHUB_TOKEN is not configured");

    const sb = createClient(supabaseUrl, serviceRoleKey);
    const { data: report, error } = await sb
      .from("wt_bug_reports")
      .select("*, wt_users(username, display_name, email)")
      .eq("id", bugReportId)
      .maybeSingle();
    if (error) throw error;
    if (!report) throw new Error("Bug report not found");

    const user = report.wt_users;
    const screenshots = Array.isArray(report.screenshots) ? report.screenshots : [];
    const screenshotSummary = screenshots.length
      ? [
          "",
          "Screenshots attached in WorkTracker:",
          ...screenshots.slice(0, 3).map((img: { name?: string; mimeType?: string }, index: number) =>
            `- ${img?.name || `Screenshot ${index + 1}`}${img?.mimeType ? ` (${img.mimeType})` : ""}`
          ),
        ]
      : [];
    const body = [
      `Reported by: ${user?.display_name || user?.username || "Unknown"} (${user?.email || "no email"})`,
      `Severity: ${report.severity || "normal"}`,
      `App version: ${report.app_version || "unknown"}`,
      ...screenshotSummary,
      "",
      report.description || "No description provided.",
    ].join("\n");

    const gh = await fetch(`https://api.github.com/repos/${githubRepo}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "WorkTracker-BugReporter",
      },
      body: JSON.stringify({
        title: `[Bug] ${report.title || "Untitled report"}`,
        body,
        labels: ["bug", "from-worktracker"],
      }),
    });

    const issue = await gh.json();
    if (!gh.ok) throw new Error(issue?.message || "GitHub issue creation failed");

    await sb
      .from("wt_bug_reports")
      .update({
        status: "sent",
        github_issue_url: issue.html_url || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bugReportId);

    return new Response(JSON.stringify({ ok: true, issueUrl: issue.html_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message || String(error) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
