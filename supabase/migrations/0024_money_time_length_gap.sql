-- Congak: second round of closing curriculum gaps identified from the
-- real KSSR textbooks — Money (previously only Y4 "giving change" existed)
-- and Time/Length (previously almost nothing beyond Y5 duration and Y4
-- perimeter). Adds: Y4 money add/subtract and multiply/divide, Y5 simple
-- interest (financial literacy), Y6 profit and loss, Y4 time add/subtract
-- (hours and minutes, base-60 carrying), and Y4 length add/subtract
-- (metres and centimetres, base-100 carrying — same pattern as money's
-- RM/sen). Both Money and Time/Length remain far from fully scoped — see
-- HANDOVER.md for what's still missing (Y6 money is especially rich:
-- discounts, invoices, insurance/takaful; Y5 has a large time-unit-
-- conversion section not touched here).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000039', 4, 'Wang', 'Tambah & Tolak Wang', 2),
  ('a1000000-0000-0000-0000-000000000040', 4, 'Wang', 'Darab & Bahagi Wang', 3),
  ('a1000000-0000-0000-0000-000000000041', 5, 'Wang', 'Faedah Mudah', 1),
  ('a1000000-0000-0000-0000-000000000042', 6, 'Wang', 'Untung dan Rugi', 1),
  ('a1000000-0000-0000-0000-000000000043', 4, 'Ukuran dan Sukatan', 'Tambah & Tolak Masa', 2),
  ('a1000000-0000-0000-0000-000000000044', 4, 'Ukuran dan Sukatan', 'Tambah & Tolak Panjang', 3);
