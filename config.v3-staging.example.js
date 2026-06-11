// Copy these values into config.js only for a staging v3 test build.
// Do not use a service-role key here. Use the Supabase anon/publishable key.
window.WT_CONFIG = window.WT_CONFIG || {
  storage: 'supabase',
  supabaseSchemaVersion: 'v3',
  supabaseUrl: 'https://YOUR_STAGING_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_STAGING_ANON_OR_PUBLISHABLE_KEY'
};
