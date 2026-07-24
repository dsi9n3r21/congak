-- Congak: seventh round. Adds Y5 Data Handling "Mode, Range, Median, and
-- Mean" (the four measures share one generator — the three NOT asked
-- about double as natural distractors, testing the specific real mistake
-- of confusing one statistic for another) and Y5 Money "Purchasing Via
-- Cash or Instalment" (comparing instalment total vs. cash price —
-- previously flagged as needing scoping since it's comparison-based
-- rather than a single clean arithmetic operation).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000066', 5, 'Statistik', 'Mod, Julat, Median, dan Min', 2),
  ('a1000000-0000-0000-0000-000000000067', 5, 'Wang', 'Beli Secara Tunai atau Ansuran', 5);
