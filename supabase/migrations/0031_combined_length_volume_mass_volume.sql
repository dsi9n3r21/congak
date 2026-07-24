-- Congak: ninth round. Adds the remaining two Y6 "combined measurement"
-- pairings — Combined Length and Volume (garden hose + fertiliser bottle)
-- and Combined Mass and Volume (recipe: flour + milk) — completing all
-- three combinations (length+mass was added in migration 0030). Same
-- single-correctAnswer pattern: ask for just one of the two quantities.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000070', 6, 'Ukuran dan Sukatan', 'Panjang dan Isipadu Bergabung', 6),
  ('a1000000-0000-0000-0000-000000000071', 6, 'Ukuran dan Sukatan', 'Jisim dan Isipadu Bergabung', 7);
