-- Congak: first round of closing the Fractions/Decimals/Percentages gap —
-- identified as the biggest curriculum gap after cross-checking against
-- the real official KSSR Year 4/5/6 textbooks (see HANDOVER.md). Adds:
-- Y4 fraction subtraction (same denominator, pairs with existing Y4
-- fraction addition), Y4 decimal add/subtract at 1 decimal place (Y4 had
-- ZERO decimal topics before this — the existing decimal_add_subtract
-- generator is 2-decimal-place, which is the Y5 level), Y5 decimal
-- multiplication and division (completing the 4-operations set for Y5
-- decimals), and Y6 fraction division by a whole number (first of four
-- fraction-division sub-topics in the real textbook — starting with the
-- simplest).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000034', 4, 'Pecahan', 'Tolak Pecahan Penyebut Sama', 2),
  ('a1000000-0000-0000-0000-000000000035', 4, 'Perpuluhan', 'Tambah & Tolak Perpuluhan (1 Tempat Perpuluhan)', 1),
  ('a1000000-0000-0000-0000-000000000036', 5, 'Perpuluhan', 'Darab Perpuluhan', 2),
  ('a1000000-0000-0000-0000-000000000037', 5, 'Perpuluhan', 'Bahagi Perpuluhan', 3),
  ('a1000000-0000-0000-0000-000000000038', 6, 'Pecahan', 'Bahagi Pecahan Dengan Nombor Bulat', 1);
