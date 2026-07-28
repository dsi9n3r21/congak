-- Congak: eighteenth round. Lynda's brief (adapted from a richer curriculum-
-- architect schema down to Congak's actual TopicContent/generator pipeline)
-- flagged the one real gap in Y5 Time: converting between 12-hour and
-- 24-hour format. Congak already had clock-time+duration (Waktu dan Masa,
-- id ...007) and duration+duration (Tambah & Tolak Masa, id ...043) but
-- nothing for format conversion itself.
--
-- New generator `time_format_convert` (lib/questions/generators/time.ts)
-- covers both directions (to24/to12), the noon/midnight special case,
-- a bus-schedule word-problem wrapper with an irrelevant-info decoy, an
-- error-spotting variant, and a reverse problem chained with duration
-- addition. Full lesson content lives in lib/content/topics.ts.
--
-- Same as prior migrations — this insert exists only to satisfy the
-- topics(id) foreign key.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000085', 5, 'Ukuran dan Sukatan', 'Format 12 Jam dan 24 Jam', 5);
