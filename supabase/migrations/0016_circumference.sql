-- Congak: Circumference of a Circle (Y6) — first Space topic using
-- pi (3.142, the KSSR convention) and a decimal answer. Fourth diagram
-- kind: CircleDiagram (circle + labeled radius line).
-- Scope note: this covers circumference only. Area of a circle was
-- deliberately left for a later round — see HANDOVER.md.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000018', 6, 'Ruang', 'Lilitan Bulatan', 5);
