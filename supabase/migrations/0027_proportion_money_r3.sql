-- Congak: fifth round — Coordinates/Ratio/Proportion (Y5 proportion, a
-- strand previously only had Y5 coordinates + Y6 ratio simplification)
-- and more of Y6 Money's richer real-textbook content (service tax,
-- dividend, asset/liability classification — the latter is Congak's
-- second word-answer, non-arithmetic generator alongside likelihood).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000058', 5, 'Koordinat', 'Perkadaran Untuk Cari Nilai', 2),
  ('a1000000-0000-0000-0000-000000000059', 6, 'Wang', 'Invois, Resit, dan Cukai Perkhidmatan', 3),
  ('a1000000-0000-0000-0000-000000000060', 6, 'Wang', 'Faedah dan Dividen', 4),
  ('a1000000-0000-0000-0000-000000000061', 6, 'Wang', 'Aset dan Liabiliti', 5);
