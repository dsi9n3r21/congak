-- Congak: parent-child linking support.
-- Each student gets a short, human-typeable code a parent enters once to
-- link their account — simpler than email lookups and avoids exposing
-- student emails/IDs directly.

alter table students add column link_code text unique;

-- Parents need to be able to create their own links, and read only the
-- ones that belong to them; students should never see who's linked to them
-- change via a client update (link creation only happens through the
-- server action, using the authenticated parent's own id).
alter table parent_links enable row level security;

create policy "parents_manage_own_links" on parent_links
  for all using (parent_user_id = auth.uid())
  with check (parent_user_id = auth.uid());

-- Needed so a parent can look up a student by code before a link exists.
-- Deliberately a function, not an open RLS select policy — a policy like
-- `using (link_code is not null)` would expose every student's full row
-- (year_level, xp, gender, etc.) to any authenticated user, not just the
-- id/display_name needed for linking. SECURITY DEFINER lets this bypass
-- RLS internally while the return type restricts what actually comes back.
create or replace function find_student_by_link_code(code text)
returns table (id uuid, display_name text)
language sql
security definer
set search_path = public
as $$
  select id, display_name from students where link_code = code;
$$;

revoke all on function find_student_by_link_code(text) from public;
grant execute on function find_student_by_link_code(text) to authenticated;
