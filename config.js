// Runtime configuration for WorkTracker.
// The values below are the Supabase project URL and the *publishable* (anon) key.
// Both are designed to be exposed in client code; access is gated by Row-Level
// Security policies defined in supabase/schema.sql. Never paste a service_role key here.
window.WT_CONFIG = window.WT_CONFIG || {
  storage: 'supabase',
  // Keep production on v2 until the staging v3 build passes validation.
  // For a staging v3 test build, set this to 'v3' and point the URL/key at staging.
  supabaseSchemaVersion: 'v2',
  supabaseUrl: 'https://ubheoxzwzfhzccotulmt.supabase.co',
  supabaseAnonKey: 'sb_publishable_JtyUKd1nBgO7LLAJ45aiuw_Sd2EUOgd',
  storageProvider: 'google_drive',
};
