-- Congak: quizzes + mistake_patterns tables.
-- These were specified in the original database design but hadn't
-- actually been created yet — submitQuiz() already writes to `quizzes`,
-- so this migration must run before the quiz feature works in production.

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  topic_id uuid not null references topics(id),
  score int not null,
  accuracy int not null,
  time_taken int not null,
  created_at timestamptz not null default now()
);

alter table quizzes enable row level security;

create policy "students_own_quizzes" on quizzes
  for all using (
    student_id in (select id from students where user_id = auth.uid())
  );

create policy "parents_view_linked_quizzes" on quizzes
  for select using (
    student_id in (select student_id from parent_links where parent_user_id = auth.uid())
  );

-- Tracks how often a specific mistake type recurs for a student on a topic —
-- this is what lets Professor Nombor eventually say "you've mixed up
-- denominators 4 times this month" instead of only reacting to one attempt.
create table mistake_patterns (
  student_id uuid not null references students(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  mistake_type text not null,
  frequency int not null default 1,
  last_seen_at timestamptz not null default now(),
  primary key (student_id, topic_id, mistake_type)
);

alter table mistake_patterns enable row level security;

create policy "students_own_mistake_patterns" on mistake_patterns
  for select using (
    student_id in (select id from students where user_id = auth.uid())
  );

create policy "parents_view_linked_mistake_patterns" on mistake_patterns
  for select using (
    student_id in (select student_id from parent_links where parent_user_id = auth.uid())
  );

-- Atomic upsert-and-increment — using a function avoids a read-then-write
-- race if a student submits attempts in quick succession.
create or replace function record_mistake_pattern(p_student_id uuid, p_topic_id uuid, p_mistake_type text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into mistake_patterns (student_id, topic_id, mistake_type, frequency, last_seen_at)
  values (p_student_id, p_topic_id, p_mistake_type, 1, now())
  on conflict (student_id, topic_id, mistake_type)
  do update set frequency = mistake_patterns.frequency + 1, last_seen_at = now();
$$;

revoke all on function record_mistake_pattern(uuid, uuid, text) from public;
grant execute on function record_mistake_pattern(uuid, uuid, text) to authenticated;
