#!/usr/bin/env node
/*
 * Master workflow for Orbitrack Google Drive + Supabase storage maintenance.
 *
 * Default safe run:
 *   node scripts/drive-storage-master.mjs
 *
 * Full refresh after Google Cloud/OAuth changes:
 *   node scripts/drive-storage-master.mjs --bootstrap
 *
 * Safe cleanup of empty duplicate root folders:
 *   node scripts/drive-storage-master.mjs --clean-empty
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function hasFlag(name) {
  return process.argv.includes(name);
}

function printHelp() {
  console.log(`
Usage:
  node scripts/drive-storage-master.mjs
  node scripts/drive-storage-master.mjs --bootstrap
  node scripts/drive-storage-master.mjs --clean-empty
  node scripts/drive-storage-master.mjs --bootstrap --clean-empty

Options:
  --bootstrap     Open Google OAuth, write the returned token/root id to .env,
                  then continue with Supabase sync/deploy and root audit.
  --clean-empty   Move only empty duplicate Orbitrack Storage roots to Drive trash.
                  Non-empty duplicate roots are always kept for review.
  --audit-only    Run health check and duplicate-root audit without deploying.
`);
}

function runStep(title, args) {
  console.log(`\n=== ${title} ===`);
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    env: { ...process.env },
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    printHelp();
    return;
  }

  const bootstrap = hasFlag("--bootstrap");
  const cleanEmpty = hasFlag("--clean-empty");
  const auditOnly = hasFlag("--audit-only");

  console.log("Orbitrack Drive master workflow");
  console.log(`- Bootstrap OAuth: ${bootstrap ? "yes" : "no"}`);
  console.log(`- Deploy Supabase functions/secrets: ${auditOnly ? "no" : "yes"}`);
  console.log(`- Clean empty duplicate roots: ${cleanEmpty ? "yes" : "no"}`);

  if (bootstrap) {
    runStep("Google OAuth bootstrap", ["scripts/google-drive-oauth-bootstrap.mjs", "--write-env"]);
  }

  if (auditOnly) {
    runStep("Drive health check", ["scripts/drive-storage-maintenance.mjs"]);
  } else {
    runStep("Supabase secrets sync and function deploy", [
      "scripts/drive-storage-maintenance.mjs",
      "--set-secrets",
      "--deploy",
    ]);
  }

  runStep(cleanEmpty ? "Audit and trash empty duplicate Drive roots" : "Audit duplicate Drive roots", [
    "scripts/drive-storage-root-cleanup.mjs",
    ...(cleanEmpty ? ["--confirm-empty-trash"] : []),
  ]);

  if (cleanEmpty) {
    runStep("Final duplicate Drive root audit", ["scripts/drive-storage-root-cleanup.mjs"]);
  }

  console.log("\n[ok] Drive master workflow complete.");
}

try {
  main();
} catch (err) {
  console.error(`[error] ${err.message || err}`);
  process.exit(1);
}
