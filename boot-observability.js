/* boot-observability.js — starts optional observability and installs the global
 * error hooks.
 *
 * Previously an inline <script> in index.html, which forced the renderer CSP to
 * allow 'unsafe-inline' for script-src. Behaviour is unchanged: OrbiObs no-ops
 * unless window.WT_CONFIG carries PostHog/Sentry keys.
 *
 * Must load after vendor/orbiobs/orbiobs.js.
 */
(function (window) {
  'use strict';
  try {
    if (window.OrbiObs) window.OrbiObs.init();
  } catch (_) {}

  window.addEventListener('error', function (e) {
    if (window.OrbiObs) window.OrbiObs.captureError(e.error || e.message);
  });
  window.addEventListener('unhandledrejection', function (e) {
    if (window.OrbiObs) window.OrbiObs.captureError(e.reason);
  });
})(window);
