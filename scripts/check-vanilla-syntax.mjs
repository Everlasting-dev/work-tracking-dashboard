/* check-vanilla-syntax.mjs — parse every script the vanilla app actually loads.
 *
 * `verify:vanilla` used to run `node --check` on four files, which left the
 * majority of the renderer — db.js, sync.js, notes.js, bootstrap.js and the rest
 * of the scripts index.html loads — unparsed. A syntax error in any of them only
 * showed up as a blank window at runtime.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

// Every non-vendor script tag in index.html, plus the Electron main/preload pair
// and the local-only helpers the desktop shell loads.
const FILES = [
  'boot-version.js',
  'boot-observability.js',
  'config.js',
  'db.js',
  'db-supabase.js',
  'sync.js',
  'sync-v3.js',
  'realtime-sync.js',
  'notification-sounds.js',
  'db-bridge.js',
  'splash-sphere.js',
  'reports-projects.js',
  'date-utils.js',
  'app.js',
  'notes.js',
  'reports.js',
  'storage-drive.js',
  'ui.js',
  'bootstrap.js',
  'desktop/updates.js',
  'desktop/main.js',
  'desktop/preload.js'
];

const missing = [];
const failed = [];

for (const rel of FILES) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    missing.push(rel);
    continue;
  }
  try {
    execFileSync(process.execPath, ['--check', abs], { stdio: 'pipe' });
  } catch (err) {
    failed.push({ rel, detail: String(err.stderr || err.message).trim() });
  }
}

// index.html should not reference a script that does not exist, and this list
// should not drift from what index.html actually loads.
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const referenced = [...indexSource.matchAll(/<script\s+src="([^"?]+)/g)]
  .map(m => m[1])
  .filter(src => !src.startsWith('vendor/') && !src.startsWith('http'));

const brokenRefs = referenced.filter(src => !fs.existsSync(path.join(root, src)));
const unchecked = referenced.filter(src => !FILES.includes(src));

if (missing.length) console.error(`Missing files: ${missing.join(', ')}`);
if (brokenRefs.length) console.error(`index.html references missing scripts: ${brokenRefs.join(', ')}`);
if (unchecked.length) console.error(`index.html loads unchecked scripts (add to check-vanilla-syntax.mjs): ${unchecked.join(', ')}`);
for (const { rel, detail } of failed) console.error(`Syntax error in ${rel}:\n${detail}`);

if (missing.length || brokenRefs.length || unchecked.length || failed.length) {
  process.exit(1);
}

console.log(`Syntax check passed for ${FILES.length} scripts.`);
