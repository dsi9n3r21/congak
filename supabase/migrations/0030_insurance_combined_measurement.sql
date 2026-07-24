-- Congak: eighth round. Adds Y6 Money "Insurance and Takaful" (word-answer,
-- non-arithmetic — third generator of this kind alongside likelihood and
-- asset_liability; distinguishes by stated operating principle: Shariah/
-- mutual-contribution/no-riba vs. conventional/fixed-premium/company-run)
-- and Y6 "Combined Length and Mass" (first of the Y6 "combined measurement"
-- problems — mixes two measurement types in one scenario, asks for just
-- one to keep a single correctAnswer).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000068', 6, 'Wang', 'Insurans dan Takaful', 6),
  ('a1000000-0000-0000-0000-000000000069', 6, 'Ukuran dan Sukatan', 'Panjang dan Jisim Bergabung', 5);
