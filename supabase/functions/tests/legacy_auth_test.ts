// deno test --allow-env supabase/functions/tests/legacy_auth_test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  legacyEmailForUsername,
  legacyPasswordHash,
  normalizeLogin,
  supabaseAuthPassword,
  verifyLegacyPassword,
} from "../_shared/legacy_auth.ts";

Deno.test("legacyPasswordHash matches vanilla PBKDF2-SHA256 format", async () => {
  const hash = await legacyPasswordHash("secret", "00112233445566778899aabbccddeeff");
  assertEquals(hash, "9d64f93be6eddb2c94a7aec21fa395a4a437e2792473d8e23f88a4c0fc6c0bf8");
});

Deno.test("verifyLegacyPassword accepts only the matching password", async () => {
  const row = {
    salt: "00112233445566778899aabbccddeeff",
    password_hash: "9d64f93be6eddb2c94a7aec21fa395a4a437e2792473d8e23f88a4c0fc6c0bf8",
  };
  assertEquals(await verifyLegacyPassword("secret", row), true);
  assertEquals(await verifyLegacyPassword("wrong", row), false);
});

Deno.test("supabaseAuthPassword mirrors the vanilla Auth bridge", () => {
  assertEquals(supabaseAuthPassword("secret"), "secret");
  assertEquals(supabaseAuthPassword("1234"), "wtk_1234_orbitrack");
});

Deno.test("login normalization and legacy fallback email are deterministic", () => {
  assertEquals(normalizeLogin(" Admin "), "admin");
  assertEquals(legacyEmailForUsername("Admin"), "admin@worktracker.app");
});
