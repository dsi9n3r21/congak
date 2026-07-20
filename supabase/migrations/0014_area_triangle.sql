-- Congak: Area of a Triangle (Y6) — second topic to use the diagram
-- system, reusing the diagram field added for Types of Angles. New
-- TriangleDiagram component renders base + dashed height line.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000016', 6, 'Ruang', 'Luas Segi Tiga', 4);
