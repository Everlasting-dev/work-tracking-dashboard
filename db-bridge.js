/* Selects IndexedDB (local) or Supabase based on window.WT_CONFIG */

async function bootstrapDB() {
  const cfg = window.WT_CONFIG || { storage: 'local' };
  const useSupabase = cfg.storage === 'supabase' && cfg.supabaseUrl && cfg.supabaseAnonKey;

  if (useSupabase && typeof SupabaseDB !== 'undefined' && typeof supabase !== 'undefined') {
    try {
      await SupabaseDB.init(cfg.supabaseUrl, cfg.supabaseAnonKey);
      window.DB = SupabaseDB;
      window.WT_STORAGE_MODE = 'supabase';
      return;
    } catch (err) {
      console.error('Supabase connection failed, falling back to IndexedDB:', err);
    }
  }

  window.DB = window.LocalDB;
  window.WT_STORAGE_MODE = 'local';
}
