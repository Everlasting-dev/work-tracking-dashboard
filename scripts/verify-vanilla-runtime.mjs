import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const dateUtilsSource = fs.readFileSync(path.join(root, 'date-utils.js'), 'utf8');
const preloadSource = fs.readFileSync(path.join(root, 'desktop', 'preload.js'), 'utf8');
const packageMeta = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

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
assert.ok(
  preloadSource.includes(`process.env.npm_package_version || '${packageMeta.version}'`),
  'desktop preload fallback version should match package.json'
);

console.log('Vanilla runtime verification passed.');
