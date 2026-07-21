-- Congak: Reading Coordinates (Y5) — the Coordinates/Ratio/Proportion
-- unit previously only had Y6 ratio simplification; this is the first
-- topic in the Coordinates strand itself. Sixth diagram kind:
-- CoordinateGridDiagram (first-quadrant grid, one plotted point, dashed
-- guide lines to each axis).
-- MCQ-only by design: the answer format "(x, y)" is too fragile for
-- exact-string "fill" grading (e.g. "(3,5)" vs "(3, 5)" would wrongly
-- fail) — see HANDOVER.md.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000024', 5, 'Koordinat', 'Membaca Koordinat', 5);
