-- Congak: sixteenth round (continuing the Math.zip-verified work).
-- Closes the last two known real gaps from round 12-14's scoping pass:
--   - Volume of a Cuboid (Y4 Space, real ToC p.209) — the prerequisite
--     that was missing entirely (Congak previously had only liquid
--     volume in ml/L, no solid volume at all)
--   - Volume of Composite Shapes (Y5 Space, real ToC p.217-224) — two
--     cuboids combined, same pattern as the existing area_composite
--   - Perimeter of Composite Shapes (Y5 Space, real ToC p.217) — uses
--     the L-shape bounding-box invariant (cutting a corner notch out of
--     a rectangle doesn't change its perimeter), which is the actual
--     insight this topic tests
-- No new diagrams needed — mirrors area_composite's text-only pattern.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000079', 4, 'Ruang', 'Isi Padu Kuboid', 7),
  ('a1000000-0000-0000-0000-000000000080', 5, 'Ruang', 'Isi Padu Bentuk Gubahan', 8),
  ('a1000000-0000-0000-0000-000000000081', 5, 'Ruang', 'Perimeter Bentuk Gubahan', 9);
