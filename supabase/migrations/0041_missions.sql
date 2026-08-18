-- Congak: Mission Engine (Adventure Mode) state tables.
--
-- Mission CONTENT (stories, variants, math) lives in code
-- (lib/missions/missions.ts) — same pattern as lesson content in
-- lib/content/topics.ts, which is why there's no `missions` content
-- table here mirroring the legacy `topics`/`question_templates` tables.
-- `mission_id` below is free text matching a MissionTemplate.id, not an
-- FK, for the same reason attempts.mistake_type and
-- question_templates.generator_config_json aren't FK-linked to code-side
-- definitions either.
--
-- Badge DEFINITIONS also live in code (lib/missions/badges.ts) — only
-- each student's PROGRESS toward a badge is real state, so student_badges
-- stores badge_id as free text with no separate `badges` table to keep
-- in sync.

create table student_badges (
  student_id uuid not null references students(id) on delete cascade,
  badge_id text not null,
  progress int not null default 0,
  target int not null default 1,
  earned_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, badge_id)
);

alter table student_badges enable row level security;

create policy "students_own_badges" on student_badges
  for all using (
    student_id in (select id from students where user_id = auth.uid())
  );

create policy "parents_view_linked_badges" on student_badges
  for select using (
    student_id in (select student_id from parent_links where parent_user_id = auth.uid())
  );

create table mission_completions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  mission_id text not null,
  category text not null,
  xp_earned int not null,
  completed_at timestamptz not null default now()
);

alter table mission_completions enable row level security;

create policy "students_own_mission_completions" on mission_completions
  for all using (
    student_id in (select id from students where user_id = auth.uid())
  );

create policy "parents_view_linked_mission_completions" on mission_completions
  for select using (
    student_id in (select student_id from parent_links where parent_user_id = auth.uid())
  );

-- Atomic upsert-and-increment for badge progress — same reasoning as
-- record_mistake_pattern in migration 0004: avoids a read-then-write race
-- if a student completes missions in quick succession. Caps progress at
-- target and stamps earned_at the moment it's first reached (never
-- overwritten on subsequent calls, so earned_at reflects the true
-- first-earned moment even if the badge is progressed further later).
create or replace function record_badge_progress(p_student_id uuid, p_badge_id text, p_increment int, p_target int)
returns void
language plpgsql
as $$
begin
  insert into student_badges (student_id, badge_id, progress, target, earned_at, updated_at)
  values (
    p_student_id,
    p_badge_id,
    least(p_increment, p_target),
    p_target,
    case when p_increment >= p_target then now() else null end,
    now()
  )
  on conflict (student_id, badge_id) do update
  set progress = least(student_badges.progress + p_increment, p_target),
      earned_at = coalesce(student_badges.earned_at, case when student_badges.progress + p_increment >= p_target then now() else null end),
      updated_at = now();
end;
$$;
