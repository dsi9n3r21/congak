-- Congak: fourteenth round (continuing the Math.zip-verified work).
-- Finished scoping Year 4's ToC (topics 5-8) using the same pdfplumber
-- CID-decode method as Y5/Y6, closing the one remaining blind spot from
-- round 12-13. Found two real Y4 gaps: Parallel/Perpendicular Lines
-- (Space) and Pictographs (Data Handling) — this migration adds
-- Pictographs, the more quiz-appropriate of the two.
--
-- Reading Pictographs (`pictograph`) — verified against the real Y4 ToC
-- (Data Handling, p.233-236). Added a new PictographDiagram (icon rows +
-- a key caption), the seventh diagram kind. Deliberately distinct from
-- bar_graph: the actual unit count is never shown directly, only icon
-- counts + a key — applying that key IS the skill being tested.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000077', 4, 'Statistik', 'Membaca Piktograf', 9);
