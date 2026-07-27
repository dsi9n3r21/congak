-- Congak: seventeenth round. Lynda asked directly whether Year 4
-- Coordinates/Ratio/Proportion were covered — they weren't at all (only
-- Y5/Y6 versions existed), despite this being confirmed in the real Y4
-- textbook ToC back in round 14 (Topic 7: "Recognise and Determine The
-- Coordinates, Mark Coordinates of Points, Ratio, Proportion", p.215+).
-- That gap slipped through because round 14 only cross-checked Space and
-- Data Handling for Y4, not Coordinates/Ratio/Proportion specifically.
-- Adds all three, each deliberately distinct from its later-year sibling:
--   - Reading Coordinates (reuses the existing `coordinates` generator
--     with a smaller gridSize=6, vs Y5's larger default grid)
--   - Ratio — write a ratio from a scenario (new `write_ratio` generator),
--     distinct from Y6's "Simple Ratio" (simplifying to simplest form)
--   - Proportion — unitary method (new `unitary_proportion` generator:
--     price-per-item scaling), distinct from Y5's ratio-based proportion
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000082', 4, 'Koordinat', 'Membaca Koordinat', 7),
  ('a1000000-0000-0000-0000-000000000083', 4, 'Nisbah', 'Nisbah', 8),
  ('a1000000-0000-0000-0000-000000000084', 4, 'Nisbah', 'Kadaran', 9);
