-- Congak: Reading Bar Graphs (Y5) — expands Data Handling beyond just
-- average/mean. Fifth diagram kind: BarChartDiagram (4 labeled bars,
-- values shown on top of each bar).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000023', 5, 'Statistik', 'Membaca Graf Palang', 4);
