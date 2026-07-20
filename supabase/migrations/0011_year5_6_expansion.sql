-- Congak: expanding Year 5 and Year 6 coverage.
-- Same as 0010 — this insert exists only to satisfy the topics(id) foreign
-- key on practice_sessions/quizzes/exams. Full lesson content lives in
-- lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000007', 5, 'Ukuran dan Sukatan', 'Waktu dan Masa', 2),
  ('a1000000-0000-0000-0000-000000000008', 5, 'Statistik', 'Purata (Min)', 3),
  ('a1000000-0000-0000-0000-000000000009', 6, 'Nisbah', 'Nisbah Mudah', 2),
  ('a1000000-0000-0000-0000-000000000010', 6, 'Ukuran dan Sukatan', 'Isipadu Cecair', 3);
