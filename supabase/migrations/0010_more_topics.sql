-- Congak: 3 new topics expanding coverage into Year 5 and Year 6.
-- Full lesson content (explanations, tips, worked examples) lives in
-- lib/content/topics.ts, not duplicated here — this insert exists only
-- because practice_sessions/quizzes/exams all have a foreign key to
-- topics(id), so a topic must exist here before progress on it can be
-- saved, even though the UI itself renders from the TypeScript file.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000004', 4, 'Ukuran dan Sukatan', 'Perimeter Bentuk Mudah', 2),
  ('a1000000-0000-0000-0000-000000000005', 5, 'Perpuluhan', 'Tambah & Tolak Perpuluhan', 1),
  ('a1000000-0000-0000-0000-000000000006', 6, 'Peratus', 'Peratus Asas', 1);
