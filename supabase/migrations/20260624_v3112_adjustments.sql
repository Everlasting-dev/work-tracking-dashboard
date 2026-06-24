-- v3.1.12 adjustments — new columns for the OTP flow, personal classrooms,
-- profile customization, and canvas owner controls.
--
-- The app degrades gracefully when these columns are missing (the values are
-- kept in LocalDB and the writes drop the unknown columns), so the features work
-- locally without this migration. Apply it so the new fields PERSIST and SYNC
-- across devices. Safe to run more than once.

-- 1) One-time password / forced password change (Item 2)
alter table wt_users add column if not exists must_change_password boolean default false;

-- 2) Profile customization (Item 6)
alter table wt_users add column if not exists tagline text;
alter table wt_users add column if not exists accent_color text;
alter table wt_users add column if not exists cover_color text;

-- 3) Private personal-space classrooms (Item 3)
alter table wt_classrooms add column if not exists is_personal boolean default false;
alter table wt_classrooms add column if not exists owner_id bigint;

-- 4) Canvas: purpose + private-collaboration participants (Item 7 / 11)
alter table wt_canvas_rooms add column if not exists purpose text;
alter table wt_canvas_rooms add column if not exists participant_ids bigint[] default '{}';
