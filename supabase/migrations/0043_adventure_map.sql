-- Congak: Adventure Map run tracking.
--
-- The 9 mission categories double as the map's "obstacles" (A -> B).
-- One row per (student, mode) tracks which categories have been cleared
-- in that mode's current run. When categories_cleared reaches all 9, the
-- adventure_champion badge fires and the row is ready for "Play again"
-- to reset (categories_cleared back to '{}', run_number bumped) so a
-- student can replay the whole map — including on a mode/grade they've
-- already 100%'d — without losing the badge they already earned.
--
-- Clearing ONE obstacle just means completing any one mission in that
-- category at that mode at least once during the current run — it does
-- not require completing every mission the category has, which is what
-- keeps the map achievable even as more missions get added to a category
-- over time.

create table adventure_runs (
  student_id uuid not null references students(id) on delete cascade,
  mode text not null check (mode in ('easy', 'medium', 'hard')),
  categories_cleared text[] not null default '{}',
  run_number int not null default 1,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, mode)
);

alter table adventure_runs enable row level security;

create policy "students_own_adventure_runs" on adventure_runs
  for all using (
    student_id in (select id from students where user_id = auth.uid())
  );

create policy "parents_view_linked_adventure_runs" on adventure_runs
  for select using (
    student_id in (select student_id from parent_links where parent_user_id = auth.uid())
  );

-- Marks one category cleared for (student, mode) and reports whether
-- that just completed the full map (all 9 categories) — the caller
-- (completeMission action) uses that boolean to also call
-- record_badge_progress for 'adventure_champion' and set completed_at.
-- Atomic (single upsert) for the same race-safety reason as
-- record_badge_progress in migration 0041.
create or replace function clear_adventure_obstacle(p_student_id uuid, p_mode text, p_category text, p_total_categories int)
returns boolean
language plpgsql
as $$
declare
  v_cleared text[];
begin
  insert into adventure_runs (student_id, mode, categories_cleared, updated_at)
  values (p_student_id, p_mode, array[p_category], now())
  on conflict (student_id, mode) do update
  set categories_cleared = case
        when p_category = any(adventure_runs.categories_cleared) then adventure_runs.categories_cleared
        else array_append(adventure_runs.categories_cleared, p_category)
      end,
      updated_at = now()
  returning categories_cleared into v_cleared;

  if array_length(v_cleared, 1) >= p_total_categories then
    update adventure_runs
    set completed_at = coalesce(completed_at, now())
    where student_id = p_student_id and mode = p_mode;
    return true;
  end if;
  return false;
end;
$$;

-- Resets one (student, mode) run so "Play again" after a full clear
-- starts a fresh map walk — badge already earned is untouched (it lives
-- in student_badges, not here).
create or replace function restart_adventure_run(p_student_id uuid, p_mode text)
returns void
language plpgsql
as $$
begin
  update adventure_runs
  set categories_cleared = '{}',
      run_number = run_number + 1,
      started_at = now(),
      completed_at = null,
      updated_at = now()
  where student_id = p_student_id and mode = p_mode;
end;
$$;
