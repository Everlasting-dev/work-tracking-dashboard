/* orbiobs.js — Optional, privacy-guarded observability island.
 *
 * PostHog (product analytics) + Sentry (renderer error tracking). Both are
 * OFF by default and only initialise when the matching key is present in
 * window.WT_CONFIG, so the app stays local-first/no-telemetry unless the
 * operator opts in. No autocapture, no session recording, explicit events only.
 *
 *   window.WT_CONFIG.posthogKey  + (optional) posthogHost
 *   window.WT_CONFIG.sentryDsn
 *
 * API: window.OrbiObs = { init, track, identify, captureError }
 *
 * Rebuild after editing:  npm run build:orbiobs
 */
import posthog from 'posthog-js';
import * as Sentry from '@sentry/browser';

let _ph = false;   // posthog enabled
let _sentry = false;

function init(cfg) {
  cfg = cfg || (typeof window !== 'undefined' && window.WT_CONFIG) || {};
  const offline = (typeof navigator !== 'undefined' && navigator.onLine === false);
  if (offline) return; // never reach out when offline

  if (cfg.posthogKey && !_ph) {
    try {
      posthog.init(cfg.posthogKey, {
        api_host: cfg.posthogHost || 'https://us.i.posthog.com',
        autocapture: false,
        capture_pageview: false,
        disable_session_recording: true,
        persistence: 'localStorage',
      });
      _ph = true;
    } catch (_) {}
  }

  if (cfg.sentryDsn && !_sentry) {
    try {
      Sentry.init({
        dsn: cfg.sentryDsn,
        release: cfg.appVersion || (typeof window !== 'undefined' && window.WT_APP_VERSION) || undefined,
        tracesSampleRate: 0,
        sendDefaultPii: false,
      });
      _sentry = true;
    } catch (_) {}
  }
}

function identify(id, props) { if (_ph && id != null) { try { posthog.identify(String(id), props || {}); } catch (_) {} } }
function track(event, props) { if (_ph && event) { try { posthog.capture(event, props || {}); } catch (_) {} } }
function captureError(err, ctx) { if (_sentry && err) { try { Sentry.captureException(err, ctx ? { extra: ctx } : undefined); } catch (_) {} } }

window.OrbiObs = { init, track, identify, captureError };
