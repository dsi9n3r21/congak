-- Congak: per-world level progress.
--
-- adventure_runs (0043) tracks whole-category completion across the
-- top-level map — one boolean-ish "cleared" per category. This
-- migration adds a layer UNDER that: each category is now its own
-- scrollable "world" of LEVELS_PER_WORLD levels (see
-- lib/missions/worldConfig.ts), and world_levels tracks how far into
-- that world a student has gotten. A world counts as "cleared" for
-- adventure_runs purposes once every level in it is done — the app
-- calls clear_world_level first, and only calls clear_adventure_obstacle
-- (0043) when that comes back true, so the two tables stay in sync
-- without adventure_runs needing to know about levels itself.

create table world_levels (
  student_id uuid not null references students(id) on delete cascade,
  mode text not null check (mode in ('easy', 'medium', 'hard')),
  category text not null,
  cleared_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, mode, category)
);

alter table world_levels enable row level security;

create policy "students_own_world_levels" on world_levels
  for all using (
    student_id in (select id from students where user_id = auth.uid())
  );

create policy "parents_view_linked_world_levels" on world_levels
  for select using (
    student_id in (select student_id from parent_links where parent_user_id = auth.uid())
  );

-- Atomic increment-and-check, same race-safety pattern as
-- clear_adventure_obstacle (0043) and record_badge_progress (0041).
-- Returns true the moment this completion clears the LAST level in the
-- world (cleared_count reaches p_total_levels) — false on every level
-- before that, including ones after the world was already fully clear
-- (cleared_count is capped at p_total_levels, not incremented past it,
-- so replaying a finished world's levels doesn't error or overflow).
create or replace function clear_world_level(p_student_id uuid, p_mode text, p_category text, p_total_levels int)
returns boolean
language plpgsql
as $$
declare
  v_count int;
begin
  insert into world_levels (student_id, mode, category, cleared_count, updated_at)
  values (p_student_id, p_mode, p_category, 1, now())
  on conflict (student_id, mode, category) do update
  set cleared_count = least(world_levels.cleared_count + 1, p_total_levels),
      updated_at = now()
  returning cleared_count into v_count;

  return v_count >= p_total_levels;
end;
$$;

-- Resets one world's level progress for "Play again" after a full
-- clear — mirrors restart_adventure_run (0043).
create or replace function restart_world(p_student_id uuid, p_mode text, p_category text)
returns void
language plpgsql
as $$
begin
  update world_levels
  set cleared_count = 0,
      updated_at = now()
  where student_id = p_student_id and mode = p_mode and category = p_category;
end;
$$;
