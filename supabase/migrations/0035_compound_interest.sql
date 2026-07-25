-- Congak: thirteenth round (continuing round twelve's Math.zip-verified
-- work). Adds Compound Interest (Y5 Money, Financial Literacy) — the real
-- ToC lists it as "Simple Interest and Compound Interest" together;
-- Simple Interest was already covered, this was the missing sibling.
-- Computed year-by-year on the running total (not the closed-form
-- P(1+r)^t formula), matching how the real primary curriculum presents
-- it — the exponential formula is beyond this level.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000076', 5, 'Wang', 'Faedah Kompaun', 3);
