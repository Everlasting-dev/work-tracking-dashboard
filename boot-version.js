/* boot-version.js — seeds window.WT_APP_VERSION before any other app script.
 *
 * This used to be an inline <script> in index.html, which forced the renderer's
 * Content-Security-Policy to allow 'unsafe-inline' for script-src. It lives in a
 * file so script-src can stay at 'self'.
 *
 * Sources, in order of authority:
 *   1. workTrackerDesktop.packageVersion — the packaged app's real version,
 *      exposed synchronously across the contextBridge (desktop/preload.js).
 *      desktop/updates.js later refreshes it from app.getVersion() over IPC.
 *   2. The literal below — the version for browser/hosted builds. Kept in step
 *      with package.json by scripts/verify-vanilla-runtime.mjs.
 */
(function (window) {
  'use strict';
  var FALLBACK_VERSION = '3.6.1';
  var bridged = null;
  try {
    bridged = window.workTrackerDesktop && window.workTrackerDesktop.packageVersion;
  } catch (_) {
    bridged = null;
  }
  window.WT_APP_VERSION = window.WT_APP_VERSION || bridged || FALLBACK_VERSION;
})(window);
