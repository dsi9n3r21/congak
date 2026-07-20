-- Congak: Angles at a Point (Y5) — third topic to use the diagram
-- system, and the first with a multi-sector diagram (AnglesAtPointDiagram)
-- instead of a single angle or shape.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000017', 5, 'Ruang', 'Sudut Pada Satu Titik', 6);
