-- Congak: Area of a Circle (Y6) — the follow-up to Circumference of a
-- Circle (0016), reusing the same CircleDiagram and π = 3.142 convention.
-- This completes the Space unit's planned scope.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000019', 6, 'Ruang', 'Luas Bulatan', 6);
