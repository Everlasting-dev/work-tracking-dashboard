// POST /functions/v1/auth-password-login
// Body: { login: string, password: string }
//
// Resolves username/email server-side, signs in through Supabase Auth, and
// links legacy wt_users rows to auth.users only from the service-role boundary.
// The browser never receives password hashes, salts, or a reusable pepper.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, preflight, log } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/auth.ts";

const GENERIC_ERROR = "Username or password is incorrect.";

function anonClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function normalizeLogin(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const login = normalizeLogin(body.login);
    const password = String(body.password || "");
    if (!login || !password) return json({ error: GENERIC_ERROR }, 401);

    const svc = serviceClient();
    const isEmail = login.includes("@");
    const query = svc
      .from("wt_users")
      .select("id,email,auth_user_id,must_change_password")
      .limit(1);
    const { data: rows, error: lookupError } = await (isEmail ? query.ilike("email", login) : query.eq("username", login));
    if (lookupError) {
      log("auth_password.lookup_error", { message: lookupError.message });
      return json({ error: GENERIC_ERROR }, 401);
    }

    const row = rows?.[0] ?? null;
    const email = row?.email || (isEmail ? login : "");
    if (!row || !email) return json({ error: GENERIC_ERROR }, 401);

    const { data, error } = await anonClient().auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      log("auth_password.failed", { userId: row.id });
      return json({ error: GENERIC_ERROR }, 401);
    }

    if (row.auth_user_id && row.auth_user_id !== data.user.id) {
      log("auth_password.link_conflict", { userId: row.id });
      return json({ error: "Account link conflict. Contact an administrator." }, 409);
    }

    if (!row.auth_user_id) {
      const { error: linkError } = await svc
        .from("wt_users")
        .update({ auth_user_id: data.user.id, last_seen_at: new Date().toISOString() })
        .eq("id", row.id)
        .is("auth_user_id", null);
      if (linkError) {
        log("auth_password.link_failed", { userId: row.id, message: linkError.message });
        return json({ error: "Account could not be linked securely." }, 409);
      }
    } else {
      await svc.from("wt_users").update({ last_seen_at: new Date().toISOString() }).eq("id", row.id);
    }

    log("auth_password.ok", { userId: row.id });
    return new Response(
      JSON.stringify({
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
        mustChangePassword: Boolean(row.must_change_password),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    log("auth_password.error", { err: String(err) });
    return json({ error: GENERIC_ERROR }, 401);
  }
});
