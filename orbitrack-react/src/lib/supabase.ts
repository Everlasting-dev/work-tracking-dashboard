import { createClient } from "@supabase/supabase-js";

// Reuses the SAME backend as the live app (new project in the Apex-chrome org).
// Anon/publishable key — access is gated by RLS + app-level auth.
const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = key;

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Public Drive thumbnail URL for an avatar (mirrors avatarSrc in the vanilla app).
export function avatarSrc(u?: { avatar_drive_id?: string | null } | null): string {
  if (!u?.avatar_drive_id) return "";
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(u.avatar_drive_id)}&sz=w240`;
}
