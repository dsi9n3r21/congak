// TEMP: mirrors supabase/migrations/0002_seed_content.sql exactly.
// Once auth + data fetching are wired (Phase 1.5), replace these with
// real `supabase.from('topics').select(...)` calls in server components —
// the shapes below are intentionally identical to the DB rows so that
// swap is a drop-in, not a rewrite.

export interface TopicContent {
  id: string;
  strand: string;
  title: string;
  yearLevel: number;
  explanation: string;
  tips: string;
  workedExample: { problem: string; steps: string[]; answer: string | number };
  commonMistakes: { mistakeType: string; description: string }[];
  questionTemplates: { type: "mcq" | "fill" | "word_problem"; difficulty: number; generatorKey: string; config: Record<string, unknown> }[];
}

export const TOPICS: Record<string, TopicContent> = {
  "a1000000-0000-0000-0000-000000000001": {
    id: "a1000000-0000-0000-0000-000000000001",
    strand: "Nombor Bulat",
    title: "Tambah Dalam Lingkungan 100 000",
    yearLevel: 4,
    explanation:
      "Apabila kita menambah dua nombor besar, kita susun nombor ikut nilai tempat: ratus ribu, puluh ribu, ribu, ratus, puluh, sa. Kita tambah dari lajur sa (kanan sekali) dahulu, dan \"simpan\" jika jumlah lebih 9.\n\nContoh harian: Kedai buku ada 45,320 pensel dan terima 12,150 pensel baru. Berapa jumlah pensel sekarang?",
    tips: "Susun nombor ikut nilai tempat dengan kemas — guna kertas berpetak jika perlu. Sentiasa mula tambah dari lajur paling kanan (sa).",
    workedExample: {
      problem: "45320 + 12150",
      steps: ["Susun ikut nilai tempat", "0+0=0 (sa)", "2+5=7 (puluh)", "3+1=4 (ratus)", "5+2=7 (ribu)", "4+1=5 (puluh ribu)"],
      answer: 57470,
    },
    commonMistakes: [
      { mistakeType: "place_value_misalignment", description: "Murid tidak susun nombor ikut nilai tempat dengan betul." },
      { mistakeType: "forgot_carry", description: "Murid terlupa \"simpan\" apabila jumlah lajur melebihi 9." },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_addition", config: { min: 10000, max: 99000 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_addition", config: { min: 20000, max: 99999 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000002": {
    id: "a1000000-0000-0000-0000-000000000002",
    strand: "Pecahan",
    title: "Tambah Pecahan Penyebut Sama",
    yearLevel: 4,
    explanation:
      "Apabila penyebut (nombor bawah) dua pecahan adalah SAMA, kita hanya tambah pengangka (nombor atas) sahaja. Penyebut kekal sama.\n\nContoh: 2/5 + 1/5 = (2+1)/5 = 3/5. Bayangkan 5 keping pizza dipotong sama besar — kita ambil 2 keping, kemudian 1 keping lagi.",
    tips: "Penyebut sama = kongsi saiz bahagian yang sama. Hanya nombor atas (pengangka) yang berubah.",
    workedExample: {
      problem: "3/8 + 2/8",
      steps: ["Penyebut sama, kekalkan 8", "Tambah pengangka: 3+2=5"],
      answer: "5/8",
    },
    commonMistakes: [
      { mistakeType: "denominator_addition_error", description: "Murid turut menambah penyebut (2/5 + 1/5 dijawab 3/10)." },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "fractions_same_denominator", config: { denominators: [4, 5, 6, 8, 10] } },
      { type: "fill", difficulty: 2, generatorKey: "fractions_same_denominator", config: { denominators: [6, 8, 10, 12] } },
    ],
  },
  "a1000000-0000-0000-0000-000000000003": {
    id: "a1000000-0000-0000-0000-000000000003",
    strand: "Wang",
    title: "Kira Baki Wang (Ringgit & Sen)",
    yearLevel: 4,
    explanation:
      "Baki wang ialah beza antara wang yang dibayar dengan harga barang. Kita tolak: Wang Dibayar − Harga Barang = Baki.\n\nContoh: Ali beli air kotak RM2.50 di kantin dan bayar dengan RM5.00. Baki = RM5.00 − RM2.50 = RM2.50.",
    tips: "Tukar semua kepada sen dahulu (RM5.00 = 500 sen) supaya lebih mudah tolak, kemudian tukar balik kepada RM jika perlu.",
    workedExample: {
      problem: "RM10.00 - RM6.30",
      steps: ["Tukar kepada sen: 1000 sen - 630 sen", "= 370 sen", "Tukar balik: RM3.70"],
      answer: "RM3.70",
    },
    commonMistakes: [
      { mistakeType: "ringgit_sen_conversion_error", description: "Murid tersilap semasa menukar antara ringgit dan sen." },
      { mistakeType: "subtraction_borrow_error", description: "Murid tersilap semasa proses \"pinjam\" dalam penolakan berlajur." },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "money_change", config: { maxPaid: 20, maxPrice: 15 } },
      { type: "word_problem", difficulty: 2, generatorKey: "money_change", config: { maxPaid: 50, maxPrice: 45, context: "canteen" } },
    ],
  },
};
