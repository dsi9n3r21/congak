-- Congak: adding the Space unit (angles + area of composite shapes) —
-- zero coverage across all three years before this migration.
-- Same as 0010/0011 — this insert exists only to satisfy the topics(id)
-- foreign key on practice_sessions/quizzes/exams. Full lesson content
-- lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000011', 4, 'Ruang', 'Luas Segi Empat Tepat & Segi Empat Sama', 4),
  ('a1000000-0000-0000-0000-000000000012', 5, 'Ruang', 'Sudut Pada Garis Lurus', 4),
  ('a1000000-0000-0000-0000-000000000013', 5, 'Ruang', 'Luas Bentuk Gubahan', 5),
  ('a1000000-0000-0000-0000-000000000014', 6, 'Ruang', 'Jumlah Sudut Dalam Segi Tiga', 4);
