-- Congak: sixth round. Completes all 4 KSSR fraction-division sub-topics
-- (proper÷whole and mixed÷whole were done in earlier rounds; this adds
-- proper÷proper and mixed÷proper, the "flip and multiply" pair). Also
-- adds a generic reusable Y5 time-unit add/subtract generator (years/
-- months, decades/years — same one-generator-many-configs approach as
-- unit_convert), and Y6 "Distance Between Two Coordinates" (horizontal/
-- vertical only, pure arithmetic — no new diagram needed).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000062', 6, 'Pecahan', 'Bahagi Pecahan Dengan Pecahan', 3),
  ('a1000000-0000-0000-0000-000000000063', 6, 'Pecahan', 'Bahagi Nombor Bercampur Dengan Pecahan', 4),
  ('a1000000-0000-0000-0000-000000000064', 5, 'Ukuran dan Sukatan', 'Tambah & Tolak Masa (Unit Lebih Besar)', 4),
  ('a1000000-0000-0000-0000-000000000065', 6, 'Koordinat', 'Jarak Antara Dua Koordinat', 1);
