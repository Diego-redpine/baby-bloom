-- 002_lockdown_archive.sql
-- Security lockdown for the POST-EVENT archive (applied 2026-06-01).
-- The Apr 4 baby shower is over, so no new public reads/writes are needed.
-- This revokes ALL anon/public access to guest PII, time-capsule recordings,
-- photos, and votes. The project owner (Supabase dashboard / service_role)
-- keeps full access. Fixes: C1 (open RLS read), C2 (public buckets), H3 (open writes).
--
-- Safe to re-run (idempotent). To re-enable a feature later, add a scoped policy explicitly.

-- 1. Drop EVERY existing policy on the babyshower_* tables (covers policies created
--    via the dashboard with unknown names). RLS stays ENABLED, so with zero policies
--    the anon role is denied all access (deny-by-default).
do $$
declare
  t text;
  p record;
  tables text[] := array[
    'babyshower_guests',
    'babyshower_capsule_messages',
    'babyshower_photos',
    'babyshower_game_votes'
  ];
begin
  foreach t in array tables loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I enable row level security;', t);
      for p in
        select policyname from pg_policies
        where schemaname = 'public' and tablename = t
      loop
        execute format('drop policy if exists %I on public.%I;', p.policyname, t);
      end loop;
    end if;
  end loop;
end $$;

-- 2. Make the storage buckets PRIVATE (they were public-read).
--    Admin playback should use createSignedUrl() instead of getPublicUrl().
update storage.buckets
  set public = false
  where id in ('babyshower-capsule', 'babyshower-photos');

-- 3. Stop broadcasting votes over realtime (the live reveal screen is idle now).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      execute 'alter publication supabase_realtime drop table babyshower_game_votes';
    exception when others then
      null; -- table may not be in the publication; ignore
    end;
  end if;
end $$;

-- Post-conditions:
--   * anon key can read/write NOTHING in babyshower_* tables
--   * both storage buckets are private (no public URLs resolve)
--   * realtime no longer streams vote rows
