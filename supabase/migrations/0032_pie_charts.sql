-- Congak: tenth round. Adds Reading Pie Charts (Y6 Statistics) — the
-- last known content gap, since it needed an actual new diagram kind
-- (a proper SVG pie chart, not just a variant of an existing shape).
-- Sectors are labeled directly with their fraction (e.g. "A 1/4"), same
-- convention as the existing bar_graph topic's generic A/B/C/D labels,
-- so no bilingual text needs to live inside the SVG.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000072', 6, 'Statistik', 'Membaca Carta Pai', 8);
