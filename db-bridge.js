/* db-bridge.js — WorkTracker database bootstrap
 *
 * Architecture:
 *   LocalDB (IndexedDB/Dexie) is ALWAYS window.DB — the primary store.
 *   SyncEngine handles Supabase in the background (non-blocking).
 *
 * This means the app NEVER waits for the network to start.
 * Offline → works with local data.
 * Online  → SyncEngine pulls Supabase data into LocalDB, then flushes queued writes.
 */

async function bootstrapDB() {
  const cfg = window.WT_CONFIG || { storage: 'local' };
  window.WT_INITIAL_SYNC = Promise.resolve(false);
  const useV3 = cfg.supabaseSchemaVersion === 'v3';

  // LocalDB is always primary — instant, no network needed
  window.DB = window.LocalDB;
  window.WT_STORAGE_MODE = 'local';

  // If Supabase is configured, start SyncEngine in the background
  const useSupabase =
    cfg.storage === 'supabase' &&
    cfg.supabaseUrl &&
    cfg.supabaseAnonKey &&
    (useV3 ? typeof SyncEngineV3 !== 'undefined' : typeof SyncEngine !== 'undefined') &&
    typeof SupabaseDB !== 'undefined' &&
    typeof supabase   !== 'undefined';

  if (useSupabase) {
    window.WT_STORAGE_MODE = useV3 ? 'hybrid-v3' : 'hybrid';
    // Keep a handle to the first pull so auth can avoid showing first-time setup
    // before an existing cloud workspace has had a chance to hydrate locally.
    const engine = useV3 ? SyncEngineV3 : SyncEngine;
    window.WT_INITIAL_SYNC = engine.init(cfg.supabaseUrl, cfg.supabaseAnonKey).catch(err => {
      console.error('[db-bridge] SyncEngine init failed:', err);
      return false;
    });
  }
}
