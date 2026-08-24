import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const dateUtilsSource = read('date-utils.js');
const preloadSource = read('desktop', 'preload.js');
const bootVersionSource = read('boot-version.js');
const indexSource = read('index.html');
const appSource = read('app.js');
const packageMeta = JSON.parse(read('package.json'));
const expected = packageMeta.version;

const sandbox = {
  window: {
    WT_APP_VERSION: packageMeta.version
  }
};

vm.runInNewContext(dateUtilsSource, sandbox, { filename: 'date-utils.js' });

const utils = sandbox.window.WTDateUtils;
assert.ok(utils, 'WTDateUtils should be published on window');

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

assert.equal(utils.getAppVersion(), packageMeta.version, 'date utils should read the app version');
assert.match(utils.formatDateShort('2026-06-24'), /^[A-Z][a-z]{2} \d{1,2}$/);
assert.equal(utils.formatDateShort('bad-date'), '', 'bad dates should render as empty labels');
assert.equal(utils.timeAgo('bad-date'), '', 'bad relative dates should render as empty labels');
assert.equal(utils.isDueSoon(dateKey(today)), true, 'today should be due soon');
assert.equal(utils.isDueSoon(dateKey(tomorrow)), true, 'tomorrow should be due soon');
assert.equal(utils.isOverdue(dateKey(yesterday)), true, 'yesterday should be overdue');
assert.equal(utils.isOverdue(dateKey(today)), false, 'today should not be overdue');

/* Version consistency.
 *
 * The version is restated in several places that cannot read package.json at
 * runtime: two offline fallbacks, the browser-build seed, the cache-busting
 * query strings, and the changelog the release-notes UI reads. Bumping only
 * package.json used to leave the hosted build reporting the old number and the
 * "What's new" modal titled with the new one. Assert them all here so a bump is
 * either complete or loud. */

assert.ok(
  preloadSource.includes(`process.env.npm_package_version || '${expected}'`),
  `desktop preload fallback version should be ${expected}`
);

assert.ok(
  dateUtilsSource.includes(`window.WT_APP_VERSION || '${expected}'`),
  `date-utils.js getAppVersion fallback should be ${expected}`
);

assert.ok(
  bootVersionSource.includes(`var FALLBACK_VERSION = '${expected}';`),
  `boot-version.js FALLBACK_VERSION should be ${expected}`
);

// index.html must not carry an inline <script>: the desktop renderer runs under
// a CSP with script-src 'self'.
assert.ok(
  !/<script(?![^>]*\bsrc=)[^>]*>/i.test(indexSource),
  'index.html must not contain inline <script> blocks (CSP script-src is \'self\')'
);

// App-owned assets are cache-busted with the app version. Vendor bundles under
// vendor/ carry their own library versions and are deliberately excluded.
const bustedAssets = [...indexSource.matchAll(/(?:src|href)="([^"]+?)\?v=([^"&]+)"/g)]
  .map(([, asset, version]) => ({ asset, version }))
  .filter(({ asset }) => !asset.startsWith('vendor/') && !/^https?:/.test(asset));
assert.ok(bustedAssets.length > 0, 'index.html should cache-bust its own assets with ?v=');
const stale = bustedAssets.filter(({ version }) => version !== expected);
assert.equal(
  stale.length, 0,
  `index.html ?v= cache-busters should be ${expected}; stale: ${stale.map(s => `${s.asset}?v=${s.version}`).join(', ')}`
);

assert.ok(
  indexSource.includes(`<p class="splash-version" id="splash-app-version">v${expected}</p>`),
  `index.html splash version label should read v${expected}`
);

const changelogTop = appSource.match(/const SUPPORT_CHANGELOG = \[\s*\{\s*version: '([^']+)'/);
assert.ok(changelogTop, 'app.js should declare SUPPORT_CHANGELOG with a leading entry');
assert.equal(
  changelogTop[1], expected,
  `SUPPORT_CHANGELOG[0].version should be ${expected} so the What's New modal matches the running build`
);

console.log(`Vanilla runtime verification passed (v${expected}).`);
