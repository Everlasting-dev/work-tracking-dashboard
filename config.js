// Runtime configuration for WorkTracker.
// The values below are the Supabase project URL and the *publishable* (anon) key.
// Both are designed to be exposed in client code; access is gated by Row-Level
// Security policies defined in supabase/schema.sql. Never paste a service_role key here.
window.WT_CONFIG = window.WT_CONFIG || {
  storage: 'supabase',
  supabaseUrl: 'https://ewexbdilrhmlpbalmpfj.supabase.co',
  supabaseAnonKey: 'sb_publishable_QvcfeV3hQjFaIigiP-nYpg_D_oPU1wW'
};
