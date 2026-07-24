-- Congak: fourth round closing Fractions/Decimals/Percentages gaps —
-- still flagged as the single biggest gap after cross-checking the real
-- KSSR textbooks. Adds: Y4 percentage of a quantity (reuses the existing
-- percentage_of_quantity generator with a smaller/simpler config — no new
-- code needed), Y4 fraction↔percentage conversion, Y5 fraction
-- multiplication, Y5 decimal↔percentage conversion (shares a generator
-- with the Y6 topic below via config, same efficiency idea as
-- unit_convert), Y6 percentage addition/subtraction, and Y6 dividing a
-- mixed number by a whole number (second of four fraction-division
-- sub-topics — see migration 0021 for the first).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000052', 4, 'Peratus', 'Peratus Suatu Kuantiti (Asas)', 1),
  ('a1000000-0000-0000-0000-000000000053', 4, 'Pecahan', 'Tukar Pecahan dan Peratus', 3),
  ('a1000000-0000-0000-0000-000000000054', 5, 'Pecahan', 'Darab Pecahan', 1),
  ('a1000000-0000-0000-0000-000000000055', 5, 'Perpuluhan', 'Tukar Perpuluhan dan Peratus', 4),
  ('a1000000-0000-0000-0000-000000000056', 6, 'Peratus', 'Tambah & Tolak Peratus', 2),
  ('a1000000-0000-0000-0000-000000000057', 6, 'Pecahan', 'Bahagi Nombor Bercampur Dengan Nombor Bulat', 2);
