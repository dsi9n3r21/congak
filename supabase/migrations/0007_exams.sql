-- Congak: exams table.

create table exams (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  config_json jsonb not null,
  score int not null,
  total int not null,
  strengths_json jsonb not null default '[]'::jsonb,
  weaknesses_json jsonb not null default '[]'::jsonb,
  recommended_path_json jsonb not null default '[]'::jsonb,
  time_taken_seconds int not null,
  created_at timestamptz not null default now()
);

alter table exams enable row level security;

-- "for all using (...)" applies the same USING clause as WITH CHECK for
-- insert/update by default in Postgres — covers read + write in one policy,
-- unlike students/topic_mastery in earlier migrations which needed it split out.
create policy "students_own_exams" on exams
  for all using (
    student_id in (select id from students where user_id = auth.uid())
  );

create policy "parents_view_linked_exams" on exams
  for select using (
    student_id in (select student_id from parent_links where parent_user_id = auth.uid())
  );
