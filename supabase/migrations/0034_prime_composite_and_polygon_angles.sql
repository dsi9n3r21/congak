-- Congak: twelfth round. First round done with Math.zip (the real KSSR
-- textbooks) actually available — used pdfplumber's raw CID text to read
-- the Year 6 table of contents (Year 4/5's ToC text uses an obfuscated
-- custom font that garbles plain pdftotext output; Year 6's happened to
-- extract cleanly). Confirmed several already-shipped topics match the
-- real book exactly (Y6 combined measurement, Y6 time zones, Y6 pie
-- charts, Y6 likelihood, division of fractions) and found two genuine
-- gaps, both added here:
--   - Prime Numbers and Composite Numbers (Numbers and Operations, real
--     ToC: p.42)
--   - Interior Angles of Regular Polygons (Space, real ToC: p.168-177;
--     Regular Heptagon deliberately excluded — its interior angle is a
--     non-terminating decimal, no clean quiz answer, and the real book
--     covers it as a hands-on measuring exercise anyway)
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000074', 6, 'Nombor dan Operasi', 'Nombor Perdana dan Nombor Gubahan', 2),
  ('a1000000-0000-0000-0000-000000000075', 6, 'Ruang', 'Sudut Pedalaman Poligon Sekata', 10);
