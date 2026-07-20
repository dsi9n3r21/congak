-- Congak: Types of Angles (Y4) — the first topic to use a rendered SVG
-- diagram (AngleDiagram) instead of a purely text-described question,
-- now that the Space unit has a diagram field on GeneratedQuestion.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000015', 4, 'Ruang', 'Jenis-Jenis Sudut', 5);
