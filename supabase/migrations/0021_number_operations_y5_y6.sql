-- Congak: closing more of the Numbers & Operations gap for Y5/Y6 —
-- previously Y5 only had multiplication and Y6 only had division.
-- Adds division by a 1-digit number (Y5), multiplication of a 4-digit
-- by a 2-digit number (Y6), and combined operations without brackets /
-- BODMAS (Y6, new topic — first "operasi bergabung" question type).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000025', 5, 'Nombor Bulat', 'Bahagi Dengan Nombor 1 Digit', 2),
  ('a1000000-0000-0000-0000-000000000026', 6, 'Nombor Bulat', 'Darab Nombor 4 Digit Dengan Nombor 2 Digit', 2),
  ('a1000000-0000-0000-0000-000000000027', 6, 'Nombor Bulat', 'Operasi Bergabung Tanpa Kurungan', 3);
