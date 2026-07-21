-- Congak: expanding Numbers & Operations — previously only addition (Y4)
-- was covered. Adds subtraction (Y4), multiplication by a 2-digit number
-- (Y5), and division by a 2-digit number (Y6).
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000020', 4, 'Nombor Bulat', 'Tolak Nombor Bulat Hingga 100000', 2),
  ('a1000000-0000-0000-0000-000000000021', 5, 'Nombor Bulat', 'Darab Dengan Nombor 2 Digit', 1),
  ('a1000000-0000-0000-0000-000000000022', 6, 'Nombor Bulat', 'Bahagi Dengan Nombor 2 Digit', 1);
