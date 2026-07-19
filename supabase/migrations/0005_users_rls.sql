-- Congak: users table RLS policies.
-- Supabase now enables RLS by default on new tables in the public schema —
-- 0001_init.sql created `users` without ever explicitly enabling RLS on it,
-- but the platform default turned it on anyway with zero policies attached,
-- which silently denies every insert (including a user creating their own
-- row right after signup). This adds the policies that should have shipped
-- with 0001.

alter table users enable row level security;

create policy "users_insert_own" on users
  for insert
  with check (id = auth.uid());

create policy "users_select_own" on users
  for select
  using (id = auth.uid());
