// Shared CORS + JSON helpers + a structured logger that NEVER logs secrets.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Expose-Headers": "content-range, accept-ranges, content-length, etag",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });
}

export function preflight(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return null;
}

// Redact obviously sensitive keys before logging. Never pass tokens/cookies/file
// bytes into `meta`.
const SENSITIVE = /token|secret|authorization|cookie|apikey|refresh|password|key/i;
export function log(event: string, meta: Record<string, unknown> = {}) {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE.test(k)) continue;
    if (typeof v === "string" && v.length > 256) { safe[k] = `${v.slice(0, 64)}…(${v.length})`; continue; }
    safe[k] = v;
  }
  console.log(JSON.stringify({ event, ...safe }));
}
