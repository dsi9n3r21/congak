-- Congak: Phase 1 content seed — Year 4, one topic per launch strand.
-- Deliberately narrow (3 topics, not the full syllabus) to prove the
-- learn -> practice -> mistake-feedback loop before scaling content breadth.

insert into topics (id, year_level, strand, title, order_index) values
  ('a1000000-0000-0000-0000-000000000001', 4, 'Nombor Bulat', 'Tambah Dalam Lingkungan 100 000', 1),
  ('a1000000-0000-0000-0000-000000000002', 4, 'Pecahan', 'Tambah Pecahan Penyebut Sama', 1),
  ('a1000000-0000-0000-0000-000000000003', 4, 'Wang', 'Kira Baki Wang (Ringgit & Sen)', 1);

insert into lessons (topic_id, explanation_md, tips_md, worked_examples_json, common_mistakes_json) values
(
  'a1000000-0000-0000-0000-000000000001',
  'Apabila kita menambah dua nombor besar, kita susun nombor ikut nilai tempat: ratus ribu, puluh ribu, ribu, ratus, puluh, sa. Kita tambah dari lajur sa (kanan sekali) dahulu, dan "simpan" jika jumlah lebih 9.\n\nContoh harian: Kedai buku ada 45,320 pensel dan terima 12,150 pensel baru. Berapa jumlah pensel sekarang?',
  'Susun nombor ikut nilai tempat dengan kemas — guna kertas berpetak jika perlu. Sentiasa mula tambah dari lajur paling kanan (sa).',
  '[{"problem": "45320 + 12150", "steps": ["Susun ikut nilai tempat", "0+0=0 (sa)", "2+5=7 (puluh)", "3+1=4 (ratus)", "5+2=7 (ribu)", "4+1=5 (puluh ribu)"], "answer": 57470}]'::jsonb,
  '[{"mistake_type": "place_value_misalignment", "description": "Murid tidak susun nombor ikut nilai tempat dengan betul, menyebabkan digit ditambah pada lajur yang salah."}, {"mistake_type": "forgot_carry", "description": "Murid terlupa \"simpan\" apabila jumlah lajur melebihi 9."}]'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000002',
  'Apabila penyebut (nombor bawah) dua pecahan adalah SAMA, kita hanya tambah pengangka (nombor atas) sahaja. Penyebut kekal sama.\n\nContoh: 2/5 + 1/5 = (2+1)/5 = 3/5. Bayangkan 5 keping pizza dipotong sama besar — kita ambil 2 keping, kemudian 1 keping lagi.',
  'Penyebut sama = kongsi saiz bahagian yang sama. Hanya nombor atas (pengangka) yang berubah.',
  '[{"problem": "3/8 + 2/8", "steps": ["Penyebut sama, kekalkan 8", "Tambah pengangka: 3+2=5"], "answer": "5/8"}]'::jsonb,
  '[{"mistake_type": "denominator_addition_error", "description": "Murid turut menambah penyebut (contoh: 2/5 + 1/5 dijawab 3/10), sedangkan penyebut sepatutnya kekal."}]'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000003',
  'Baki wang ialah beza antara wang yang dibayar dengan harga barang. Kita tolak: Wang Dibayar − Harga Barang = Baki.\n\nContoh: Ali beli air kotak RM2.50 di kantin dan bayar dengan RM5.00. Baki = RM5.00 − RM2.50 = RM2.50.',
  'Tukar semua kepada sen dahulu (RM5.00 = 500 sen) supaya lebih mudah tolak, kemudian tukar balik kepada RM jika perlu.',
  '[{"problem": "RM10.00 - RM6.30", "steps": ["Tukar kepada sen: 1000 sen - 630 sen", "= 370 sen", "Tukar balik: RM3.70"], "answer": "RM3.70"}]'::jsonb,
  '[{"mistake_type": "ringgit_sen_conversion_error", "description": "Murid tersilap semasa menukar antara ringgit dan sen (contoh: RM2.5 dianggap RM2.05)."}, {"mistake_type": "subtraction_borrow_error", "description": "Murid tersilap semasa proses \"pinjam\" dalam penolakan berlajur."}]'::jsonb
);

-- Question templates reference a generator_key that maps to a function in
-- lib/questions/generators/ — the actual randomized numbers are produced
-- client/server-side at request time, never stored row-by-row here.
insert into question_templates (topic_id, type, difficulty, generator_config_json) values
  ('a1000000-0000-0000-0000-000000000001', 'mcq',  1, '{"generator_key": "whole_numbers_addition", "min": 10000, "max": 99000}'::jsonb),
  ('a1000000-0000-0000-0000-000000000001', 'fill', 2, '{"generator_key": "whole_numbers_addition", "min": 20000, "max": 99999}'::jsonb),
  ('a1000000-0000-0000-0000-000000000002', 'mcq',  1, '{"generator_key": "fractions_same_denominator", "denominators": [4,5,6,8,10]}'::jsonb),
  ('a1000000-0000-0000-0000-000000000002', 'fill', 2, '{"generator_key": "fractions_same_denominator", "denominators": [6,8,10,12]}'::jsonb),
  ('a1000000-0000-0000-0000-000000000003', 'mcq',  1, '{"generator_key": "money_change", "maxPaid": 20, "maxPrice": 15}'::jsonb),
  ('a1000000-0000-0000-0000-000000000003', 'word_problem', 2, '{"generator_key": "money_change", "maxPaid": 50, "maxPrice": 45, "context": "canteen"}'::jsonb);
