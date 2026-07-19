-- Congak: initial schema (Phase 0)
-- Multi-tenant-ready from day one: org_id is nullable so individual
-- students/parents work today, and schools slot in later without a rewrite.

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('individual', 'school')),
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'parent', 'teacher', 'admin')),
  org_id uuid references organizations(id),
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  display_name text not null,
  gender text,
  year_level int not null check (year_level in (4, 5, 6)),
  avatar_id text,
  theme text not null default 'explorer' check (theme in ('adventure', 'explorer')),
  xp int not null default 0,
  level int not null default 1,
  streak_count int not null default 0,
  last_active_at timestamptz
);

create table parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  relationship text
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  year_level int not null check (year_level in (4, 5, 6)),
  strand text not null,
  title text not null,
  order_index int not null default 0
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  explanation_md text not null,
  tips_md text,
  worked_examples_json jsonb,
  common_mistakes_json jsonb
);

create table question_templates (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  type text not null check (type in ('mcq', 'fill', 'drag', 'match', 'word_problem')),
  difficulty int not null default 1,
  generator_config_json jsonb not null
);

create table practice_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  topic_id uuid not null references topics(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references practice_sessions(id) on delete cascade,
  question_snapshot_json jsonb not null,
  student_answer text,
  is_correct boolean,
  mistake_type text,
  time_taken_seconds int,
  created_at timestamptz not null default now()
);

create table topic_mastery (
  student_id uuid not null references students(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  mastery_score numeric not null default 0,
  weak_flag boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, topic_id)
);

-- Row Level Security: students see only their own data; parents see only
-- their linked children. This is the pattern every future table follows.
alter table students enable row level security;
alter table practice_sessions enable row level security;
alter table attempts enable row level security;
alter table topic_mastery enable row level security;

create policy "students_own_row" on students
  for select using (user_id = auth.uid());

create policy "parents_view_linked_students" on students
  for select using (
    id in (select student_id from parent_links where parent_user_id = auth.uid())
  );

create policy "students_own_sessions" on practice_sessions
  for all using (
    student_id in (select id from students where user_id = auth.uid())
  );

create policy "students_own_attempts" on attempts
  for all using (
    session_id in (
      select ps.id from practice_sessions ps
      join students s on s.id = ps.student_id
      where s.user_id = auth.uid()
    )
  );

create policy "mastery_visible_to_student_and_parent" on topic_mastery
  for select using (
    student_id in (select id from students where user_id = auth.uid())
    or student_id in (select student_id from parent_links where parent_user_id = auth.uid())
  );
