// Default: browser-only storage (IndexedDB). For cloud sync, copy config.example.js
// or set GitHub Actions secrets SUPABASE_URL and SUPABASE_ANON_KEY on deploy.
window.WT_CONFIG = window.WT_CONFIG || {
  storage: 'local'
};
