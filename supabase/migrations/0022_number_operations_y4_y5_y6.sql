-- Congak: further closing the Numbers & Operations gap. Y4 previously had
-- no multiplication or division of its own (only addition/subtraction);
-- Y5/Y6 previously had no addition/subtraction of their own (only Y4 did).
-- Adds: Y4 multiplication (1-digit multiplier), Y4 division (1-digit
-- divisor), Y5 addition/subtraction (6-digit, up to 1,000,000), Y6
-- addition (three addends), Y6 subtraction (from a round number, forcing
-- cascading borrows across zero columns — the classic Y6 pain point).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000028', 4, 'Nombor Bulat', 'Darab Dengan Nombor 1 Digit', 3),
  ('a1000000-0000-0000-0000-000000000029', 4, 'Nombor Bulat', 'Bahagi Dengan Nombor 1 Digit', 4),
  ('a1000000-0000-0000-0000-000000000030', 5, 'Nombor Bulat', 'Tambah Nombor Bulat Hingga 1,000,000', 3),
  ('a1000000-0000-0000-0000-000000000031', 5, 'Nombor Bulat', 'Tolak Nombor Bulat Hingga 1,000,000', 4),
  ('a1000000-0000-0000-0000-000000000032', 6, 'Nombor Bulat', 'Tambah Tiga Nombor Bulat', 4),
  ('a1000000-0000-0000-0000-000000000033', 6, 'Nombor Bulat', 'Tolak Daripada Nombor Bulat', 5);
