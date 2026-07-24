-- Congak: third round of closing curriculum gaps from the real KSSR
-- textbooks. Adds a generic reusable "unit_convert" generator (Length,
-- Mass, Volume of Liquid, and Time conversions are all structurally
-- identical — one generator, many topic configs) covering 5 new
-- conversion topics, plus Y6 Money "Discount" and Y6 Data Handling
-- "Likelihood" (first non-arithmetic, word-answer Data Handling topic —
-- reuses the OPTION_LABELS convention from angles_classify).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000045', 4, 'Ukuran dan Sukatan', 'Tukar Unit Panjang', 4),
  ('a1000000-0000-0000-0000-000000000046', 5, 'Ukuran dan Sukatan', 'Tukar Unit Jisim', 1),
  ('a1000000-0000-0000-0000-000000000047', 5, 'Ukuran dan Sukatan', 'Tukar Unit Isipadu Cecair', 2),
  ('a1000000-0000-0000-0000-000000000048', 4, 'Ukuran dan Sukatan', 'Tukar Unit Masa', 5),
  ('a1000000-0000-0000-0000-000000000049', 5, 'Ukuran dan Sukatan', 'Tukar Unit Masa Lanjutan', 3),
  ('a1000000-0000-0000-0000-000000000050', 6, 'Wang', 'Diskaun', 2),
  ('a1000000-0000-0000-0000-000000000051', 6, 'Statistik', 'Kebarangkalian', 1);
