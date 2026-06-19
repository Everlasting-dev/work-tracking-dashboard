// deno test --allow-env supabase/functions/tests/validation_test.ts
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateUpload, sanitizeName, categoryForMime, ALLOWED_MIME } from "../_shared/validation.ts";

Deno.test("accepts a normal image within size", () => {
  assertEquals(validateUpload({ name: "photo.png", mime: "image/png", size: 1024 }), null);
});

Deno.test("rejects oversized files", () => {
  const r = validateUpload({ name: "big.png", mime: "image/png", size: 9_999_999_999 });
  assert(r && /too large/i.test(r));
});

Deno.test("rejects unsupported MIME types", () => {
  const r = validateUpload({ name: "x.bin", mime: "application/x-msdownload", size: 10 });
  assert(r && /unsupported/i.test(r));
});

Deno.test("rejects dangerous extensions regardless of MIME", () => {
  const r = validateUpload({ name: "evil.exe", mime: "image/png", size: 10 });
  assert(r && /not allowed/i.test(r));
});

Deno.test("rejects empty / zero-size", () => {
  assert(validateUpload({ name: "", mime: "image/png", size: 10 }));
  assert(validateUpload({ name: "a.png", mime: "image/png", size: 0 }));
});

Deno.test("sanitizeName strips paths and unsafe chars", () => {
  assertEquals(sanitizeName("../../etc/pa ss wd.txt").includes("/"), false);
  assert(!sanitizeName("a/b\\c.png").includes("\\"));
});

Deno.test("categoryForMime maps to folders", () => {
  assertEquals(categoryForMime("image/jpeg"), "images");
  assertEquals(categoryForMime("video/mp4"), "videos");
  assertEquals(categoryForMime("application/pdf"), "documents");
  assertEquals(categoryForMime("application/zip"), "other");
});

Deno.test("allowlist is a Set with expected members", () => {
  assert(ALLOWED_MIME.has("application/pdf"));
  assert(!ALLOWED_MIME.has("application/x-msdownload"));
});
