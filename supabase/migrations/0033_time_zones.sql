-- Congak: eleventh round. Adds Time Zones (Y6 Measurement) — noted several
-- rounds ago as the one remaining Y6 Time sub-topic (the real book is
-- otherwise light on Y6 Time compared to Y4/Y5). Uses real non-DST cities
-- (Kuala Lumpur, Tokyo, Dubai, Moscow, Cairo, Karachi) with fixed GMT
-- offsets rather than fictional labels, since real-world GMT offsets are
-- the whole point of the topic — chosen specifically because none of them
-- observe daylight saving, so the offsets stay correct year-round.
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key. Full lesson content lives in lib/content/topics.ts.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000073', 6, 'Ukuran dan Sukatan', 'Zon Waktu', 9);
