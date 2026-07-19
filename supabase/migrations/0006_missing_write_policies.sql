-- Congak: missing write policies for students + topic_mastery.
-- 0001_init.sql only added SELECT policies for these two tables. That's
-- enough to view data but RLS denies writes by default with no matching
-- policy — which is why profile creation (students insert), XP updates
-- (students update), and mastery tracking (topic_mastery upsert) were all
-- silently failing.

create policy "students_insert_own" on students
  for insert
  with check (user_id = auth.uid());

create policy "students_update_own" on students
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "students_manage_own_mastery" on topic_mastery
  for insert
  with check (student_id in (select id from students where user_id = auth.uid()));

create policy "students_update_own_mastery" on topic_mastery
  for update
  using (student_id in (select id from students where user_id = auth.uid()))
  with check (student_id in (select id from students where user_id = auth.uid()));
