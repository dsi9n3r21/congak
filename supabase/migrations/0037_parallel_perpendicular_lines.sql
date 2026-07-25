-- Congak: fifteenth round (continuing the Math.zip-verified work).
-- Adds Parallel Lines and Perpendicular Lines (Y4 Space, real ToC p.201)
-- — the one Y4 gap flagged but not yet built at the end of round 14.
-- Added a new LinePairDiagram (parallel: offset lines with arrow-tick
-- marks; perpendicular: crossing lines with a right-angle square marker,
-- same convention as AngleDiagram; neither: crossing at a random other
-- angle), the eighth diagram kind. Word-based answer (parallel/
-- perpendicular/neither) via the existing optionLabels convention.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000078', 4, 'Ruang', 'Garis Selari dan Garis Serenjang', 6);
