-- Orbitask v3.0.1 — Calendar Sync Configuration
-- Run this SQL in the Supabase Dashboard → SQL Editor
-- Safe to run multiple times (all statements are idempotent)

-- ── 1. Enable RLS (matches existing pattern on other wt_ tables) ──────────
ALTER TABLE public.wt_calendar_events ENABLE ROW LEVEL SECURITY;

-- ── 2. Open read/write policy (matches wt_anon_all on other tables) ───────
CREATE POLICY IF NOT EXISTS "wt_calendar_anon_all"
  ON public.wt_calendar_events
  USING (true)
  WITH CHECK (true);

-- ── 3. Add to realtime publication so changes broadcast live ──────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.wt_calendar_events;

-- ── 4. Add missing indexes for common query patterns ─────────────────────
CREATE INDEX IF NOT EXISTS wt_calendar_events_created_by_idx
  ON public.wt_calendar_events(created_by);

CREATE INDEX IF NOT EXISTS wt_calendar_events_project_idx
  ON public.wt_calendar_events(related_project_id);

CREATE INDEX IF NOT EXISTS wt_calendar_events_task_idx
  ON public.wt_calendar_events(related_task_id);

-- ── Verification ──────────────────────────────────────────────────────────
-- After running this SQL, the calendar will automatically sync across devices.
-- Check the Supabase UI:
--   1. Replication → Supabase realtime publication should list wt_calendar_events
--   2. RLS → wt_calendar_events should have "wt_calendar_anon_all" policy enabled
--   3. Indexes → All three indexes above should be visible in the table details
