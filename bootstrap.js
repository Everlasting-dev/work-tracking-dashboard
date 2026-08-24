/* bootstrap.js - startup and splash handoff for WorkTracker. */

// Safety net: after 12s the splash always comes down, whether boot hung or the
// loader was held open. Nothing else can rescue a held splash, so this must not
// be gated on _splashReady.
// It stays armed deliberately: once boot succeeds it is a harmless no-op, but a
// splash held open past 12s has no other way out.
setTimeout(() => {
  _splashReady = true;
  forceSplashDismiss();
}, 12000);

applyTheme();
applyUiDensity();
applySidebarCollapsed();
document.documentElement.classList.add('splash-lock');
document.getElementById('splash')?.classList.add('is-visible');
window.addEventListener('resize', () => {
  try { syncSidebarDockMetrics(); } catch (_) {}
});

(async () => {
  try {
    setSplashStatus('Loading local database…');
    await _splashDelay(800);
    await bootstrapDB();
    if (window.WT_STORAGE_MODE === 'hybrid' || window.WT_STORAGE_MODE === 'hybrid-v3') {
      setSplashStatus('Connecting to cloud…');
      await _splashDelay(700);
    }
    if (window.WT_INITIAL_SYNC) {
      setSplashStatus('Syncing workspace…');
      // LocalDB is the primary store. Do not block the whole app on cloud sync:
      // on weak/offline networks Supabase requests can hang long enough to make
      // the app look dead before the user even reaches cached local data.
      await Promise.race([
        window.WT_INITIAL_SYNC.catch(() => false),
        new Promise(resolve => setTimeout(() => resolve(false), 2500))
      ]);
      await _splashDelay(300);
    }
    setSplashStatus('Ready');
    await _splashDelay(500);
    await init();
  } catch (err) {
    console.error('Bootstrap failed:', err);
    requestSplashDismiss();
  } finally {
    dismissSplashWhenReady();
  }
})();
