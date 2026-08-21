const LEGACY_PBKDF2_ITERATIONS = 100_000;
const LEGACY_PBKDF2_BITS = 256;

export interface LegacyPasswordRow {
  password_hash?: string | null;
  salt?: string | null;
}

export function normalizeLogin(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export function legacyEmailForUsername(username: string) {
  return `${normalizeLogin(username)}@worktracker.app`;
}

export function supabaseAuthPassword(password: string) {
  return password.length >= 6 ? password : `wtk_${password}_orbitrack`;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) {
    diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function legacyPasswordHash(password: string, salt: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const buffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: LEGACY_PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    LEGACY_PBKDF2_BITS,
  );
  return bytesToHex(new Uint8Array(buffer));
}

export async function verifyLegacyPassword(password: string, row: LegacyPasswordRow) {
  if (!row.password_hash || !row.salt) return false;
  const hash = await legacyPasswordHash(password, row.salt);
  return timingSafeEqual(hash, row.password_hash);
}
