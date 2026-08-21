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
import {
  legacyEmailForUsername,
  normalizeLogin,
  supabaseAuthPassword,
  verifyLegacyPassword,
} from "../_shared/legacy_auth.ts";

const GENERIC_ERROR = "Username or password is incorrect.";

interface LegacyUserRow {
  id: number;
  username: string;
  display_name?: string | null;
  email?: string | null;
  role?: string | null;
  auth_user_id?: string | null;
  must_change_password?: boolean | null;
  password_hash?: string | null;
  salt?: string | null;
}

function anonClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function signInWithPassword(email: string, password: string) {
  return await anonClient().auth.signInWithPassword({ email, password: supabaseAuthPassword(password) });
}

function metadataFor(row: LegacyUserRow) {
  return {
    username: row.username,
    display_name: row.display_name || row.username,
    role: row.role || "user",
  };
}

async function resolveLinkedAuthEmail(svc: ReturnType<typeof serviceClient>, row: LegacyUserRow, fallbackEmail: string) {
  if (!row.auth_user_id) return fallbackEmail;
  const { data, error } = await svc.auth.admin.getUserById(row.auth_user_id);
  if (error) {
    log("auth_password.auth_lookup_failed", { userId: row.id, message: error.message });
    return fallbackEmail;
  }
  return data.user?.email || fallbackEmail;
}

async function findAuthUserByEmail(svc: ReturnType<typeof serviceClient>, email: string) {
  const needle = email.trim().toLowerCase();
  if (!needle) return null;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      log("auth_password.auth_list_failed", { message: error.message });
      return null;
    }
    const match = data.users.find((user) => user.email?.toLowerCase() === needle);
    if (match) return match;
    if (data.users.length < 1000) return null;
  }

  return null;
}

async function provisionAuthFromLegacyPassword(
  svc: ReturnType<typeof serviceClient>,
  row: LegacyUserRow,
  email: string,
  password: string,
) {
  const legacyOk = await verifyLegacyPassword(password, row);
  if (!legacyOk) return null;

  const authPassword = supabaseAuthPassword(password);
  if (row.auth_user_id) {
    const { error } = await svc.auth.admin.updateUserById(row.auth_user_id, {
      password: authPassword,
      user_metadata: metadataFor(row),
    });
    if (error) {
      log("auth_password.legacy_update_failed", { userId: row.id, message: error.message });
      return null;
    }
  } else {
    const { error } = await svc.auth.admin.createUser({
      email,
      password: authPassword,
      email_confirm: true,
      user_metadata: metadataFor(row),
    });
    if (error) {
      const existing = await findAuthUserByEmail(svc, email);
      if (!existing?.id) {
        log("auth_password.legacy_create_failed", { userId: row.id, message: error.message });
        return null;
      }
      const { error: updateError } = await svc.auth.admin.updateUserById(existing.id, {
        password: authPassword,
        user_metadata: metadataFor(row),
      });
      if (updateError) {
        log("auth_password.legacy_existing_update_failed", { userId: row.id, message: updateError.message });
        return null;
      }
    }
  }

  const { data, error } = await signInWithPassword(email, password);
  if (error || !data.session || !data.user) {
    log("auth_password.legacy_signin_failed", { userId: row.id, message: error?.message });
    return null;
  }
  return data;
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
      .select("id,username,display_name,email,role,auth_user_id,must_change_password,password_hash,salt")
      .limit(1);
    const { data: rows, error: lookupError } = await (isEmail ? query.ilike("email", login) : query.eq("username", login));
    if (lookupError) {
      log("auth_password.lookup_error", { message: lookupError.message });
      return json({ error: GENERIC_ERROR }, 401);
    }

    const row = (rows?.[0] ?? null) as LegacyUserRow | null;
    if (!row?.username) return json({ error: GENERIC_ERROR }, 401);

    const fallbackEmail = row.email || (isEmail ? login : legacyEmailForUsername(row.username));
    const email = await resolveLinkedAuthEmail(svc, row, fallbackEmail);

    const signInResult = await signInWithPassword(email, password);
    let authData = signInResult.data;
    if (signInResult.error || !authData.session || !authData.user) {
      const provisioned = await provisionAuthFromLegacyPassword(svc, row, email, password);
      if (!provisioned?.session || !provisioned.user) {
        log("auth_password.failed", { userId: row.id });
        return json({ error: GENERIC_ERROR }, 401);
      }
      authData = provisioned;
    }

    if (row.auth_user_id && row.auth_user_id !== authData.user.id) {
      log("auth_password.link_conflict", { userId: row.id });
      return json({ error: "Account link conflict. Contact an administrator." }, 409);
    }

    if (!row.auth_user_id) {
      const { error: linkError } = await svc
        .from("wt_users")
        .update({ auth_user_id: authData.user.id, last_seen_at: new Date().toISOString() })
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
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
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
