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

  // LocalDB is always primary — instant, no network needed
  window.DB = window.LocalDB;
  window.WT_STORAGE_MODE = 'local';

  // If Supabase is configured, start SyncEngine in the background
  const useSupabase =
    cfg.storage === 'supabase' &&
    cfg.supabaseUrl &&
    cfg.supabaseAnonKey &&
    typeof SyncEngine !== 'undefined' &&
    typeof SupabaseDB !== 'undefined' &&
    typeof supabase   !== 'undefined';

  if (useSupabase) {
    window.WT_STORAGE_MODE = 'hybrid';
    // Non-blocking — app starts immediately, sync happens in background
    SyncEngine.init(cfg.supabaseUrl, cfg.supabaseAnonKey).catch(err => {
      console.error('[db-bridge] SyncEngine init failed:', err);
    });
  }
}
