// TEMP: mirrors supabase/migrations/0002_seed_content.sql exactly.
// Once auth + data fetching are wired (Phase 1.5), replace these with
// real `supabase.from('topics').select(...)` calls in server components —
// the shapes below are intentionally identical to the DB rows so that
// swap is a drop-in, not a rewrite.
//
// NOTE: 0002_seed_content.sql itself still only has Malay text — it isn't
// actually read by any screen (everything renders from this file), so it's
// a known stale duplicate rather than a live inconsistency. Worth reconciling
// once content moves fully into the database.

import type { Bilingual } from "@/lib/i18n/dictionary";
import type { DiagramSpec } from "@/lib/questions/types";

/** One worked example's shape — reused for the primary `workedExample`
 * and every entry in `moreExamples`. `diagram` is optional: only the
 * topics whose question generators show a diagram (angles, triangles,
 * circles, bar/pie charts, pictographs, line pairs, coordinate grids)
 * carry one, and its numbers always match the example's own `problem`/
 * `steps`/`answer` text — never a different illustrative example. */
interface WorkedExampleContent {
  problem: Bilingual;
  steps: Bilingual[];
  answer: string | number;
  diagram?: DiagramSpec;
}

export interface TopicContent {
  id: string;
  /** KSSR "Tajuk" — the sub-topic within a bidang, e.g. "Wang", "Ruang". */
  strand: Bilingual;
  /** KSSR "Bidang Pembelajaran" — the main learning area `strand` nests
   * under. One of the 4 values in BIDANG below. */
  bidang: Bilingual;
  title: Bilingual;
  yearLevel: number;
  explanation: Bilingual;
  /** Short standalone reminders/shortcuts — shown as a bulleted list. */
  tips: Bilingual[];
  /** General, number-free method steps ("how to solve this type of question") —
   * distinct from workedExample, which walks one specific set of numbers. */
  howTo: Bilingual[];
  workedExample: WorkedExampleContent;
  /** Optional additional worked examples beyond the first, shown as
   * "Example 2", "Example 3" etc. in the same tab. Optional so existing
   * topics keep working untouched while content gets filled in gradually. */
  moreExamples?: WorkedExampleContent[];
  commonMistakes: {
    mistakeType: string;
    description: Bilingual;
    /** The wrong way, step by step — shown in a red "❌ Don't do this" card.
     * Optional: falls back to just the description when not yet filled in. */
    wrongSteps?: Bilingual[];
    /** The correct way for the same problem, step by step — shown in a
     * green "✅ Do this instead" card right next to wrongSteps. */
    correctSteps?: Bilingual[];
  }[];
  questionTemplates: { type: "mcq" | "fill" | "word_problem"; difficulty: number; generatorKey: string; config: Record<string, unknown> }[];
}

// The 4 official KSSR "Bidang Pembelajaran" (learning areas). `strand`
// above is the "Tajuk" (sub-topic) level nested under one of these —
// verified against DSKP Matematik KSSR (Semakan 2017) Tahun 4-6.
const BIDANG = {
  numbersOperations: { ms: "Nombor dan Operasi", en: "Numbers and Operations" },
  measurementGeometry: { ms: "Sukatan dan Geometri", en: "Measurement and Geometry" },
  relationshipAlgebra: { ms: "Perkaitan dan Algebra", en: "Relationship and Algebra" },
  statisticsProbability: { ms: "Statistik dan Kebarangkalian", en: "Statistics and Probability" },
} as const;

export const TOPICS: Record<string, TopicContent> = {
  "a1000000-0000-0000-0000-000000000001": {
    id: "a1000000-0000-0000-0000-000000000001",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tambah Dalam Lingkungan 100 000", en: "Addition Within 100,000" },
    yearLevel: 4,
    explanation: {
      ms: "Apabila kita menambah dua nombor besar, kita susun nombor ikut nilai tempat: puluh ribu, ribu, ratus, puluh, sa. Kita tambah dari lajur sa (kanan sekali) dahulu, dan \"simpan\" jika jumlah lebih 9.\n\nContoh harian: Kedai buku ada 32,450 pensel dan terima 18,600 pensel baru. Berapa jumlah pensel sekarang?",
      en: "When adding two large numbers, we line them up by place value: ten thousands, thousands, hundreds, tens, ones. We add starting from the ones column (rightmost) first, and \"carry\" whenever a column's total is more than 9.\n\nEveryday example: A bookshop has 32,450 pencils and receives 18,600 new ones. How many pencils are there now?",
    },
    tips: [
      {
        ms: "Susun nombor ikut nilai tempat dengan kemas — guna kertas berpetak jika perlu. Sentiasa mula tambah dari lajur paling kanan (sa).",
        en: "Line up numbers neatly by place value — use grid paper if it helps. Always start adding from the rightmost column (ones).",
      },
      {
        ms: "Anggarkan jawapan dahulu dengan membundarkan kedua-dua nombor — ini membantu anda kesan jika jawapan akhir tidak masuk akal.",
        en: "Estimate the answer first by rounding both numbers — this helps you catch it if your final answer doesn't make sense.",
      },
      {
        ms: "JANGAN buat ini: 3245 + 186 disusun sa bertentang sa dengan sa terakhir sahaja (bukan ikut nilai tempat sebenar), lalu jawab 5105. SALAH — anda MESTI susun ikut nilai tempat (sa di bawah sa). Jawapan yang betul ialah 3431.",
        en: "DON'T do this: 3245 + 186 lined up flush-right by digit count (not real place value), then answered 5105. WRONG — you MUST line up by place value (ones under ones). The correct answer is 3431.",
      },
      {
        ms: "Cabaran: jika ada DUA penghantaran berturutan, jangan berhenti selepas yang pertama — tambah KETIGA-TIGA nombor (jumlah asal + penghantaran pertama + penghantaran kedua).",
        en: "Challenge: if there are TWO deliveries one after another, don't stop after the first — add all THREE numbers (original amount + first delivery + second delivery).",
      },
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor menegak, ikut nilai tempat (sa di bawah sa, puluh di bawah puluh, dan seterusnya).", en: "Line the two numbers up vertically, matching place value (ones under ones, tens under tens, and so on)." },
      { ms: "Tambah lajur sa (paling kanan) dahulu.", en: "Add the ones column (rightmost) first." },
      { ms: "Jika jumlah lajur itu 10 atau lebih, tulis digit sa dan \"simpan\" 1 ke lajur sebelah kiri.", en: "If that column's total is 10 or more, write down the ones digit and \"carry\" the 1 to the column on the left." },
      { ms: "Ulang proses ini bagi setiap lajur sehingga ke kiri sekali.", en: "Repeat this for every column, moving left, until you reach the last one." },
    ],
    workedExample: {
      problem: { ms: "32450 + 18600", en: "32450 + 18600" },
      steps: [
        { ms: "Susun ikut nilai tempat", en: "Line up by place value" },
        { ms: "0+0=0 (sa)", en: "0+0=0 (ones)" },
        { ms: "5+0=5 (puluh)", en: "5+0=5 (tens)" },
        { ms: "4+6=10, tulis 0 simpan 1 (ratus)", en: "4+6=10, write 0 carry 1 (hundreds)" },
        { ms: "2+8+1(simpan)=11, tulis 1 simpan 1 (ribu)", en: "2+8+1(carried)=11, write 1 carry 1 (thousands)" },
        { ms: "3+1+1(simpan)=5 (puluh ribu)", en: "3+1+1(carried)=5 (ten thousands)" },
      ],
      answer: 51050,
      diagram: { kind: "vertical_arithmetic", operands: ["32450", "18600"], operator: "+", result: "51050" },
    },
    moreExamples: [
      {
        problem: { ms: "47250 + 6890", en: "47250 + 6890" },
        steps: [
          { ms: "Susun ikut nilai tempat", en: "Line up by place value" },
          { ms: "0+0=0 (sa)", en: "0+0=0 (ones)" },
          { ms: "5+9=14, tulis 4 simpan 1 (puluh)", en: "5+9=14, write 4 carry 1 (tens)" },
          { ms: "2+8+1(simpan)=11, tulis 1 simpan 1 (ratus)", en: "2+8+1(carried)=11, write 1 carry 1 (hundreds)" },
          { ms: "7+6+1(simpan)=14, tulis 4 simpan 1 (ribu)", en: "7+6+1(carried)=14, write 4 carry 1 (thousands)" },
          { ms: "4+0+1(simpan)=5 (puluh ribu)", en: "4+0+1(carried)=5 (ten thousands)" },
        ],
        answer: 54140,
      },
    ],
    commonMistakes: [
      {
        mistakeType: "place_value_misalignment",
        description: { ms: "Murid tidak susun nombor ikut nilai tempat dengan betul.", en: "The student doesn't line up digits by the correct place value column." },
        wrongSteps: [
          { ms: "3245 + 186 disusun sa bertentang sa dengan sa terakhir sahaja:", en: "3245 + 186 lined up flush-right by digit count, not place value:" },
          { ms: "  3245", en: "  3245" },
          { ms: "+  186", en: "+  186" },
          { ms: "= 5105 ✗ (silap — 1 disamakan dengan lajur ratus)", en: "= 5105 ✗ (wrong — the 1 got matched to the hundreds column)" },
        ],
        correctSteps: [
          { ms: "Susun ikut nilai tempat sebenar (sa di bawah sa):", en: "Line up by actual place value (ones under ones):" },
          { ms: "  3245", en: "  3245" },
          { ms: "+ 0186", en: "+ 0186" },
          { ms: "= 3431 ✓", en: "= 3431 ✓" },
        ],
      },
      {
        mistakeType: "forgot_carry",
        description: { ms: "Murid terlupa \"simpan\" apabila jumlah lajur melebihi 9.", en: "The student forgets to \"carry\" when a column's total is more than 9." },
        wrongSteps: [
          { ms: "4+6=10 di lajur ratus, tulis \"10\" terus tanpa simpan", en: "4+6=10 in the hundreds column, writes \"10\" straight down without carrying" },
          { ms: "Jawapan jadi bercampur digit — jumlah akhir salah", en: "The answer ends up with a stray extra digit — final total is wrong" },
        ],
        correctSteps: [
          { ms: "4+6=10 — tulis 0, simpan 1 ke lajur ribu", en: "4+6=10 — write down 0, carry the 1 to the thousands column" },
          { ms: "Tambah 1 (simpan) itu bersama lajur ribu seterusnya", en: "Add that carried 1 into the next (thousands) column's total" },
        ],
      },
      { mistakeType: "wrong_operation", description: { ms: "Murid menolak berbanding menambah (atau sebaliknya) apabila menyelesaikan masalah.", en: "The student subtracts instead of adding (or vice versa) when solving the problem." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak anggarkan jawapan dahulu, jadi tidak perasan jawapan akhir tidak masuk akal.", en: "The student doesn't estimate the answer first, so doesn't notice when the final answer doesn't make sense." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan dua penghantaran, murid berhenti selepas penghantaran PERTAMA dan lupa tambah penghantaran kedua.", en: "In a two-delivery question, the student stops after the FIRST delivery and forgets to add the second." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_addition", config: { min: 15000, max: 45000 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_addition", config: { min: 25000, max: 50000 } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_addition", config: { min: 15000, max: 45000, type: "word_problem" } },
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_addition", config: { min: 15000, max: 45000, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_addition", config: { min: 15000, max: 45000, reverseProblem: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_addition", config: { min: 15000, max: 45000, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000002": {
    id: "a1000000-0000-0000-0000-000000000002",
    strand: { ms: "Pecahan", en: "Fractions" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tambah Pecahan Penyebut Sama", en: "Adding Fractions with the Same Denominator" },
    yearLevel: 4,
    explanation: {
      ms: "Sebuah pizza dipotong kepada 8 keping sama besar untuk pesta gotong-royong. Aminah makan 3/8 daripada pizza itu, kemudian Hakim makan 2/8 lagi. Berapakah jumlah bahagian pizza yang telah dimakan?\n\nApabila penyebut (nombor bawah) dua pecahan adalah SAMA, kita hanya tambah pengangka (nombor atas) sahaja. Penyebut kekal sama kerana saiz setiap keping tidak berubah.",
      en: "A pizza is cut into 8 equal slices for a community event. Aminah eats 3/8 of the pizza, then Hakim eats another 2/8. What fraction of the pizza has been eaten in total?\n\nWhen two fractions have the SAME denominator (bottom number), we only add the numerators (top numbers). The denominator stays the same because the size of each slice hasn't changed.",
    },
    tips: [
      { ms: "Penyebut sama = SAMA besar keping. 'Sama besar, senang tambah' — hanya nombor atas berubah!", en: "Same denominator = same-size pieces. 'Same size, easy to add' — only the top number changes!" },
      { ms: "JANGAN buat ini: 2/5 + 1/5 = 3/10. SALAH — penyebut TIDAK ditambah. Jawapan yang betul ialah 3/5; penyebut kekal 5 kerana saiz keping tidak berubah.", en: "DON'T do this: 2/5 + 1/5 = 3/10. WRONG — the denominator is NOT added. The correct answer is 3/5; the denominator stays 5 because the piece size hasn't changed." },
      { ms: "Petua pantas: jika penyebut kedua-dua pecahan sama, hanya fokus pada nombor atas — anggap ia macam tambah nombor bulat biasa.", en: "Quick trick: if both denominators match, focus only on the top numbers — treat it like adding regular whole numbers." },
      { ms: "Cabaran: jika ada TIGA bahagian yang dimakan/ditambah berturutan, jangan berhenti selepas dua yang pertama — tambah KETIGA-TIGA pengangka.", en: "Challenge: if THREE portions are eaten/added one after another, don't stop after the first two — add all THREE numerators." },
    ],
    howTo: [
      { ms: "Kenal pasti kedua-dua pecahan yang perlu ditambah.", en: "Identify the two fractions to be added." },
      { ms: "Semak sama ada kedua-dua pecahan mempunyai penyebut yang sama.", en: "Check that both fractions have the same denominator." },
      { ms: "Tambahkan pengangka (nombor atas) sahaja.", en: "Add just the numerators (top numbers) together." },
      { ms: "Kekalkan penyebut (nombor bawah) tanpa diubah.", en: "Keep the denominator (bottom number) unchanged." },
      { ms: "Semak: penyebut jawapan anda mesti SAMA seperti penyebut asal, tidak digandakan.", en: "Check: your answer's denominator must be the SAME as the original denominator, not doubled." },
    ],
    workedExample: {
      problem: { ms: "3/8 + 2/8", en: "3/8 + 2/8" },
      steps: [
        { ms: "Semak penyebut: kedua-duanya 8, jadi sama.", en: "Check the denominators: both are 8, so they match." },
        { ms: "Penyebut sama, kekalkan 8.", en: "Same denominator, keep it as 8." },
        { ms: "Tambah pengangka: 3+2=5", en: "Add the numerators: 3+2=5" },
        { ms: "Jawapan: 5/8", en: "Answer: 5/8" },
        { ms: "Semak: penyebut jawapan (8) sama seperti penyebut asal (8), bukan 16 ✓", en: "Check: the answer's denominator (8) matches the original denominator (8), not 16 ✓" },
      ],
      answer: "5/8",
    },
    commonMistakes: [
      { mistakeType: "unit_confusion", description: { ms: "Murid turut menambah penyebut (2/5 + 1/5 dijawab 3/10), menganggap kedua-dua nombor dalam pecahan perlu ditambah.", en: "Student also adds the denominators (answers 2/5 + 1/5 as 3/10), assuming both numbers in a fraction need adding." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menolak pengangka bukannya menambah, kerana keliru dengan susunan soalan.", en: "Student subtracts the numerators instead of adding, getting confused by the question's layout." } },
      { mistakeType: "special_case_error", description: { ms: "Apabila salah satu pecahan mempunyai pengangka sama dengan penyebut (contohnya 5/5), murid tidak pasti cara mengendalikannya dan tertinggal langkah tambah.", en: "When one fraction has a numerator equal to its denominator (e.g. 5/5), student is unsure how to handle it and skips the addition step." } },
      { mistakeType: "keyword_only_classification", description: { ms: "Murid cuba mempermudahkan jawapan (contohnya 6/8 kepada 3/4) walaupun sistem menyemak jawapan tanpa dipermudahkan, menyebabkan jawapan yang betul secara matematik ditandakan salah.", en: "Student tries to simplify the answer (e.g. 6/8 to 3/4) even though the system checks the unsimplified form, causing a mathematically correct answer to be marked wrong." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan tiga bahagian, murid hanya tambah dua bahagian pertama dan lupa bahagian ketiga.", en: "In a three-portion question, the student only adds the first two portions and forgets the third." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "fractions_same_denominator", config: { denominators: [4, 5, 6, 8, 10, 12] } },
      { type: "fill", difficulty: 2, generatorKey: "fractions_same_denominator", config: { denominators: [8, 10, 12, 15, 16] } },
      { type: "word_problem", difficulty: 2, generatorKey: "fractions_same_denominator", config: { type: "word_problem", denominators: [5, 6, 8, 10] } },
      { type: "mcq", difficulty: 3, generatorKey: "fractions_same_denominator", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_same_denominator", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "fractions_same_denominator", config: { denominators: [8, 10, 12], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000003": {
    id: "a1000000-0000-0000-0000-000000000003",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Kira Baki Wang (Ringgit & Sen)", en: "Calculating Change (Ringgit & Sen)" },
    yearLevel: 4,
    explanation: {
      ms: "Baki wang ialah beza antara wang yang dibayar dengan harga barang. Kita tolak: Wang Dibayar − Harga Barang = Baki.\n\nContoh: Ali beli air kotak RM2.50 di kantin dan bayar dengan RM5.00. Baki = RM5.00 − RM2.50 = RM2.50.",
      en: "Change is the difference between the money paid and the item's price. We subtract: Money Paid − Item Price = Change.\n\nExample: Ali buys a packet drink for RM2.50 at the canteen and pays with RM5.00. Change = RM5.00 − RM2.50 = RM2.50.",
    },
    tips: [
      {
        ms: "Tukar semua kepada sen dahulu (RM5.00 = 500 sen) supaya lebih mudah tolak, kemudian tukar balik kepada RM jika perlu.",
        en: "Convert everything to sen first (RM5.00 = 500 sen) to make subtraction easier, then convert back to RM if needed.",
      },
      {
        ms: "Semak jawapan anda: Baki + Harga Barang MESTI menyamai Wang Dibayar.",
        en: "Check your answer: Change + Item Price MUST equal Money Paid.",
      },
      {
        ms: "JANGAN buat ini: RM10.00 − RM6.30 dikira terus digit demi digit tanpa tukar ke sen (10−6=4, 00−30=terbalik). SALAH — anda MESTI tukar kepada sen dahulu (1000 sen − 630 sen). Jawapan yang betul ialah RM3.70.",
        en: "DON'T do this: RM10.00 − RM6.30 calculated digit-by-digit without converting to sen first (10−6=4, 00−30=flipped). WRONG — you MUST convert to sen first (1000 sen − 630 sen). The correct answer is RM3.70.",
      },
      {
        ms: "Cabaran: jika baki daripada satu belian digunakan untuk belian KEDUA, jangan berhenti selepas belian pertama — teruskan tolak harga belian kedua daripada baki itu.",
        en: "Challenge: if the change from one purchase is used for a SECOND purchase, don't stop after the first purchase — keep going and subtract the second item's price from that change.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti Wang Dibayar dan Harga Barang.", en: "Identify the Money Paid and the Item Price." },
      { ms: "Tukar kedua-dua nilai kepada sen sepenuhnya.", en: "Convert both values fully into sen." },
      { ms: "Tolak: Wang Dibayar − Harga Barang.", en: "Subtract: Money Paid − Item Price." },
      { ms: "Tukar jawapan itu balik kepada format RM.", en: "Convert the answer back into RM format." },
      { ms: "Semak: Baki + Harga Barang mesti menyamai semula Wang Dibayar. Jika ada belian KEDUA, ulangi langkah ini dengan baki pertama sebagai \"wang dibayar\" yang baharu.", en: "Check: Change + Item Price must add back up to Money Paid. If there's a SECOND purchase, repeat this process using the first change as the new \"money paid\"." },
    ],
    workedExample: {
      problem: { ms: "RM10.00 - RM6.30", en: "RM10.00 - RM6.30" },
      steps: [
        { ms: "Tukar kepada sen: 1000 sen - 630 sen", en: "Convert to sen: 1000 sen - 630 sen" },
        { ms: "= 370 sen", en: "= 370 sen" },
        { ms: "Tukar balik: RM3.70", en: "Convert back: RM3.70" },
      ],
      answer: "RM3.70",
      diagram: { kind: "vertical_arithmetic", operands: ["10.00", "6.30"], operator: "\u2212", result: "3.70", prefix: "RM" },
    },
    commonMistakes: [
      { mistakeType: "ringgit_sen_conversion_error", description: { ms: "Murid tersilap semasa menukar antara ringgit dan sen.", en: "The student makes an error converting between ringgit and sen." } },
      { mistakeType: "subtraction_borrow_error", description: { ms: "Murid tersilap semasa proses \"pinjam\" dalam penolakan berlajur.", en: "The student makes an error during the \"borrow\" step in column subtraction." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah harga barang dengan wang dibayar, bukan menolak.", en: "The student adds the item price to the money paid, instead of subtracting." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak anggarkan baki dahulu, jadi tidak perasan jika jawapan akhir tidak munasabah (contohnya baki lebih besar daripada wang dibayar).", en: "The student doesn't estimate the change first, so doesn't notice when the final answer doesn't make sense (e.g. change bigger than the money paid)." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan dua langkah (belian kedua daripada baki pertama), murid berhenti selepas belian pertama dan lupa teruskan ke belian kedua.", en: "In a two-step question (a second purchase from the first change), the student stops after the first purchase and forgets to continue to the second." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "money_change", config: { maxPaid: 20, maxPrice: 18 } },
      { type: "fill", difficulty: 2, generatorKey: "money_change", config: { maxPaid: 30, maxPrice: 28 } },
      { type: "word_problem", difficulty: 2, generatorKey: "money_change", config: { maxPaid: 50, maxPrice: 48, context: "canteen" } },
      { type: "mcq", difficulty: 3, generatorKey: "money_change", config: { maxPaid: 30, maxPrice: 28, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "money_change", config: { maxPaid: 30, maxPrice: 28, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "money_change", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000004": {
    id: "a1000000-0000-0000-0000-000000000004",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Perimeter Bentuk Mudah", en: "Perimeter of Simple Shapes" },
    yearLevel: 4,
    explanation: {
      ms: "Perimeter ialah jumlah panjang semua sisi sesuatu bentuk. Untuk segi empat tepat, kita gunakan formula: Perimeter = 2 × (panjang + lebar). Untuk segi empat sama, semua sisi sama panjang.\n\nContoh harian: Pak Ali ingin memagar sebidang tanah berbentuk segi empat tepat. Berapa panjang pagar yang diperlukan?",
      en: "Perimeter is the total length of all the sides of a shape. For a rectangle, we use the formula: Perimeter = 2 × (length + width). For a square, all sides are the same length.\n\nEveryday example: Pak Ali wants to fence a rectangular plot of land. How much fencing does he need?",
    },
    tips: [
      {
        ms: "Bayangkan berjalan mengelilingi keseluruhan bentuk itu — perimeter ialah jumlah jarak yang anda jalani.",
        en: "Imagine walking all the way around the shape — the perimeter is the total distance you'd walk.",
      },
      {
        ms: "Untuk segi empat sama, cukup darab satu sisi dengan 4 — tidak perlu formula panjang+lebar.",
        en: "For a square, just multiply one side by 4 — no need for the length+width formula.",
      },
      {
        ms: "JANGAN buat ini: segi empat tepat 8 cm × 5 cm dikira sebagai 8 × 5 = 40 cm. SALAH — itu ialah LUAS, bukan perimeter. Perimeter yang betul ialah 2 × (8 + 5) = 26 cm.",
        en: "DON'T do this: a rectangle 8 cm × 5 cm calculated as 8 × 5 = 40 cm. WRONG — that's AREA, not perimeter. The correct perimeter is 2 × (8 + 5) = 26 cm.",
      },
      {
        ms: "Cabaran: jika soalan tanya kos memagar (bukan hanya panjang pagar), cari perimeter dahulu, kemudian darabkan dengan kos setiap meter.",
        en: "Challenge: if the question asks for the COST of fencing (not just the fencing length), find the perimeter first, then multiply by the cost per metre.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti bentuk itu — segi empat tepat atau segi empat sama.", en: "Identify the shape — rectangle or square." },
      { ms: "Untuk segi empat tepat: tambah panjang dan lebar, kemudian darab jumlah itu dengan 2.", en: "For a rectangle: add the length and width, then multiply that total by 2." },
      { ms: "Untuk segi empat sama: darab panjang satu sisi dengan 4.", en: "For a square: multiply one side's length by 4." },
      { ms: "Sertakan unit ukuran (cm, m) dalam jawapan akhir.", en: "Include the unit of measurement (cm, m) in your final answer." },
    ],
    workedExample: {
      problem: { ms: "Segi empat tepat 8 cm × 5 cm", en: "Rectangle 8 cm × 5 cm" },
      steps: [
        { ms: "Perimeter = 2 × (panjang + lebar)", en: "Perimeter = 2 × (length + width)" },
        { ms: "= 2 × (8 + 5)", en: "= 2 × (8 + 5)" },
        { ms: "= 2 × 13 = 26 cm", en: "= 2 × 13 = 26 cm" },
      ],
      answer: "26 cm",
    },
    commonMistakes: [
      { mistakeType: "perimeter_area_confusion", description: { ms: "Murid mengira luas (panjang × lebar) berbanding perimeter.", en: "The student calculates area (length × width) instead of perimeter." } },
      { mistakeType: "forgot_double_perimeter", description: { ms: "Murid terlupa gandakan (panjang + lebar) dengan 2.", en: "The student forgets to double (length + width) by 2." } },
      { mistakeType: "wrong_dimensions_used", description: { ms: "Dalam soalan berbalik, murid guna perimeter secara terus sebagai sisi, tanpa bahagikan dengan 2 dahulu.", en: "In reverse-style questions, the student uses the perimeter directly as a side length, without dividing by 2 first." } },
      { mistakeType: "arithmetic_error_in_formula", description: { ms: "Murid guna formula yang betul tetapi tersilap kira semasa menambah atau mendarab.", en: "The student uses the correct formula but makes an arithmetic slip while adding or multiplying." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (kos memagar), murid berhenti selepas cari perimeter dan tidak teruskan mendarab dengan kos setiap meter.", en: "In the challenge-tier question (cost of fencing), the student stops after finding the perimeter and doesn't continue to multiply by the cost per metre." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "perimeter", config: { min: 3, max: 12 } },
      { type: "fill", difficulty: 2, generatorKey: "perimeter", config: { min: 8, max: 20 } },
      { type: "word_problem", difficulty: 2, generatorKey: "perimeter", config: { min: 3, max: 12, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "perimeter", config: { min: 3, max: 12, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "perimeter", config: { min: 3, max: 12, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "perimeter", config: { min: 3, max: 12, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000005": {
    id: "a1000000-0000-0000-0000-000000000005",
    strand: { ms: "Perpuluhan", en: "Decimals" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tambah & Tolak Perpuluhan", en: "Adding & Subtracting Decimals" },
    yearLevel: 5,
    explanation: {
      ms: "Apabila menambah atau menolak nombor perpuluhan, titik perpuluhan MESTI disusun lurus antara satu sama lain, sama seperti nilai tempat dalam nombor bulat.\n\nContoh harian: Siti membeli buku RM12.50 dan pensel RM3.20. Berapa jumlah perbelanjaannya?",
      en: "When adding or subtracting decimal numbers, the decimal points MUST line up with each other, just like place value does for whole numbers.\n\nEveryday example: Siti buys a book for RM12.50 and a pencil for RM3.20. How much did she spend in total?",
    },
    tips: [
      { ms: "Titik ke titik, segaris betul — susun titik perpuluhan lurus dahulu sebelum mengira!", en: "Point to point, line them right — align the decimal points before you calculate!" },
      { ms: "JANGAN buat ini: RM12.5 + RM3.20 dikira sebagai 125 + 320 = 445 (abaikan titik terus). SALAH — titik perpuluhan MESTI disusun segaris dahulu; RM12.50 + RM3.20 = RM15.70.", en: "DON'T do this: RM12.5 + RM3.20 calculated as 125 + 320 = 445 (ignoring the decimal point entirely). WRONG — the decimal points MUST be aligned first; RM12.50 + RM3.20 = RM15.70." },
      { ms: "Petua pantas: tambah sifar pada nombor yang lebih pendek supaya kedua-dua nombor ada bilangan digit selepas titik yang sama sebelum mengira.", en: "Quick trick: add a trailing zero to the shorter number so both numbers have the same number of digits after the point before calculating." },
      { ms: "Cabaran: jika ada barang KETIGA yang dibeli selepas dua yang pertama, jangan berhenti awal — tambah ketiga-tiga harga itu.", en: "Challenge: if a THIRD item is bought after the first two, don't stop early — add all three prices together." },
    ],
    howTo: [
      { ms: "Kenal pasti kedua-dua nombor perpuluhan yang perlu dikira.", en: "Identify the two decimal numbers to be calculated." },
      { ms: "Susun kedua-dua nombor menegak dengan titik perpuluhan segaris.", en: "Line up both numbers vertically with the decimal points aligned." },
      { ms: "Tambah sifar pada hujung nombor yang lebih pendek jika perlu.", en: "Add a trailing zero to the shorter number if needed." },
      { ms: "Tambah atau tolak seperti nombor bulat biasa, lajur demi lajur dari kanan.", en: "Add or subtract as with whole numbers, column by column from the right." },
      { ms: "Semak: letakkan titik perpuluhan dalam jawapan pada kedudukan yang sama segaris dengan soalan.", en: "Check: place the decimal point in your answer in the same lined-up position as the question." },
    ],
    workedExample: {
      problem: { ms: "12.50 + 3.20", en: "12.50 + 3.20" },
      steps: [
        { ms: "Kenal pasti: 12.50 dan 3.20, kedua-duanya sudah 2 tempat perpuluhan.", en: "Identify: 12.50 and 3.20, both already 2 decimal places." },
        { ms: "Susun titik perpuluhan segaris.", en: "Line up the decimal points." },
        { ms: "50 + 20 = 70 (bahagian perpuluhan)", en: "50 + 20 = 70 (decimal part)" },
        { ms: "12 + 3 = 15 (bahagian bulat)", en: "12 + 3 = 15 (whole part)" },
        { ms: "Jawapan: 15.70", en: "Answer: 15.70" },
        { ms: "Semak: 15.70 − 3.20 = 12.50 ✓", en: "Check: 15.70 − 3.20 = 12.50 ✓" },
      ],
      answer: "15.70",
      diagram: { kind: "vertical_arithmetic", operands: ["12.50", "3.20"], operator: "+", result: "15.70" },
    },
    commonMistakes: [
      { mistakeType: "place_value_error", description: { ms: "Murid tidak menyusun titik perpuluhan segaris, menyebabkan nilai tempat tersalah dan digit dikira pada lajur yang salah.", en: "Student doesn't line up the decimal points, causing place values to be mismatched and digits added in the wrong column." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid mengabaikan titik perpuluhan sepenuhnya dan mengira kedua-dua nombor seolah-olah nombor bulat (contohnya 12.5 dikira sebagai 125).", en: "Student ignores the decimal point entirely and calculates both numbers as if they were whole numbers (e.g. 12.5 treated as 125)." } },
      { mistakeType: "special_case_error", description: { ms: "Apabila satu nombor mempunyai lebih sedikit digit selepas titik perpuluhan (contohnya 12.5 berbanding 3.25), murid tidak tambah sifar dan salah jajar digit.", en: "When one number has fewer digits after the decimal point (e.g. 12.5 vs 3.25), student doesn't add a trailing zero and misaligns the digits." } },
      { mistakeType: "wrong_operation", description: { ms: "Semasa menolak, murid tidak pinjam merentasi titik perpuluhan apabila digit atas lebih kecil daripada digit bawah dalam bahagian perpuluhan.", en: "While subtracting, student doesn't borrow across the decimal point when the top digit is smaller than the bottom digit in the decimal part." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (barang ketiga dibeli selepas dua yang pertama), murid berhenti selepas dua barang pertama dan tidak teruskan menambah barang ketiga.", en: "In the challenge-tier question (a third item bought after the first two), the student stops after the first two items and doesn't continue to add the third." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "decimal_add_subtract", config: { maxWhole: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "decimal_add_subtract", config: { maxWhole: 25 } },
      { type: "word_problem", difficulty: 2, generatorKey: "decimal_add_subtract", config: { type: "word_problem", maxWhole: 20 } },
      { type: "mcq", difficulty: 3, generatorKey: "decimal_add_subtract", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_add_subtract", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_add_subtract", config: { maxWhole: 20, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000006": {
    id: "a1000000-0000-0000-0000-000000000006",
    strand: { ms: "Peratus", en: "Percentage" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Peratus Asas", en: "Basic Percentage" },
    yearLevel: 6,
    explanation: {
      ms: "Peratus bermaksud \"per seratus\". Untuk mencari peratus daripada suatu kuantiti, kita bahagi peratus itu dengan 100, kemudian darab dengan kuantiti tersebut.\n\nContoh harian: Sebuah kedai memberi diskaun 20% untuk barang berharga RM50. Berapakah jumlah diskaun itu?",
      en: "Percent means \"per hundred\". To find a percentage of a quantity, we divide the percentage by 100, then multiply by that quantity.\n\nEveryday example: A shop gives a 20% discount on an item priced at RM50. What is the discount amount?",
    },
    tips: [
      {
        ms: "50% ialah separuh, 25% ialah suku, 10% ialah selepas menggerakkan titik perpuluhan satu tempat ke kiri. Guna ini untuk anggaran pantas.",
        en: "50% is half, 25% is a quarter, 10% is moving the decimal point one place left. Use these as quick estimation checks.",
      },
      {
        ms: "Jawapan mesti lebih kecil daripada kuantiti asal (kecuali peratus itu 100% atau lebih) — jika lebih besar, semak semula pengiraan anda.",
        en: "The answer should be smaller than the original quantity (unless the percentage is 100% or more) — if it's bigger, double-check your working.",
      },
      {
        ms: "JANGAN buat ini: 20% daripada 50 dikira sebagai 20 × 50 = 1000 dan berhenti di situ. SALAH — anda MESTI bahagi dengan 100 selepas darab. Jawapan yang betul ialah 1000 ÷ 100 = 10.",
        en: "DON'T do this: 20% of 50 calculated as 20 × 50 = 1000 and stopping there. WRONG — you MUST divide by 100 after multiplying. The correct answer is 1000 ÷ 100 = 10.",
      },
      {
        ms: "Cabaran: jika DUA peratusan dikenakan secara berturutan, peratusan KEDUA dikira daripada BAKI selepas potongan pertama, bukan daripada kuantiti asal.",
        en: "Challenge: if TWO percentages are applied one after another, the SECOND one is calculated from the REMAINDER after the first cut, not from the original quantity.",
      },
    ],
    howTo: [
      { ms: "Tukar peratus itu kepada pecahan per seratus (cth. 20% = 20/100).", en: "Convert the percentage into a fraction over 100 (e.g. 20% = 20/100)." },
      { ms: "Darabkan pecahan itu dengan kuantiti yang diberi.", en: "Multiply that fraction by the given quantity." },
      { ms: "Permudahkan pengiraan itu untuk dapatkan jawapan.", en: "Simplify the calculation to get the answer." },
      { ms: "Semak: adakah jawapan anda munasabah berbanding kuantiti asal? Jika ada peratusan KEDUA, ulangi proses ini menggunakan BAKI sebagai kuantiti baharu.", en: "Check: does your answer make sense compared to the original quantity? If there's a SECOND percentage, repeat this process using the remainder as the new quantity." },
    ],
    workedExample: {
      problem: { ms: "20% daripada 50", en: "20% of 50" },
      steps: [
        { ms: "Tukar peratus kepada pecahan: 20/100", en: "Convert percent to a fraction: 20/100" },
        { ms: "Darab dengan kuantiti: (20/100) × 50", en: "Multiply by the quantity: (20/100) × 50" },
        { ms: "= 10", en: "= 10" },
      ],
      answer: 10,
    },
    commonMistakes: [
      { mistakeType: "forgot_divide_by_100", description: { ms: "Murid mendarab terus peratus dengan kuantiti tanpa membahagi dengan 100 dahulu.", en: "The student multiplies the percent directly by the quantity without dividing by 100 first." } },
      { mistakeType: "inverted_percentage_operation", description: { ms: "Murid membahagikan kuantiti dengan peratus, bukan mendarab.", en: "The student divides the quantity by the percent instead of multiplying." } },
      { mistakeType: "confused_part_and_whole", description: { ms: "Murid keliru antara kuantiti asal dan bahagian yang dicari, terutamanya dalam soalan berbalik.", en: "The student confuses the original quantity with the part being found, especially in reverse-style questions." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan dua peratusan berturutan, murid berhenti selepas potongan pertama dan lupa kira potongan kedua daripada baki.", en: "In a two-cascading-percentage question, the student stops after the first cut and forgets to calculate the second cut from the remainder." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "percentage_of_quantity", config: { percentages: [50, 25, 10] } },
      { type: "fill", difficulty: 1, generatorKey: "percentage_of_quantity", config: { percentages: [50, 25, 10] } },
      { type: "word_problem", difficulty: 2, generatorKey: "percentage_of_quantity", config: { percentages: [20, 75, 5], type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "percentage_of_quantity", config: { percentages: [20, 75, 5], errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "percentage_of_quantity", config: { percentages: [20, 75, 5], reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "percentage_of_quantity", config: { percentages: [50, 25, 10, 20], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000007": {
    id: "a1000000-0000-0000-0000-000000000007",
    strand: { ms: "Masa dan Waktu", en: "Time" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Waktu dan Masa", en: "Time & Duration" },
    yearLevel: 5,
    explanation: {
      ms: "Untuk mengira waktu tamat, kita tambah tempoh masa kepada waktu mula. Ingat: 60 minit = 1 jam. Jika jumlah minit melebihi 60, tukar 60 minit itu kepada 1 jam.\n\nContoh harian: Kelas tuisyen Amin bermula pukul 2:30 petang dan berlangsung 90 minit. Pukul berapakah ia tamat?",
      en: "To find the end time, we add the duration to the start time. Remember: 60 minutes = 1 hour. If the total minutes go past 60, convert that 60 minutes into 1 hour.\n\nEveryday example: Amin's tuition class starts at 2:30 pm and lasts 90 minutes. What time does it end?",
    },
    tips: [
      { ms: "Pisah dahulu, tambah kemudian — pecahkan tempoh masa kepada jam dan minit sebelum mengira!", en: "Split first, add later — break the duration into hours and minutes before calculating!" },
      { ms: "JANGAN buat ini: 2:45 + 30 minit dikira sebagai 2:75. SALAH — 75 minit bukan format masa yang sah. Tukar dahulu: 45+30=75 minit = 1 jam 15 minit, jadi jawapannya 3:15.", en: "DON'T do this: 2:45 + 30 minutes calculated as 2:75. WRONG — 75 minutes isn't a valid time format. Convert first: 45+30=75 minutes = 1 hour 15 minutes, so the answer is 3:15." },
      { ms: "Petua pantas: jika jumlah minit anda 60 atau lebih, tolak 60 daripada minit itu dan tambah 1 pada jam.", en: "Quick trick: if your total minutes is 60 or more, subtract 60 from the minutes and add 1 to the hour." },
      { ms: "Cabaran: jika ada kelas KEDUA sejurus selepas kelas pertama tamat, jangan berhenti pada waktu tamat kelas pertama — teruskan tambah tempoh kelas kedua.", en: "Challenge: if a SECOND class starts right after the first ends, don't stop at the first class's end time — keep adding the second class's duration." },
    ],
    howTo: [
      { ms: "Kenal pasti masa mula dan tempoh masa yang diberi.", en: "Identify the start time and the given duration." },
      { ms: "Tukar tempoh masa kepada jam dan minit berasingan.", en: "Convert the duration into separate hours and minutes." },
      { ms: "Tambah bilangan jam kepada waktu mula.", en: "Add the number of hours to the start time." },
      { ms: "Tambah bilangan minit yang selebihnya.", en: "Add the remaining number of minutes." },
      { ms: "Semak: jika jumlah minit mencapai 60 atau lebih, tukar kepada 1 jam dan laraskan waktu.", en: "Check: if the minutes reach 60 or more, convert into an extra hour and adjust the time." },
    ],
    workedExample: {
      problem: { ms: "2:30 + 90 minit", en: "2:30 + 90 minutes" },
      steps: [
        { ms: "Kenal pasti: masa mula 2:30, tempoh 90 minit.", en: "Identify: start time 2:30, duration 90 minutes." },
        { ms: "90 minit = 1 jam 30 minit", en: "90 minutes = 1 hour 30 minutes" },
        { ms: "2:30 + 1 jam = 3:30", en: "2:30 + 1 hour = 3:30" },
        { ms: "3:30 + 30 minit = 4:00", en: "3:30 + 30 minutes = 4:00" },
        { ms: "Jawapan: 4:00", en: "Answer: 4:00" },
        { ms: "Semak: 4:00 tolak 90 minit sepatutnya kembali kepada 2:30 ✓", en: "Check: 4:00 minus 90 minutes should return to 2:30 ✓" },
      ],
      answer: "4:00",
    },
    commonMistakes: [
      { mistakeType: "unit_confusion", description: { ms: "Murid tidak menukar 60 minit kepada 1 jam apabila jumlah minit melebihi 60, dan menulis masa tidak sah seperti 2:75.", en: "Student doesn't convert 60 minutes into 1 hour when the total minutes exceed 60, writing an invalid time like 2:75." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah tempoh masa hanya pada bahagian jam sahaja, mengabaikan bahagian minit dalam tempoh itu.", en: "Student only adds the duration to the hour part, ignoring the minute part of the duration." } },
      { mistakeType: "special_case_error", description: { ms: "Apabila jam mencecah 12, murid tidak tahu cara menyambung semula ke 1 (contohnya 11:30 + 1 jam menjadi 12:30, bukan 0:30 atau terus ke 13).", en: "When the hour reaches 12, student doesn't know how to wrap back to 1 (e.g. 11:30 + 1 hour becomes 12:30, not 0:30 or straight to 13)." } },
      { mistakeType: "place_value_error", description: { ms: "Murid keliru antara bilangan minit dan bilangan jam semasa memisahkan tempoh masa (contohnya menganggap 90 minit sebagai 9 jam).", en: "Student confuses the number of minutes with the number of hours when splitting the duration (e.g. treats 90 minutes as 9 hours)." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (kelas kedua sejurus selepas kelas pertama), murid beri waktu tamat kelas pertama sahaja, tidak teruskan tambah tempoh kelas kedua.", en: "In the challenge-tier question (a second class right after the first), the student gives just the first class's end time, without continuing to add the second class's duration." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "time_duration", config: {} },
      { type: "fill", difficulty: 2, generatorKey: "time_duration", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "time_duration", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "time_duration", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_duration", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_duration", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000008": {
    id: "a1000000-0000-0000-0000-000000000008",
    strand: { ms: "Statistik", en: "Statistics" },
    bidang: BIDANG.statisticsProbability,
    title: { ms: "Purata (Min)", en: "Average (Mean)" },
    yearLevel: 5,
    explanation: {
      ms: "Purata (min) ialah nilai yang mewakili satu set data. Untuk mencari purata, tambah semua nilai, kemudian bahagikan dengan bilangan nilai tersebut.\n\nContoh harian: Markah ujian matematik Aina untuk 4 minggu ialah 70, 80, 75, 75. Berapakah purata markahnya?",
      en: "The average (mean) is a value that represents a set of data. To find the average, add all the values together, then divide by how many values there are.\n\nEveryday example: Aina's maths test scores over 4 weeks were 70, 80, 75, 75. What is her average score?",
    },
    tips: [
      {
        ms: "Purata = Jumlah Semua Nilai ÷ Bilangan Nilai. Jangan lupa langkah bahagi — jumlah sahaja bukan purata.",
        en: "Average = Total of All Values ÷ Number of Values. Don't forget the division step — the sum alone isn't the average.",
      },
      {
        ms: "Kira semula berapa banyak nilai yang diberi dalam soalan sebelum membahagi — silap kira bilangan nilai ialah kesilapan biasa.",
        en: "Recount how many values the question gives before dividing — miscounting the number of values is a common slip.",
      },
      {
        ms: "JANGAN buat ini: purata bagi 70, 80, 75, 75 dijawab sebagai 300 (jumlah sahaja, berhenti di situ). SALAH — anda MESTI bahagikan jumlah itu dengan bilangan nilai (4). Jawapan yang betul ialah 75.",
        en: "DON'T do this: the average of 70, 80, 75, 75 answered as 300 (just the sum, stopping there). WRONG — you MUST divide that sum by the number of values (4). The correct answer is 75.",
      },
      {
        ms: "Cabaran: jika satu nilai BAHARU ditambah kepada set data, purata lama TIDAK boleh dipurata terus dengan nilai baharu itu — cari jumlah asal dahulu (purata lama × bilangan lama), tambah nilai baharu, kemudian bahagi dengan bilangan yang baharu.",
        en: "Challenge: if a NEW value is added to the data set, you can't just average the old average with the new value — find the original sum first (old average × old count), add the new value, then divide by the new count.",
      },
    ],
    howTo: [
      { ms: "Tambahkan semua nilai dalam set data itu.", en: "Add up all the values in the data set." },
      { ms: "Kira berapa banyak nilai yang ada.", en: "Count how many values there are." },
      { ms: "Bahagikan jumlah itu dengan bilangan nilai.", en: "Divide the total by the number of values." },
      { ms: "Semak: purata itu sepatutnya berada antara nilai terkecil dan terbesar dalam set data. Jika satu nilai baharu ditambah, ulangi proses ini dengan jumlah dan bilangan yang dikemas kini.", en: "Check: the average should fall between the smallest and largest values in the data set. If a new value is added, repeat this process with the updated sum and count." },
    ],
    workedExample: {
      problem: { ms: "70, 80, 75, 75", en: "70, 80, 75, 75" },
      steps: [
        { ms: "Jumlah = 70+80+75+75 = 300", en: "Sum = 70+80+75+75 = 300" },
        { ms: "Bilangan nilai = 4", en: "Number of values = 4" },
        { ms: "Purata = 300 ÷ 4 = 75", en: "Average = 300 ÷ 4 = 75" },
      ],
      answer: 75,
    },
    commonMistakes: [
      { mistakeType: "forgot_divide_average", description: { ms: "Murid memberikan jumlah keseluruhan sebagai jawapan, tanpa membahagikannya.", en: "The student gives the total sum as the answer, without dividing it." } },
      { mistakeType: "wrong_count_average", description: { ms: "Murid membahagikan dengan bilangan nilai yang salah.", en: "The student divides by the wrong number of values." } },
      { mistakeType: "forgot_subtract_known_values", description: { ms: "Semasa mencari nilai yang hilang, murid darab purata dengan bilangan nilai tetapi terlupa tolak jumlah nilai yang sudah diketahui.", en: "When finding a missing value, the student multiplies the average by the count but forgets to subtract the sum of the known values." } },
      { mistakeType: "average_out_of_range", description: { ms: "Murid dapat jawapan purata yang lebih besar daripada nilai terbesar atau lebih kecil daripada nilai terkecil, tetapi tidak perasan ia tidak munasabah.", en: "The student gets an average bigger than the largest value or smaller than the smallest value, but doesn't notice it's unreasonable." } },
      { mistakeType: "averaged_the_average", description: { ms: "Apabila nilai baharu ditambah, murid purata terus purata lama dengan nilai baharu itu (contoh (purata+nilai baharu)÷2), lupa purata lama mewakili beberapa nilai.", en: "When a new value is added, the student directly averages the old average with the new value (e.g. (average+new value)÷2), forgetting the old average represents several values." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "average", config: { count: 3, maxValue: 15 } },
      { type: "fill", difficulty: 2, generatorKey: "average", config: { count: 4, maxValue: 20 } },
      { type: "word_problem", difficulty: 2, generatorKey: "average", config: { count: 4, maxValue: 15, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "average", config: { count: 4, maxValue: 20, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "average", config: { count: 4, maxValue: 15, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "average", config: { count: 4, maxValue: 15, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000009": {
    id: "a1000000-0000-0000-0000-000000000009",
    strand: { ms: "Nisbah", en: "Ratio" },
    bidang: BIDANG.relationshipAlgebra,
    title: { ms: "Nisbah Mudah", en: "Simple Ratio" },
    yearLevel: 6,
    explanation: {
      ms: "Nisbah membandingkan dua kuantiti. Untuk memudahkan nisbah, bahagikan kedua-dua bahagian dengan nombor terbesar yang boleh membahagikannya dengan tepat (Pembahagi Sepunya Terbesar).\n\nContoh harian: Dalam sebuah kelas, terdapat 12 murid lelaki dan 18 murid perempuan. Apakah nisbah lelaki kepada perempuan dalam bentuk paling ringkas?",
      en: "A ratio compares two quantities. To simplify a ratio, divide both parts by the largest number that divides them evenly (the Greatest Common Divisor).\n\nEveryday example: In a class, there are 12 boys and 18 girls. What is the ratio of boys to girls in simplest form?",
    },
    tips: [
      {
        ms: "Cuba bahagi kedua-dua bahagian dengan 2, kemudian 3, dan seterusnya sehingga tidak boleh dibahagi lagi tanpa baki.",
        en: "Try dividing both parts by 2, then 3, and so on until neither can be divided any further without a remainder.",
      },
      {
        ms: "Nisbah paling ringkas tidak boleh dipermudahkan lagi — jika kedua-dua nombor masih ada faktor sepunya, teruskan membahagi.",
        en: "The simplest ratio can't be simplified any further — if both numbers still share a common factor, keep dividing.",
      },
      {
        ms: "JANGAN buat ini: nisbah 12:18 dipermudahkan kepada 6:9 (bahagi dengan 2 sahaja) dan berhenti. SALAH — 6 dan 9 masih ada faktor sepunya (3). Anda MESTI teruskan membahagi sehingga tiada faktor sepunya lagi. Jawapan yang betul ialah 2:3.",
        en: "DON'T do this: the ratio 12:18 simplified to 6:9 (only divided by 2) and stopped there. WRONG — 6 and 9 still share a common factor (3). You MUST keep dividing until there's no common factor left. The correct answer is 2:3.",
      },
      {
        ms: "Cabaran: jika soalan tanya BEZA antara dua bahagian (bukan hanya satu bahagian), cari nilai SEBENAR kedua-dua bahagian dahulu, kemudian tolak.",
        en: "Challenge: if the question asks for the DIFFERENCE between the two parts (not just one part), find the ACTUAL value of both parts first, then subtract.",
      },
    ],
    howTo: [
      { ms: "Cari faktor sepunya terbesar (HCF/GCD) bagi kedua-dua nombor dalam nisbah.", en: "Find the highest common factor (HCF/GCD) of both numbers in the ratio." },
      { ms: "Bahagikan kedua-dua nombor itu dengan faktor sepunya terbesar tersebut.", en: "Divide both numbers by that highest common factor." },
      { ms: "Semak sama ada nisbah itu sudah dalam bentuk paling ringkas.", en: "Check that the ratio is now in its simplest form." },
      { ms: "Jika nisbah mewakili kuantiti sebenar (contoh bilangan murid), kekalkan kaitan dengan jumlah asal semasa menyelesaikan masalah.", en: "If the ratio represents real quantities (e.g. number of students), keep track of how it relates to the original total when solving problems." },
    ],
    workedExample: {
      problem: { ms: "12:18", en: "12:18" },
      steps: [
        { ms: "Bahagi kedua-dua bahagian dengan 6", en: "Divide both parts by 6" },
        { ms: "12÷6 : 18÷6", en: "12÷6 : 18÷6" },
        { ms: "= 2:3", en: "= 2:3" },
      ],
      answer: "2:3",
    },
    commonMistakes: [
      { mistakeType: "ratio_not_fully_simplified", description: { ms: "Murid hanya membahagikan sebahagian, bukan sehingga bentuk paling ringkas.", en: "The student only partially simplifies, not all the way to the simplest form." } },
      { mistakeType: "ratio_order_reversed", description: { ms: "Murid menukar susunan nisbah secara tidak sengaja.", en: "The student accidentally reverses the order of the ratio." } },
      { mistakeType: "ratio_scaling_error", description: { ms: "Semasa mengagihkan jumlah mengikut nisbah, murid membahagikan jumlah itu sama rata dua-dua bahagian, bukan mengikut nisbah.", en: "When sharing a total according to a ratio, the student divides the total equally between the two parts instead of by the ratio." } },
      { mistakeType: "ratio_part_swapped", description: { ms: "Murid memberikan nilai bahagian yang satu lagi, bukan bahagian yang ditanya.", en: "The student gives the value of the other part, not the one the question asked for." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (beza antara dua bahagian), murid beri nilai satu bahagian sahaja, tidak teruskan tolak untuk cari beza.", en: "In the challenge-tier question (difference between two parts), the student gives just one part's value, without continuing to subtract for the difference." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "simplify_ratio", config: { maxMultiplier: 4 } },
      { type: "fill", difficulty: 2, generatorKey: "simplify_ratio", config: { maxMultiplier: 6 } },
      { type: "fill", difficulty: 2, generatorKey: "simplify_ratio", config: { maxMultiplier: 8 } },
      { type: "mcq", difficulty: 3, generatorKey: "simplify_ratio", config: { maxMultiplier: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "simplify_ratio", config: { maxMultiplier: 4, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "simplify_ratio", config: { maxMultiplier: 4, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000010": {
    id: "a1000000-0000-0000-0000-000000000010",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Isipadu Cecair", en: "Volume of Liquid" },
    yearLevel: 6,
    explanation: {
      ms: "Isipadu cecair diukur dalam liter (L) dan mililiter (ml). 1 liter = 1000 mililiter. Apabila menambah isipadu yang dinyatakan dalam L dan ml, tukar semuanya kepada ml dahulu.\n\nContoh harian: Sebuah balang mengandungi 1 L 250 ml jus. 300 ml jus lagi dituang masuk. Berapakah jumlah isipadu jus sekarang?",
      en: "Liquid volume is measured in litres (L) and millilitres (ml). 1 litre = 1000 millilitres. When adding volumes given in both L and ml, convert everything to ml first.\n\nEveryday example: A jug contains 1 L 250 ml of juice. Another 300 ml is poured in. What is the total volume of juice now?",
    },
    tips: [
      { ms: "Liter ke ml, darab seribu — 1 L sentiasa bersamaan 1000 ml!", en: "Litres to ml, times a thousand — 1 L always equals 1000 ml!" },
      { ms: "JANGAN buat ini: 1 L 250 ml + 300 ml dikira sebagai 1+250+300=551. SALAH — anda tidak boleh tambah bilangan liter terus dengan ml; tukar 1 L kepada 1000 ml dahulu: 1000+250+300=1550 ml.", en: "DON'T do this: 1 L 250 ml + 300 ml calculated as 1+250+300=551. WRONG — you can't add the litre count directly to ml; convert 1 L to 1000 ml first: 1000+250+300=1550 ml." },
      { ms: "Petua pantas: selepas mengira dalam ml, bahagi dengan 1000 untuk semak berapa liter penuh yang terkandung dalam jawapan anda.", en: "Quick trick: after calculating in ml, divide by 1000 to check how many full litres are in your answer." },
      { ms: "Cabaran: jika ada peristiwa KEDUA (dituang keluar selepas dituang masuk), jangan berhenti awal — kira kedua-dua peristiwa itu.", en: "Challenge: if there's a SECOND event (poured out after poured in), don't stop early — account for both events." },
    ],
    howTo: [
      { ms: "Kenal pasti kedua-dua isipadu yang perlu dikira.", en: "Identify the two volumes to be calculated." },
      { ms: "Tukar semua nilai liter kepada ml (darab dengan 1000).", en: "Convert every litre value to ml (multiply by 1000)." },
      { ms: "Tambah atau tolak nilai-nilai itu dalam ml.", en: "Add or subtract the values in ml." },
      { ms: "Tukar jawapan itu balik kepada L dan ml jika perlu.", en: "Convert the answer back into L and ml if needed." },
      { ms: "Semak: adakah anda tukar SEMUA nilai liter kepada ml sebelum mengira, bukan selepas?", en: "Check: did you convert ALL litre values to ml before calculating, not after?" },
    ],
    workedExample: {
      problem: { ms: "1 L 250 ml + 300 ml", en: "1 L 250 ml + 300 ml" },
      steps: [
        { ms: "Kenal pasti: 1 L 250 ml ditambah 300 ml.", en: "Identify: 1 L 250 ml plus 300 ml." },
        { ms: "1 L = 1000 ml", en: "1 L = 1000 ml" },
        { ms: "1000 ml + 250 ml = 1250 ml", en: "1000 ml + 250 ml = 1250 ml" },
        { ms: "1250 ml + 300 ml = 1550 ml", en: "1250 ml + 300 ml = 1550 ml" },
        { ms: "Semak: 1550 ml − 300 ml = 1250 ml, dan 1250 ml = 1 L 250 ml ✓", en: "Check: 1550 ml − 300 ml = 1250 ml, and 1250 ml = 1 L 250 ml ✓" },
      ],
      answer: "1550 ml",
    },
    commonMistakes: [
      { mistakeType: "forgot_conversion", description: { ms: "Murid tidak menukar liter kepada ml dengan betul sebelum menambah, dan menambah bilangan liter terus kepada nilai ml.", en: "Student doesn't correctly convert litres to ml before adding, adding the litre count directly to the ml value." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid hanya menambah bahagian ml sahaja, mengabaikan bahagian liter sepenuhnya.", en: "Student only adds the ml parts, ignoring the litre part entirely." } },
      { mistakeType: "place_value_error", description: { ms: "Murid tersilap kira semasa menukar liter kepada ml (contohnya 2 L dikira sebagai 200 ml bukan 2000 ml).", en: "Student miscalculates when converting litres to ml (e.g. 2 L treated as 200 ml instead of 2000 ml)." } },
      { mistakeType: "wrong_operation", description: { ms: "Semasa menolak isipadu, murid menambah bukannya menolak, kerana tidak membaca konteks soalan (dituang keluar) dengan teliti.", en: "While subtracting volumes, student adds instead of subtracting, from not reading the question's context (poured out) carefully." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (dituang keluar selepas dituang masuk), murid berhenti selepas peristiwa pertama dan tidak teruskan mengira peristiwa kedua.", en: "In the challenge-tier question (poured out after poured in), the student stops after the first event and doesn't continue to account for the second." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "volume", config: {} },
      { type: "mcq", difficulty: 2, generatorKey: "volume", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "volume", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "volume", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "volume", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "volume", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000011": {
    id: "a1000000-0000-0000-0000-000000000011",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Luas Segi Empat Tepat & Segi Empat Sama", en: "Area of Rectangles & Squares" },
    yearLevel: 4,
    explanation: {
      ms: "Luas ialah keluasan ruang di dalam sesuatu bentuk. Untuk segi empat tepat, kita gunakan formula: Luas = panjang × lebar. Untuk segi empat sama, semua sisi sama panjang, jadi Luas = sisi × sisi.\n\nContoh harian: Sebidang tanah berbentuk segi empat tepat hendak ditanami rumput. Berapakah luas tanah itu?",
      en: "Area is the amount of space inside a shape. For a rectangle, we use the formula: Area = length × width. For a square, all sides are equal, so Area = side × side.\n\nEveryday example: A rectangular plot of land is going to be planted with grass. What is the area of the land?",
    },
    tips: [
      {
        ms: "Bayangkan bentuk itu dipenuhi dengan petak-petak kecil 1cm × 1cm — luas ialah jumlah petak yang boleh muat di dalamnya.",
        en: "Imagine the shape filled with tiny 1cm × 1cm squares — the area is how many of those squares fit inside it.",
      },
      {
        ms: "Jangan lupa unit luas ialah \"persegi\" (cm² atau m²), bukan sama seperti unit panjang biasa.",
        en: "Don't forget the unit for area is \"squared\" (cm² or m²), not the same as a plain length unit.",
      },
      {
        ms: "JANGAN buat ini: segi empat tepat 7 cm × 4 cm dikira sebagai perimeter 2×(7+4) = 22 cm. SALAH — soalan minta LUAS, bukan perimeter. Luas yang betul ialah 7 × 4 = 28 cm².",
        en: "DON'T do this: a rectangle 7 cm × 4 cm calculated as the perimeter 2×(7+4) = 22 cm. WRONG — the question asks for AREA, not perimeter. The correct area is 7 × 4 = 28 cm².",
      },
      {
        ms: "Cabaran: jika soalan tanya kos rumput (bukan hanya luas), cari luas dahulu, kemudian darabkan dengan kos setiap meter persegi.",
        en: "Challenge: if the question asks for the COST of grass (not just the area), find the area first, then multiply by the cost per square metre.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti panjang dan lebar bentuk itu.", en: "Identify the length and width of the shape." },
      { ms: "Darabkan panjang dengan lebar.", en: "Multiply the length by the width." },
      { ms: "Tulis jawapan dengan unit persegi yang betul (cm², m²).", en: "Write the answer with the correct squared unit (cm², m²)." },
      { ms: "Semak: adakah anda darab (bukan tambah) panjang dengan lebar?", en: "Check: did you multiply (not add) the length and width?" },
    ],
    workedExample: {
      problem: { ms: "Segi empat tepat 7 cm × 4 cm", en: "Rectangle 7 cm × 4 cm" },
      steps: [
        { ms: "Luas = panjang × lebar", en: "Area = length × width" },
        { ms: "= 7 × 4", en: "= 7 × 4" },
        { ms: "= 28 cm²", en: "= 28 cm²" },
      ],
      answer: "28 cm²",
    },
    commonMistakes: [
      { mistakeType: "area_perimeter_confusion", description: { ms: "Murid mengira perimeter (2×(panjang+lebar)) berbanding luas.", en: "The student calculates perimeter (2×(length+width)) instead of area." } },
      { mistakeType: "forgot_multiply_area", description: { ms: "Murid menambah panjang dan lebar, bukan mendarabkannya.", en: "The student adds the length and width instead of multiplying them." } },
      { mistakeType: "wrong_dimension_used", description: { ms: "Dalam soalan berbalik, murid tolak berbanding bahagi untuk mencari sisi yang tidak diketahui.", en: "In reverse-style questions, the student subtracts instead of dividing to find the missing side." } },
      { mistakeType: "arithmetic_error_in_multiplication", description: { ms: "Murid kenal pasti panjang dan lebar dengan betul tetapi tersilap kira semasa mendarab.", en: "The student correctly identifies the length and width but makes an arithmetic slip while multiplying." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (kos rumput), murid berhenti selepas cari luas dan tidak teruskan mendarab dengan kos setiap meter persegi.", en: "In the challenge-tier question (cost of grass), the student stops after finding the area and doesn't continue to multiply by the cost per square metre." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "area_rectangle", config: { min: 3, max: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "area_rectangle", config: { min: 5, max: 15 } },
      { type: "word_problem", difficulty: 2, generatorKey: "area_rectangle", config: { min: 3, max: 10, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "area_rectangle", config: { min: 3, max: 10, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_rectangle", config: { min: 3, max: 10, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_rectangle", config: { min: 3, max: 10, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000012": {
    id: "a1000000-0000-0000-0000-000000000012",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Sudut Pada Garis Lurus", en: "Angles on a Straight Line" },
    yearLevel: 5,
    explanation: {
      ms: "Sudut-sudut pada satu garis lurus akan sentiasa berjumlah 180°. Jika kita tahu satu sudut, kita boleh cari sudut satu lagi dengan tolak 180° dengan sudut yang diketahui.\n\nContoh harian: Sebatang kayu disandarkan pada dinding, membentuk dua sudut pada garis lurus lantai. Jika satu sudut ialah 65°, berapakah sudut satu lagi?",
      en: "Angles that lie along one straight line always add up to 180°. If we know one angle, we can find the other by subtracting the known angle from 180°.\n\nEveryday example: A stick leans against a wall, forming two angles along the straight line of the floor. If one angle is 65°, what is the other angle?",
    },
    tips: [
      {
        ms: "Fikirkan garis lurus sebagai separuh bulatan (180°) yang dibahagikan kepada dua bahagian oleh sudut yang diberi.",
        en: "Think of the straight line as a half-circle (180°) split into two parts by the given angle.",
      },
      {
        ms: "Semak jawapan anda: sudut yang diberi + jawapan anda MESTI menyamai 180°.",
        en: "Check your answer: the given angle + your answer MUST equal 180°.",
      },
      {
        ms: "JANGAN buat ini: satu sudut 65° pada garis lurus, sudut satu lagi dikira sebagai 90° − 65° = 25°. SALAH — sudut pada garis lurus berjumlah 180°, BUKAN 90°. Jawapan yang betul ialah 180° − 65° = 115°.",
        en: "DON'T do this: one angle is 65° on a straight line, the other calculated as 90° − 65° = 25°. WRONG — angles on a straight line add up to 180°, NOT 90°. The correct answer is 180° − 65° = 115°.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti sudut yang diberi pada garis lurus itu.", en: "Identify the given angle on the straight line." },
      { ms: "Tolak sudut itu daripada 180°.", en: "Subtract that angle from 180°." },
      { ms: "Jawapan itu ialah sudut satu lagi.", en: "The result is the other angle." },
      { ms: "Semak: adakah kedua-dua sudut itu berjumlah tepat 180°?", en: "Check: do both angles add up to exactly 180°?" },
    ],
    workedExample: {
      problem: { ms: "Satu sudut ialah 65° pada garis lurus", en: "One angle is 65° on a straight line" },
      steps: [
        { ms: "Jumlah sudut pada garis lurus = 180°", en: "Total of angles on a straight line = 180°" },
        { ms: "180° − 65° = 115°", en: "180° − 65° = 115°" },
      ],
      answer: "115°",
    },
    commonMistakes: [
      { mistakeType: "confused_with_complementary", description: { ms: "Murid tolak daripada 90° (sudut bersandar) berbanding 180°.", en: "The student subtracts from 90° (complementary angles) instead of 180°." } },
      { mistakeType: "no_operation_performed", description: { ms: "Murid menulis semula sudut yang diberi tanpa membuat sebarang pengiraan.", en: "The student just restates the given angle without performing any calculation." } },
      { mistakeType: "confused_which_angle_asked", description: { ms: "Dalam soalan berbalik, murid beri sudut yang lebih besar apabila soalan minta yang lebih kecil, atau sebaliknya.", en: "In reverse-style questions, the student gives the larger angle when the question asks for the smaller one, or vice versa." } },
      { mistakeType: "arithmetic_error_in_subtraction", description: { ms: "Murid guna kaedah yang betul (tolak daripada 180°) tetapi tersilap kira.", en: "The student uses the correct method (subtracting from 180°) but makes an arithmetic slip." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "angles_straight_line", config: {} },
      { type: "fill", difficulty: 2, generatorKey: "angles_straight_line", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "angles_straight_line", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "angles_straight_line", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "angles_straight_line", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "angles_straight_line", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000013": {
    id: "a1000000-0000-0000-0000-000000000013",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Luas Bentuk Gubahan", en: "Area of Composite Shapes" },
    yearLevel: 5,
    explanation: {
      ms: "Bentuk gubahan ialah bentuk yang dibina daripada dua atau lebih segi empat tepat/sama yang digabungkan. Untuk mencari jumlah luas, kita bahagikan bentuk itu kepada bahagian-bahagian segi empat tepat, kira luas setiap bahagian, kemudian tambahkan kesemuanya.\n\nContoh harian: Sebuah taman berbentuk 'L' dibina daripada dua kawasan segi empat tepat. Berapakah jumlah luas taman itu?",
      en: "A composite shape is made by combining two or more rectangles/squares. To find the total area, we split the shape into rectangular parts, work out each part's area, then add them all together.\n\nEveryday example: An L-shaped garden is made of two rectangular sections. What is the total area of the garden?",
    },
    tips: [
      {
        ms: "Lukis garis untuk membahagikan bentuk gubahan kepada segi empat tepat yang berasingan sebelum mengira.",
        en: "Draw a line to split the composite shape into separate rectangles before calculating.",
      },
      {
        ms: "Kira luas setiap segi empat tepat secara berasingan dahulu — jangan cuba gabungkan semua nombor dalam satu langkah.",
        en: "Work out each rectangle's area separately first — don't try to combine all the numbers in one step.",
      },
      {
        ms: "JANGAN buat ini: cari jumlah luas dengan menambah SEMUA panjang sisi (6+3+4+2=15) seperti mengira perimeter. SALAH — anda MESTI darab panjang×lebar bagi SETIAP segi empat tepat dahulu, kemudian tambah kedua-dua luas itu. Jawapan yang betul ialah 26 cm².",
        en: "DON'T do this: find the total area by adding UP ALL the side lengths (6+3+4+2=15) like calculating a perimeter. WRONG — you MUST multiply length×width for EACH rectangle first, then add the two areas. The correct answer is 26 cm².",
      },
    ],
    howTo: [
      { ms: "Bahagikan bentuk gubahan itu kepada dua atau lebih segi empat tepat.", en: "Split the composite shape into two or more rectangles." },
      { ms: "Kira luas setiap segi empat tepat secara berasingan (panjang × lebar).", en: "Calculate each rectangle's area separately (length × width)." },
      { ms: "Tambahkan semua luas itu untuk dapatkan jumlah keseluruhan.", en: "Add all those areas together to get the total." },
      { ms: "Semak: setiap luas mesti lebih besar berbanding sisi-sisinya sendiri, bukan lebih kecil.", en: "Check: each area should be bigger than its own sides, not smaller." },
    ],
    workedExample: {
      problem: { ms: "Segi Empat Tepat A: 6 cm × 3 cm, Segi Empat Tepat B: 4 cm × 2 cm", en: "Rectangle A: 6 cm × 3 cm, Rectangle B: 4 cm × 2 cm" },
      steps: [
        { ms: "Luas A = 6 × 3 = 18 cm²", en: "Area A = 6 × 3 = 18 cm²" },
        { ms: "Luas B = 4 × 2 = 8 cm²", en: "Area B = 4 × 2 = 8 cm²" },
        { ms: "Jumlah = 18 + 8 = 26 cm²", en: "Total = 18 + 8 = 26 cm²" },
      ],
      answer: "26 cm²",
    },
    commonMistakes: [
      { mistakeType: "forgot_second_rectangle", description: { ms: "Murid hanya mengira luas satu segi empat tepat sahaja.", en: "The student only calculates the area of one rectangle." } },
      { mistakeType: "area_addition_error", description: { ms: "Murid menambah semua sisi berbanding mengira setiap luas dahulu.", en: "The student adds all the side lengths together instead of finding each area first." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari sisi yang hilang (diberi jumlah luas), murid tolak luas A daripada jumlah tetapi terlupa bahagikan dengan sisi yang diketahui.", en: "When finding a missing side (given the total area), the student subtracts Rectangle A's area from the total but forgets to divide by the known side." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak anggarkan jumlah luas dahulu, jadi tidak perasan jawapan akhir tidak munasabah (contohnya lebih kecil daripada salah satu luas komponen).", en: "The student doesn't estimate the total area first, so doesn't notice when the final answer doesn't make sense (e.g. smaller than one of the component areas)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "area_composite", config: { min: 2, max: 8 } },
      { type: "fill", difficulty: 2, generatorKey: "area_composite", config: { min: 3, max: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "area_composite", config: { min: 3, max: 10, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "area_composite", config: { min: 3, max: 10, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_composite", config: { min: 2, max: 8, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_composite", config: { min: 2, max: 6, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000014": {
    id: "a1000000-0000-0000-0000-000000000014",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Jumlah Sudut Dalam Segi Tiga", en: "Sum of Angles in a Triangle" },
    yearLevel: 6,
    explanation: {
      ms: "Jumlah ketiga-tiga sudut dalam sebarang segi tiga sentiasa 180°. Jika kita tahu dua sudut, kita boleh cari sudut ketiga dengan tolak kedua-dua sudut yang diketahui daripada 180°.\n\nContoh harian: Sekeping kad berbentuk segi tiga mempunyai dua sudut 50° dan 60°. Berapakah sudut ketiga?",
      en: "The three angles in any triangle always add up to 180°. If we know two angles, we can find the third by subtracting both known angles from 180°.\n\nEveryday example: A triangular card has two angles of 50° and 60°. What is the third angle?",
    },
    tips: [
      {
        ms: "Tambah dua sudut yang diketahui dahulu, kemudian tolak jumlah itu daripada 180°.",
        en: "Add the two known angles together first, then subtract that total from 180°.",
      },
      {
        ms: "Semak jawapan anda: ketiga-tiga sudut segi tiga itu MESTI berjumlah tepat 180° apabila ditambah bersama.",
        en: "Check your answer: all three angles of the triangle MUST add up to exactly 180° together.",
      },
      {
        ms: "JANGAN buat ini: sudut 50° dan 60°, sudut ketiga dikira sebagai 360° − 50° − 60° = 250°. SALAH — jumlah sudut dalam segi tiga ialah 180°, BUKAN 360° (itu untuk sudut pada satu titik). Jawapan yang betul ialah 180° − 50° − 60° = 70°.",
        en: "DON'T do this: angles 50° and 60°, third angle calculated as 360° − 50° − 60° = 250°. WRONG — the angle sum in a triangle is 180°, NOT 360° (that's for angles at a point). The correct answer is 180° − 50° − 60° = 70°.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti kedua-dua sudut yang diberi dalam segi tiga itu.", en: "Identify the two given angles in the triangle." },
      { ms: "Tambahkan kedua-dua sudut itu bersama.", en: "Add those two angles together." },
      { ms: "Tolak jumlah itu daripada 180°.", en: "Subtract that total from 180°." },
      { ms: "Semak: adakah ketiga-tiga sudut berjumlah tepat 180°?", en: "Check: do all three angles add up to exactly 180°?" },
    ],
    workedExample: {
      problem: { ms: "Dua sudut: 50° dan 60°", en: "Two angles: 50° and 60°" },
      steps: [
        { ms: "Tambah dua sudut: 50° + 60° = 110°", en: "Add the two angles: 50° + 60° = 110°" },
        { ms: "180° − 110° = 70°", en: "180° − 110° = 70°" },
      ],
      answer: "70°",
    },
    commonMistakes: [
      { mistakeType: "confused_angle_sum_360", description: { ms: "Murid tolak daripada 360° (sudut pada satu titik) berbanding 180°.", en: "The student subtracts from 360° (angles at a point) instead of 180°." } },
      { mistakeType: "only_subtracted_one_angle", description: { ms: "Murid hanya tolak satu daripada dua sudut yang diberi.", en: "The student only subtracts one of the two given angles." } },
      { mistakeType: "confused_which_angle_asked", description: { ms: "Dalam soalan berbalik, murid keliru sudut mana yang perlu dicari apabila diberi sudut ketiga.", en: "In reverse-style questions, the student is confused about which angle to find when given the third angle." } },
      { mistakeType: "arithmetic_error_in_addition", description: { ms: "Murid guna kaedah yang betul tetapi tersilap kira semasa menambah atau menolak.", en: "The student uses the correct method but makes an arithmetic slip while adding or subtracting." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "angles_triangle_sum", config: {} },
      { type: "fill", difficulty: 2, generatorKey: "angles_triangle_sum", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "angles_triangle_sum", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "angles_triangle_sum", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "angles_triangle_sum", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "angles_triangle_sum", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000015": {
    id: "a1000000-0000-0000-0000-000000000015",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Jenis-Jenis Sudut", en: "Types of Angles" },
    yearLevel: 4,
    explanation: {
      ms: "Sudut boleh dikelaskan mengikut saiznya:\n• Sudut Tirus (Acute) — kurang daripada 90°\n• Sudut Tegak (Right Angle) — tepat 90°\n• Sudut Cakah (Obtuse) — lebih daripada 90° tetapi kurang daripada 180°\n• Sudut Refleks (Reflex) — lebih daripada 180° tetapi kurang daripada 360°\n\nContoh harian: Bucu meja biasanya sudut tegak (90°). Bucu jam menunjukkan pelbagai jenis sudut bergantung pada waktu.",
      en: "Angles are classified by their size:\n• Acute — less than 90°\n• Right Angle — exactly 90°\n• Obtuse — more than 90° but less than 180°\n• Reflex — more than 180° but less than 360°\n\nEveryday example: The corner of a table is usually a right angle (90°). A clock's hands show different angle types depending on the time.",
    },
    tips: [
      { ms: "Tirus, Tegak, Cakah, Refleks — saiznya makin membesar, ingat: 'Tikus Tak Cari Rumah' (T-T-C-R)!", en: "Acute, Right, Obtuse, Reflex — the size keeps growing, remember: 'All The Other Rabbits' (A-R-O-R)!" },
      { ms: "JANGAN buat ini: memilih 'Sudut Tegak' hanya kerana sudut itu kelihatan hampir 90°. SALAH — sudut tegak MESTI tepat 90° (bertanda petak □). Jika ia sedikit lebih besar (contohnya 100°), ia Cakah, bukan Tegak.", en: "DON'T do this: picking 'Right Angle' just because the angle looks close to 90°. WRONG — a right angle MUST be exactly 90° (marked with a square □). If it's a bit bigger (e.g. 100°), it's Obtuse, not Right." },
      { ms: "Petua pantas: jika sudut itu 'terbuka luas', melepasi lurus (180°), ia mesti Refleks — tiada jenis lain yang lebih besar daripada itu.", en: "Quick trick: if the angle looks 'wide open', past a straight line (180°), it must be Reflex — no other type is bigger than that." },
    ],
    howTo: [
      { ms: "Lihat rajah sudut dengan teliti.", en: "Look at the angle diagram carefully." },
      { ms: "Anggarkan saiz sudut itu berbanding sudut tegak (90°).", en: "Estimate the angle's size compared to a right angle (90°)." },
      { ms: "Jika ia kurang daripada 90°, kelaskan sebagai Tirus.", en: "If it's less than 90°, classify it as Acute." },
      { ms: "Jika ia tepat 90° (bertanda petak □), kelaskan sebagai Tegak.", en: "If it's exactly 90° (marked with a square □), classify it as Right." },
      { ms: "Semak: jika ia antara 90° dan 180°, ia Cakah; jika melebihi 180°, ia Refleks.", en: "Check: if it's between 90° and 180°, it's Obtuse; if it's more than 180°, it's Reflex." },
    ],
    workedExample: {
      problem: { ms: "Sudut 130°", en: "Angle 130°" },
      steps: [
        { ms: "Lihat rajah: sudut ini bersilang tetapi tiada petanda petak (□).", en: "Look at the diagram: the angle crosses but has no square marker (□)." },
        { ms: "130° lebih besar daripada 90°", en: "130° is greater than 90°" },
        { ms: "130° kurang daripada 180°", en: "130° is less than 180°" },
        { ms: "Jadi ia adalah Sudut Cakah (Obtuse)", en: "So it is an Obtuse angle" },
        { ms: "Semak: 130° berada antara 90° dan 180° — konsisten dengan Cakah ✓", en: "Check: 130° falls between 90° and 180° — consistent with Obtuse ✓" },
      ],
      answer: "Sudut Cakah (Obtuse)",
      diagram: { kind: "angle", degrees: 130 },
    },
    commonMistakes: [
      { mistakeType: "special_case_error", description: { ms: "Murid memilih 'Sudut Tegak' walaupun sudut itu bukan tepat 90°, kerana ia kelihatan hampir sama.", en: "Student picks 'Right Angle' even though the angle isn't exactly 90°, because it looks close." } },
      { mistakeType: "keyword_only_classification", description: { ms: "Murid tidak menyedari sudut refleks perlu melebihi 180°, dan mengelaskan sudut besar sebagai Cakah sahaja.", en: "Student doesn't recognize that a reflex angle must be greater than 180°, and classifies any large angle as just Obtuse." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid mengelirukan turutan saiz (contohnya menganggap Cakah lebih kecil daripada Tirus), menyebabkan jawapan tertukar antara dua kategori.", en: "Student mixes up the size order (e.g. thinks Obtuse is smaller than Acute), causing the answer to swap between two categories." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid keliru antara sudut dan bentuk keseluruhan bagi objek (contohnya menilai keseluruhan bentuk segi tiga, bukan hanya satu bucu/sudutnya).", en: "Student confuses the angle with the overall shape of the object (e.g. judges the whole triangle shape instead of just one corner/angle)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "angles_classify", config: {} },
      { type: "mcq", difficulty: 1, generatorKey: "angles_classify", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "angles_classify", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "angles_classify", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "angles_classify", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000016": {
    id: "a1000000-0000-0000-0000-000000000016",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Luas Segi Tiga", en: "Area of a Triangle" },
    yearLevel: 6,
    explanation: {
      ms: "Luas segi tiga ialah separuh daripada luas segi empat tepat yang mempunyai tapak dan tinggi yang sama. Formula: Luas = ½ × tapak × tinggi.\n\nContoh harian: Sekeping kain berbentuk segi tiga hendak dipotong. Berapakah luas kain itu?",
      en: "The area of a triangle is half the area of a rectangle with the same base and height. Formula: Area = ½ × base × height.\n\nEveryday example: A triangular piece of cloth needs to be cut. What is the area of the cloth?",
    },
    tips: [
      {
        ms: "Darabkan tapak dengan tinggi dahulu, kemudian bahagikan jawapan itu dengan 2 — jangan bahagikan tapak atau tinggi secara berasingan.",
        en: "Multiply the base by the height first, then divide that answer by 2 — don't divide the base or height separately.",
      },
      {
        ms: "Tinggi segi tiga MESTI diukur secara tegak lurus (bersudut 90°) daripada tapak ke bucu atas — bukan panjang sisi condong.",
        en: "The height of a triangle MUST be measured perpendicular (at 90°) from the base to the top vertex — not the length of a slanted side.",
      },
      {
        ms: "JANGAN buat ini: tapak 8 cm, tinggi 5 cm dikira sebagai 8 × 5 = 40 cm² dan berhenti di situ. SALAH — anda MESTI bahagi dengan 2 selepas darab. Jawapan yang betul ialah 40 ÷ 2 = 20 cm².",
        en: "DON'T do this: base 8 cm, height 5 cm calculated as 8 × 5 = 40 cm² and stopping there. WRONG — you MUST divide by 2 after multiplying. The correct answer is 40 ÷ 2 = 20 cm².",
      },
      {
        ms: "Cabaran: jika soalan tanya kos kain (bukan hanya luas), cari luas dahulu, kemudian darabkan dengan kos setiap sentimeter persegi.",
        en: "Challenge: if the question asks for the COST of the cloth (not just the area), find the area first, then multiply by the cost per square centimetre.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti tapak dan tinggi segi tiga itu.", en: "Identify the triangle's base and height." },
      { ms: "Darabkan tapak dengan tinggi.", en: "Multiply the base by the height." },
      { ms: "Bahagikan hasil darab itu dengan 2.", en: "Divide that product by 2." },
      { ms: "Semak: adakah anda bahagi dengan 2 SELEPAS darab, bukan sebelum?", en: "Check: did you divide by 2 AFTER multiplying, not before?" },
    ],
    workedExample: {
      problem: { ms: "Tapak 8 cm, tinggi 5 cm", en: "Base 8 cm, height 5 cm" },
      steps: [
        { ms: "Luas = ½ × tapak × tinggi", en: "Area = ½ × base × height" },
        { ms: "= ½ × 8 × 5", en: "= ½ × 8 × 5" },
        { ms: "= ½ × 40", en: "= ½ × 40" },
        { ms: "= 20 cm²", en: "= 20 cm²" },
      ],
      answer: "20 cm²",
      diagram: { kind: "triangle", base: 8, height: 5 },
    },
    commonMistakes: [
      { mistakeType: "forgot_to_halve", description: { ms: "Murid mengira tapak × tinggi tanpa membahagikan dengan 2.", en: "The student calculates base × height without dividing by 2." } },
      { mistakeType: "halved_both_dimensions", description: { ms: "Murid membahagikan tapak dan tinggi dengan 2 secara berasingan sebelum mendarab.", en: "The student divides the base and height by 2 separately before multiplying." } },
      { mistakeType: "used_slanted_side_as_height", description: { ms: "Murid guna panjang sisi condong sebagai tinggi, bukan jarak tegak lurus sebenar.", en: "The student uses the length of a slanted side as the height, instead of the actual perpendicular distance." } },
      { mistakeType: "arithmetic_error_in_division", description: { ms: "Murid darab tapak dan tinggi dengan betul tetapi tersilap kira semasa bahagi dengan 2.", en: "The student multiplies the base and height correctly but makes an arithmetic slip while dividing by 2." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (kos kain), murid berhenti selepas cari luas dan tidak teruskan mendarab dengan kos setiap sentimeter persegi.", en: "In the challenge-tier question (cost of cloth), the student stops after finding the area and doesn't continue to multiply by the cost per square centimetre." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "area_triangle", config: { min: 4, max: 16 } },
      { type: "fill", difficulty: 2, generatorKey: "area_triangle", config: { min: 4, max: 16 } },
      { type: "word_problem", difficulty: 2, generatorKey: "area_triangle", config: { min: 6, max: 20, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "area_triangle", config: { min: 4, max: 16, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_triangle", config: { min: 6, max: 20, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_triangle", config: { min: 6, max: 20, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000017": {
    id: "a1000000-0000-0000-0000-000000000017",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Sudut Pada Satu Titik", en: "Angles at a Point" },
    yearLevel: 5,
    explanation: {
      ms: "Apabila beberapa sudut bertemu pada satu titik dan mengelilinginya sepenuhnya, jumlah kesemua sudut itu ialah 360° (satu pusingan penuh). Jika kita tahu semua sudut kecuali satu, kita boleh cari sudut yang hilang dengan tolak jumlah sudut yang diketahui daripada 360°.\n\nContoh harian: Tiga jalan bertemu pada satu bulatan (roundabout). Dua daripada sudut antara jalan itu ialah 110° dan 95°. Berapakah sudut ketiga?",
      en: "When several angles meet at a single point and go all the way around it, they add up to 360° (one full turn). If we know all but one of the angles, we can find the missing one by subtracting the known angles from 360°.\n\nEveryday example: Three roads meet at a roundabout. Two of the angles between the roads are 110° and 95°. What is the third angle?",
    },
    tips: [
      {
        ms: "Bayangkan satu pusingan penuh mengelilingi titik itu — jumlahnya sentiasa 360°, tidak kira berapa banyak sudut yang membahagikannya.",
        en: "Imagine one full turn around the point — it always totals 360°, no matter how many angles divide it up.",
      },
      {
        ms: "Jangan keliru dengan sudut pada garis lurus (180°) — sudut pada satu titik mengelilingi TITIK itu sepenuhnya, bukan hanya separuh.",
        en: "Don't confuse this with angles on a straight line (180°) — angles at a point go all the way around the point, not just halfway.",
      },
      {
        ms: "JANGAN buat ini: sudut 110° dan 95°, sudut ketiga dikira sebagai 180° − 110° − 95° = −25°. SALAH — jumlah sudut pada satu titik ialah 360°, BUKAN 180° (itu untuk garis lurus). Jawapan yang betul ialah 360° − 110° − 95° = 155°.",
        en: "DON'T do this: angles 110° and 95°, third angle calculated as 180° − 110° − 95° = −25°. WRONG — the angle sum at a point is 360°, NOT 180° (that's for a straight line). The correct answer is 360° − 110° − 95° = 155°.",
      },
    ],
    howTo: [
      { ms: "Tambahkan semua sudut yang diketahui.", en: "Add up all the known angles." },
      { ms: "Tolak jumlah itu daripada 360°.", en: "Subtract that total from 360°." },
      { ms: "Jawapan itu ialah sudut yang hilang.", en: "The result is the missing angle." },
      { ms: "Semak: adakah kesemua sudut berjumlah tepat 360°?", en: "Check: do all the angles add up to exactly 360°?" },
    ],
    workedExample: {
      problem: { ms: "Dua sudut: 110° dan 95°", en: "Two angles: 110° and 95°" },
      steps: [
        { ms: "Tambah dua sudut: 110° + 95° = 205°", en: "Add the two angles: 110° + 95° = 205°" },
        { ms: "360° − 205° = 155°", en: "360° − 205° = 155°" },
      ],
      answer: "155°",
      diagram: { kind: "point3", angleA: 110, angleB: 95 },
    },
    commonMistakes: [
      { mistakeType: "confused_with_180", description: { ms: "Murid tolak daripada 180° (garis lurus/segi tiga) berbanding 360°.", en: "The student subtracts from 180° (straight line/triangle) instead of 360°." } },
      { mistakeType: "only_subtracted_one_angle", description: { ms: "Murid hanya tolak satu daripada dua sudut yang diberi.", en: "The student only subtracts one of the two given angles." } },
      { mistakeType: "confused_which_angle_asked", description: { ms: "Dalam soalan berbalik, murid keliru sudut mana yang perlu dicari apabila diberi sudut ketiga.", en: "In reverse-style questions, the student is confused about which angle to find when given the third angle." } },
      { mistakeType: "arithmetic_error_in_addition", description: { ms: "Murid guna kaedah yang betul tetapi tersilap kira semasa menambah atau menolak.", en: "The student uses the correct method but makes an arithmetic slip while adding or subtracting." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "angles_at_point", config: {} },
      { type: "fill", difficulty: 2, generatorKey: "angles_at_point", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "angles_at_point", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "angles_at_point", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "angles_at_point", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "angles_at_point", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000018": {
    id: "a1000000-0000-0000-0000-000000000018",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Lilitan Bulatan", en: "Circumference of a Circle" },
    yearLevel: 6,
    explanation: {
      ms: "Lilitan ialah jarak mengelilingi sepenuhnya sebuah bulatan — seperti perimeter, tetapi untuk bentuk bulat. Formula: Lilitan = 2 × π × jejari, dengan π (pi) lebih kurang 3.142.\n\nContoh harian: Sebuah kolam berbentuk bulat mempunyai jejari 7 m. Berapakah panjang pagar yang diperlukan untuk mengelilinginya?",
      en: "Circumference is the distance all the way around a circle — like perimeter, but for a round shape. Formula: Circumference = 2 × π × radius, where π (pi) is approximately 3.142.\n\nEveryday example: A circular pond has a radius of 7 m. How much fencing is needed to go all the way around it?",
    },
    tips: [
      {
        ms: "π (pi) ialah nombor tetap ≈ 3.142 — ia sentiasa sama tidak kira saiz bulatan.",
        en: "π (pi) is a fixed number ≈ 3.142 — it's always the same no matter the size of the circle.",
      },
      {
        ms: "Jika soalan memberi diameter (bukan jejari), anda tidak perlu darab dengan 2 lagi — diameter sudah merupakan 2 × jejari.",
        en: "If the question gives the diameter (not the radius), you don't need to multiply by 2 again — the diameter already IS 2 × radius.",
      },
      {
        ms: "JANGAN buat ini: jejari 7 cm dikira sebagai lilitan = 3.142 × 7 = 21.99 cm (terlepas gandakan dahulu). SALAH — anda MESTI gandakan jejari dengan 2 SEBELUM darab dengan π. Jawapan yang betul ialah 2 × 3.142 × 7 = 43.99 cm.",
        en: "DON'T do this: radius 7 cm calculated as circumference = 3.142 × 7 = 21.99 cm (missing the doubling step). WRONG — you MUST double the radius by 2 BEFORE multiplying by π. The correct answer is 2 × 3.142 × 7 = 43.99 cm.",
      },
      {
        ms: "Cabaran: jika soalan tanya kos pagar (bukan hanya lilitan), cari lilitan dahulu, kemudian darabkan dengan kos setiap meter.",
        en: "Challenge: if the question asks for the COST of fencing (not just the circumference), find the circumference first, then multiply by the cost per metre.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti jejari bulatan itu.", en: "Identify the circle's radius." },
      { ms: "Gandakan jejari dengan 2 untuk dapatkan diameter.", en: "Double the radius to get the diameter." },
      { ms: "Darabkan diameter itu dengan π (3.142).", en: "Multiply that diameter by π (3.142)." },
      { ms: "Semak: adakah anda gandakan jejari SEBELUM darab dengan π?", en: "Check: did you double the radius BEFORE multiplying by π?" },
    ],
    workedExample: {
      problem: { ms: "Jejari 7 cm", en: "Radius 7 cm" },
      steps: [
        { ms: "Lilitan = 2 × π × jejari", en: "Circumference = 2 × π × radius" },
        { ms: "= 2 × 3.142 × 7", en: "= 2 × 3.142 × 7" },
        { ms: "= 43.99 cm", en: "= 43.99 cm" },
      ],
      answer: "43.99 cm",
      diagram: { kind: "circle", radius: 7 },
    },
    commonMistakes: [
      { mistakeType: "forgot_to_double_radius", description: { ms: "Murid mendarab jejari dengan π sahaja, lupa gandakan dengan 2 dahulu.", en: "The student multiplies the radius by π alone, forgetting to double it first." } },
      { mistakeType: "confused_with_area_formula", description: { ms: "Murid menggunakan formula luas (π × jejari²) berbanding formula lilitan.", en: "The student uses the area formula (π × radius²) instead of the circumference formula." } },
      { mistakeType: "wrong_reverse_method", description: { ms: "Dalam soalan berbalik, murid bahagikan lilitan dengan π sahaja tanpa bahagi 2 juga, jadi dapat diameter bukan jejari.", en: "In reverse-style questions, the student divides the circumference by π alone without also dividing by 2, getting the diameter instead of the radius." } },
      { mistakeType: "arithmetic_error_in_multiplication", description: { ms: "Murid guna formula yang betul tetapi tersilap kira semasa mendarab.", en: "The student uses the correct formula but makes an arithmetic slip while multiplying." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (kos pagar), murid berhenti selepas cari lilitan dan tidak teruskan mendarab dengan kos setiap meter.", en: "In the challenge-tier question (cost of fencing), the student stops after finding the circumference and doesn't continue to multiply by the cost per metre." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "circumference", config: { min: 3, max: 20 } },
      { type: "fill", difficulty: 3, generatorKey: "circumference", config: { min: 5, max: 25 } },
      { type: "word_problem", difficulty: 3, generatorKey: "circumference", config: { min: 3, max: 20, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "circumference", config: { min: 3, max: 20, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "circumference", config: { min: 3, max: 20, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "circumference", config: { min: 3, max: 20, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000019": {
    id: "a1000000-0000-0000-0000-000000000019",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Luas Bulatan", en: "Area of a Circle" },
    yearLevel: 6,
    explanation: {
      ms: "Luas bulatan ialah ruang di dalam bulatan itu. Formula: Luas = π × jejari × jejari, dengan π (pi) lebih kurang 3.142.\n\nContoh harian: Sekeping meja bulat mempunyai jejari 50 cm. Berapakah luas permukaan meja itu?",
      en: "The area of a circle is the space inside it. Formula: Area = π × radius × radius, where π (pi) is approximately 3.142.\n\nEveryday example: A round table has a radius of 50 cm. What is the area of the tabletop?",
    },
    tips: [
      {
        ms: "Formula ini guna jejari, BUKAN diameter. Jika soalan beri diameter, bahagikan dengan 2 dahulu untuk dapatkan jejari.",
        en: "This formula uses the radius, NOT the diameter. If the question gives the diameter, divide by 2 first to get the radius.",
      },
      {
        ms: "Jangan keliru dengan lilitan (2 × π × jejari) — luas melibatkan jejari didarab dengan DIRINYA, bukan didarab dengan 2.",
        en: "Don't mix this up with circumference (2 × π × radius) — area involves multiplying the radius by ITSELF, not by 2.",
      },
      {
        ms: "JANGAN buat ini: jejari 5 cm dikira sebagai luas = 2 × 3.142 × 5 = 31.42 cm² (guna formula lilitan). SALAH — luas MESTI guna jejari × jejari, bukan × 2. Jawapan yang betul ialah 3.142 × 5 × 5 = 78.55 cm².",
        en: "DON'T do this: radius 5 cm calculated as area = 2 × 3.142 × 5 = 31.42 cm² (using the circumference formula). WRONG — area MUST use radius × radius, not × 2. The correct answer is 3.142 × 5 × 5 = 78.55 cm².",
      },
      {
        ms: "Cabaran: jika soalan tanya kos kanvas (bukan hanya luas), cari luas dahulu, kemudian darabkan dengan kos setiap sentimeter persegi.",
        en: "Challenge: if the question asks for the COST of canvas (not just the area), find the area first, then multiply by the cost per square centimetre.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti jejari bulatan itu (bahagikan diameter dengan 2 jika perlu).", en: "Identify the circle's radius (divide the diameter by 2 if needed)." },
      { ms: "Darabkan jejari dengan dirinya sendiri (jejari × jejari).", en: "Multiply the radius by itself (radius × radius)." },
      { ms: "Darabkan hasil itu dengan π (3.142).", en: "Multiply that result by π (3.142)." },
      { ms: "Semak: adakah anda darab jejari dengan DIRINYA, bukan dengan 2?", en: "Check: did you multiply the radius by ITSELF, not by 2?" },
    ],
    workedExample: {
      problem: { ms: "Jejari 5 cm", en: "Radius 5 cm" },
      steps: [
        { ms: "Luas = π × jejari × jejari", en: "Area = π × radius × radius" },
        { ms: "= 3.142 × 5 × 5", en: "= 3.142 × 5 × 5" },
        { ms: "= 78.55 cm²", en: "= 78.55 cm²" },
      ],
      answer: "78.55 cm²",
      diagram: { kind: "circle", radius: 5 },
    },
    commonMistakes: [
      { mistakeType: "confused_with_circumference_formula", description: { ms: "Murid menggunakan formula lilitan (2 × π × jejari) berbanding formula luas.", en: "The student uses the circumference formula (2 × π × radius) instead of the area formula." } },
      { mistakeType: "squared_diameter_instead", description: { ms: "Murid mendarab diameter dengan dirinya, bukan jejari.", en: "The student squares the diameter instead of the radius." } },
      { mistakeType: "wrong_reverse_method", description: { ms: "Dalam soalan berbalik, murid guna kaedah bahagi lilitan (÷π÷2) berbanding punca kuasa dua yang betul untuk cari jejari.", en: "In reverse-style questions, the student uses the circumference-division method (÷π÷2) instead of correctly working back through the square to find the radius." } },
      { mistakeType: "arithmetic_error_in_multiplication", description: { ms: "Murid guna formula yang betul tetapi tersilap kira semasa mendarab.", en: "The student uses the correct formula but makes an arithmetic slip while multiplying." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (kos kanvas), murid berhenti selepas cari luas dan tidak teruskan mendarab dengan kos setiap sentimeter persegi.", en: "In the challenge-tier question (cost of canvas), the student stops after finding the area and doesn't continue to multiply by the cost per square centimetre." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "area_circle", config: { min: 3, max: 15 } },
      { type: "fill", difficulty: 3, generatorKey: "area_circle", config: { min: 4, max: 18 } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_circle", config: { min: 3, max: 15, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "area_circle", config: { min: 3, max: 15, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_circle", config: { min: 3, max: 15, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "area_circle", config: { min: 3, max: 15, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000020": {
    id: "a1000000-0000-0000-0000-000000000020",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tolak Nombor Bulat Hingga 100000", en: "Subtracting Whole Numbers up to 100,000" },
    yearLevel: 4,
    explanation: {
      ms: "Menolak nombor besar berfungsi sama seperti menolak nombor kecil — susun ikut nilai tempat dan tolak dari kanan ke kiri. Apabila digit atas lebih kecil daripada digit bawah, kita perlu \"pinjam\" 1 daripada lajur sebelah kiri.\n\nContoh harian: Sebuah kedai ada 84500 biji telur pada awal bulan. Selepas dijual 37800 biji, berapa biji yang tinggal?",
      en: "Subtracting large numbers works the same way as small ones — line up by place value and subtract from right to left. When the top digit is smaller than the bottom digit, we need to \"borrow\" 1 from the column on the left.\n\nEveryday example: A shop starts the month with 84,500 eggs. After selling 37,800, how many are left?",
    },
    tips: [
      {
        ms: "Susun kedua-dua nombor menegak ikut nilai tempat, sama seperti tambah — tetapi nombor yang lebih besar mesti di atas.",
        en: "Line up both numbers vertically by place value, just like addition — but the bigger number must go on top.",
      },
      {
        ms: "Anggarkan jawapan dahulu dengan membundarkan kedua-dua nombor — ini membantu anda kesan jika jawapan akhir tidak masuk akal.",
        en: "Estimate the answer first by rounding both numbers — this helps you catch it if your final answer doesn't make sense.",
      },
      {
        ms: "JANGAN buat ini: 34 − 78 (dalam satu lajur) dikira sebagai 78 − 34 = 44 kerana \"lebih senang\". SALAH — anda MESTI pinjam 1 daripada lajur sebelah kiri apabila digit atas lebih kecil, bukan tukar susunan.",
        en: "DON'T do this: 34 − 78 (within one column) calculated as 78 − 34 = 44 because it's \"easier\". WRONG — you MUST borrow 1 from the column on the left when the top digit is smaller, not swap the order around.",
      },
      {
        ms: "Cabaran: jika ada DUA jualan berturutan, jangan berhenti selepas yang pertama — tolak jualan KEDUA daripada baki selepas jualan pertama.",
        en: "Challenge: if there are TWO sales one after another, don't stop after the first — subtract the SECOND sale from the remainder after the first.",
      },
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor menegak, nombor lebih besar di atas.", en: "Line the two numbers up vertically, with the bigger number on top." },
      { ms: "Tolak lajur sa (paling kanan) dahulu.", en: "Subtract the ones column (rightmost) first." },
      { ms: "Jika digit atas lebih kecil, \"pinjam\" 1 daripada lajur sebelah kiri sebelum menolak.", en: "If the top digit is smaller, \"borrow\" 1 from the column on the left before subtracting." },
      { ms: "Ulang proses ini bagi setiap lajur sehingga ke kiri sekali.", en: "Repeat this for every column, moving left, until you reach the last one." },
    ],
    workedExample: {
      problem: { ms: "84500 − 37800", en: "84500 − 37800" },
      steps: [
        { ms: "0 − 0 = 0 (sa)", en: "0 − 0 = 0 (ones)" },
        { ms: "0 − 0 = 0 (puluh)", en: "0 − 0 = 0 (tens)" },
        { ms: "5 − 8: pinjam 1, jadi 15 − 8 = 7 (ratus)", en: "5 − 8: borrow 1, so 15 − 8 = 7 (hundreds)" },
        { ms: "3(baki)−1(pinjam)=3, 3 − 7: pinjam 1, jadi 13 − 7 = 6 (ribu)", en: "3(remaining)−1(borrowed)=3, 3 − 7: borrow 1, so 13 − 7 = 6 (thousands)" },
        { ms: "7(baki)−1(pinjam)=6, 6 − 3 = 3 (puluh ribu)", en: "7(remaining)−1(borrowed)=6, 6 − 3 = 3 (ten thousands)" },
      ],
      answer: 46700,
      diagram: { kind: "vertical_arithmetic", operands: ["84500", "37800"], operator: "\u2212", result: "46700" },
    },
    commonMistakes: [
      { mistakeType: "forgot_borrow", description: { ms: "Murid tolak digit lebih kecil daripada digit lebih besar mengikut susunan terbalik (bukan pinjam).", en: "The student subtracts the smaller digit from the larger one regardless of position, instead of borrowing." } },
      { mistakeType: "place_value_misalignment", description: { ms: "Murid tidak susun nombor ikut nilai tempat dengan betul.", en: "The student doesn't line up digits by the correct place value column." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah berbanding menolak (atau sebaliknya) apabila menyelesaikan masalah.", en: "The student adds instead of subtracting (or vice versa) when solving the problem." } },
      { mistakeType: "chained_borrow_error", description: { ms: "Murid pinjam dengan betul di satu lajur tetapi lupa tolak 1 daripada lajur yang dipinjam pada langkah seterusnya.", en: "The student borrows correctly in one column but forgets to subtract 1 from the borrowed-from column in the next step." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan dua jualan, murid berhenti selepas jualan PERTAMA dan lupa tolak jualan kedua.", en: "In a two-sale question, the student stops after the FIRST sale and forgets to subtract the second." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_subtraction", config: { min: 15000, max: 45000 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_subtraction", config: { min: 25000, max: 90000 } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_subtraction", config: { min: 15000, max: 45000, type: "word_problem" } },
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_subtraction", config: { min: 15000, max: 45000, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_subtraction", config: { min: 15000, max: 45000, reverseProblem: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_subtraction", config: { min: 15000, max: 45000, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000021": {
    id: "a1000000-0000-0000-0000-000000000021",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Darab Dengan Nombor 2 Digit", en: "Multiplying by a 2-Digit Number" },
    yearLevel: 5,
    explanation: {
      ms: "Apabila mendarab dengan nombor 2 digit, kita darab secara berasingan dengan digit sa, kemudian dengan digit puluh, lalu tambahkan kedua-dua hasil itu. Hasil darab dengan digit puluh mesti dianjak satu tempat ke kiri (tambah 0 di hujung) sebelum ditambah.\n\nContoh harian: Sebuah kilang mengeluarkan 245 tin susu setiap hari. Berapa tin dikeluarkan dalam 23 hari?",
      en: "When multiplying by a 2-digit number, we multiply separately by the ones digit, then by the tens digit, then add both results together. The result from the tens digit must be shifted one place left (add a trailing 0) before adding.\n\nEveryday example: A factory produces 245 tins of milk every day. How many tins are produced in 23 days?",
    },
    tips: [
      {
        ms: "Bahagikan pengiraan itu kepada dua langkah: darab dengan digit sa dahulu, kemudian dengan digit puluh secara berasingan.",
        en: "Split the calculation into two steps: multiply by the ones digit first, then the tens digit separately.",
      },
      {
        ms: "Apabila mendarab dengan digit puluh, letakkan 0 di lajur sa hasil darab kedua itu sebelum menambah — ini penting!",
        en: "When multiplying by the tens digit, place a 0 in the ones column of that second product before adding — this step is easy to skip.",
      },
      {
        ms: "JANGAN buat ini: 245 × 23 dikira sebagai 245×2 + 245×3 = 490 + 735 = 1225 (tak anjak hasil darab puluh). SALAH — 245 × 20 = 4900, bukan 245 × 2 = 490. Anda MESTI darab dengan nilai puluh sebenar (20), bukan digit itu sahaja (2). Jawapan yang betul ialah 5,635.",
        en: "DON'T do this: 245 × 23 calculated as 245×2 + 245×3 = 490 + 735 = 1225 (not shifting the tens product). WRONG — 245 × 20 = 4900, not 245 × 2 = 490. You MUST multiply by the actual tens value (20), not just the digit (2). The correct answer is 5,635.",
      },
      {
        ms: "Cabaran: jika soalan tanya jumlah untuk bilangan hari yang BAHARU, cari kadar harian dahulu (jumlah asal ÷ bilangan hari asal), kemudian darab dengan bilangan hari baharu.",
        en: "Challenge: if the question asks for a total over a NEW number of days, find the daily rate first (original total ÷ original days), then multiply by the new number of days.",
      },
    ],
    howTo: [
      { ms: "Darabkan nombor pertama dengan digit sa nombor kedua.", en: "Multiply the first number by the ones digit of the second number." },
      { ms: "Darabkan nombor pertama dengan digit puluh nombor kedua, kemudian anjak hasil itu satu tempat ke kiri.", en: "Multiply the first number by the tens digit of the second number, then shift that result one place to the left." },
      { ms: "Tambahkan kedua-dua hasil darab itu.", en: "Add the two products together." },
      { ms: "Semak: bahagikan jawapan anda dengan salah satu nombor asal — ia mesti menyamai nombor yang satu lagi. Jika soalan minta unjuran untuk bilangan hari lain, ulangi darab dengan kadar harian itu.", en: "Check: divide your answer by one of the original numbers — it should equal the other one. If the question asks for a projection over a different number of days, multiply the daily rate by that new number." },
    ],
    workedExample: {
      problem: { ms: "245 × 23", en: "245 × 23" },
      steps: [
        { ms: "245 × 3 = 735", en: "245 × 3 = 735" },
        { ms: "245 × 20 = 4900", en: "245 × 20 = 4900" },
        { ms: "735 + 4900 = 5635", en: "735 + 4900 = 5635" },
      ],
      answer: 5635,
    },
    commonMistakes: [
      { mistakeType: "forgot_shift", description: { ms: "Murid darab dengan digit puluh tetapi lupa anjak hasilnya (lupa tambah 0).", en: "The student multiplies by the tens digit but forgets to shift the result (forgets the trailing 0)." } },
      { mistakeType: "added_instead_of_multiplied", description: { ms: "Murid menambah kedua-dua nombor berbanding mendarabkannya.", en: "The student adds the two numbers instead of multiplying them." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak anggarkan hasil darab dahulu, jadi tidak perasan jawapan akhir tidak munasabah (contohnya lebih kecil daripada salah satu nombor asal).", en: "The student doesn't estimate the product first, so doesn't notice when the final answer doesn't make sense (e.g. smaller than one of the original numbers)." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan dua langkah (unjur untuk bilangan hari baharu), murid berhenti selepas cari kadar harian dan lupa teruskan darab dengan hari baharu.", en: "In a two-step projection question, the student stops after finding the daily rate and forgets to continue by multiplying by the new day count." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_multiplication", config: { min: 100, max: 999 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_multiplication", config: { min: 100, max: 500 } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_multiplication", config: { min: 100, max: 500, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_multiplication", config: { min: 100, max: 500, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_multiplication", config: { min: 100, max: 500, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_multiplication", config: { min: 100, max: 500, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000022": {
    id: "a1000000-0000-0000-0000-000000000022",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Bahagi Dengan Nombor 2 Digit", en: "Dividing by a 2-Digit Number" },
    yearLevel: 6,
    explanation: {
      ms: "Membahagi ialah mencari berapa kali satu nombor (pembahagi) boleh masuk ke dalam nombor lain (bahagi). Apabila pembahagi ialah nombor 2 digit, kita anggarkan dahulu berapa kali ia boleh masuk, kemudian semak dengan darab semula.\n\nContoh harian: 1288 biji buku hendak diagihkan sama rata kepada 23 buah kelas. Berapa biji buku setiap kelas terima?",
      en: "Dividing means finding how many times one number (the divisor) fits into another (the dividend). When the divisor is a 2-digit number, we estimate how many times it fits first, then check by multiplying back.\n\nEveryday example: 1,288 books need to be shared equally among 23 classes. How many books does each class get?",
    },
    tips: [
      {
        ms: "Anggarkan dahulu dengan membundarkan pembahagi — cth. 23 boleh dianggap 20 untuk anggaran pantas.",
        en: "Estimate first by rounding the divisor — e.g. 23 can be treated as 20 for a quick estimate.",
      },
      {
        ms: "Semak jawapan anda: darabkan jawapan (hasil bahagi) dengan pembahagi — ia MESTI menyamai bahagi (nombor asal).",
        en: "Check your answer: multiply your answer (the quotient) by the divisor — it MUST equal the dividend (the original number).",
      },
      {
        ms: "JANGAN buat ini: 1288 ÷ 23 dikira sebagai 1288 − 23 = 1265 (tolak sekali sahaja). SALAH — pembahagian bermaksud tolak pembahagi BERULANG kali (atau anggar dan darab semula), bukan tolak sekali. Jawapan yang betul ialah 56.",
        en: "DON'T do this: 1288 ÷ 23 calculated as 1288 − 23 = 1265 (subtracting just once). WRONG — division means subtracting the divisor REPEATEDLY (or estimating and multiplying back), not subtracting once. The correct answer is 56.",
      },
      {
        ms: "Cabaran: jika kumpulan yang SAMA disusun semula kepada bilangan kelas yang BAHARU, kira semula jumlah keseluruhan dahulu (pembahagi lama × hasil bahagi lama), kemudian bahagikan dengan bilangan kelas yang baharu.",
        en: "Challenge: if the SAME group is regrouped into a NEW number of classes, recalculate the total first (old divisor × old quotient), then divide by the new number of classes.",
      },
    ],
    howTo: [
      { ms: "Anggarkan berapa kali pembahagi boleh masuk ke dalam bahagi.", en: "Estimate how many times the divisor fits into the dividend." },
      { ms: "Darabkan anggaran itu dengan pembahagi dan bandingkan dengan bahagi.", en: "Multiply that estimate by the divisor and compare it to the dividend." },
      { ms: "Laraskan anggaran itu sehingga ia tepat.", en: "Adjust the estimate until it's exact." },
      { ms: "Semak: darabkan jawapan akhir dengan pembahagi — ia mesti menyamai bahagi asal. Jika ada penyusunan semula, ulangi proses dengan bilangan kelas yang baharu.", en: "Check: multiply your final answer by the divisor — it should equal the original dividend. If there's a regroup, repeat the process with the new number of classes." },
    ],
    workedExample: {
      problem: { ms: "1288 ÷ 23", en: "1288 ÷ 23" },
      steps: [
        { ms: "Anggaran: 23 × 50 = 1150 (terlalu kecil)", en: "Estimate: 23 × 50 = 1150 (too small)" },
        { ms: "Cuba 23 × 56 = 1288 ✓", en: "Try 23 × 56 = 1288 ✓" },
      ],
      answer: 56,
    },
    commonMistakes: [
      { mistakeType: "subtracted_instead_of_divided", description: { ms: "Murid menolak pembahagi daripada bahagi berbanding membahagikannya.", en: "The student subtracts the divisor from the dividend instead of dividing." } },
      { mistakeType: "added_instead_of_divided", description: { ms: "Murid menambah pembahagi kepada bahagi berbanding membahagikannya.", en: "The student adds the divisor to the dividend instead of dividing." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak semula dengan darab, jadi tidak perasan anggaran mereka masih terlalu jauh daripada bahagi sebenar.", en: "The student doesn't check back by multiplying, so doesn't notice their estimate is still far off from the actual dividend." } },
      { mistakeType: "multiplied_instead_of_divided", description: { ms: "Dalam soalan songsang (cari bilangan kumpulan/murid), murid darab bahagi dengan hasil bahagi, bukan membahagikannya.", en: "In the reverse-direction question (finding the number of groups/students), the student multiplies the dividend by the quotient, instead of dividing." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan penyusunan semula, murid berhenti selepas pengagihan PERTAMA dan lupa kira semula bagi bilangan kelas yang baharu.", en: "In a regrouping question, the student stops after the FIRST grouping and forgets to recalculate for the new number of classes." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_division", config: { minQuotient: 10, maxQuotient: 99 } },
      { type: "fill", difficulty: 3, generatorKey: "whole_numbers_division", config: { minQuotient: 15, maxQuotient: 80 } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_division", config: { minQuotient: 15, maxQuotient: 80, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_division", config: { minQuotient: 15, maxQuotient: 80, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_division", config: { minQuotient: 15, maxQuotient: 60, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_division", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000023": {
    id: "a1000000-0000-0000-0000-000000000023",
    strand: { ms: "Statistik", en: "Statistics" },
    bidang: BIDANG.statisticsProbability,
    title: { ms: "Membaca Graf Palang", en: "Reading Bar Graphs" },
    yearLevel: 5,
    explanation: {
      ms: "Graf palang menunjukkan data menggunakan palang (bar) — semakin tinggi palang, semakin besar nilainya. Kita boleh gunakan graf palang untuk cari jumlah keseluruhan data, atau bandingkan dua kumpulan dengan cari bezanya.\n\nContoh harian: Sebuah graf palang menunjukkan bilangan buku yang dibaca oleh 4 orang murid dalam sebulan. Berapakah jumlah buku yang dibaca oleh kesemua murid itu?",
      en: "A bar graph shows data using bars — the taller the bar, the bigger the value. We can use a bar graph to find the total of all the data, or compare two groups by finding the difference between them.\n\nEveryday example: A bar graph shows how many books 4 students read in a month. What is the total number of books read by all the students?",
    },
    tips: [
      {
        ms: "Baca nilai pada setiap palang dengan teliti sebelum mengira — silap baca satu nombor akan menyebabkan jawapan salah.",
        en: "Read the value on each bar carefully before calculating — misreading even one number will throw off the whole answer.",
      },
      {
        ms: "Untuk soalan \"jumlah\", tambah SEMUA palang. Untuk soalan \"beza\", tolak nilai yang lebih kecil daripada nilai yang lebih besar sahaja.",
        en: "For \"total\" questions, add UP ALL the bars. For \"difference\" questions, just subtract the smaller value from the bigger one.",
      },
      {
        ms: "JANGAN buat ini: cari jumlah keseluruhan dengan tambah hanya 2 daripada 4 palang (12+18=30) dan berhenti. SALAH — anda MESTI tambah SEMUA palang yang berkaitan. Jawapan yang betul ialah 12+18+9+15=54.",
        en: "DON'T do this: find the total by adding only 2 of the 4 bars (12+18=30) and stopping there. WRONG — you MUST add UP ALL the relevant bars. The correct answer is 12+18+9+15=54.",
      },
      {
        ms: "Cabaran: jika soalan minta \"berapa lebih daripada DUA KALI\" satu kumpulan, gandakan nilai itu DAHULU sebelum tolak — jangan tolak biasa sahaja.",
        en: "Challenge: if the question asks \"how much more than DOUBLE\" one group, double that value FIRST before subtracting — don't just do a plain subtraction.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti soalan itu meminta jumlah atau beza.", en: "Identify whether the question is asking for a total or a difference." },
      { ms: "Baca nilai setiap palang yang berkaitan daripada graf.", en: "Read the value of each relevant bar from the graph." },
      { ms: "Untuk jumlah: tambahkan semua nilai. Untuk beza: tolak nilai lebih kecil daripada nilai lebih besar.", en: "For a total: add all the values. For a difference: subtract the smaller value from the bigger one." },
      { ms: "Semak: kira semula bilangan palang yang anda gunakan — adakah ia menyamai bilangan kumpulan dalam graf? Jika soalan ada perkataan tambahan seperti \"dua kali\", pastikan anda buat langkah itu SEBELUM tolak.", en: "Check: recount how many bars you used — does it match the number of groups in the graph? If the question has an extra word like \"double\", make sure you do that step BEFORE subtracting." },
    ],
    workedExample: {
      problem: { ms: "Kumpulan A=12, B=18, C=9, D=15", en: "Group A=12, B=18, C=9, D=15" },
      steps: [
        { ms: "Jumlah = 12 + 18 + 9 + 15", en: "Total = 12 + 18 + 9 + 15" },
        { ms: "= 54", en: "= 54" },
      ],
      answer: 54,
      diagram: { kind: "bar_chart", labels: ["A", "B", "C", "D"], values: [12, 18, 9, 15] },
    },
    commonMistakes: [
      { mistakeType: "forgot_one_bar", description: { ms: "Murid tertinggal satu kumpulan semasa menambah jumlah keseluruhan.", en: "The student misses one group while adding up the total." } },
      { mistakeType: "added_instead_of_subtracted", description: { ms: "Murid menambah dua nilai berbanding mencari beza antara keduanya.", en: "The student adds two values instead of finding the difference between them." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari nilai palang yang hilang (diberi jumlah), murid tersilap semasa tolak jumlah tiga palang yang diketahui daripada jumlah keseluruhan.", en: "When finding a missing bar's value (given the total), the student makes an error subtracting the three known bars from the overall total." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan \"berapa lebih daripada dua kali\", murid kira beza biasa sahaja dan lupa gandakan nilai itu dahulu.", en: "In a \"how much more than double\" question, the student calculates a plain difference and forgets to double the value first." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "bar_graph", config: { min: 5, max: 32 } },
      { type: "fill", difficulty: 2, generatorKey: "bar_graph", config: { min: 8, max: 40 } },
      { type: "word_problem", difficulty: 2, generatorKey: "bar_graph", config: { min: 8, max: 40, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "bar_graph", config: { min: 8, max: 40, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "bar_graph", config: { min: 5, max: 32, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "bar_graph", config: { min: 5, max: 32, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000024": {
    id: "a1000000-0000-0000-0000-000000000024",
    strand: { ms: "Koordinat", en: "Coordinates" },
    bidang: BIDANG.relationshipAlgebra,
    title: { ms: "Membaca Koordinat", en: "Reading Coordinates" },
    yearLevel: 5,
    explanation: {
      ms: "Koordinat menunjukkan kedudukan sesuatu titik pada grid menggunakan dua nombor: (x, y). Nombor pertama (x) menunjukkan berapa unit ke KANAN daripada titik asalan, dan nombor kedua (y) menunjukkan berapa unit ke ATAS.\n\nContoh harian: Pada peta sebuah taman, gerai makanan berada pada koordinat (4, 6) — 4 unit ke kanan dan 6 unit ke atas daripada pintu masuk.",
      en: "Coordinates show a point's position on a grid using two numbers: (x, y). The first number (x) shows how many units to the RIGHT of the origin, and the second number (y) shows how many units UP.\n\nEveryday example: On a park map, a food stall is at coordinates (4, 6) — 4 units right and 6 units up from the entrance.",
    },
    tips: [
      {
        ms: "Ingat susunan: \"masuk rumah dahulu, baru naik tangga\" — x (ke kanan) sentiasa ditulis dahulu, kemudian y (ke atas).",
        en: "Remember the order: \"go along the hallway first, then up the stairs\" — x (across) is always written first, then y (up).",
      },
      {
        ms: "Mula kira dari titik asalan (0, 0) setiap kali — jangan kira dari kedudukan lain di grid.",
        en: "Always start counting from the origin (0, 0) — don't count from some other point on the grid.",
      },
      {
        ms: "JANGAN buat ini: titik yang 4 unit ke kanan dan 6 unit ke atas ditulis sebagai (6, 4). SALAH — nombor ATAS PANJANG (x) MESTI ditulis dahulu. Jawapan yang betul ialah (4, 6).",
        en: "DON'T do this: a point that is 4 units right and 6 units up written as (6, 4). WRONG — the ACROSS number (x) MUST be written first. The correct answer is (4, 6).",
      },
    ],
    howTo: [
      { ms: "Cari titik asalan (0, 0) di sudut bawah kiri grid.", en: "Find the origin (0, 0) at the bottom-left corner of the grid." },
      { ms: "Kira berapa unit titik itu berada ke KANAN daripada titik asalan — ini ialah nilai x.", en: "Count how many units the point is to the RIGHT of the origin — this is the x-value." },
      { ms: "Kira berapa unit titik itu berada ke ATAS daripada titik asalan — ini ialah nilai y.", en: "Count how many units the point is UP from the origin — this is the y-value." },
      { ms: "Tulis jawapan sebagai (x, y).", en: "Write the answer as (x, y)." },
    ],
    workedExample: {
      problem: { ms: "Titik berada 4 unit ke kanan dan 6 unit ke atas", en: "The point is 4 units right and 6 units up" },
      steps: [
        { ms: "Nilai x = 4 (ke kanan)", en: "x-value = 4 (right)" },
        { ms: "Nilai y = 6 (ke atas)", en: "y-value = 6 (up)" },
        { ms: "Koordinat = (4, 6)", en: "Coordinates = (4, 6)" },
      ],
      answer: "(4, 6)",
      diagram: { kind: "coordinate_grid", x: 4, y: 6, gridSize: 10 },
    },
    commonMistakes: [
      { mistakeType: "swapped_x_and_y", description: { ms: "Murid menulis nilai y dahulu, kemudian x — tersalah susunan.", en: "The student writes the y-value first, then x — the order is reversed." } },
      { mistakeType: "misread_grid_position", description: { ms: "Murid silap kira bilangan unit pada grid.", en: "The student miscounts the number of units on the grid." } },
      { mistakeType: "started_from_wrong_point", description: { ms: "Murid mula mengira daripada tepi grid atau titik lain, bukan daripada asalan (0, 0).", en: "The student starts counting from the edge of the grid or another point, not from the origin (0, 0)." } },
      { mistakeType: "confused_axis_direction", description: { ms: "Murid keliru arah paksi-x (mendatar) dengan paksi-y (menegak).", en: "The student confuses the direction of the x-axis (horizontal) with the y-axis (vertical)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "coordinates", config: { gridSize: 10 } },
      { type: "mcq", difficulty: 2, generatorKey: "coordinates", config: { gridSize: 12 } },
      { type: "word_problem", difficulty: 2, generatorKey: "coordinates", config: { gridSize: 10, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "coordinates", config: { gridSize: 10, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "coordinates", config: { gridSize: 10, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000025": {
    id: "a1000000-0000-0000-0000-000000000025",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Bahagi Dengan Nombor 1 Digit", en: "Dividing by a 1-Digit Number" },
    yearLevel: 5,
    explanation: {
      ms: "Membahagi ialah mencari berapa kali satu nombor (pembahagi) boleh masuk ke dalam nombor lain (bahagi). Pada tahap ini, pembahagi ialah nombor 1 digit sahaja, jadi kita boleh guna sifir untuk bantu anggaran.\n\nContoh harian: 738 biji gula-gula hendak diagihkan sama rata kepada 6 orang murid. Berapa biji gula-gula setiap murid terima?",
      en: "Dividing means finding how many times one number (the divisor) fits into another (the dividend). At this level the divisor is just a 1-digit number, so multiplication tables can help you estimate.\n\nEveryday example: 738 sweets need to be shared equally among 6 students. How many sweets does each student get?",
    },
    tips: [
      {
        ms: "Guna sifir nombor pembahagi untuk anggarkan dengan cepat — cth. bahagi dengan 6, fikir sifir 6.",
        en: "Use the divisor's times table to estimate quickly — e.g. dividing by 6, think of the 6 times table.",
      },
      {
        ms: "Semak jawapan anda: darabkan jawapan (hasil bahagi) dengan pembahagi — ia MESTI menyamai bahagi (nombor asal).",
        en: "Check your answer: multiply your answer (the quotient) by the divisor — it MUST equal the dividend (the original number).",
      },
      {
        ms: "JANGAN buat ini: 738 ÷ 6 dikira sebagai 738 − 6 = 732 (tolak sekali sahaja). SALAH — pembahagian bermaksud cari berapa KALI 6 boleh masuk ke dalam 738, bukan tolak sekali. Jawapan yang betul ialah 123.",
        en: "DON'T do this: 738 ÷ 6 calculated as 738 − 6 = 732 (subtracting just once). WRONG — division means finding how many TIMES 6 fits into 738, not subtracting once. The correct answer is 123.",
      },
      {
        ms: "Cabaran: jika jumlah yang SAMA diagihkan semula kepada bilangan murid yang berbeza, anda perlu bahagi DUA kali — sekali untuk setiap pengagihan, bukan hanya yang pertama.",
        en: "Challenge: if the SAME total is regrouped among a different number of students, you need to divide TWICE — once for each sharing, not just the first.",
      },
    ],
    howTo: [
      { ms: "Anggarkan berapa kali pembahagi boleh masuk ke dalam bahagi, digit demi digit dari kiri.", en: "Estimate how many times the divisor fits into the dividend, digit by digit from the left." },
      { ms: "Darabkan anggaran itu dengan pembahagi dan bandingkan dengan bahagi.", en: "Multiply that estimate by the divisor and compare it to the dividend." },
      { ms: "Laraskan anggaran itu sehingga ia tepat.", en: "Adjust the estimate until it's exact." },
      { ms: "Semak: darabkan jawapan akhir dengan pembahagi — ia mesti menyamai bahagi asal.", en: "Check: multiply your final answer by the divisor — it should equal the original dividend." },
    ],
    workedExample: {
      problem: { ms: "738 ÷ 6", en: "738 ÷ 6" },
      steps: [
        { ms: "6 masuk ke dalam 7 sebanyak 1 kali, baki 1", en: "6 goes into 7 once, remainder 1" },
        { ms: "Turunkan 3: 13 ÷ 6 = 2 kali, baki 1", en: "Bring down 3: 13 ÷ 6 = 2 times, remainder 1" },
        { ms: "Turunkan 8: 18 ÷ 6 = 3 kali, baki 0", en: "Bring down 8: 18 ÷ 6 = 3 times, remainder 0" },
        { ms: "738 ÷ 6 = 123", en: "738 ÷ 6 = 123" },
      ],
      answer: 123,
    },
    commonMistakes: [
      { mistakeType: "subtracted_instead_of_divided", description: { ms: "Murid menolak pembahagi daripada bahagi berbanding membahagikannya.", en: "The student subtracts the divisor from the dividend instead of dividing." } },
      { mistakeType: "added_instead_of_divided", description: { ms: "Murid menambah pembahagi kepada bahagi berbanding membahagikannya.", en: "The student adds the divisor to the dividend instead of dividing." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak semula dengan darab, jadi tidak perasan anggaran mereka masih terlalu jauh daripada bahagi sebenar.", en: "The student doesn't check back by multiplying, so doesn't notice their estimate is still far off from the actual dividend." } },
      { mistakeType: "multiplied_instead_of_divided", description: { ms: "Dalam soalan songsang (cari bilangan kumpulan/murid), murid darab bahagi dengan hasil bahagi, bukan membahagikannya.", en: "In the reverse-direction question (finding the number of groups/students), the student multiplies the dividend by the quotient, instead of dividing." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (agihan disusun semula kepada bilangan murid yang berbeza), murid berhenti selepas pengagihan pertama dan tidak teruskan ke pengagihan kedua.", en: "In the challenge-tier question (the same total regrouped among a different number of students), the student stops after the first sharing and doesn't continue to the second." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_division_y5", config: { minQuotient: 100, maxQuotient: 999 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_division_y5", config: { minQuotient: 100, maxQuotient: 500 } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_division_y5", config: { minQuotient: 100, maxQuotient: 500, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_division_y5", config: { minQuotient: 100, maxQuotient: 500, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_division_y5", config: { minQuotient: 100, maxQuotient: 400, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_division_y5", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000026": {
    id: "a1000000-0000-0000-0000-000000000026",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Darab Nombor 4 Digit Dengan Nombor 2 Digit", en: "Multiplying a 4-Digit Number by a 2-Digit Number" },
    yearLevel: 6,
    explanation: {
      ms: "Sama seperti darab dengan nombor 2 digit di Tahun 5, tetapi nombor pertama kini lebih besar (4 digit). Kita darab secara berasingan dengan digit sa, kemudian dengan digit puluh, lalu tambahkan kedua-dua hasil itu.\n\nContoh harian: Sebuah kilang mengeluarkan 3,450 botol air setiap hari. Berapa botol dikeluarkan dalam 34 hari?",
      en: "Same method as multiplying by a 2-digit number in Year 5, but the first number is now bigger (4 digits). We multiply separately by the ones digit, then by the tens digit, then add both results together.\n\nEveryday example: A factory produces 3,450 bottles of water every day. How many bottles are produced in 34 days?",
    },
    tips: [
      {
        ms: "Nombor yang lebih besar tidak mengubah kaedah — hanya lebih banyak digit untuk diuruskan dengan teliti.",
        en: "A bigger number doesn't change the method — there are just more digits to keep track of carefully.",
      },
      {
        ms: "Apabila mendarab dengan digit puluh, letakkan 0 di lajur sa hasil darab kedua itu sebelum menambah — ini penting!",
        en: "When multiplying by the tens digit, place a 0 in the ones column of that second product before adding — this step is easy to skip.",
      },
      {
        ms: "JANGAN buat ini: 3450 × 34 dikira sebagai 3450×3 + 3450×4 = 10,350 + 13,800 = 24,150 (tak anjak hasil darab puluh). SALAH — 3450 × 30 = 103,500, bukan 3450 × 3 = 10,350. Anda MESTI darab dengan nilai puluh sebenar (30), bukan digit itu sahaja (3). Jawapan yang betul ialah 117,300.",
        en: "DON'T do this: 3450 × 34 calculated as 3450×3 + 3450×4 = 10,350 + 13,800 = 24,150 (not shifting the tens product). WRONG — 3450 × 30 = 103,500, not 3450 × 3 = 10,350. You MUST multiply by the actual tens value (30), not just the digit (3). The correct answer is 117,300.",
      },
      {
        ms: "Cabaran: jika soalan tanya tentang bilangan hari yang BERBEZA daripada jumlah asal, cari kadar harian dahulu (jumlah ÷ hari), kemudian darab semula dengan bilangan hari yang baharu.",
        en: "Challenge: if the question asks about a DIFFERENT number of days than the original total, find the daily rate first (total ÷ days), then multiply again by the new number of days.",
      },
    ],
    howTo: [
      { ms: "Darabkan nombor pertama dengan digit sa nombor kedua.", en: "Multiply the first number by the ones digit of the second number." },
      { ms: "Darabkan nombor pertama dengan digit puluh nombor kedua, kemudian anjak hasil itu satu tempat ke kiri.", en: "Multiply the first number by the tens digit of the second number, then shift that result one place to the left." },
      { ms: "Tambahkan kedua-dua hasil darab itu.", en: "Add the two products together." },
      { ms: "Semak: bahagikan jawapan anda dengan salah satu nombor asal — ia mesti menyamai nombor yang satu lagi.", en: "Check: divide your answer by one of the original numbers — it should equal the other one." },
    ],
    workedExample: {
      problem: { ms: "3450 × 34", en: "3450 × 34" },
      steps: [
        { ms: "3450 × 4 = 13,800", en: "3450 × 4 = 13,800" },
        { ms: "3450 × 30 = 103,500", en: "3450 × 30 = 103,500" },
        { ms: "13,800 + 103,500 = 117,300", en: "13,800 + 103,500 = 117,300" },
      ],
      answer: 117300,
    },
    commonMistakes: [
      { mistakeType: "forgot_shift", description: { ms: "Murid darab dengan digit puluh tetapi lupa anjak hasilnya (lupa tambah 0).", en: "The student multiplies by the tens digit but forgets to shift the result (forgets the trailing 0)." } },
      { mistakeType: "added_instead_of_multiplied", description: { ms: "Murid menambah kedua-dua nombor berbanding mendarabkannya.", en: "The student adds the two numbers instead of multiplying them." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak anggarkan hasil darab dahulu, jadi tidak perasan jawapan akhir tidak munasabah (contohnya lebih kecil daripada salah satu nombor asal).", en: "The student doesn't estimate the product first, so doesn't notice when the final answer doesn't make sense (e.g. smaller than one of the original numbers)." } },
      { mistakeType: "multiplied_instead_of_divided", description: { ms: "Dalam soalan songsang (cari nilai harian daripada jumlah), murid darab semula jumlah itu dengan bilangan hari, bukan bahagikannya.", en: "In the reverse-direction question (finding the daily rate from a total), the student multiplies the total by the number of days again, instead of dividing." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (unjurkan kadar harian ke bilangan hari yang berbeza), murid berhenti selepas cari kadar harian dan tidak teruskan mendarab dengan bilangan hari yang baharu.", en: "In the challenge-tier question (projecting the daily rate over a different number of days), the student stops after finding the daily rate and doesn't continue to multiply by the new number of days." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_multiplication_y6", config: { min: 1000, max: 9999 } },
      { type: "fill", difficulty: 3, generatorKey: "whole_numbers_multiplication_y6", config: { min: 1000, max: 5000 } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_multiplication_y6", config: { min: 1000, max: 5000, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_multiplication_y6", config: { min: 1000, max: 5000, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_multiplication_y6", config: { min: 1000, max: 5000, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_multiplication_y6", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000027": {
    id: "a1000000-0000-0000-0000-000000000027",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Operasi Bergabung Tanpa Kurungan", en: "Combined Operations Without Brackets" },
    yearLevel: 6,
    explanation: {
      ms: "Apabila satu soalan ada campuran operasi tanpa kurungan, kita MESTI buat pendaraban/pembahagian dahulu, kemudian penambahan/penolakan — bukan dikira dari kiri ke kanan. Jika soalan hanya ada tambah & tolak, ATAU hanya ada darab & bahagi (tiada gabungan dengan yang lain), kedua-dua operasi itu setaraf, jadi kira dari kiri ke kanan.\n\nContoh harian: Ali ada RM15, kemudian ibunya beri dia 4 keping not RM10. Berapakah jumlah wang Ali sekarang? (15 + 4 × 10)",
      en: "When a question mixes operations with no brackets, we MUST do the multiplication/division first, then the addition/subtraction — not simply left to right. If a question only has addition & subtraction, OR only has multiplication & division (no mix with the other pair), both operations are equal rank, so calculate strictly left to right.\n\nEveryday example: Ali has RM15, then his mother gives him 4 pieces of RM10 notes. How much money does Ali have now? (15 + 4 × 10)",
    },
    tips: [
      {
        ms: "Ingat: \"Darab dan Bahagi dahulu, Tambah dan Tolak kemudian\" — ini dipanggil susunan operasi. Tetapi jika soalan HANYA ada tambah & tolak, atau HANYA darab & bahagi, kira dari kiri ke kanan sahaja.",
        en: "Remember: \"Multiply and Divide first, Add and Subtract after\" — this is called order of operations. But if a question ONLY has addition & subtraction, or ONLY multiplication & division, just calculate strictly left to right.",
      },
      {
        ms: "Bulatkan atau garisi bahagi darab dalam soalan itu dahulu supaya anda tidak terlepas pandang untuk buat itu dahulu.",
        en: "Circle or underline the multiplication or division part of the question first so you don't accidentally skip doing it first.",
      },
      {
        ms: "JANGAN buat ini: 15 + 4 × 10 dikira sebagai (15 + 4) × 10 = 190. SALAH — kiri-ke-kanan bukan susunan yang betul apabila ada campuran operasi. Darab dahulu: 4 × 10 = 40, baru tambah 15 + 40 = 55.",
        en: "DON'T do this: 15 + 4 × 10 calculated as (15 + 4) × 10 = 190. WRONG — left-to-right isn't correct when operations are mixed. Multiply first: 4 × 10 = 40, then add 15 + 40 = 55.",
      },
    ],
    howTo: [
      { ms: "Cari bahagi darab (atau bahagi) dalam soalan itu dan selesaikan itu dahulu.", en: "Find the multiplication (or division) part of the question and solve that first." },
      { ms: "Kemudian buat penambahan (atau penolakan) menggunakan hasil daripada langkah pertama.", en: "Then do the addition (or subtraction) using the result from the first step." },
      { ms: "Semak: adakah anda buat pendaraban/pembahagian dahulu sebelum tambah/tolak?", en: "Check: did you do the multiplication/division before the addition/subtraction?" },
    ],
    workedExample: {
      problem: { ms: "15 + 4 × 10", en: "15 + 4 × 10" },
      steps: [
        { ms: "Darab dahulu: 4 × 10 = 40", en: "Multiply first: 4 × 10 = 40" },
        { ms: "Kemudian tambah: 15 + 40 = 55", en: "Then add: 15 + 40 = 55" },
        { ms: "Jawapan: 55", en: "Answer: 55" },
      ],
      answer: 55,
    },
    commonMistakes: [
      { mistakeType: "ignored_order_of_operations", description: { ms: "Murid mengira dari kiri ke kanan (tambah dahulu, kemudian darab) berbanding ikut susunan operasi yang betul.", en: "The student calculates strictly left to right (adds first, then multiplies) instead of following the correct order of operations." } },
      { mistakeType: "gave_multiplication_only", description: { ms: "Murid selesai selepas mengira bahagi darab sahaja, lupa tambah nombor pertama.", en: "The student stops after computing the multiplication part alone, forgetting to add the first number." } },
      { mistakeType: "arithmetic_error_in_step", description: { ms: "Murid ikut susunan operasi yang betul tetapi tersilap kira semasa mendarab atau menambah.", en: "The student follows the correct order of operations but makes an arithmetic slip while multiplying or adding." } },
      { mistakeType: "misidentified_operation", description: { ms: "Murid keliru nombor mana patut didarab, cth. darab nombor pertama dan kedua berbanding nombor kedua dan ketiga.", en: "The student confuses which numbers to multiply, e.g. multiplies the first and second numbers instead of the second and third." } },
    ],
    questionTemplates: [
      // Tambah & Darab (add × multiply) — original pattern
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_multiply" } },
      { type: "fill", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_multiply" } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "add_multiply" } },
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_multiply", errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "add_multiply", reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 8, max: 30, pattern: "add_multiply", challenge: true } },
      // Tolak & Darab (subtract × multiply)
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "subtract_multiply" } },
      { type: "fill", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "subtract_multiply" } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "subtract_multiply" } },
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "subtract_multiply", errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "subtract_multiply", reverseProblem: true } },
      // Tambah & Bahagi (add × divide)
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_divide" } },
      { type: "fill", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_divide" } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "add_divide" } },
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_divide", errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "add_divide", reverseProblem: true } },
      // Tolak & Bahagi (subtract × divide)
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "subtract_divide" } },
      { type: "fill", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "subtract_divide" } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "subtract_divide" } },
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "subtract_divide", errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "subtract_divide", reverseProblem: true } },
      // Tambah & Tolak (equal precedence — strict left to right)
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_subtract" } },
      { type: "fill", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_subtract" } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "add_subtract" } },
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "add_subtract", errorSpotting: true } },
      // Darab & Bahagi (equal precedence — strict left to right)
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "multiply_divide" } },
      { type: "fill", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "multiply_divide" } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50, pattern: "multiply_divide" } },
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80, pattern: "multiply_divide", errorSpotting: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000028": {
    id: "a1000000-0000-0000-0000-000000000028",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Darab Dengan Nombor 1 Digit", en: "Multiplying by a 1-Digit Number" },
    yearLevel: 4,
    explanation: {
      ms: "Apabila mendarab nombor besar dengan nombor 1 digit, kita darab setiap digit (bermula dari sa) dengan nombor itu, dan \"simpan\" apa-apa lebihan ke lajur seterusnya — sama seperti dalam penambahan.\n\nContoh harian: Sebuah kedai menjual 1,245 biji telur setiap hari. Berapa biji telur dijual dalam 4 hari?",
      en: "When multiplying a big number by a 1-digit number, we multiply each digit (starting from the ones) by that number, and \"carry\" any overflow into the next column — just like in addition.\n\nEveryday example: A shop sells 1,245 eggs every day. How many eggs are sold in 4 days?",
    },
    tips: [
      {
        ms: "Mula dari lajur sa dan bergerak ke kiri, sama seperti tambah.",
        en: "Start from the ones column and work left, just like addition.",
      },
      {
        ms: "Jika hasil darab satu lajur lebih daripada 9, tulis digit sa sahaja dan \"simpan\" baki ke lajur seterusnya.",
        en: "If one column's product is more than 9, write only the ones digit and \"carry\" the rest into the next column.",
      },
      {
        ms: "JANGAN buat ini: 1245 × 4 dikira sebagai 1245 + 4 = 1249. SALAH — soalan minta DARAB, bukan tambah. Jawapan yang betul ialah 1245 × 4 = 4980.",
        en: "DON'T do this: 1245 × 4 calculated as 1245 + 4 = 1249. WRONG — the question asks to MULTIPLY, not add. The correct answer is 1245 × 4 = 4980.",
      },
      {
        ms: "Cabaran: jika soalan tanya jumlah untuk bilangan hari yang BAHARU, cari kadar harian dahulu (jumlah asal ÷ bilangan hari asal), kemudian darab dengan bilangan hari baharu.",
        en: "Challenge: if the question asks for a total over a NEW number of days, find the daily rate first (original total ÷ original days), then multiply by the new number of days.",
      },
    ],
    howTo: [
      { ms: "Darabkan digit sa nombor besar itu dengan nombor 1 digit.", en: "Multiply the ones digit of the big number by the 1-digit number." },
      { ms: "Simpan apa-apa lebihan ke lajur seterusnya, kemudian ulang untuk setiap lajur.", en: "Carry any overflow to the next column, then repeat for every column." },
      { ms: "Gabungkan semua digit jawapan untuk dapatkan jawapan akhir.", en: "Combine all the answer digits to get the final answer." },
      { ms: "Semak: adakah anda simpan lebihan setiap kali hasil darab satu lajur melebihi 9? Jika soalan minta unjuran untuk bilangan hari lain, ulangi darab dengan kadar harian itu.", en: "Check: did you carry the overflow every time a column's product exceeded 9? If the question asks for a projection over a different number of days, multiply the daily rate by that new number." },
    ],
    workedExample: {
      problem: { ms: "1245 × 4", en: "1245 × 4" },
      steps: [
        { ms: "5 × 4 = 20, tulis 0, simpan 2", en: "5 × 4 = 20, write 0, carry 2" },
        { ms: "4 × 4 = 16, + 2 (simpan) = 18, tulis 8, simpan 1", en: "4 × 4 = 16, + 2 (carried) = 18, write 8, carry 1" },
        { ms: "2 × 4 = 8, + 1 (simpan) = 9, tulis 9", en: "2 × 4 = 8, + 1 (carried) = 9, write 9" },
        { ms: "1 × 4 = 4, tulis 4", en: "1 × 4 = 4, write 4" },
        { ms: "Jawapan: 4980", en: "Answer: 4980" },
      ],
      answer: 4980,
    },
    commonMistakes: [
      { mistakeType: "forgot_carry", description: { ms: "Murid darab setiap digit secara berasingan tanpa \"simpan\" lebihan ke lajur seterusnya.", en: "The student multiplies each digit separately without carrying the overflow into the next column." } },
      { mistakeType: "added_instead_of_multiplied", description: { ms: "Murid menambah kedua-dua nombor berbanding mendarabkannya.", en: "The student adds the two numbers instead of multiplying them." } },
      { mistakeType: "wrong_dimension_used", description: { ms: "Dalam soalan berbalik, murid tolak berbanding bahagi untuk mencari kuantiti yang tidak diketahui.", en: "In reverse-style questions, the student subtracts instead of dividing to find the missing quantity." } },
      { mistakeType: "arithmetic_error_in_carry", description: { ms: "Murid simpan dengan betul di satu lajur tetapi lupa tambah nombor yang disimpan pada lajur seterusnya.", en: "The student carries correctly in one column but forgets to add the carried number in the next column." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan dua langkah (unjur untuk bilangan hari baharu), murid berhenti selepas cari kadar harian dan lupa teruskan darab dengan hari baharu.", en: "In a two-step projection question, the student stops after finding the daily rate and forgets to continue by multiplying by the new day count." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_multiplication_y4", config: { min: 1000, max: 9999 } },
      { type: "fill", difficulty: 1, generatorKey: "whole_numbers_multiplication_y4", config: { min: 1000, max: 5000 } },
      { type: "word_problem", difficulty: 1, generatorKey: "whole_numbers_multiplication_y4", config: { min: 1000, max: 5000, type: "word_problem" } },
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_multiplication_y4", config: { min: 1000, max: 9999, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_multiplication_y4", config: { min: 1000, max: 9999, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_multiplication_y4", config: { min: 1000, max: 5000, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000029": {
    id: "a1000000-0000-0000-0000-000000000029",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Bahagi Dengan Nombor 1 Digit", en: "Dividing by a 1-Digit Number" },
    yearLevel: 4,
    explanation: {
      ms: "Membahagi ialah mencari berapa kali satu nombor (pembahagi) boleh masuk ke dalam nombor lain (bahagi). Pada tahap ini, pembahagi ialah nombor 1 digit sahaja.\n\nContoh harian: 84 biji biskut hendak diagihkan sama rata kepada 4 orang murid. Berapa biji biskut setiap murid terima?",
      en: "Dividing means finding how many times one number (the divisor) fits into another (the dividend). At this level, the divisor is just a 1-digit number.\n\nEveryday example: 84 biscuits need to be shared equally among 4 students. How many biscuits does each student get?",
    },
    tips: [
      {
        ms: "Guna sifir nombor pembahagi untuk bantu anggaran — cth. bahagi dengan 4, fikir sifir 4.",
        en: "Use the divisor's times table to help estimate — e.g. dividing by 4, think of the 4 times table.",
      },
      {
        ms: "Semak jawapan anda: darabkan jawapan (hasil bahagi) dengan pembahagi — ia MESTI menyamai bahagi (nombor asal).",
        en: "Check your answer: multiply your answer (the quotient) by the divisor — it MUST equal the dividend (the original number).",
      },
      {
        ms: "JANGAN buat ini: 84 ÷ 4 dikira sebagai 84 − 4 = 80 (tolak sekali sahaja). SALAH — pembahagian bermaksud cari berapa KALI 4 boleh masuk ke dalam 84, bukan tolak sekali. Jawapan yang betul ialah 21.",
        en: "DON'T do this: 84 ÷ 4 calculated as 84 − 4 = 80 (subtracting just once). WRONG — division means finding how many TIMES 4 fits into 84, not subtracting once. The correct answer is 21.",
      },
      {
        ms: "Cabaran: jika kumpulan yang SAMA disusun semula kepada bilangan murid yang BAHARU, kira semula jumlah keseluruhan dahulu (pembahagi lama × hasil bahagi lama), kemudian bahagikan dengan bilangan murid yang baharu.",
        en: "Challenge: if the SAME group is regrouped into a NEW number of students, recalculate the total first (old divisor × old quotient), then divide by the new number of students.",
      },
    ],
    howTo: [
      { ms: "Anggarkan berapa kali pembahagi boleh masuk ke dalam bahagi, digit demi digit dari kiri.", en: "Estimate how many times the divisor fits into the dividend, digit by digit from the left." },
      { ms: "Darabkan anggaran itu dengan pembahagi dan bandingkan dengan bahagi.", en: "Multiply that estimate by the divisor and compare it to the dividend." },
      { ms: "Laraskan anggaran itu sehingga ia tepat.", en: "Adjust the estimate until it's exact." },
      { ms: "Semak: darabkan jawapan akhir dengan pembahagi — ia mesti menyamai bahagi asal. Jika ada penyusunan semula, ulangi proses dengan bilangan murid yang baharu.", en: "Check: multiply your final answer by the divisor — it should equal the original dividend. If there's a regroup, repeat the process with the new number of students." },
    ],
    workedExample: {
      problem: { ms: "84 ÷ 4", en: "84 ÷ 4" },
      steps: [
        { ms: "4 masuk ke dalam 8 sebanyak 2 kali", en: "4 goes into 8 twice" },
        { ms: "4 masuk ke dalam 4 sebanyak 1 kali", en: "4 goes into 4 once" },
        { ms: "84 ÷ 4 = 21", en: "84 ÷ 4 = 21" },
      ],
      answer: 21,
    },
    commonMistakes: [
      { mistakeType: "subtracted_instead_of_divided", description: { ms: "Murid menolak pembahagi daripada bahagi berbanding membahagikannya.", en: "The student subtracts the divisor from the dividend instead of dividing." } },
      { mistakeType: "added_instead_of_divided", description: { ms: "Murid menambah pembahagi kepada bahagi berbanding membahagikannya.", en: "The student adds the divisor to the dividend instead of dividing." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak semula dengan darab, jadi tidak perasan anggaran mereka masih terlalu jauh daripada bahagi sebenar.", en: "The student doesn't check back by multiplying, so doesn't notice their estimate is still far off from the actual dividend." } },
      { mistakeType: "multiplied_instead_of_divided", description: { ms: "Dalam soalan songsang (cari bilangan kumpulan/murid), murid darab bahagi dengan hasil bahagi, bukan membahagikannya.", en: "In the reverse-direction question (finding the number of groups/students), the student multiplies the dividend by the quotient, instead of dividing." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan penyusunan semula, murid berhenti selepas pengagihan PERTAMA dan lupa kira semula bagi bilangan murid yang baharu.", en: "In a regrouping question, the student stops after the FIRST grouping and forgets to recalculate for the new number of students." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_division_y4", config: { minQuotient: 10, maxQuotient: 99 } },
      { type: "fill", difficulty: 1, generatorKey: "whole_numbers_division_y4", config: { minQuotient: 10, maxQuotient: 50 } },
      { type: "word_problem", difficulty: 1, generatorKey: "whole_numbers_division_y4", config: { minQuotient: 10, maxQuotient: 50, type: "word_problem" } },
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_division_y4", config: { minQuotient: 10, maxQuotient: 50, errorSpotting: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_division_y4", config: { minQuotient: 10, maxQuotient: 30, reverseProblem: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_division_y4", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000030": {
    id: "a1000000-0000-0000-0000-000000000030",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tambah Nombor Bulat Hingga 1,000,000", en: "Adding Whole Numbers up to 1,000,000" },
    yearLevel: 5,
    explanation: {
      ms: "Sama seperti tambah nombor hingga 100,000 di Tahun 4, tetapi nombor kini lebih besar (6 digit). Susun digit ikut nilai tempat, tambah dari lajur sa, dan \"simpan\" apabila perlu.\n\nContoh harian: Sebuah stadium ada 245,600 penonton pada perlawanan pertama dan 318,750 penonton pada perlawanan kedua. Berapa jumlah penonton kedua-dua perlawanan?",
      en: "Same as adding numbers up to 100,000 in Year 4, but the numbers are now bigger (6 digits). Line up the digits by place value, add from the ones column, and carry when needed.\n\nEveryday example: A stadium had 245,600 spectators at the first match and 318,750 at the second match. What is the total number of spectators for both matches?",
    },
    tips: [
      {
        ms: "Nombor yang lebih besar tidak mengubah kaedah — hanya lebih banyak lajur untuk diuruskan dengan teliti.",
        en: "A bigger number doesn't change the method — there are just more columns to keep track of carefully.",
      },
      {
        ms: "Susun kedua-dua nombor supaya digit sa sejajar sebelum mula tambah.",
        en: "Line up both numbers so the ones digits align before you start adding.",
      },
      {
        ms: "JANGAN buat ini: 245600 + 318750 disusun sa bertentang sa dengan sa terakhir sahaja (bukan ikut nilai tempat sebenar). SALAH — anda MESTI susun ikut nilai tempat (sa di bawah sa, puluh di bawah puluh). Jawapan yang betul ialah 564,350.",
        en: "DON'T do this: 245600 + 318750 lined up flush-right by digit count (not real place value). WRONG — you MUST line up by place value (ones under ones, tens under tens). The correct answer is 564,350.",
      },
      {
        ms: "Cabaran: jika ada penghantaran KEDUA selepas yang pertama, jangan berhenti awal — tambahkan KETIGA-TIGA nombor itu.",
        en: "Challenge: if there's a SECOND delivery after the first, don't stop early — add all THREE numbers together.",
      },
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor ikut nilai tempat.", en: "Line up both numbers by place value." },
      { ms: "Tambah bermula dari lajur sa, \"simpan\" apabila jumlah lajur lebih 9.", en: "Add starting from the ones column, carrying when a column's total is more than 9." },
      { ms: "Teruskan ke lajur seterusnya sehingga semua lajur ditambah.", en: "Continue to the next column until every column is added." },
      { ms: "Semak: adakah anda susun kedua-dua nombor ikut nilai tempat yang betul?", en: "Check: did you line up both numbers by the correct place value?" },
    ],
    workedExample: {
      problem: { ms: "245600 + 318750", en: "245600 + 318750" },
      steps: [
        { ms: "0 + 0 = 0 (sa)", en: "0 + 0 = 0 (ones)" },
        { ms: "0 + 5 = 5 (puluh)", en: "0 + 5 = 5 (tens)" },
        { ms: "6 + 7 = 13, tulis 3, simpan 1 (ratus)", en: "6 + 7 = 13, write 3, carry 1 (hundreds)" },
        { ms: "5+1(simpan)=6, 6 + 8 = 14, tulis 4, simpan 1 (ribu)", en: "5+1(carried)=6, 6 + 8 = 14, write 4, carry 1 (thousands)" },
        { ms: "4+1(simpan)=5, 5 + 1 = 6 (puluh ribu)", en: "4+1(carried)=5, 5 + 1 = 6 (ten thousands)" },
        { ms: "2 + 3 = 5 (ratus ribu)", en: "2 + 3 = 5 (hundred thousands)" },
        { ms: "Jawapan: 564,350", en: "Answer: 564,350" },
      ],
      answer: 564350,
      diagram: { kind: "vertical_arithmetic", operands: ["245600", "318750"], operator: "+", result: "564350" },
    },
    commonMistakes: [
      { mistakeType: "forgot_carry", description: { ms: "Murid tambah setiap lajur secara berasingan tanpa \"simpan\" apabila jumlah lebih 9.", en: "The student adds each column separately without carrying when the total is more than 9." } },
      { mistakeType: "place_value_misalignment", description: { ms: "Murid tidak susun nombor ikut nilai tempat dengan betul.", en: "The student doesn't line up digits by the correct place value column." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menolak berbanding menambah (atau sebaliknya) apabila menyelesaikan masalah.", en: "The student subtracts instead of adding (or vice versa) when solving the problem." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak anggarkan jawapan dahulu, jadi tidak perasan jawapan akhir tidak masuk akal.", en: "The student doesn't estimate the answer first, so doesn't notice when the final answer doesn't make sense." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (penghantaran kedua selepas yang pertama), murid berhenti selepas penghantaran pertama dan tidak teruskan menambah penghantaran kedua.", en: "In the challenge-tier question (a second delivery after the first), the student stops after the first delivery and doesn't continue to add the second one." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_addition_y5", config: { min: 100000, max: 999999 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_addition_y5", config: { min: 100000, max: 500000 } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_addition_y5", config: { min: 100000, max: 500000, type: "word_problem" } },
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_addition_y5", config: { min: 100000, max: 999999, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_addition_y5", config: { min: 100000, max: 500000, reverseProblem: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_addition_y5", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000031": {
    id: "a1000000-0000-0000-0000-000000000031",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tolak Nombor Bulat Hingga 1,000,000", en: "Subtracting Whole Numbers up to 1,000,000" },
    yearLevel: 5,
    explanation: {
      ms: "Sama seperti tolak nombor hingga 100,000 di Tahun 4, tetapi nombor kini lebih besar (6 digit). Susun digit ikut nilai tempat, tolak dari lajur sa, dan \"pinjam\" apabila perlu.\n\nContoh harian: Sebuah bandar ada 876,400 penduduk. Sebanyak 123,850 penduduk berpindah keluar. Berapa penduduk yang tinggal?",
      en: "Same as subtracting numbers up to 100,000 in Year 4, but the numbers are now bigger (6 digits). Line up the digits by place value, subtract from the ones column, and borrow when needed.\n\nEveryday example: A town has 876,400 residents. 123,850 residents move away. How many residents remain?",
    },
    tips: [
      {
        ms: "Nombor yang lebih besar tidak mengubah kaedah — hanya lebih banyak lajur untuk diuruskan dengan teliti.",
        en: "A bigger number doesn't change the method — there are just more columns to keep track of carefully.",
      },
      {
        ms: "Semak jawapan anda: tambah jawapan dengan nombor yang ditolak — ia MESTI menyamai nombor asal.",
        en: "Check your answer: add your result to the number you subtracted — it MUST equal the original number.",
      },
      {
        ms: "JANGAN buat ini: 876400 − 123850 (dalam satu lajur) dikira dengan tolak digit lebih kecil daripada digit lebih besar, tidak kira susunan. SALAH — anda MESTI pinjam 1 daripada lajur sebelah kiri apabila digit atas lebih kecil, bukan tukar susunan.",
        en: "DON'T do this: 876400 − 123850 (within one column) calculated by subtracting the smaller digit from the larger one, regardless of position. WRONG — you MUST borrow 1 from the column on the left when the top digit is smaller, not swap the order around.",
      },
      {
        ms: "Cabaran: jika ada penolakan KEDUA selepas yang pertama, jangan berhenti awal — tolak kedua-dua jumlah itu daripada nombor asal.",
        en: "Challenge: if there's a SECOND deduction after the first, don't stop early — subtract both amounts from the original number.",
      },
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor ikut nilai tempat.", en: "Line up both numbers by place value." },
      { ms: "Tolak bermula dari lajur sa, \"pinjam\" apabila digit atas lebih kecil.", en: "Subtract starting from the ones column, borrowing when the top digit is smaller." },
      { ms: "Teruskan ke lajur seterusnya sehingga semua lajur ditolak.", en: "Continue to the next column until every column is subtracted." },
      { ms: "Semak: adakah jawapan + nombor yang ditolak menyamai nombor asal?", en: "Check: does your answer + the number you subtracted equal the original number?" },
    ],
    workedExample: {
      problem: { ms: "876400 − 123850", en: "876400 − 123850" },
      steps: [
        { ms: "0 − 0 = 0 (sa)", en: "0 − 0 = 0 (ones)" },
        { ms: "0 − 5: pinjam 1, 10 − 5 = 5 (puluh)", en: "0 − 5: borrow 1, 10 − 5 = 5 (tens)" },
        { ms: "3(baki)−1(pinjam)=3, 3 − 8: pinjam 1, 13 − 8 = 5 (ratus)", en: "3(remaining)−1(borrowed)=3, 3 − 8: borrow 1, 13 − 8 = 5 (hundreds)" },
        { ms: "5(baki)−1(pinjam)=5, 5 − 3 = 2 (ribu)", en: "5(remaining)−1(borrowed)=5, 5 − 3 = 2 (thousands)" },
        { ms: "7 − 2 = 5 (puluh ribu)", en: "7 − 2 = 5 (ten thousands)" },
        { ms: "8 − 1 = 7 (ratus ribu)", en: "8 − 1 = 7 (hundred thousands)" },
        { ms: "Jawapan: 752,550", en: "Answer: 752,550" },
      ],
      answer: 752550,
      diagram: { kind: "vertical_arithmetic", operands: ["876400", "123850"], operator: "\u2212", result: "752550" },
    },
    commonMistakes: [
      { mistakeType: "forgot_borrow", description: { ms: "Murid tolak digit lebih kecil daripada digit lebih besar mengikut susunan terbalik (bukan pinjam).", en: "The student subtracts the smaller digit from the larger one regardless of position, instead of borrowing." } },
      { mistakeType: "place_value_misalignment", description: { ms: "Murid tidak susun nombor ikut nilai tempat dengan betul.", en: "The student doesn't line up digits by the correct place value column." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah berbanding menolak (atau sebaliknya) apabila menyelesaikan masalah.", en: "The student adds instead of subtracting (or vice versa) when solving the problem." } },
      { mistakeType: "chained_borrow_error", description: { ms: "Murid pinjam dengan betul di satu lajur tetapi lupa tolak 1 daripada lajur yang dipinjam pada langkah seterusnya.", en: "The student borrows correctly in one column but forgets to subtract 1 from the borrowed-from column in the next step." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (penolakan kedua selepas yang pertama), murid berhenti selepas penolakan pertama dan tidak teruskan menolak jumlah kedua.", en: "In the challenge-tier question (a second deduction after the first), the student stops after the first deduction and doesn't continue to subtract the second." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_subtraction_y5", config: { min: 100000, max: 999999 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_subtraction_y5", config: { min: 200000, max: 900000 } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_subtraction_y5", config: { min: 200000, max: 900000, type: "word_problem" } },
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_subtraction_y5", config: { min: 100000, max: 999999, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_subtraction_y5", config: { min: 200000, max: 900000, reverseProblem: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_subtraction_y5", config: { min: 200000, max: 900000, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000032": {
    id: "a1000000-0000-0000-0000-000000000032",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tambah Tiga Nombor Bulat", en: "Adding Three Whole Numbers" },
    yearLevel: 6,
    explanation: {
      ms: "Apabila TIGA nombor perlu ditambah, kita boleh tambah dua nombor dahulu, kemudian tambah nombor ketiga dengan jumlah itu. Kaedah tambah (susun ikut nilai tempat, simpan apabila perlu) adalah sama.\n\nContoh harian: Sebuah kedai buku menjual 12,450 buku pada Januari, 15,800 buku pada Februari, dan 9,670 buku pada Mac. Berapa jumlah buku dijual dalam tiga bulan itu?",
      en: "When THREE numbers need to be added, we can add two of them first, then add the third number to that sum. The addition method (line up by place value, carry when needed) stays the same.\n\nEveryday example: A bookstore sold 12,450 books in January, 15,800 in February, and 9,670 in March. How many books were sold across those three months in total?",
    },
    tips: [
      { ms: "Dua-dua, tiga-tiga — tambah DUA dahulu, baru tambah nombor KETIGA!", en: "Two then three — add the first TWO, then add the THIRD to that!" },
      { ms: "JANGAN buat ini: tambah dua nombor sahaja dan lupa nombor ketiga (12,450 + 15,800 = 28,250, terus jadi jawapan akhir). SALAH — masih ada 9,670 yang belum ditambah!", en: "DON'T do this: add only two numbers and forget the third (12,450 + 15,800 = 28,250, treated as the final answer). WRONG — there's still 9,670 left to add!" },
      { ms: "Petua pantas: selepas dapat jumlah dua nombor pertama, tanya diri anda 'adakah masih ada nombor lagi?' sebelum tulis jawapan akhir.", en: "Quick trick: after getting the subtotal of the first two numbers, ask yourself 'is there still another number?' before writing your final answer." },
      { ms: "Cabaran: jika ada catatan KEEMPAT yang ditemui selepas jumlah tiga bulan itu, jangan berhenti — tambah catatan itu juga.", en: "Challenge: if a FOURTH figure turns up after the three-month subtotal, don't stop there — add that figure too." },
    ],
    howTo: [
      { ms: "Kenal pasti ketiga-tiga nombor yang perlu ditambah.", en: "Identify all three numbers that need to be added." },
      { ms: "Tambah dua nombor pertama untuk dapatkan jumlah sementara.", en: "Add the first two numbers to get a running subtotal." },
      { ms: "Tambah nombor ketiga pada jumlah sementara itu.", en: "Add the third number to that subtotal." },
      { ms: "Tulis jawapan akhir.", en: "Write down your final answer." },
      { ms: "Semak: adakah anda benar-benar menambah SEMUA TIGA nombor, bukan hanya dua?", en: "Check: did you really add ALL THREE numbers, not just two?" },
    ],
    workedExample: {
      problem: { ms: "12450 + 15800 + 9670", en: "12450 + 15800 + 9670" },
      steps: [
        { ms: "Kenal pasti tiga nombor: 12,450, 15,800, dan 9,670.", en: "Identify the three numbers: 12,450, 15,800, and 9,670." },
        { ms: "12,450 + 15,800 = 28,250", en: "12,450 + 15,800 = 28,250" },
        { ms: "28,250 + 9,670 = 37,920", en: "28,250 + 9,670 = 37,920" },
        { ms: "Jawapan: 37,920", en: "Answer: 37,920" },
        { ms: "Semak: 37,920 − 9,670 = 28,250, dan 28,250 − 15,800 = 12,450 ✓", en: "Check: 37,920 − 9,670 = 28,250, and 28,250 − 15,800 = 12,450 ✓" },
      ],
      answer: 37920,
      diagram: { kind: "vertical_arithmetic", operands: ["12450", "15800", "9670"], operator: "+", result: "37920" },
    },
    commonMistakes: [
      { mistakeType: "wrong_operation", description: { ms: "Murid hanya tambah dua daripada tiga nombor, tertinggal satu — biasanya nombor ketiga yang berada paling jauh daripada tanda '+' pertama.", en: "Student only adds two of the three numbers, missing one — usually the third number, furthest from the first '+' sign." } },
      { mistakeType: "place_value_error", description: { ms: "Semasa menambah nombor besar (5-6 digit), murid tersalah jajar lajur nilai tempat, menyebabkan jawapan tersasar jauh.", en: "While adding large numbers (5-6 digits), student misaligns the place-value columns, causing the answer to be far off." } },
      { mistakeType: "special_case_error", description: { ms: "Apabila menambah tiga nombor menyebabkan simpan (carry) berlaku dua kali berturut-turut, murid hanya simpan sekali dan lupa simpan yang kedua.", en: "When adding three numbers causes a carry to happen twice in a row, student only carries once and forgets the second carry." } },
      { mistakeType: "keyword_only_classification", description: { ms: "Murid tambah nombor mengikut susunan yang salah (contohnya nombor kedua dan ketiga dahulu, bukan pertama dan kedua), menyebabkan kekeliruan semasa menyemak jawapan.", en: "Student adds the numbers in the wrong order (e.g. the second and third first, not the first and second), causing confusion when checking the answer." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (catatan keempat ditemui selepas jumlah tiga bulan), murid berhenti pada jumlah tiga bulan dan tidak teruskan menambah catatan keempat.", en: "In the challenge-tier question (a fourth figure turns up after the three-month subtotal), the student stops at the three-month subtotal and doesn't continue to add the fourth." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_addition_y6", config: { min: 10000, max: 99999 } },
      { type: "fill", difficulty: 3, generatorKey: "whole_numbers_addition_y6", config: { min: 10000, max: 99999 } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_addition_y6", config: { min: 5000, max: 50000 } },
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_addition_y6", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_addition_y6", config: { min: 5000, max: 50000, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_addition_y6", config: { min: 5000, max: 50000, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000033": {
    id: "a1000000-0000-0000-0000-000000000033",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tolak Daripada Nombor Bulat", en: "Subtracting from a Round Number" },
    yearLevel: 6,
    explanation: {
      ms: "Apabila menolak daripada nombor bulat seperti 500,000 (banyak digit 0), kita perlu \"pinjam\" merentasi beberapa lajur 0 secara berturutan sebelum sampai ke digit yang boleh dipinjam.\n\nContoh harian: Sebuah kilang mensasarkan pengeluaran 500,000 unit. Setakat ini, 187,650 unit belum dikeluarkan. Berapa unit sudah dikeluarkan?",
      en: "When subtracting from a round number like 500,000 (lots of 0 digits), you need to \"borrow\" across several zero columns in a row before reaching a digit that can actually lend.\n\nEveryday example: A factory targets 500,000 units. So far, 187,650 units have not yet been produced. How many units have been produced?",
    },
    tips: [
      { ms: "Sifar tak boleh pinjam — pinjam dari yang BUKAN sifar, semua sifar di antaranya jadi 9!", en: "A zero can't lend — borrow from the nearest NON-zero, every zero in between turns into a 9!" },
      { ms: "JANGAN buat ini: 500,000 − 187,650, tolak digit lebih kecil daripada lebih besar tanpa pinjam (0−0=0, 0−5=5 kerana 'tak boleh negatif'). SALAH — anda MESTI pinjam merentasi kesemua sifar itu dahulu.", en: "DON'T do this: for 500,000 − 187,650, subtracting the smaller digit from the larger regardless of position (0−0=0, 0−5=5 because 'can't be negative'). WRONG — you MUST borrow across all those zeros first." },
      { ms: "Semak jawapan anda: tambah jawapan dengan nombor yang ditolak — ia MESTI menyamai nombor bulat asal.", en: "Check your answer: add your result to the number you subtracted — it MUST equal the original round number." },
      { ms: "Cabaran: jika ada dua fasa pengeluaran, cari baki selepas fasa pertama dahulu, kemudian tolak fasa kedua daripada baki itu.", en: "Challenge: with two production phases, find the remainder after phase one first, then subtract phase two from that remainder." },
    ],
    howTo: [
      { ms: "Kenal pasti nombor bulat (minuend) dan nombor yang ditolak (subtrahend).", en: "Identify the round number (minuend) and the number being subtracted (subtrahend)." },
      { ms: "Kenal pasti lajur bukan-sifar yang paling hampir di sebelah kiri untuk dipinjam.", en: "Identify the nearest non-zero column to the left to borrow from." },
      { ms: "Pinjam daripada lajur itu — setiap lajur 0 di antaranya akan bertukar menjadi 9.", en: "Borrow from that column — every 0 column in between turns into a 9." },
      { ms: "Tolak setiap lajur seperti biasa, dari kanan ke kiri.", en: "Subtract each column as usual, from right to left." },
      { ms: "Semak: tambah jawapan anda dengan nombor yang ditolak — ia mesti kembali kepada nombor bulat asal.", en: "Check: add your answer to the number you subtracted — it must return to the original round number." },
    ],
    workedExample: {
      problem: { ms: "500000 − 187650", en: "500000 − 187650" },
      steps: [
        { ms: "Kenal pasti: 500,000 (nombor bulat) − 187,650.", en: "Identify: 500,000 (round number) − 187,650." },
        { ms: "500,000 boleh ditulis sebagai 4 9 9 9 9 10 selepas pinjam", en: "500,000 can be rewritten as 4 9 9 9 9 10 after borrowing" },
        { ms: "10 − 0 = 10, tulis 0 (sa)", en: "10 − 0 = 10, write 0 (ones)" },
        { ms: "9 − 5 = 4 (puluh)", en: "9 − 5 = 4 (tens)" },
        { ms: "9 − 6 = 3 (ratus)", en: "9 − 6 = 3 (hundreds)" },
        { ms: "9 − 7 = 2 (ribu)", en: "9 − 7 = 2 (thousands)" },
        { ms: "9 − 8 = 1 (puluh ribu)", en: "9 − 8 = 1 (ten thousands)" },
        { ms: "4 − 1 = 3 (ratus ribu)", en: "4 − 1 = 3 (hundred thousands)" },
        { ms: "Jawapan: 312,350", en: "Answer: 312,350" },
        { ms: "Semak: 312,350 + 187,650 = 500,000 ✓", en: "Check: 312,350 + 187,650 = 500,000 ✓" },
      ],
      answer: 312350,
      diagram: { kind: "vertical_arithmetic", operands: ["500000", "187650"], operator: "\u2212", result: "312350" },
    },
    commonMistakes: [
      { mistakeType: "wrong_operation", description: { ms: "Murid tidak tahu cara pinjam merentasi beberapa lajur 0, dan tolak digit lebih kecil daripada digit lebih besar mengikut susunan terbalik.", en: "Student doesn't know how to borrow across several zero columns, and subtracts the smaller digit from the larger regardless of position." } },
      { mistakeType: "place_value_error", description: { ms: "Murid pinjam daripada lajur yang salah (bukan lajur bukan-sifar terdekat), menyebabkan lajur pertengahan tersalah nilai.", en: "Student borrows from the wrong column (not the nearest non-zero one), causing middle columns to end up with the wrong value." } },
      { mistakeType: "special_case_error", description: { ms: "Murid lupa menukar SEMUA lajur 0 di antara kepada 9 — hanya menukar satu atau dua, meninggalkan baki lajur sebagai 0.", en: "Student forgets to change ALL the zero columns in between to 9 — only changes one or two, leaving the rest as 0." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid keliru nilai tempat setiap digit (contohnya menganggap digit ratus ribu sebagai puluh ribu), menyebabkan jawapan tersasar dengan faktor 10.", en: "Student confuses the place value of a digit (e.g. treats the hundred-thousands digit as ten-thousands), causing the answer to be off by a factor of 10." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (dua fasa pengeluaran daripada sasaran yang sama), murid berhenti selepas fasa pertama dan tidak teruskan menolak fasa kedua.", en: "In the challenge-tier question (two production phases against the same target), the student stops after phase one and doesn't continue to subtract phase two." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_subtraction_y6", config: { min: 10000, max: 99999 } },
      { type: "fill", difficulty: 3, generatorKey: "whole_numbers_subtraction_y6", config: { min: 10000, max: 99999 } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_subtraction_y6", config: { min: 10000, max: 80000 } },
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_subtraction_y6", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_subtraction_y6", config: { min: 10000, max: 80000, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_subtraction_y6", config: { min: 10000, max: 80000, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000034": {
    id: "a1000000-0000-0000-0000-000000000034",
    strand: { ms: "Pecahan", en: "Fractions" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tolak Pecahan Penyebut Sama", en: "Subtracting Fractions with the Same Denominator" },
    yearLevel: 4,
    explanation: {
      ms: "Apabila penyebut (nombor bawah) dua pecahan adalah SAMA, kita hanya tolak pengangka (nombor atas) sahaja. Penyebut kekal sama.\n\nContoh: 4/5 − 1/5 = (4−1)/5 = 3/5. Bayangkan 5 keping pizza — kita ada 4 keping, kemudian makan 1 keping.",
      en: "When two fractions have the SAME denominator (bottom number), we only subtract the numerators (top numbers). The denominator stays the same.\n\nExample: 4/5 − 1/5 = (4−1)/5 = 3/5. Imagine 5 pizza slices — we have 4 slices, then eat 1.",
    },
    tips: [
      {
        ms: "Penyebut sama = kongsi saiz bahagian yang sama. Hanya nombor atas (pengangka) yang berubah.",
        en: "Same denominator = the pieces are the same size. Only the top number (numerator) changes.",
      },
      {
        ms: "Pengangka pertama mesti lebih besar (atau sama) daripada pengangka kedua, supaya jawapan tidak negatif.",
        en: "The first numerator must be bigger than (or equal to) the second, so the answer doesn't go negative.",
      },
      {
        ms: "JANGAN buat ini: 5/8 − 2/8 dikira sebagai 3/0 (tolak penyebut juga, 8−8=0). SALAH — penyebut MESTI kekal sama, hanya pengangka yang ditolak. Jawapan yang betul ialah 3/8.",
        en: "DON'T do this: 5/8 − 2/8 calculated as 3/0 (subtracting the denominators too, 8−8=0). WRONG — the denominator MUST stay the same, only the numerator gets subtracted. The correct answer is 3/8.",
      },
      {
        ms: "Cabaran: jika ada bahagian KEDUA yang dimakan selepas yang pertama, jangan berhenti awal — tolak kedua-dua bahagian itu daripada pengangka asal.",
        en: "Challenge: if a SECOND portion is eaten after the first, don't stop early — subtract both portions from the original numerator.",
      },
    ],
    howTo: [
      { ms: "Semak sama ada kedua-dua pecahan mempunyai penyebut yang sama.", en: "Check that both fractions have the same denominator." },
      { ms: "Tolak pengangka kedua daripada pengangka pertama.", en: "Subtract the second numerator from the first." },
      { ms: "Kekalkan penyebut (nombor bawah) tanpa diubah.", en: "Keep the denominator (bottom number) unchanged." },
      { ms: "Semak: tambahkan jawapan anda dengan pecahan yang ditolak — ia mesti menyamai pecahan asal.", en: "Check: add your answer to the fraction you subtracted — it should equal the original fraction." },
    ],
    workedExample: {
      problem: { ms: "5/8 − 2/8", en: "5/8 − 2/8" },
      steps: [
        { ms: "Penyebut sama, kekalkan 8", en: "Same denominator, keep it as 8" },
        { ms: "Tolak pengangka: 5−2=3", en: "Subtract the numerators: 5−2=3" },
      ],
      answer: "3/8",
    },
    commonMistakes: [
      { mistakeType: "added_instead_of_subtracted", description: { ms: "Murid menambah pengangka berbanding menolaknya.", en: "The student adds the numerators instead of subtracting them." } },
      { mistakeType: "denominator_subtraction_error", description: { ms: "Murid turut menolak penyebut.", en: "The student also subtracts the denominators." } },
      { mistakeType: "fraction_calculation_error", description: { ms: "Semasa cari jumlah permulaan (diberi baki dan bahagian yang dimakan), murid tolak berbanding tambah.", en: "When finding the starting amount (given the remainder and the part eaten), the student subtracts instead of adding." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak sama ada jawapan itu munasabah — pecahan hasil tolak mesti lebih kecil daripada pecahan pertama.", en: "The student doesn't check whether the answer is reasonable — the resulting fraction should be smaller than the first fraction." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (bahagian kedua dimakan selepas yang pertama), murid berhenti selepas bahagian pertama dan tidak teruskan menolak bahagian kedua.", en: "In the challenge-tier question (a second portion eaten after the first), the student stops after the first portion and doesn't continue to subtract the second." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "fractions_subtract_same_denominator", config: { denominators: [4, 5, 6, 8, 10, 12] } },
      { type: "fill", difficulty: 2, generatorKey: "fractions_subtract_same_denominator", config: { denominators: [8, 10, 12, 15, 16] } },
      { type: "word_problem", difficulty: 1, generatorKey: "fractions_subtract_same_denominator", config: { denominators: [4, 5, 6, 8], type: "word_problem" } },
      { type: "mcq", difficulty: 2, generatorKey: "fractions_subtract_same_denominator", config: { denominators: [6, 8, 10, 12], errorSpotting: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "fractions_subtract_same_denominator", config: { denominators: [5, 6, 8, 10], reverseProblem: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "fractions_subtract_same_denominator", config: { denominators: [8, 10, 12], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000035": {
    id: "a1000000-0000-0000-0000-000000000035",
    strand: { ms: "Perpuluhan", en: "Decimals" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tambah & Tolak Perpuluhan (1 Tempat Perpuluhan)", en: "Adding & Subtracting Decimals (1 Decimal Place)" },
    yearLevel: 4,
    explanation: {
      ms: "Perpuluhan 1 tempat perpuluhan (persepuluhan) seperti 3.5 bermaksud 3 dan 5 persepuluhan. Untuk tambah atau tolak, susun titik perpuluhan lurus, sama seperti nombor bulat biasa.\n\nContoh harian: Ali berlari 2.4 km pagi ini dan 1.3 km petang ini. Berapa jumlah jarak larian Ali?",
      en: "A 1-decimal-place number (tenths) like 3.5 means 3 and 5 tenths. To add or subtract, line up the decimal points, just like normal whole numbers.\n\nEveryday example: Ali ran 2.4 km this morning and 1.3 km this evening. What's his total running distance?",
    },
    tips: [
      { ms: "Titik lurus, jawapan tepat — susun titik perpuluhan sebelum mengira apa-apa!", en: "Straight point, correct answer — line up the decimal points before calculating anything!" },
      { ms: "JANGAN buat ini: 2.4 + 1.3 dikira sebagai 2+1=3 (abaikan .4 dan .3 terus). SALAH — persepuluhan MESTI dikira juga; jawapan yang betul ialah 3.7, bukan 3.", en: "DON'T do this: 2.4 + 1.3 calculated as 2+1=3 (ignoring the .4 and .3 entirely). WRONG — the tenths MUST be included too; the correct answer is 3.7, not 3." },
      { ms: "Petua pantas: fikirkan tempat persepuluhan seperti sen dalam wang — 0.5 hampir sama konsepnya dengan RM0.50.", en: "Quick trick: think of the tenths place like small change — 0.5 works similarly to thinking about half of something." },
      { ms: "Cabaran: jika ada sesi KETIGA selepas dua yang pertama, jangan berhenti awal — tambah KETIGA-TIGA jarak itu.", en: "Challenge: if there's a THIRD session after the first two, don't stop early — add all THREE distances together." },
    ],
    howTo: [
      { ms: "Kenal pasti kedua-dua nombor perpuluhan yang perlu dikira.", en: "Identify the two decimal numbers to be calculated." },
      { ms: "Susun kedua-dua nombor supaya titik perpuluhan sejajar.", en: "Line up both numbers so the decimal points align." },
      { ms: "Tambah atau tolak bermula dari lajur paling kanan (persepuluhan), sama seperti nombor bulat.", en: "Add or subtract starting from the rightmost column (tenths), just like whole numbers." },
      { ms: "Letakkan titik perpuluhan pada jawapan, pada kedudukan yang sama.", en: "Place the decimal point in your answer, in the same position." },
      { ms: "Semak: jawapan anda mesti mempunyai TEPAT satu digit selepas titik perpuluhan.", en: "Check: your answer must have EXACTLY one digit after the decimal point." },
    ],
    workedExample: {
      problem: { ms: "2.4 + 1.3", en: "2.4 + 1.3" },
      steps: [
        { ms: "Kenal pasti: 2.4 dan 1.3, kedua-duanya 1 tempat perpuluhan.", en: "Identify: 2.4 and 1.3, both 1 decimal place." },
        { ms: "Susun titik perpuluhan lurus", en: "Line up the decimal points" },
        { ms: "Tambah persepuluhan: 4+3=7", en: "Add the tenths: 4+3=7" },
        { ms: "Tambah nombor bulat: 2+1=3", en: "Add the whole numbers: 2+1=3" },
        { ms: "Jawapan: 3.7", en: "Answer: 3.7" },
        { ms: "Semak: 3.7 − 1.3 = 2.4 ✓", en: "Check: 3.7 − 1.3 = 2.4 ✓" },
      ],
      answer: "3.7",
      diagram: { kind: "vertical_arithmetic", operands: ["2.4", "1.3"], operator: "+", result: "3.7" },
    },
    commonMistakes: [
      { mistakeType: "unit_confusion", description: { ms: "Murid mengabaikan persepuluhan sepenuhnya dan hanya mengira bahagian nombor bulat (contohnya 2.4+1.3 dikira sebagai 2+1=3).", en: "Student ignores the tenths entirely and only calculates the whole-number part (e.g. 2.4+1.3 treated as 2+1=3)." } },
      { mistakeType: "place_value_error", description: { ms: "Murid tidak susun titik perpuluhan dengan betul semasa mengira secara menegak, menyebabkan digit tercampur pada lajur yang salah.", en: "Student doesn't line up the decimal points correctly when calculating vertically, causing digits to mix into the wrong columns." } },
      { mistakeType: "special_case_error", description: { ms: "Apabila jumlah persepuluhan mencecah 10 (contohnya 6+7=13), murid tidak simpan 1 ke lajur nombor bulat.", en: "When the tenths sum reaches 10 or more (e.g. 6+7=13), student doesn't carry the 1 into the whole-number column." } },
      { mistakeType: "wrong_operation", description: { ms: "Semasa menolak, murid tidak pinjam daripada nombor bulat apabila persepuluhan yang ditolak lebih besar daripada persepuluhan asal.", en: "While subtracting, student doesn't borrow from the whole number when the tenths being subtracted is larger than the original tenths." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (sesi ketiga selepas dua yang pertama), murid berhenti selepas dua sesi pertama dan tidak teruskan menambah sesi ketiga.", en: "In the challenge-tier question (a third session after the first two), the student stops after the first two sessions and doesn't continue to add the third." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "decimal_add_subtract_y4", config: { maxWhole: 10 } },
      { type: "fill", difficulty: 1, generatorKey: "decimal_add_subtract_y4", config: { maxWhole: 20 } },
      { type: "word_problem", difficulty: 2, generatorKey: "decimal_add_subtract_y4", config: { type: "word_problem", maxWhole: 15 } },
      { type: "mcq", difficulty: 3, generatorKey: "decimal_add_subtract_y4", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_add_subtract_y4", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 2, generatorKey: "decimal_add_subtract_y4", config: { maxWhole: 15, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000036": {
    id: "a1000000-0000-0000-0000-000000000036",
    strand: { ms: "Perpuluhan", en: "Decimals" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Darab Perpuluhan", en: "Multiplying Decimals" },
    yearLevel: 5,
    explanation: {
      ms: "Untuk darab nombor perpuluhan dengan nombor bulat, darab seperti biasa dahulu (abaikan titik perpuluhan buat sementara), kemudian letakkan semula titik perpuluhan pada jawapan.\n\nContoh harian: Sebotol jus berisi 1.5 liter. Berapa liter jus dalam 4 botol?",
      en: "To multiply a decimal by a whole number, multiply as usual first (ignore the decimal point temporarily), then place the decimal point back into the answer.\n\nEveryday example: A bottle of juice holds 1.5 litres. How many litres are in 4 bottles?",
    },
    tips: [
      {
        ms: "Darab seolah-olah kedua-dua nombor itu nombor bulat dahulu, kemudian kembalikan titik perpuluhan.",
        en: "Multiply as if both numbers were whole numbers first, then bring the decimal point back.",
      },
      {
        ms: "Anggarkan jawapan dahulu (cth. 1.5 × 4 ≈ 2 × 4 = 8) untuk semak jawapan akhir masuk akal.",
        en: "Estimate the answer first (e.g. 1.5 × 4 ≈ 2 × 4 = 8) to check your final answer makes sense.",
      },
      {
        ms: "JANGAN buat ini: 1.5 × 4 dijawab sebagai 60 (darab 15 × 4 tetapi lupa letak titik semula). SALAH — 1.5 ada 1 tempat perpuluhan, jadi jawapan MESTI juga ada 1 tempat perpuluhan: 6.0.",
        en: "DON'T do this: 1.5 × 4 answered as 60 (multiplying 15 × 4 but forgetting to put the point back). WRONG — 1.5 has 1 decimal place, so the answer MUST also have 1 decimal place: 6.0.",
      },
      {
        ms: "Cabaran: jika soalan tanya tentang bilangan botol yang BERBEZA daripada jumlah asal, cari jumlah sebotol dahulu, kemudian darab semula dengan bilangan botol yang baharu.",
        en: "Challenge: if the question asks about a DIFFERENT number of bottles than the original total, find the per-bottle amount first, then multiply again by the new bottle count.",
      },
    ],
    howTo: [
      { ms: "Darab kedua-dua nombor seolah-olah nombor bulat, abaikan titik perpuluhan.", en: "Multiply both numbers as if they were whole numbers, ignoring the decimal point." },
      { ms: "Kira semula berapa tempat perpuluhan patut ada dalam jawapan.", en: "Work out how many decimal places the answer should have." },
      { ms: "Letakkan titik perpuluhan pada kedudukan yang betul.", en: "Place the decimal point in the correct position." },
      { ms: "Semak dengan anggaran: adakah jawapan anda hampir dengan anggaran kasar?", en: "Check with an estimate: is your answer close to a rough estimate?" },
    ],
    workedExample: {
      problem: { ms: "1.5 × 4", en: "1.5 × 4" },
      steps: [
        { ms: "Darab seolah-olah nombor bulat: 15 × 4 = 60", en: "Multiply as whole numbers: 15 × 4 = 60" },
        { ms: "1.5 ada 1 tempat perpuluhan, jadi letakkan titik: 6.0", en: "1.5 has 1 decimal place, so place the point: 6.0" },
        { ms: "Jawapan: 6.0", en: "Answer: 6.0" },
        { ms: "Semak: 1.5 × 4 ≈ 2 × 4 = 8, dan 6.0 hampir dengan anggaran itu ✓", en: "Check: 1.5 × 4 ≈ 2 × 4 = 8, and 6.0 is close to that estimate ✓" },
      ],
      answer: "6.0",
    },
    commonMistakes: [
      { mistakeType: "ignored_decimal_point", description: { ms: "Murid darab dengan betul tetapi lupa letakkan semula titik perpuluhan pada jawapan.", en: "The student multiplies correctly but forgets to place the decimal point back into the answer." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah kedua-dua nombor berbanding mendarabkannya.", en: "The student adds the two numbers instead of multiplying them." } },
      { mistakeType: "misplaced_decimal_point", description: { ms: "Murid letakkan titik perpuluhan pada kedudukan yang salah (cth. dua tempat perpuluhan berbanding satu).", en: "The student places the decimal point in the wrong position (e.g. two decimal places instead of one)." } },
      { mistakeType: "arithmetic_error_in_multiplication", description: { ms: "Murid abaikan titik perpuluhan dengan betul tetapi tersilap kira pendaraban asas itu sendiri.", en: "The student correctly ignores the decimal point but makes an error in the basic multiplication itself." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (bilangan botol berbeza daripada jumlah asal), murid berhenti selepas cari jumlah sebotol dan tidak teruskan mendarab dengan bilangan botol yang baharu.", en: "In the challenge-tier question (a different number of bottles than the original total), the student stops after finding the per-bottle amount and doesn't continue to multiply by the new bottle count." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "decimal_multiply", config: { maxWhole: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "decimal_multiply", config: { maxWhole: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "decimal_multiply", config: { maxWhole: 8 } },
      { type: "mcq", difficulty: 3, generatorKey: "decimal_multiply", config: { maxWhole: 10, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_multiply", config: { maxWhole: 8, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_multiply", config: { maxWhole: 8, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000037": {
    id: "a1000000-0000-0000-0000-000000000037",
    strand: { ms: "Perpuluhan", en: "Decimals" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Bahagi Perpuluhan", en: "Dividing Decimals" },
    yearLevel: 5,
    explanation: {
      ms: "Untuk bahagi nombor perpuluhan dengan nombor bulat, bahagi seperti biasa, dan letakkan titik perpuluhan pada jawapan terus di atas titik perpuluhan bahagi (nombor asal).\n\nContoh harian: 7.2 meter tali dipotong sama rata kepada 3 bahagian. Berapa panjang setiap bahagian?",
      en: "To divide a decimal by a whole number, divide as usual, and place the decimal point in the answer directly above the decimal point in the number being divided.\n\nEveryday example: 7.2 metres of rope is cut equally into 3 pieces. How long is each piece?",
    },
    tips: [
      {
        ms: "Letakkan titik perpuluhan pada jawapan terus di atas titik perpuluhan asal, sebelum mula membahagi.",
        en: "Place the decimal point in your answer directly above the original decimal point, before you start dividing.",
      },
      {
        ms: "Semak jawapan anda: darabkan jawapan dengan pembahagi — ia MESTI menyamai nombor asal.",
        en: "Check your answer: multiply your answer by the divisor — it MUST equal the original number.",
      },
      {
        ms: "JANGAN buat ini: 7.2 ÷ 3 dijawab sebagai 24 (bahagi 72 ÷ 3 tetapi lupa letak titik semula). SALAH — jawapan MESTI juga ada 1 tempat perpuluhan, sama seperti nombor asal: 2.4.",
        en: "DON'T do this: 7.2 ÷ 3 answered as 24 (dividing 72 ÷ 3 but forgetting to put the point back). WRONG — the answer MUST also have 1 decimal place, same as the original number: 2.4.",
      },
      {
        ms: "Cabaran: jika tali yang sama dipotong semula kepada bilangan bahagian yang BERBEZA, jangan berhenti pada potongan pertama — bahagikan semula panjang asal dengan bilangan bahagian yang baharu.",
        en: "Challenge: if the same rope is re-cut into a DIFFERENT number of pieces, don't stop at the first cut — divide the original length again by the new number of pieces.",
      },
    ],
    howTo: [
      { ms: "Letakkan titik perpuluhan pada jawapan, terus di atas titik perpuluhan bahagi.", en: "Place the decimal point in the answer, directly above the decimal point being divided." },
      { ms: "Bahagi seperti biasa, digit demi digit.", en: "Divide as usual, digit by digit." },
      { ms: "Semak jawapan akhir dengan darab semula.", en: "Check the final answer by multiplying back." },
    ],
    workedExample: {
      problem: { ms: "7.2 ÷ 3", en: "7.2 ÷ 3" },
      steps: [
        { ms: "Letakkan titik perpuluhan pada jawapan terus di atas 7.2", en: "Place the decimal point in the answer directly above 7.2" },
        { ms: "7 ÷ 3 = 2, baki 1", en: "7 ÷ 3 = 2, remainder 1" },
        { ms: "12 ÷ 3 = 4 (bawa turun 2 persepuluhan)", en: "12 ÷ 3 = 4 (bring down the 2 tenths)" },
        { ms: "Jawapan: 2.4", en: "Answer: 2.4" },
        { ms: "Semak: 2.4 × 3 = 7.2 ✓", en: "Check: 2.4 × 3 = 7.2 ✓" },
      ],
      answer: "2.4",
    },
    commonMistakes: [
      { mistakeType: "ignored_decimal_point", description: { ms: "Murid membahagi dengan betul tetapi lupa letakkan semula titik perpuluhan pada jawapan.", en: "The student divides correctly but forgets to place the decimal point back into the answer." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid mendarab kedua-dua nombor berbanding membahagikannya.", en: "The student multiplies the two numbers instead of dividing them." } },
      { mistakeType: "misplaced_decimal_point", description: { ms: "Murid letakkan titik perpuluhan pada kedudukan yang salah dalam jawapan.", en: "The student places the decimal point in the wrong position in the answer." } },
      { mistakeType: "remainder_confusion", description: { ms: "Murid berhenti selepas langkah pertama pembahagian dan tidak bawa turun digit persepuluhan yang berbaki.", en: "The student stops after the first division step and doesn't bring down the remaining tenths digit." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (dipotong semula kepada bilangan bahagian berbeza), murid berhenti selepas potongan pertama dan tidak teruskan membahagi semula.", en: "In the challenge-tier question (re-cut into a different number of pieces), the student stops after the first cut and doesn't continue to divide again." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "decimal_divide", config: { maxQuotientWhole: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "decimal_divide", config: { maxQuotientWhole: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "decimal_divide", config: { maxQuotientWhole: 8 } },
      { type: "mcq", difficulty: 3, generatorKey: "decimal_divide", config: { maxQuotientWhole: 10, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_divide", config: { maxQuotientWhole: 8, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_divide", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000038": {
    id: "a1000000-0000-0000-0000-000000000038",
    strand: { ms: "Pecahan", en: "Fractions" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Bahagi Pecahan Dengan Nombor Bulat", en: "Dividing a Fraction by a Whole Number" },
    yearLevel: 6,
    explanation: {
      ms: "Untuk membahagikan pecahan wajar dengan nombor bulat, darabkan sahaja PENYEBUT (nombor bawah) dengan nombor bulat itu. Pengangka (nombor atas) kekal sama, kemudian permudahkan jika boleh.\n\nContoh harian: 3/4 bar coklat hendak dikongsi sama rata antara 2 orang kawan. Berapa bahagian setiap orang dapat?",
      en: "To divide a proper fraction by a whole number, just multiply the DENOMINATOR (bottom number) by that whole number. The numerator (top number) stays the same, then simplify if possible.\n\nEveryday example: 3/4 of a chocolate bar is shared equally between 2 friends. How much does each friend get?",
    },
    tips: [
      {
        ms: "Peraturan: (a/b) ÷ c = a/(b × c) — hanya penyebut yang berubah.",
        en: "The rule: (a/b) ÷ c = a/(b × c) — only the denominator changes.",
      },
      {
        ms: "Jangan lupa permudahkan jawapan akhir jika pengangka dan penyebut ada faktor sepunya.",
        en: "Don't forget to simplify the final answer if the numerator and denominator share a common factor.",
      },
      {
        ms: "JANGAN buat ini: 3/4 ÷ 2 dikira sebagai 6/4 (darab pengangka dengan 2, seperti mendarab bukan membahagi). SALAH — anda MESTI darab PENYEBUT dengan nombor bulat itu, bukan pengangka. Jawapan yang betul ialah 3/8.",
        en: "DON'T do this: 3/4 ÷ 2 calculated as 6/4 (multiplying the numerator by 2, like multiplying instead of dividing). WRONG — you MUST multiply the DENOMINATOR by that whole number, not the numerator. The correct answer is 3/8.",
      },
      {
        ms: "Cabaran: jika bahagian itu dikongsi SEKALI LAGI antara lebih ramai orang, darabkan penyebut SEKALI LAGI dengan bilangan orang yang baharu — jangan berhenti selepas pembahagian pertama.",
        en: "Challenge: if the share is divided AGAIN among more people, multiply the denominator AGAIN by the new number of people — don't stop after the first division.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti pengangka, penyebut, dan nombor bulat pembahagi.", en: "Identify the numerator, denominator, and the whole number divisor." },
      { ms: "Darabkan penyebut dengan nombor bulat itu. Pengangka kekal sama.", en: "Multiply the denominator by that whole number. The numerator stays the same." },
      { ms: "Permudahkan pecahan jawapan jika boleh.", en: "Simplify the resulting fraction if possible." },
      { ms: "Semak: darabkan jawapan anda semula dengan nombor bulat itu — ia mesti menyamai pecahan asal. Jika bahagian itu dikongsi sekali lagi, ulangi proses ini dengan penyebut yang baharu.", en: "Check: multiply your answer back by that whole number — it should equal the original fraction. If the share is divided again, repeat this process with the new denominator." },
    ],
    workedExample: {
      problem: { ms: "3/4 ÷ 2", en: "3/4 ÷ 2" },
      steps: [
        { ms: "Darabkan penyebut: 4 × 2 = 8", en: "Multiply the denominator: 4 × 2 = 8" },
        { ms: "Pengangka kekal: 3", en: "Numerator stays: 3" },
        { ms: "Jawapan: 3/8 (sudah paling mudah)", en: "Answer: 3/8 (already simplest form)" },
      ],
      answer: "3/8",
    },
    commonMistakes: [
      { mistakeType: "multiplied_instead_of_divided", description: { ms: "Murid darabkan pengangka dengan nombor bulat, bukan penyebut.", en: "The student multiplies the numerator by the whole number instead of the denominator." } },
      { mistakeType: "forgot_to_simplify", description: { ms: "Murid dapat jawapan yang betul tetapi tidak permudahkannya.", en: "The student gets the correct answer but doesn't simplify it." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari jumlah asal (diberi bahagian dan bilangan bahagian), murid bahagi berbanding darab semula.", en: "When finding the original amount (given the share and the number of shares), the student divides instead of multiplying back." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak sama ada jawapan itu munasabah — pecahan hasil bahagi mesti lebih kecil daripada pecahan asal.", en: "The student doesn't check whether the answer is reasonable — the resulting fraction should be smaller than the original fraction." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan dua langkah (dikongsi sekali lagi), murid berhenti selepas pembahagian pertama dan lupa teruskan ke pembahagian kedua.", en: "In a two-step question (shared again), the student stops after the first division and forgets to continue to the second." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_by_whole", config: { denominators: [2, 3, 4, 5, 6, 8] } },
      { type: "fill", difficulty: 3, generatorKey: "fractions_divide_by_whole", config: { denominators: [2, 3, 4, 6] } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_by_whole", config: { denominators: [2, 3, 4, 6], type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_by_whole", config: { denominators: [3, 4, 5, 6], errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_by_whole", config: { denominators: [2, 3, 4, 6], reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_by_whole", config: { denominators: [2, 3, 4], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000039": {
    id: "a1000000-0000-0000-0000-000000000039",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tambah & Tolak Wang", en: "Adding & Subtracting Money" },
    yearLevel: 4,
    explanation: {
      ms: "Wang dalam Ringgit Malaysia (RM) ditulis dengan 2 tempat perpuluhan (sen). 100 sen = RM1. Untuk tambah atau tolak wang, susun titik perpuluhan lurus, sama seperti nombor perpuluhan biasa.\n\nContoh harian: Ibu beli sayur RM8.50 dan ikan RM12.30. Berapa jumlah perbelanjaan ibu?",
      en: "Money in Ringgit Malaysia (RM) is written with 2 decimal places (sen). 100 sen = RM1. To add or subtract money, line up the decimal points, just like regular decimal numbers.\n\nEveryday example: Mother buys vegetables for RM8.50 and fish for RM12.30. What's her total spending?",
    },
    tips: [
      { ms: "Seratus sen sama dengan satu ringgit — simpan 1 ringgit apabila sen mencecah 100!", en: "A hundred sen equals one ringgit — carry 1 ringgit whenever the sen reaches 100!" },
      { ms: "JANGAN buat ini: RM8.50 + RM12.30 dikira sebagai 850 + 1230 = 2080, terus ditulis RM20.80 tanpa semak sen. SALAH secara kebetulan sahaja di sini — tambah sen dan ringgit BERASINGAN dahulu (50+30=80 sen, 8+12=20 ringgit), baru gabungkan; jangan hanya sambungkan digit.", en: "DON'T do this: RM8.50 + RM12.30 calculated as 850 + 1230 = 2080, written straight as RM20.80 without checking the sen. This only happens to work here — add the sen and ringgit SEPARATELY first (50+30=80 sen, 8+12=20 ringgit), then combine; don't just concatenate digits." },
      { ms: "Semak jawapan anda: tolak salah satu jumlah asal daripada jawapan — ia mesti kembali kepada jumlah yang satu lagi.", en: "Check your answer: subtract one of the original amounts from your answer — it should return the other original amount." },
      { ms: "Cabaran: jika ada barang KETIGA yang dibeli selepas dua yang pertama, jangan berhenti awal — tambah ketiga-tiga harga itu.", en: "Challenge: if a THIRD item is bought after the first two, don't stop early — add all three prices together." },
    ],
    howTo: [
      { ms: "Kenal pasti kedua-dua jumlah wang yang perlu dikira.", en: "Identify both money amounts to be calculated." },
      { ms: "Susun kedua-dua jumlah wang supaya titik perpuluhan sejajar.", en: "Line up both amounts so the decimal points align." },
      { ms: "Tambah atau tolak sen dahulu, kemudian ringgit.", en: "Add or subtract the sen first, then the ringgit." },
      { ms: "Jika sen melebihi 100, simpan 1 ke lajur ringgit (sama seperti nombor perpuluhan biasa).", en: "If the sen total is 100 or more, carry 1 into the ringgit column (same as regular decimals)." },
      { ms: "Semak: tolak salah satu jumlah asal daripada jawapan anda — ia mesti sama dengan jumlah asal yang satu lagi.", en: "Check: subtract one of the original amounts from your answer — it should equal the other original amount." },
    ],
    workedExample: {
      problem: { ms: "RM8.50 + RM12.30", en: "RM8.50 + RM12.30" },
      steps: [
        { ms: "Kenal pasti: RM8.50 dan RM12.30.", en: "Identify: RM8.50 and RM12.30." },
        { ms: "Tambah sen: 50 + 30 = 80 sen", en: "Add the sen: 50 + 30 = 80 sen" },
        { ms: "Tambah ringgit: 8 + 12 = 20", en: "Add the ringgit: 8 + 12 = 20" },
        { ms: "Jawapan: RM20.80", en: "Answer: RM20.80" },
        { ms: "Semak: RM20.80 − RM12.30 = RM8.50 ✓", en: "Check: RM20.80 − RM12.30 = RM8.50 ✓" },
      ],
      answer: "RM20.80",
      diagram: { kind: "vertical_arithmetic", operands: ["8.50", "12.30"], operator: "+", result: "20.80", prefix: "RM" },
    },
    commonMistakes: [
      { mistakeType: "special_case_error", description: { ms: "Murid tidak \"simpan\"/\"pinjam\" dengan betul apabila jumlah sen mencecah atau melebihi 100, meninggalkan sen sebagai nombor 3 digit dalam jawapan (contohnya RM8.124 bukan RM9.24).", en: "Student doesn't carry/borrow correctly when the sen total reaches or exceeds 100, leaving the sen as a 3-digit number in the answer (e.g. RM8.124 instead of RM9.24)." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid mencampurkan ringgit dan sen sebagai satu nombor bulat (contohnya RM8.50 dikira sebagai 850) tanpa mengekalkan tempat perpuluhan yang betul.", en: "Student merges ringgit and sen into one whole number (e.g. RM8.50 treated as 850) without keeping the correct decimal place." } },
      { mistakeType: "place_value_error", description: { ms: "Murid tidak menyusun titik perpuluhan segaris semasa mengira secara menegak, menyebabkan sen dan ringgit tercampur pada lajur yang salah.", en: "Student doesn't align the decimal points when calculating vertically, causing sen and ringgit to mix into the wrong columns." } },
      { mistakeType: "wrong_operation", description: { ms: "Semasa menolak, murid tidak pinjam daripada ringgit apabila sen yang ditolak lebih besar daripada sen asal.", en: "While subtracting, student doesn't borrow from the ringgit when the sen being subtracted is larger than the original sen." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (barang ketiga dibeli selepas dua yang pertama), murid berhenti selepas dua barang pertama dan tidak teruskan menambah barang ketiga.", en: "In the challenge-tier question (a third item bought after the first two), the student stops after the first two items and doesn't continue to add the third." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "money_add_subtract", config: { maxRM: 20 } },
      { type: "fill", difficulty: 2, generatorKey: "money_add_subtract", config: { maxRM: 15 } },
      { type: "word_problem", difficulty: 2, generatorKey: "money_add_subtract", config: { type: "word_problem", maxRM: 15 } },
      { type: "mcq", difficulty: 3, generatorKey: "money_add_subtract", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "money_add_subtract", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "money_add_subtract", config: { maxRM: 15, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000040": {
    id: "a1000000-0000-0000-0000-000000000040",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Darab & Bahagi Wang", en: "Multiplying & Dividing Money" },
    yearLevel: 4,
    explanation: {
      ms: "Untuk darab atau bahagi wang dengan nombor bulat, kira seperti biasa, kemudian pastikan jawapan ditulis dalam format RM yang betul (2 tempat perpuluhan).\n\nContoh harian: Sebuah buku berharga RM4.50. Berapa kos untuk 3 buah buku?",
      en: "To multiply or divide money by a whole number, calculate as usual, then make sure the answer is written in the correct RM format (2 decimal places).\n\nEveryday example: A book costs RM4.50. How much do 3 books cost?",
    },
    tips: [
      { ms: "Darab macam nombor biasa, letak titik balik kemudian — kira dahulu tanpa titik, baru letak semula!", en: "Multiply like a regular number, put the point back after — calculate first without the point, then put it back!" },
      { ms: "JANGAN buat ini: RM4.50 × 3 dikira dengan titik perpuluhan dikekalkan sepanjang pengiraan (4.50 × 3 dianggap seperti 4 × 3 = 12, .50 diabaikan). SALAH — kira 450 × 3 = 1350 dahulu, BARU letak titik semula: RM13.50.", en: "DON'T do this: RM4.50 × 3 calculated with the decimal point kept throughout (treating 4.50 × 3 like 4 × 3 = 12, ignoring the .50). WRONG — calculate 450 × 3 = 1350 first, THEN place the point back: RM13.50." },
      { ms: "Petua pantas: anggarkan dahulu untuk semak jawapan munasabah (cth. RM4.50 × 3 ≈ RM5 × 3 = RM15).", en: "Quick trick: estimate first to check your answer is reasonable (e.g. RM4.50 × 3 ≈ RM5 × 3 = RM15)." },
      { ms: "Cabaran: jika soalan tanya tentang bilangan yang BERBEZA daripada jumlah asal, cari harga seunit dahulu, kemudian darab semula dengan bilangan yang baharu.", en: "Challenge: if the question asks about a DIFFERENT quantity than the original total, find the unit price first, then multiply again by the new quantity." },
    ],
    howTo: [
      { ms: "Kenal pasti sama ada soalan itu darab atau bahagi.", en: "Identify whether the question is multiplication or division." },
      { ms: "Buang titik perpuluhan buat sementara dan kira seperti nombor bulat.", en: "Temporarily drop the decimal point and calculate like a whole number." },
      { ms: "Darab atau bahagi seperti biasa.", en: "Multiply or divide as usual." },
      { ms: "Letakkan semula titik perpuluhan dua angka dari kanan.", en: "Place the decimal point back, two digits from the right." },
      { ms: "Semak: gunakan anggaran untuk pastikan jawapan anda munasabah.", en: "Check: use an estimate to make sure your answer is reasonable." },
    ],
    workedExample: {
      problem: { ms: "RM4.50 × 3", en: "RM4.50 × 3" },
      steps: [
        { ms: "Kenal pasti: RM4.50 didarab dengan 3.", en: "Identify: RM4.50 multiplied by 3." },
        { ms: "Buang titik: 450 sen", en: "Drop the point: 450 sen" },
        { ms: "Darab seolah-olah nombor bulat: 450 × 3 = 1350", en: "Multiply as whole numbers: 450 × 3 = 1350" },
        { ms: "Letakkan semula titik perpuluhan: RM13.50", en: "Place the decimal point back: RM13.50" },
        { ms: "Semak: RM13.50 ÷ 3 = RM4.50 ✓", en: "Check: RM13.50 ÷ 3 = RM4.50 ✓" },
      ],
      answer: "RM13.50",
    },
    commonMistakes: [
      { mistakeType: "place_value_error", description: { ms: "Murid tidak tukar kepada sen sebelum mengira, menyebabkan titik perpuluhan diletakkan pada kedudukan yang salah dalam jawapan.", en: "Student doesn't convert to sen before calculating, causing the decimal point to end up in the wrong position in the answer." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid mendarab atau membahagi hanya bahagian ringgit, mengabaikan bahagian sen sepenuhnya.", en: "Student multiplies or divides only the ringgit part, ignoring the sen part entirely." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah harga berulang kali secara manual dan tersilap kira bilangan kali, bukan mendarab terus.", en: "Student adds the price repeatedly by hand and miscounts the number of times, instead of multiplying directly." } },
      { mistakeType: "special_case_error", description: { ms: "Semasa membahagi, murid tidak sedar jawapan sepatutnya kurang daripada jumlah asal, dan tidak menyedari kesilapan walaupun jawapannya tidak munasabah.", en: "While dividing, student doesn't realize the answer should be smaller than the original total, and doesn't notice the mistake even when the answer isn't reasonable." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (bilangan berbeza daripada jumlah asal), murid berhenti selepas cari harga seunit dan tidak teruskan mendarab dengan bilangan yang baharu.", en: "In the challenge-tier question (a different quantity than the original total), the student stops after finding the unit price and doesn't continue to multiply by the new quantity." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "money_multiply_divide", config: { maxRM: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "money_multiply_divide", config: { maxRM: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "money_multiply_divide", config: { type: "word_problem", maxRM: 8 } },
      { type: "mcq", difficulty: 3, generatorKey: "money_multiply_divide", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "money_multiply_divide", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "money_multiply_divide", config: { maxRM: 8, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000041": {
    id: "a1000000-0000-0000-0000-000000000041",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Faedah Mudah", en: "Simple Interest" },
    yearLevel: 5,
    explanation: {
      ms: "Faedah mudah ialah wang tambahan yang diperoleh apabila melabur atau disimpan di bank. Formula: Faedah = Prinsipal × Kadar × Tahun ÷ 100.\n\nContoh harian: Jika kamu simpan RM500 pada kadar faedah 4% setahun selama 2 tahun, berapa faedah yang kamu peroleh?",
      en: "Simple interest is the extra money earned when investing or saving in a bank. Formula: Interest = Principal × Rate × Years ÷ 100.\n\nEveryday example: If you save RM500 at an interest rate of 4% per year for 2 years, how much interest do you earn?",
    },
    tips: [
      { ms: "P-R-T bahagi seratus — Prinsipal kali Rate kali Tahun, baru bahagi 100!", en: "P-R-T over one hundred — Principal times Rate times Time, then divide by 100!" },
      { ms: "JANGAN buat ini: RM500 pada 4% selama 2 tahun dikira sebagai (500×4)÷100=20, terus jadikan jawapan akhir. SALAH — anda TERLUPA darab dengan bilangan tahun (2); jawapan yang betul ialah RM40.00, bukan RM20.00.", en: "DON'T do this: RM500 at 4% for 2 years calculated as (500×4)÷100=20, treated as the final answer. WRONG — you FORGOT to multiply by the number of years (2); the correct answer is RM40.00, not RM20.00." },
      { ms: "Petua pantas: kadar peratus SENTIASA dibahagi 100 sebelum jawapan akhir — jika jawapan anda kelihatan terlalu besar (beribu-ribu ringgit), semak semula.", en: "Quick trick: the percentage rate ALWAYS gets divided by 100 before the final answer — if your answer looks way too big (thousands of ringgit), double-check." },
      { ms: "Cabaran: jika soalan tanya jumlah WANG KESELURUHAN (bukan hanya faedah), cari faedah dahulu, kemudian tambahkan dengan prinsipal.", en: "Challenge: if the question asks for the TOTAL amount (not just the interest), find the interest first, then add it to the principal." },
    ],
    howTo: [
      { ms: "Kenal pasti prinsipal, kadar faedah (%), dan tempoh (tahun).", en: "Identify the principal, interest rate (%), and time period (years)." },
      { ms: "Darabkan ketiga-tiganya: Prinsipal × Kadar × Tahun.", en: "Multiply all three: Principal × Rate × Years." },
      { ms: "Bahagikan hasilnya dengan 100 untuk dapatkan faedah.", en: "Divide the result by 100 to get the interest." },
      { ms: "Tulis jawapan dalam format RM dengan 2 tempat perpuluhan.", en: "Write the answer in RM format with 2 decimal places." },
      { ms: "Semak: adakah anda darab dengan bilangan TAHUN, bukan hanya kira untuk 1 tahun?", en: "Check: did you multiply by the number of YEARS, not just calculate for 1 year?" },
    ],
    workedExample: {
      problem: { ms: "RM500 pada 4% setahun selama 2 tahun", en: "RM500 at 4% per year for 2 years" },
      steps: [
        { ms: "Kenal pasti: Prinsipal RM500, Kadar 4%, Tempoh 2 tahun.", en: "Identify: Principal RM500, Rate 4%, Time 2 years." },
        { ms: "Darab ketiga-tiganya: 500 × 4 × 2 = 4000", en: "Multiply all three: 500 × 4 × 2 = 4000" },
        { ms: "Bahagi dengan 100: 4000 ÷ 100 = 40", en: "Divide by 100: 4000 ÷ 100 = 40" },
        { ms: "Jawapan: RM40.00", en: "Answer: RM40.00" },
        { ms: "Semak: RM40.00 ÷ 2 tahun = RM20.00 setahun, dan RM20.00 ialah faedah 1 tahun pada RM500 di 4% ✓", en: "Check: RM40.00 ÷ 2 years = RM20.00 per year, and RM20.00 is 1 year's interest on RM500 at 4% ✓" },
      ],
      answer: "RM40.00",
    },
    commonMistakes: [
      { mistakeType: "wrong_operation", description: { ms: "Murid tidak darabkan dengan bilangan tahun, mengira faedah untuk 1 tahun sahaja walaupun tempoh sebenar lebih daripada 1 tahun.", en: "Student doesn't multiply by the number of years, calculating interest for only 1 year even though the actual period is longer." } },
      { mistakeType: "forgot_conversion", description: { ms: "Murid terlupa bahagikan dengan 100, menganggap kadar peratus sebagai pendarab bulat biasa.", en: "Student forgets to divide by 100, treating the percentage rate as a plain whole-number multiplier." } },
      { mistakeType: "place_value_error", description: { ms: "Murid tersilap letak titik perpuluhan semasa menulis jawapan akhir dalam format RM.", en: "Student misplaces the decimal point when writing the final answer in RM format." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid mengelirukan prinsipal dengan faedah, dan melaporkan jumlah keseluruhan (prinsipal + faedah) sebagai jawapan akhir bukannya faedah sahaja.", en: "Student confuses the principal with the interest, reporting the total amount (principal + interest) as the final answer instead of just the interest." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (jumlah wang keseluruhan), murid berhenti selepas cari faedah dan tidak teruskan menambahkannya dengan prinsipal.", en: "In the challenge-tier question (total amount), the student stops after finding the interest and doesn't continue to add it to the principal." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "simple_interest", config: { maxPrincipalRM: 20 } },
      { type: "fill", difficulty: 3, generatorKey: "simple_interest", config: { maxPrincipalRM: 15 } },
      { type: "word_problem", difficulty: 3, generatorKey: "simple_interest", config: { maxPrincipalRM: 15 } },
      { type: "mcq", difficulty: 3, generatorKey: "simple_interest", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "simple_interest", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "simple_interest", config: { maxPrincipalRM: 15, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000042": {
    id: "a1000000-0000-0000-0000-000000000042",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Untung dan Rugi", en: "Profit and Loss" },
    yearLevel: 6,
    explanation: {
      ms: "Harga kos ialah harga membeli sesuatu barang. Harga jualan ialah harga menjualnya semula. Jika harga jualan LEBIH TINGGI, itu untung. Jika harga jualan LEBIH RENDAH, itu rugi.\n\nContoh harian: Sebuah kedai beli basikal pada harga RM150 dan menjualnya pada RM180. Berapakah untung kedai itu?",
      en: "Cost price is the price something was bought for. Selling price is the price it's sold for. If the selling price is HIGHER, that's a profit. If it's LOWER, that's a loss.\n\nEveryday example: A shop buys a bicycle for RM150 and sells it for RM180. What is the shop's profit?",
    },
    tips: [
      { ms: "Tinggi tolak rendah, itulah untung/rugi — bukan jumlah, tapi beza!", en: "Higher minus lower, that's your profit/loss — not the sum, the difference!" },
      { ms: "JANGAN buat ini: kos RM150 + jualan RM180 = RM330, dianggap sebagai untung. SALAH — ini penambahan, bukan untung! Untung ialah BEZA: RM180 − RM150 = RM30.", en: "DON'T do this: cost RM150 + selling RM180 = RM330, treated as the profit. WRONG — that's addition, not profit! Profit is the DIFFERENCE: RM180 − RM150 = RM30." },
      { ms: "Petua pantas: jika harga jualan lebih besar daripada harga kos, ia MESTI untung; jika lebih kecil, ia MESTI rugi — semak arah perbandingan dahulu.", en: "Quick trick: if the selling price is bigger than the cost price, it MUST be a profit; if smaller, it MUST be a loss — check the comparison direction first." },
    ],
    howTo: [
      { ms: "Kenal pasti harga kos dan harga jualan.", en: "Identify the cost price and the selling price." },
      { ms: "Bandingkan harga jualan dengan harga kos.", en: "Compare the selling price with the cost price." },
      { ms: "Tentukan sama ada ia untung (jualan lebih tinggi) atau rugi (jualan lebih rendah).", en: "Determine whether it's a profit (selling higher) or a loss (selling lower)." },
      { ms: "Cari beza antara kedua-dua harga itu — itulah jumlah untung atau rugi.", en: "Find the difference between the two prices — that's the profit or loss amount." },
      { ms: "Semak: adakah jawapan anda sepadan dengan arah perbandingan (untung jika jualan lebih tinggi)?", en: "Check: does your answer match the comparison direction (profit if selling is higher)?" },
    ],
    workedExample: {
      problem: { ms: "Harga kos RM150, harga jualan RM180", en: "Cost price RM150, selling price RM180" },
      steps: [
        { ms: "Kenal pasti: harga kos RM150, harga jualan RM180.", en: "Identify: cost price RM150, selling price RM180." },
        { ms: "Bandingkan: RM180 > RM150", en: "Compare: RM180 > RM150" },
        { ms: "Jualan lebih tinggi, jadi ini untung", en: "Selling is higher, so this is a profit" },
        { ms: "Untung = RM180 − RM150 = RM30", en: "Profit = RM180 − RM150 = RM30" },
        { ms: "Semak: RM150 + RM30 = RM180 ✓", en: "Check: RM150 + RM30 = RM180 ✓" },
      ],
      answer: "RM30.00",
    },
    commonMistakes: [
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah harga kos dan harga jualan berbanding mencari beza.", en: "Student adds the cost price and selling price instead of finding the difference." } },
      { mistakeType: "special_case_error", description: { ms: "Murid keliru antara untung dan rugi apabila harga jualan hampir sama dengan harga kos, dan tersilap arah perbandingan.", en: "Student confuses profit and loss when the selling price is close to the cost price, getting the comparison direction wrong." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid melaporkan harga jualan atau harga kos itu sendiri sebagai jawapan, bukan beza antara kedua-duanya.", en: "Student reports the selling price or cost price itself as the answer, not the difference between them." } },
      { mistakeType: "place_value_error", description: { ms: "Murid tersilap letak titik perpuluhan semasa menulis jawapan akhir dalam format RM.", en: "Student misplaces the decimal point when writing the final answer in RM format." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (jual beberapa item), murid beri untung/rugi bagi satu item sahaja, tidak darab dengan bilangan item yang dijual.", en: "In the challenge-tier question (selling several items), the student gives the profit/loss for just one item, without multiplying by the number of items sold." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "profit_loss", config: { maxRM: 100 } },
      { type: "fill", difficulty: 2, generatorKey: "profit_loss", config: { maxRM: 100 } },
      { type: "word_problem", difficulty: 2, generatorKey: "profit_loss", config: { type: "word_problem", maxRM: 80 } },
      { type: "mcq", difficulty: 3, generatorKey: "profit_loss", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "profit_loss", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "profit_loss", config: { maxRM: 80, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000043": {
    id: "a1000000-0000-0000-0000-000000000043",
    strand: { ms: "Masa dan Waktu", en: "Time" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Tambah & Tolak Masa", en: "Adding & Subtracting Time" },
    yearLevel: 4,
    explanation: {
      ms: "Masa diukur dalam jam dan minit, dengan 60 minit = 1 jam. Ini berbeza daripada nombor bulat biasa (yang berasaskan 10) — apabila minit mencapai 60 atau lebih, tukar 60 minit kepada 1 jam.\n\nContoh harian: Ahmad belajar Matematik selama 1 jam 45 minit, kemudian belajar Sains selama 50 minit. Berapa jumlah masa belajar Ahmad?",
      en: "Time is measured in hours and minutes, with 60 minutes = 1 hour. This is different from regular whole numbers (which are base-10) — when minutes reach 60 or more, convert 60 minutes into 1 hour.\n\nEveryday example: Ahmad studies Maths for 1 hour 45 minutes, then studies Science for 50 minutes. What's Ahmad's total study time?",
    },
    tips: [
      {
        ms: "Masa berasaskan 60, BUKAN 10 — 60 minit = 1 jam, bukan 100 minit.",
        en: "Time is base-60, NOT base-10 — 60 minutes = 1 hour, not 100 minutes.",
      },
      {
        ms: "Tambah atau tolak minit dahulu, kemudian jam.",
        en: "Add or subtract the minutes first, then the hours.",
      },
      {
        ms: "JANGAN buat ini: 1 jam 45 minit + 50 minit dijawab sebagai 1 jam 95 minit. SALAH — minit tidak boleh melebihi 59! 95 minit MESTI ditukar kepada 1 jam 35 minit dahulu, jadi jawapan sebenar ialah 2 jam 35 minit.",
        en: "DON'T do this: 1 hour 45 minutes + 50 minutes answered as 1 hour 95 minutes. WRONG — minutes can't exceed 59! 95 minutes MUST be converted into 1 hour 35 minutes first, so the real answer is 2 hours 35 minutes.",
      },
      {
        ms: "Cabaran: jika ada mata pelajaran KETIGA selepas dua yang pertama, jangan berhenti awal — tambah ketiga-tiga tempoh masa itu.",
        en: "Challenge: if there's a THIRD subject after the first two, don't stop early — add all three durations together.",
      },
    ],
    howTo: [
      { ms: "Tambah atau tolak minit dahulu.", en: "Add or subtract the minutes first." },
      { ms: "Jika minit mencapai 60 atau lebih, tukar 60 minit kepada 1 jam dan simpan ke lajur jam.", en: "If the minutes reach 60 or more, convert 60 minutes into 1 hour and carry it into the hours column." },
      { ms: "Tambah atau tolak jam.", en: "Add or subtract the hours." },
      { ms: "Semak: adakah bahagian minit dalam jawapan anda kurang daripada 60?", en: "Check: is the minutes part of your answer less than 60?" },
    ],
    workedExample: {
      problem: { ms: "1 jam 45 minit + 50 minit", en: "1 hour 45 minutes + 50 minutes" },
      steps: [
        { ms: "Tambah minit: 45 + 50 = 95 minit", en: "Add the minutes: 45 + 50 = 95 minutes" },
        { ms: "95 minit = 1 jam 35 minit", en: "95 minutes = 1 hour 35 minutes" },
        { ms: "Tambah jam: 1 jam + 1 jam = 2 jam", en: "Add the hours: 1 hour + 1 hour = 2 hours" },
        { ms: "Jawapan: 2 jam 35 minit", en: "Answer: 2 hours 35 minutes" },
      ],
      answer: "2j 35m",
    },
    commonMistakes: [
      { mistakeType: "time_base60_carry_error", description: { ms: "Murid mengira minit seperti nombor berasaskan 10, tidak menukar 60 minit kepada 1 jam.", en: "The student treats minutes like base-10 numbers, not converting 60 minutes into 1 hour." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah berbanding menolak (atau sebaliknya) apabila menyelesaikan masalah.", en: "The student adds instead of subtracting (or vice versa) when solving the problem." } },
      { mistakeType: "borrow_error", description: { ms: "Semasa menolak, murid tidak pinjam 60 minit daripada jam apabila minit yang ditolak lebih besar.", en: "When subtracting, the student doesn't borrow 60 minutes from the hours when the minutes being subtracted is larger." } },
      { mistakeType: "arithmetic_error_in_step", description: { ms: "Murid ikut kaedah yang betul tetapi tersilap kira semasa menambah atau menolak minit/jam.", en: "The student follows the correct method but makes an arithmetic slip while adding or subtracting the minutes or hours." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (mata pelajaran ketiga selepas dua yang pertama), murid berhenti selepas dua mata pelajaran pertama dan tidak teruskan menambah mata pelajaran ketiga.", en: "In the challenge-tier question (a third subject after the first two), the student stops after the first two subjects and doesn't continue to add the third." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "time_add_subtract", config: { maxHours: 5 } },
      { type: "fill", difficulty: 2, generatorKey: "time_add_subtract", config: { maxHours: 5 } },
      { type: "word_problem", difficulty: 2, generatorKey: "time_add_subtract", config: { maxHours: 3 } },
      { type: "mcq", difficulty: 3, generatorKey: "time_add_subtract", config: { maxHours: 5, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_add_subtract", config: { maxHours: 3, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_add_subtract", config: { maxHours: 3, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000044": {
    id: "a1000000-0000-0000-0000-000000000044",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Tambah & Tolak Panjang", en: "Adding & Subtracting Length" },
    yearLevel: 4,
    explanation: {
      ms: "Panjang diukur dalam meter (m) dan sentimeter (cm), dengan 100 cm = 1 m. Untuk tambah atau tolak, gunakan kaedah yang sama seperti wang (RM dan sen) — apabila cm mencapai 100 atau lebih, tukar kepada 1 m.\n\nContoh harian: Seutas reben panjangnya 2 m 40 cm. Seutas lagi panjangnya 1 m 75 cm. Berapa jumlah panjang kedua-dua reben?",
      en: "Length is measured in metres (m) and centimetres (cm), with 100 cm = 1 m. To add or subtract, use the same method as money (RM and sen) — when cm reaches 100 or more, convert it into 1 m.\n\nEveryday example: One ribbon is 2 m 40 cm long. Another is 1 m 75 cm long. What's the total length of both ribbons?",
    },
    tips: [
      {
        ms: "100 cm = 1 m — sama seperti 100 sen = RM1.",
        en: "100 cm = 1 m — just like 100 sen = RM1.",
      },
      {
        ms: "Tambah atau tolak cm dahulu, kemudian meter.",
        en: "Add or subtract the centimetres first, then the metres.",
      },
      {
        ms: "JANGAN buat ini: 2 m 40 cm + 1 m 75 cm dijawab sebagai 3 m 115 cm. SALAH — cm tidak boleh melebihi 99! 115 cm MESTI ditukar kepada 1 m 15 cm dahulu, jadi jawapan sebenar ialah 4 m 15 cm.",
        en: "DON'T do this: 2 m 40 cm + 1 m 75 cm answered as 3 m 115 cm. WRONG — cm can't exceed 99! 115 cm MUST be converted into 1 m 15 cm first, so the real answer is 4 m 15 cm.",
      },
    ],
    howTo: [
      { ms: "Tambah atau tolak cm dahulu.", en: "Add or subtract the centimetres first." },
      { ms: "Jika cm mencapai 100 atau lebih, tukar 100 cm kepada 1 m dan simpan ke lajur meter.", en: "If the cm reach 100 or more, convert 100 cm into 1 m and carry it into the metres column." },
      { ms: "Tambah atau tolak meter.", en: "Add or subtract the metres." },
      { ms: "Semak: adakah bahagian cm dalam jawapan anda kurang daripada 100?", en: "Check: is the cm part of your answer less than 100?" },
    ],
    workedExample: {
      problem: { ms: "2 m 40 cm + 1 m 75 cm", en: "2 m 40 cm + 1 m 75 cm" },
      steps: [
        { ms: "Tambah cm: 40 + 75 = 115 cm", en: "Add the cm: 40 + 75 = 115 cm" },
        { ms: "115 cm = 1 m 15 cm", en: "115 cm = 1 m 15 cm" },
        { ms: "Tambah meter: 2 m + 1 m + 1 m = 4 m", en: "Add the metres: 2 m + 1 m + 1 m = 4 m" },
        { ms: "Jawapan: 4 m 15 cm", en: "Answer: 4 m 15 cm" },
      ],
      answer: "4m 15cm",
    },
    commonMistakes: [
      { mistakeType: "length_base100_carry_error", description: { ms: "Murid tidak menukar 100 cm kepada 1 m apabila jumlah cm melebihi 100.", en: "The student doesn't convert 100 cm into 1 m when the total cm exceeds 100." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah berbanding menolak (atau sebaliknya) apabila menyelesaikan masalah.", en: "The student adds instead of subtracting (or vice versa) when solving the problem." } },
      { mistakeType: "borrow_error", description: { ms: "Semasa menolak, murid tidak pinjam 100 cm daripada meter apabila cm yang ditolak lebih besar.", en: "When subtracting, the student doesn't borrow 100 cm from the metres when the cm being subtracted is larger." } },
      { mistakeType: "arithmetic_error_in_step", description: { ms: "Murid ikut kaedah yang betul tetapi tersilap kira semasa menambah atau menolak cm/meter.", en: "The student follows the correct method but makes an arithmetic slip while adding or subtracting the cm or metres." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (keping ketiga disambungkan selepas dua yang pertama), murid berhenti selepas dua keping pertama dan tidak teruskan menambah keping ketiga.", en: "In the challenge-tier question (a third piece joined after the first two), the student stops after the first two pieces and doesn't continue to add the third." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "length_add_subtract", config: { maxMetres: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "length_add_subtract", config: { maxMetres: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "length_add_subtract", config: { maxMetres: 6 } },
      { type: "mcq", difficulty: 3, generatorKey: "length_add_subtract", config: { maxMetres: 10, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "length_add_subtract", config: { maxMetres: 6, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "length_add_subtract", config: { maxMetres: 6, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000045": {
    id: "a1000000-0000-0000-0000-000000000045",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Tukar Unit Panjang", en: "Converting Units of Length" },
    yearLevel: 4,
    explanation: {
      ms: "Panjang boleh diukur dalam milimeter (mm), sentimeter (cm), meter (m), atau kilometer (km). 10 mm = 1 cm, 100 cm = 1 m, 1000 m = 1 km.\n\nContoh harian: Sebatang pensel panjangnya 15 cm. Berapa milimeter panjangnya?",
      en: "Length can be measured in millimetres (mm), centimetres (cm), metres (m), or kilometres (km). 10 mm = 1 cm, 100 cm = 1 m, 1000 m = 1 km.\n\nEveryday example: A pencil is 15 cm long. How many millimetres is that?",
    },
    tips: [
      { ms: "Unit lebih kecil = nombor lebih besar. Darab apabila menukar daripada unit besar kepada unit kecil.", en: "Smaller unit = bigger number. Multiply when converting from a larger unit to a smaller one." },
      { ms: "Unit lebih besar = nombor lebih kecil. Bahagi apabila menukar daripada unit kecil kepada unit besar.", en: "Larger unit = smaller number. Divide when converting from a smaller unit to a larger one." },
      {
        ms: "JANGAN buat ini: 15 cm ditukar kepada mm dengan mendarab ×100 dan mendapat 1500 mm. SALAH — cm ke mm ialah ×10, BUKAN ×100 (itu faktor untuk m ke cm). Jawapan yang betul ialah 150 mm.",
        en: "DON'T do this: 15 cm converted to mm by multiplying ×100 and getting 1500 mm. WRONG — cm to mm is ×10, NOT ×100 (that's the factor for m to cm). The correct answer is 150 mm.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti unit asal dan unit yang dikehendaki.", en: "Identify the starting unit and the target unit." },
      { ms: "Ingat faktor penukaran: 10 mm=1cm, 100cm=1m, 1000m=1km.", en: "Remember the conversion factor: 10 mm=1cm, 100cm=1m, 1000m=1km." },
      { ms: "Darab (unit besar → kecil) atau bahagi (unit kecil → besar).", en: "Multiply (large→small unit) or divide (small→large unit)." },
      { ms: "Semak: adakah jawapan anda munasabah? (unit kecil sepatutnya beri nombor lebih besar)", en: "Check: does your answer make sense? (a smaller unit should give a bigger number)" },
    ],
    workedExample: {
      problem: { ms: "15 cm = ? mm", en: "15 cm = ? mm" },
      steps: [
        { ms: "cm ke mm ialah unit besar ke kecil, jadi darab", en: "cm to mm is large unit to small, so multiply" },
        { ms: "Faktor penukaran ialah 10 (10 mm = 1 cm)", en: "The conversion factor is 10 (10 mm = 1 cm)" },
        { ms: "15 × 10 = 150", en: "15 × 10 = 150" },
        { ms: "Jawapan: 150 mm", en: "Answer: 150 mm" },
      ],
      answer: "150",
    },
    commonMistakes: [
      { mistakeType: "wrong_conversion_factor", description: { ms: "Murid guna faktor penukaran yang salah (cth. ×100 bukan ×10) atau darab/bahagi ke arah yang salah.", en: "The student uses the wrong conversion factor (e.g. ×100 instead of ×10) or converts in the wrong direction." } },
      { mistakeType: "wrong_direction", description: { ms: "Murid darab apabila patut bahagi (atau sebaliknya), cth. bahagi apabila menukar unit besar kepada unit kecil.", en: "The student multiplies when they should divide (or vice versa), e.g. dividing when converting a large unit to a small one." } },
      { mistakeType: "confused_which_units", description: { ms: "Murid keliru unit mana lebih besar antara dua unit yang diberi.", en: "The student is confused about which of the two given units is larger." } },
      { mistakeType: "arithmetic_error_in_conversion", description: { ms: "Murid guna faktor dan arah yang betul tetapi tersilap kira semasa mendarab atau membahagi.", en: "The student uses the correct factor and direction but makes an arithmetic slip while multiplying or dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "unit_convert", config: { pairs: [{ big: "cm", small: "mm", factor: 10 }, { big: "m", small: "cm", factor: 100 }], maxBig: 12 } },
      { type: "fill", difficulty: 2, generatorKey: "unit_convert", config: { pairs: [{ big: "km", small: "m", factor: 1000 }], maxBig: 8 } },
      { type: "word_problem", difficulty: 2, generatorKey: "unit_convert", config: { pairs: [{ big: "cm", small: "mm", factor: 10 }, { big: "m", small: "cm", factor: 100 }, { big: "km", small: "m", factor: 1000 }], maxBig: 8, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "cm", small: "mm", factor: 10 }, { big: "m", small: "cm", factor: 100 }], maxBig: 12, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "cm", small: "mm", factor: 10 }, { big: "m", small: "cm", factor: 100 }, { big: "km", small: "m", factor: 1000 }], maxBig: 8, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "m", small: "cm", factor: 100 }], maxBig: 8, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000046": {
    id: "a1000000-0000-0000-0000-000000000046",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Tukar Unit Jisim", en: "Converting Units of Mass" },
    yearLevel: 5,
    explanation: {
      ms: "Jisim diukur dalam gram (g) atau kilogram (kg). 1000 g = 1 kg.\n\nContoh harian: Sebungkus gula beratnya 2 kg. Berapa gram beratnya?",
      en: "Mass is measured in grams (g) or kilograms (kg). 1000 g = 1 kg.\n\nEveryday example: A bag of sugar weighs 2 kg. How many grams is that?",
    },
    tips: [
      { ms: "1000 g = 1 kg — sama seperti 1000 m = 1 km.", en: "1000 g = 1 kg — same relationship as 1000 m = 1 km." },
      { ms: "kg ke g: darab dengan 1000. g ke kg: bahagi dengan 1000.", en: "kg to g: multiply by 1000. g to kg: divide by 1000." },
      {
        ms: "JANGAN buat ini: 2 kg ditukar kepada g dengan mendarab ×100 dan mendapat 200 g. SALAH — faktor penukaran ialah ×1000, BUKAN ×100. Jawapan yang betul ialah 2000 g.",
        en: "DON'T do this: 2 kg converted to g by multiplying ×100 and getting 200 g. WRONG — the conversion factor is ×1000, NOT ×100. The correct answer is 2000 g.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti unit asal dan unit yang dikehendaki.", en: "Identify the starting unit and the target unit." },
      { ms: "Darab dengan 1000 (kg → g) atau bahagi dengan 1000 (g → kg).", en: "Multiply by 1000 (kg → g) or divide by 1000 (g → kg)." },
      { ms: "Semak: adakah jawapan anda munasabah? (g sepatutnya beri nombor lebih besar daripada kg)", en: "Check: does your answer make sense? (g should give a bigger number than kg)" },
    ],
    workedExample: {
      problem: { ms: "2 kg = ? g", en: "2 kg = ? g" },
      steps: [
        { ms: "kg ke g, jadi darab dengan 1000", en: "kg to g, so multiply by 1000" },
        { ms: "2 × 1000 = 2000", en: "2 × 1000 = 2000" },
        { ms: "Jawapan: 2000 g", en: "Answer: 2000 g" },
      ],
      answer: "2000",
    },
    commonMistakes: [
      { mistakeType: "wrong_conversion_factor", description: { ms: "Murid guna faktor penukaran yang salah (cth. ×100 bukan ×1000).", en: "The student uses the wrong conversion factor (e.g. ×100 instead of ×1000)." } },
      { mistakeType: "wrong_direction", description: { ms: "Murid darab apabila patut bahagi (atau sebaliknya), cth. bahagi apabila menukar kg kepada g.", en: "The student multiplies when they should divide (or vice versa), e.g. dividing when converting kg to g." } },
      { mistakeType: "confused_which_units", description: { ms: "Murid keliru unit mana lebih besar antara kg dan g.", en: "The student is confused about which unit is larger, kg or g." } },
      { mistakeType: "arithmetic_error_in_conversion", description: { ms: "Murid guna faktor dan arah yang betul tetapi tersilap kira semasa mendarab atau membahagi dengan 1000.", en: "The student uses the correct factor and direction but makes an arithmetic slip while multiplying or dividing by 1000." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "unit_convert", config: { pairs: [{ big: "kg", small: "g", factor: 1000 }], maxBig: 10 } },
      { type: "fill", difficulty: 1, generatorKey: "unit_convert", config: { pairs: [{ big: "kg", small: "g", factor: 1000 }], maxBig: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "unit_convert", config: { pairs: [{ big: "kg", small: "g", factor: 1000 }], maxBig: 6, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "kg", small: "g", factor: 1000 }], maxBig: 10, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "kg", small: "g", factor: 1000 }], maxBig: 6, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "kg", small: "g", factor: 1000 }], maxBig: 6, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000047": {
    id: "a1000000-0000-0000-0000-000000000047",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Tukar Unit Isipadu Cecair", en: "Converting Units of Volume of Liquid" },
    yearLevel: 5,
    explanation: {
      ms: "Isipadu cecair diukur dalam mililiter (ml) atau liter (l). 1000 ml = 1 l.\n\nContoh harian: Sebotol air isipadunya 1.5 l. Berapa mililiter isipadunya?",
      en: "Volume of liquid is measured in millilitres (ml) or litres (l). 1000 ml = 1 l.\n\nEveryday example: A bottle of water holds 1.5 l. How many millilitres is that?",
    },
    tips: [
      { ms: "1000 ml = 1 l — sama seperti 1000 g = 1 kg.", en: "1000 ml = 1 l — same relationship as 1000 g = 1 kg." },
      { ms: "l ke ml: darab dengan 1000. ml ke l: bahagi dengan 1000.", en: "l to ml: multiply by 1000. ml to l: divide by 1000." },
      {
        ms: "JANGAN buat ini: 3 l ditukar kepada ml dengan mendarab ×100 dan mendapat 300 ml. SALAH — faktor penukaran ialah ×1000, BUKAN ×100. Jawapan yang betul ialah 3000 ml.",
        en: "DON'T do this: 3 l converted to ml by multiplying ×100 and getting 300 ml. WRONG — the conversion factor is ×1000, NOT ×100. The correct answer is 3000 ml.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti unit asal dan unit yang dikehendaki.", en: "Identify the starting unit and the target unit." },
      { ms: "Darab dengan 1000 (l → ml) atau bahagi dengan 1000 (ml → l).", en: "Multiply by 1000 (l → ml) or divide by 1000 (ml → l)." },
      { ms: "Semak: adakah jawapan anda munasabah? (ml sepatutnya beri nombor lebih besar daripada l)", en: "Check: does your answer make sense? (ml should give a bigger number than l)" },
    ],
    workedExample: {
      problem: { ms: "3 l = ? ml", en: "3 l = ? ml" },
      steps: [
        { ms: "l ke ml, jadi darab dengan 1000", en: "l to ml, so multiply by 1000" },
        { ms: "3 × 1000 = 3000", en: "3 × 1000 = 3000" },
        { ms: "Jawapan: 3000 ml", en: "Answer: 3000 ml" },
      ],
      answer: "3000",
    },
    commonMistakes: [
      { mistakeType: "wrong_conversion_factor", description: { ms: "Murid guna faktor penukaran yang salah (cth. ×100 bukan ×1000).", en: "The student uses the wrong conversion factor (e.g. ×100 instead of ×1000)." } },
      { mistakeType: "wrong_direction", description: { ms: "Murid darab apabila patut bahagi (atau sebaliknya), cth. bahagi apabila menukar l kepada ml.", en: "The student multiplies when they should divide (or vice versa), e.g. dividing when converting l to ml." } },
      { mistakeType: "confused_which_units", description: { ms: "Murid keliru unit mana lebih besar antara l dan ml.", en: "The student is confused about which unit is larger, l or ml." } },
      { mistakeType: "arithmetic_error_in_conversion", description: { ms: "Murid guna faktor dan arah yang betul tetapi tersilap kira semasa mendarab atau membahagi dengan 1000.", en: "The student uses the correct factor and direction but makes an arithmetic slip while multiplying or dividing by 1000." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "unit_convert", config: { pairs: [{ big: "l", small: "ml", factor: 1000 }], maxBig: 8 } },
      { type: "fill", difficulty: 1, generatorKey: "unit_convert", config: { pairs: [{ big: "l", small: "ml", factor: 1000 }], maxBig: 8 } },
      { type: "word_problem", difficulty: 2, generatorKey: "unit_convert", config: { pairs: [{ big: "l", small: "ml", factor: 1000 }], maxBig: 5, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "l", small: "ml", factor: 1000 }], maxBig: 8, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "l", small: "ml", factor: 1000 }], maxBig: 5, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "l", small: "ml", factor: 1000 }], maxBig: 5, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000048": {
    id: "a1000000-0000-0000-0000-000000000048",
    strand: { ms: "Masa dan Waktu", en: "Time" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Tukar Unit Masa", en: "Converting Units of Time" },
    yearLevel: 4,
    explanation: {
      ms: "Masa boleh ditukar antara unit — 24 jam = 1 hari, 7 hari = 1 minggu.\n\nContoh harian: Percutian keluarga Ali mengambil masa 2 minggu. Berapa hari itu?",
      en: "Time can be converted between units — 24 hours = 1 day, 7 days = 1 week.\n\nEveryday example: Ali's family holiday takes 2 weeks. How many days is that?",
    },
    tips: [
      { ms: "24 jam = 1 hari. 7 hari = 1 minggu.", en: "24 hours = 1 day. 7 days = 1 week." },
      { ms: "Unit lebih besar ke unit lebih kecil = darab. Unit lebih kecil ke unit lebih besar = bahagi.", en: "Larger unit to smaller unit = multiply. Smaller unit to larger unit = divide." },
      {
        ms: "JANGAN buat ini: 2 minggu ditukar kepada hari dengan mendarab ×10 dan mendapat 20 hari. SALAH — faktor penukaran ialah ×7 (7 hari = 1 minggu), BUKAN ×10. Jawapan yang betul ialah 14 hari.",
        en: "DON'T do this: 2 weeks converted to days by multiplying ×10 and getting 20 days. WRONG — the conversion factor is ×7 (7 days = 1 week), NOT ×10. The correct answer is 14 days.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti unit asal dan unit yang dikehendaki.", en: "Identify the starting unit and the target unit." },
      { ms: "Darab (hari → jam, minggu → hari) atau bahagi (jam → hari, hari → minggu).", en: "Multiply (day → hour, week → day) or divide (hour → day, day → week)." },
      { ms: "Semak: adakah jawapan anda munasabah? (unit lebih kecil sepatutnya beri nombor lebih besar)", en: "Check: does your answer make sense? (a smaller unit should give a bigger number)" },
    ],
    workedExample: {
      problem: { ms: "2 minggu = ? hari", en: "2 weeks = ? days" },
      steps: [
        { ms: "minggu ke hari, jadi darab dengan 7", en: "week to day, so multiply by 7" },
        { ms: "2 × 7 = 14", en: "2 × 7 = 14" },
        { ms: "Jawapan: 14 hari", en: "Answer: 14 days" },
      ],
      answer: "14",
    },
    commonMistakes: [
      { mistakeType: "wrong_conversion_factor", description: { ms: "Murid guna faktor penukaran yang salah (cth. ×10 bukan ×7).", en: "The student uses the wrong conversion factor (e.g. ×10 instead of ×7)." } },
      { mistakeType: "wrong_direction", description: { ms: "Murid darab apabila patut bahagi (atau sebaliknya), cth. bahagi apabila menukar minggu kepada hari.", en: "The student multiplies when they should divide (or vice versa), e.g. dividing when converting weeks to days." } },
      { mistakeType: "confused_which_units", description: { ms: "Murid keliru unit mana lebih besar antara dua unit yang diberi.", en: "The student is confused about which of the two given units is larger." } },
      { mistakeType: "arithmetic_error_in_conversion", description: { ms: "Murid guna faktor dan arah yang betul tetapi tersilap kira semasa mendarab atau membahagi.", en: "The student uses the correct factor and direction but makes an arithmetic slip while multiplying or dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "unit_convert", config: { pairs: [{ big: "day", small: "hr", factor: 24 }, { big: "wk", small: "day", factor: 7 }], maxBig: 6 } },
      { type: "fill", difficulty: 1, generatorKey: "unit_convert", config: { pairs: [{ big: "day", small: "hr", factor: 24 }, { big: "wk", small: "day", factor: 7 }], maxBig: 6 } },
      { type: "word_problem", difficulty: 2, generatorKey: "unit_convert", config: { pairs: [{ big: "day", small: "hr", factor: 24 }, { big: "wk", small: "day", factor: 7 }], maxBig: 4, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "day", small: "hr", factor: 24 }, { big: "wk", small: "day", factor: 7 }], maxBig: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "day", small: "hr", factor: 24 }, { big: "wk", small: "day", factor: 7 }], maxBig: 4, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "day", small: "hr", factor: 24 }, { big: "wk", small: "day", factor: 7 }], maxBig: 4, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000049": {
    id: "a1000000-0000-0000-0000-000000000049",
    strand: { ms: "Masa dan Waktu", en: "Time" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Tukar Unit Masa Lanjutan", en: "Converting Units of Time (Advanced)" },
    yearLevel: 5,
    explanation: {
      ms: "Tahun 5 meluaskan penukaran masa: 60 minit = 1 jam, 12 bulan = 1 tahun, 10 tahun = 1 dekad, 10 dekad = 1 abad.\n\nContoh harian: Sebuah bangunan bersejarah dibina 3 abad lalu. Berapa dekad itu?",
      en: "Year 5 extends time conversion further: 60 minutes = 1 hour, 12 months = 1 year, 10 years = 1 decade, 10 decades = 1 century.\n\nEveryday example: A historic building was built 3 centuries ago. How many decades is that?",
    },
    tips: [
      { ms: "60 minit=1 jam, 12 bulan=1 tahun, 10 tahun=1 dekad, 10 dekad=1 abad.", en: "60 minutes=1 hour, 12 months=1 year, 10 years=1 decade, 10 decades=1 century." },
      { ms: "Unit lebih besar ke unit lebih kecil = darab. Unit lebih kecil ke unit lebih besar = bahagi.", en: "Larger unit to smaller unit = multiply. Smaller unit to larger unit = divide." },
      {
        ms: "JANGAN buat ini: 3 abad ditukar kepada dekad dengan mendarab ×100 dan mendapat 300 dekad. SALAH — 1 abad = 10 dekad, jadi faktornya ×10, BUKAN ×100. Jawapan yang betul ialah 30 dekad.",
        en: "DON'T do this: 3 centuries converted to decades by multiplying ×100 and getting 300 decades. WRONG — 1 century = 10 decades, so the factor is ×10, NOT ×100. The correct answer is 30 decades.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti unit asal dan unit yang dikehendaki.", en: "Identify the starting unit and the target unit." },
      { ms: "Ingat faktor penukaran yang betul untuk pasangan unit itu.", en: "Recall the correct conversion factor for that unit pair." },
      { ms: "Darab atau bahagi ikut arah penukaran.", en: "Multiply or divide depending on the direction of conversion." },
      { ms: "Semak: adakah jawapan anda munasabah? (unit lebih kecil sepatutnya beri nombor lebih besar)", en: "Check: does your answer make sense? (a smaller unit should give a bigger number)" },
    ],
    workedExample: {
      problem: { ms: "3 abad = ? dekad", en: "3 centuries = ? decades" },
      steps: [
        { ms: "abad ke dekad, jadi darab dengan 10", en: "century to decade, so multiply by 10" },
        { ms: "3 × 10 = 30", en: "3 × 10 = 30" },
        { ms: "Jawapan: 30 dekad", en: "Answer: 30 decades" },
      ],
      answer: "30",
    },
    commonMistakes: [
      { mistakeType: "wrong_conversion_factor", description: { ms: "Murid guna faktor penukaran yang salah (banyak pasangan unit berbeza tahun ini) atau arah yang salah.", en: "The student uses the wrong conversion factor (many different unit pairs this year) or the wrong direction." } },
      { mistakeType: "wrong_direction", description: { ms: "Murid darab apabila patut bahagi (atau sebaliknya), cth. bahagi apabila menukar tahun kepada bulan.", en: "The student multiplies when they should divide (or vice versa), e.g. dividing when converting years to months." } },
      { mistakeType: "confused_which_units", description: { ms: "Murid keliru unit mana lebih besar antara dua unit yang diberi, terutamanya bagi dekad dan abad yang kurang biasa digunakan.", en: "The student is confused about which of the two given units is larger, especially for the less familiar decade and century." } },
      { mistakeType: "arithmetic_error_in_conversion", description: { ms: "Murid guna faktor dan arah yang betul tetapi tersilap kira semasa mendarab atau membahagi.", en: "The student uses the correct factor and direction but makes an arithmetic slip while multiplying or dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "unit_convert", config: { pairs: [{ big: "hr", small: "min", factor: 60 }, { big: "yr", small: "mth", factor: 12 }], maxBig: 6 } },
      { type: "fill", difficulty: 2, generatorKey: "unit_convert", config: { pairs: [{ big: "dec", small: "yr", factor: 10 }, { big: "c", small: "dec", factor: 10 }], maxBig: 5 } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "hr", small: "min", factor: 60 }, { big: "yr", small: "mth", factor: 12 }], maxBig: 4, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "hr", small: "min", factor: 60 }, { big: "yr", small: "mth", factor: 12 }, { big: "dec", small: "yr", factor: 10 }, { big: "c", small: "dec", factor: 10 }], maxBig: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "hr", small: "min", factor: 60 }, { big: "yr", small: "mth", factor: 12 }, { big: "dec", small: "yr", factor: 10 }, { big: "c", small: "dec", factor: 10 }], maxBig: 5, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unit_convert", config: { pairs: [{ big: "hr", small: "min", factor: 60 }, { big: "yr", small: "mth", factor: 12 }, { big: "dec", small: "yr", factor: 10 }, { big: "c", small: "dec", factor: 10 }], maxBig: 5, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000050": {
    id: "a1000000-0000-0000-0000-000000000050",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Diskaun", en: "Discount" },
    yearLevel: 6,
    explanation: {
      ms: "Diskaun ialah potongan harga yang diberikan, biasanya dalam peratus (%). Harga selepas diskaun = Harga asal − Jumlah diskaun.\n\nContoh harian: Sepasang kasut berharga RM80 didiskaun 25%. Berapakah harga selepas diskaun?",
      en: "A discount is a price reduction, usually given as a percentage (%). Price after discount = Original price − Discount amount.\n\nEveryday example: A pair of shoes costs RM80 with a 25% discount. What is the price after the discount?",
    },
    tips: [
      { ms: "Diskaun dahulu, tolak kemudian — cari jumlah potongan sebelum tolak daripada harga asal!", en: "Discount first, subtract later — find the reduction amount before taking it off the original price!" },
      { ms: "JANGAN buat ini: baju RM80 dengan diskaun 25% dijawab terus sebagai RM20 (jumlah diskaun sahaja). SALAH — RM20 hanyalah JUMLAH DISKAUN, bukan harga akhir. Harga selepas diskaun ialah RM80 − RM20 = RM60.", en: "DON'T do this: a RM80 shirt with a 25% discount answered as just RM20 (only the discount amount). WRONG — RM20 is only the DISCOUNT AMOUNT, not the final price. The price after discount is RM80 − RM20 = RM60." },
      { ms: "Petua pantas: diskaun 50% bermakna anda bayar TEPAT separuh — jumlah diskaun dan harga akhir akan menjadi nombor yang SAMA.", en: "Quick trick: a 50% discount means you pay EXACTLY half — the discount amount and the final price will be the SAME number." },
      { ms: "Cabaran: jika ada diskaun TAMBAHAN selepas diskaun pertama, kira diskaun kedua daripada harga yang TELAH didiskaun — JANGAN tambahkan kedua-dua peratus itu terus.", en: "Challenge: if there's an ADDITIONAL discount after the first, calculate the second discount on the price AFTER the first discount — DON'T just add the two percentages together." },
    ],
    howTo: [
      { ms: "Kenal pasti harga asal dan peratus diskaun.", en: "Identify the original price and the discount percentage." },
      { ms: "Kira jumlah diskaun: harga asal × peratus diskaun ÷ 100.", en: "Calculate the discount amount: original price × discount percent ÷ 100." },
      { ms: "Tolak jumlah diskaun daripada harga asal.", en: "Subtract the discount amount from the original price." },
      { ms: "Itulah harga akhir selepas diskaun.", en: "That's the final price after the discount." },
      { ms: "Semak: adakah jawapan anda harga AKHIR, bukan hanya jumlah diskaun?", en: "Check: is your answer the FINAL price, not just the discount amount?" },
    ],
    workedExample: {
      problem: { ms: "RM80 dengan diskaun 25%", en: "RM80 with a 25% discount" },
      steps: [
        { ms: "Kenal pasti: harga asal RM80, diskaun 25%.", en: "Identify: original price RM80, discount 25%." },
        { ms: "Jumlah diskaun: 80 × 25 ÷ 100 = RM20", en: "Discount amount: 80 × 25 ÷ 100 = RM20" },
        { ms: "Harga selepas diskaun: 80 − 20 = RM60", en: "Price after discount: 80 − 20 = RM60" },
        { ms: "Jawapan: RM60.00", en: "Answer: RM60.00" },
        { ms: "Semak: RM60.00 + RM20.00 = RM80.00 ✓", en: "Check: RM60.00 + RM20.00 = RM80.00 ✓" },
      ],
      answer: "RM60.00",
    },
    commonMistakes: [
      { mistakeType: "special_case_error", description: { ms: "Murid beri jumlah diskaun sahaja, bukan harga selepas diskaun, berhenti sebelum langkah tolak.", en: "Student gives only the discount amount, not the price after the discount, stopping before the subtraction step." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah jumlah diskaun kepada harga asal, bukan menolak.", en: "Student adds the discount amount to the original price, instead of subtracting." } },
      { mistakeType: "forgot_conversion", description: { ms: "Murid terlupa bahagikan dengan 100 semasa mengira jumlah diskaun daripada peratus.", en: "Student forgets to divide by 100 when calculating the discount amount from the percentage." } },
      { mistakeType: "place_value_error", description: { ms: "Murid tersilap letak titik perpuluhan semasa menulis jawapan akhir dalam format RM.", en: "Student misplaces the decimal point when writing the final answer in RM format." } },
      { mistakeType: "calculation_error", description: { ms: "Dalam soalan cabaran (dua diskaun bertindih), murid tambah kedua-dua peratus diskaun terus dan tolak satu kali daripada harga asal, bukannya kira secara berperingkat.", en: "In the challenge-tier question (two stacked discounts), the student adds the two discount percentages together and subtracts once from the original price, instead of calculating in sequence." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "discount", config: { maxRM: 100 } },
      { type: "fill", difficulty: 3, generatorKey: "discount", config: { maxRM: 100 } },
      { type: "word_problem", difficulty: 3, generatorKey: "discount", config: { type: "word_problem", maxRM: 80 } },
      { type: "mcq", difficulty: 3, generatorKey: "discount", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "discount", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "discount", config: { maxRM: 80, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000051": {
    id: "a1000000-0000-0000-0000-000000000051",
    strand: { ms: "Kebolehjadian", en: "Probability" },
    bidang: BIDANG.statisticsProbability,
    title: { ms: "Kebarangkalian", en: "Likelihood" },
    yearLevel: 6,
    explanation: {
      ms: "Kebarangkalian menerangkan sejauh mana sesuatu perkara mungkin berlaku: PASTI (akan berlaku), MUSTAHIL (tidak akan berlaku), atau di antara kedua-duanya — SAMA KEMUNGKINAN, LEBIH BERKEMUNGKINAN, atau KURANG BERKEMUNGKINAN.\n\nContoh harian: Sebuah beg mengandungi 10 biji guli merah sahaja. Adakah pasti atau mustahil untuk mengeluarkan guli biru?",
      en: "Likelihood describes how likely something is to happen: CERTAIN (will happen), IMPOSSIBLE (won't happen), or somewhere in between — EQUALLY LIKELY, MORE LIKELY, or LESS LIKELY.\n\nEveryday example: A bag contains only 10 red marbles. Is it certain or impossible to pick out a blue marble?",
    },
    tips: [
      { ms: "Jika SEMUA item sama, mengeluarkan item itu PASTI dan item lain MUSTAHIL.", en: "If ALL items are the same, picking that item is CERTAIN and any other item is IMPOSSIBLE." },
      { ms: "Jika bilangan dua jenis item SAMA, kedua-duanya SAMA KEMUNGKINAN untuk dipilih.", en: "If the count of two item types is EQUAL, both are EQUALLY LIKELY to be picked." },
      { ms: "Jenis item dengan bilangan LEBIH BANYAK adalah LEBIH BERKEMUNGKINAN dipilih.", en: "The item type with the HIGHER count is MORE LIKELY to be picked." },
    ],
    howTo: [
      { ms: "Kira bilangan setiap jenis item dalam situasi itu.", en: "Count how many of each item type are in the situation." },
      { ms: "Bandingkan bilangan itu untuk tentukan kategori kebarangkalian yang betul.", en: "Compare those counts to determine the correct likelihood category." },
      { ms: "Semak: adakah bilangan bagi setiap jenis item benar-benar sama sebelum memilih 'sama kemungkinan'?", en: "Check: are the counts for each item type actually equal before choosing 'equally likely'?" },
    ],
    workedExample: {
      problem: { ms: "Beg mengandungi 10 guli merah sahaja. Kebarangkalian mengeluarkan guli biru?", en: "A bag contains 10 red marbles only. What is the likelihood of picking out a blue marble?" },
      steps: [
        { ms: "Tiada guli biru dalam beg itu", en: "There are no blue marbles in the bag" },
        { ms: "Jawapan: Mustahil", en: "Answer: Impossible" },
      ],
      answer: "impossible",
    },
    commonMistakes: [
      { mistakeType: "likelihood_misconception", description: { ms: "Murid keliru antara kategori kebarangkalian (cth. anggap sama kemungkinan walaupun bilangan tidak sama).", en: "The student confuses the likelihood categories (e.g. assumes equally likely even when the counts aren't equal)." } },
      { mistakeType: "ignored_the_counts", description: { ms: "Murid tidak kira bilangan setiap jenis item sebelum membuat kesimpulan, hanya meneka.", en: "The student doesn't count each item type before concluding, just guesses." } },
      { mistakeType: "confused_more_and_certain", description: { ms: "Murid anggap 'lebih berkemungkinan' bermaksud 'pasti', walaupun item lain masih wujud dalam kumpulan itu.", en: "The student assumes 'more likely' means 'certain', even though the other item type still exists in the group." } },
      { mistakeType: "confused_impossible_and_less_likely", description: { ms: "Murid anggap sesuatu yang mustahil hanyalah 'kurang berkemungkinan', tidak sedar bahawa 'mustahil' bermaksud LANGSUNG tiada peluang.", en: "The student thinks something impossible is merely 'less likely', not realising 'impossible' means NO chance at all." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "likelihood", config: {} },
      { type: "mcq", difficulty: 3, generatorKey: "likelihood", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "likelihood", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "likelihood", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "likelihood", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000052": {
    id: "a1000000-0000-0000-0000-000000000052",
    strand: { ms: "Peratus", en: "Percentage" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Peratus Suatu Kuantiti (Asas)", en: "Percentage of a Quantity (Basic)" },
    yearLevel: 4,
    explanation: {
      ms: "Peratus (%) bermaksud \"per seratus\". Untuk cari peratus suatu kuantiti, darabkan kuantiti itu dengan peratus, kemudian bahagi dengan 100.\n\nContoh harian: Ada 20 biji epal dalam bakul. 25% daripadanya busuk. Berapa biji epal yang busuk?",
      en: "Percent (%) means \"per hundred\". To find a percentage of a quantity, multiply the quantity by the percentage, then divide by 100.\n\nEveryday example: There are 20 apples in a basket. 25% of them are rotten. How many apples are rotten?",
    },
    tips: [
      { ms: "Ingat peratus biasa: 50%=separuh, 25%=suku, 10%=sepersepuluh.", en: "Remember common percentages: 50%=half, 25%=quarter, 10%=one-tenth." },
      { ms: "Formula: Kuantiti × Peratus ÷ 100.", en: "Formula: Quantity × Percentage ÷ 100." },
      {
        ms: "JANGAN buat ini: 25% daripada 20 dikira sebagai 25 × 20 = 500 dan berhenti di situ. SALAH — anda MESTI bahagi dengan 100 selepas darab. Jawapan yang betul ialah 500 ÷ 100 = 5.",
        en: "DON'T do this: 25% of 20 calculated as 25 × 20 = 500 and stopping there. WRONG — you MUST divide by 100 after multiplying. The correct answer is 500 ÷ 100 = 5.",
      },
    ],
    howTo: [
      { ms: "Darabkan kuantiti dengan peratus itu.", en: "Multiply the quantity by the percentage." },
      { ms: "Bahagikan hasilnya dengan 100.", en: "Divide the result by 100." },
      { ms: "Semak: adakah jawapan anda kurang daripada kuantiti asal (untuk peratus di bawah 100%)?", en: "Check: is your answer smaller than the original quantity (for percentages under 100%)?" },
    ],
    workedExample: {
      problem: { ms: "25% daripada 20", en: "25% of 20" },
      steps: [
        { ms: "20 × 25 = 500", en: "20 × 25 = 500" },
        { ms: "500 ÷ 100 = 5", en: "500 ÷ 100 = 5" },
        { ms: "Jawapan: 5", en: "Answer: 5" },
      ],
      answer: 5,
    },
    commonMistakes: [
      { mistakeType: "calculation_error", description: { ms: "Murid lupa bahagi dengan 100 selepas darab.", en: "The student forgets to divide by 100 after multiplying." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid bahagikan kuantiti dengan peratus, bukan darab dan bahagi dengan 100.", en: "The student divides the quantity by the percentage, instead of multiplying and dividing by 100." } },
      { mistakeType: "confused_part_and_whole", description: { ms: "Murid keliru antara kuantiti asal dan bahagian yang dicari, terutamanya dalam soalan berbalik.", en: "The student confuses the original quantity with the part being found, especially in reverse-style questions." } },
      { mistakeType: "arithmetic_error_in_step", description: { ms: "Murid ikut kaedah yang betul tetapi tersilap kira semasa mendarab atau membahagi.", en: "The student follows the correct method but makes an arithmetic slip while multiplying or dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "percentage_of_quantity", config: { percentages: [10, 20, 25, 50], maxQuantity: 40 } },
      { type: "fill", difficulty: 1, generatorKey: "percentage_of_quantity", config: { percentages: [10, 20, 25, 50], maxQuantity: 40 } },
      { type: "word_problem", difficulty: 1, generatorKey: "percentage_of_quantity", config: { percentages: [10, 25, 50], maxQuantity: 30, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "percentage_of_quantity", config: { percentages: [10, 20, 25, 50], maxQuantity: 40, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "percentage_of_quantity", config: { percentages: [10, 25, 50], maxQuantity: 30, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "percentage_of_quantity", config: { percentages: [10, 20, 25, 50], maxQuantity: 40, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000053": {
    id: "a1000000-0000-0000-0000-000000000053",
    strand: { ms: "Pecahan", en: "Fractions" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tukar Pecahan dan Peratus", en: "Converting Fractions and Percentages" },
    yearLevel: 4,
    explanation: {
      ms: "Pecahan boleh ditukar kepada peratus dengan menskalakannya supaya penyebut menjadi 100. Contoh: 1/4 = 25/100 = 25%.\n\nContoh harian: 3 daripada 4 kuih dalam bekas telah dimakan. Berapa peratus kuih yang telah dimakan?",
      en: "A fraction can be converted to a percentage by scaling it so the denominator becomes 100. Example: 1/4 = 25/100 = 25%.\n\nEveryday example: 3 out of 4 cookies in a container have been eaten. What percentage of the cookies have been eaten?",
    },
    tips: [
      { ms: "Fikir: berapa kali penyebut itu perlu didarab untuk jadi 100?", en: "Think: how many times does the denominator need to be multiplied to become 100?" },
      { ms: "Darabkan pengangka dan penyebut dengan nombor yang sama itu.", en: "Multiply the numerator and denominator by that same number." },
      {
        ms: "JANGAN buat ini: 3/4 ditukar kepada peratus dengan menulis terus \"3%\". SALAH — anda MESTI skalakan penyebut kepada 100 dahulu (4 × 25 = 100), kemudian darab pengangka dengan faktor yang sama (3 × 25 = 75). Jawapan yang betul ialah 75%.",
        en: "DON'T do this: 3/4 converted to a percentage by writing \"3%\" directly. WRONG — you MUST scale the denominator to 100 first (4 × 25 = 100), then multiply the numerator by the same factor (3 × 25 = 75). The correct answer is 75%.",
      },
    ],
    howTo: [
      { ms: "Cari nombor yang menukar penyebut kepada 100.", en: "Find the number that turns the denominator into 100." },
      { ms: "Darabkan pengangka dengan nombor yang sama.", en: "Multiply the numerator by that same number." },
      { ms: "Pengangka yang baru itu ialah peratusnya.", en: "The new numerator is the percentage." },
      { ms: "Semak: adakah penyebut baru anda betul-betul 100?", en: "Check: is your new denominator exactly 100?" },
    ],
    workedExample: {
      problem: { ms: "3/4 = ?%", en: "3/4 = ?%" },
      steps: [
        { ms: "4 × 25 = 100, jadi darab kedua-dua dengan 25", en: "4 × 25 = 100, so multiply both by 25" },
        { ms: "3 × 25 = 75", en: "3 × 25 = 75" },
        { ms: "Jawapan: 75%", en: "Answer: 75%" },
      ],
      answer: "75",
    },
    commonMistakes: [
      { mistakeType: "fraction_percentage_conversion_error", description: { ms: "Murid guna pengangka terus sebagai peratus, mengabaikan penyebut.", en: "The student uses the numerator directly as the percentage, ignoring the denominator." } },
      { mistakeType: "wrong_scale_factor", description: { ms: "Murid guna faktor skala yang salah untuk menukar penyebut kepada 100.", en: "The student uses the wrong scale factor to turn the denominator into 100." } },
      { mistakeType: "scaled_numerator_only", description: { ms: "Murid darab pengangka dengan faktor tetapi lupa penyebut juga perlu diskalakan (walaupun ia menjadi 100 secara automatik apabila betul).", en: "The student multiplies the numerator by the factor but loses track of why the denominator needed scaling too." } },
      { mistakeType: "arithmetic_error_in_scaling", description: { ms: "Murid guna faktor skala yang betul tetapi tersilap kira semasa mendarab.", en: "The student uses the correct scale factor but makes an arithmetic slip while multiplying." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "fractions_percentage_convert", config: { denominators: [2, 4, 5, 10, 20, 25, 50] } },
      { type: "fill", difficulty: 3, generatorKey: "fractions_percentage_convert", config: { denominators: [4, 5, 10, 20, 25] } },
      { type: "word_problem", difficulty: 2, generatorKey: "fractions_percentage_convert", config: { denominators: [2, 4, 5, 10, 20], type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "fractions_percentage_convert", config: { denominators: [2, 4, 5, 10, 20, 25, 50], errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_percentage_convert", config: { denominators: [2, 4, 5, 10, 20, 25, 50], reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_percentage_convert", config: { denominators: [4, 5, 10, 20, 25], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000054": {
    id: "a1000000-0000-0000-0000-000000000054",
    strand: { ms: "Pecahan", en: "Fractions" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Darab Pecahan", en: "Multiplying Fractions" },
    yearLevel: 5,
    explanation: {
      ms: "Untuk darab pecahan wajar dengan nombor bulat, darabkan pengangka sahaja dengan nombor bulat itu. Penyebut kekal sama, kemudian permudahkan.\n\nContoh harian: Setiap plat mempunyai 3/4 cawan tepung. Berapa cawan tepung diperlukan untuk 3 plat?",
      en: "To multiply a proper fraction by a whole number, multiply only the numerator by that whole number. The denominator stays the same, then simplify.\n\nEveryday example: Each batch needs 3/4 cup of flour. How many cups of flour are needed for 3 batches?",
    },
    tips: [
      { ms: "Peraturan: (a/b) × c = (a×c)/b — hanya pengangka yang berubah.", en: "The rule: (a/b) × c = (a×c)/b — only the numerator changes." },
      { ms: "Jangan lupa permudahkan jawapan akhir jika boleh.", en: "Don't forget to simplify the final answer if possible." },
      {
        ms: "JANGAN buat ini: 3/4 × 3 dikira sebagai 3/12 (darab penyebut sahaja, seperti membahagi terbalik). SALAH — anda MESTI darab PENGANGKA dengan nombor bulat itu, bukan penyebut. Jawapan yang betul ialah 9/4.",
        en: "DON'T do this: 3/4 × 3 calculated as 3/12 (multiplying the denominator only, like dividing backwards). WRONG — you MUST multiply the NUMERATOR by the whole number, not the denominator. The correct answer is 9/4.",
      },
      {
        ms: "Cabaran: jika soalan tanya tentang bilangan paun yang BERBEZA daripada jumlah asal, cari jumlah sebagi paun dahulu, kemudian darab semula dengan bilangan paun yang baharu.",
        en: "Challenge: if the question asks about a DIFFERENT number of loaves than the original total, find the per-loaf amount first, then multiply again by the new number of loaves.",
      },
    ],
    howTo: [
      { ms: "Darabkan pengangka dengan nombor bulat itu.", en: "Multiply the numerator by the whole number." },
      { ms: "Penyebut kekal sama.", en: "The denominator stays the same." },
      { ms: "Permudahkan pecahan jawapan jika boleh.", en: "Simplify the resulting fraction if possible." },
      { ms: "Semak: bahagikan jawapan anda semula dengan nombor bulat itu — ia mesti menyamai pecahan asal.", en: "Check: divide your answer back by that whole number — it should equal the original fraction." },
    ],
    workedExample: {
      problem: { ms: "3/4 × 3", en: "3/4 × 3" },
      steps: [
        { ms: "Darabkan pengangka: 3 × 3 = 9", en: "Multiply the numerator: 3 × 3 = 9" },
        { ms: "Penyebut kekal: 4", en: "Denominator stays: 4" },
        { ms: "Jawapan: 9/4", en: "Answer: 9/4" },
      ],
      answer: "9/4",
    },
    commonMistakes: [
      { mistakeType: "multiplied_denominator_instead", description: { ms: "Murid darabkan penyebut, bukan pengangka.", en: "The student multiplies the denominator instead of the numerator." } },
      { mistakeType: "forgot_to_simplify", description: { ms: "Murid dapat jawapan yang betul tetapi tidak permudahkannya.", en: "The student gets the correct answer but doesn't simplify it." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari nilai satu bahagian (diberi jumlah dan bilangan bahagian), murid darab semula berbanding bahagi.", en: "When finding the value of one share (given the total and number of shares), the student multiplies again instead of dividing." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak sama ada jawapan itu munasabah — hasil darab pecahan wajar dengan nombor bulat mesti lebih besar daripada pecahan asal.", en: "The student doesn't check whether the answer is reasonable — multiplying a proper fraction by a whole number should give something bigger than the original fraction." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan cabaran (bilangan paun berbeza daripada jumlah asal), murid berhenti selepas cari jumlah sebagi paun dan tidak teruskan mendarab dengan bilangan paun yang baharu.", en: "In the challenge-tier question (a different number of loaves than the original total), the student stops after finding the per-loaf amount and doesn't continue to multiply by the new number of loaves." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "fractions_multiply", config: { denominators: [2, 3, 4, 5, 6, 8] } },
      { type: "fill", difficulty: 2, generatorKey: "fractions_multiply", config: { denominators: [2, 3, 4, 6] } },
      { type: "word_problem", difficulty: 2, generatorKey: "fractions_multiply", config: { denominators: [2, 3, 4, 6], type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "fractions_multiply", config: { denominators: [3, 4, 5, 6], errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_multiply", config: { denominators: [2, 3, 4, 6], reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_multiply", config: { denominators: [2, 3, 4, 6], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000055": {
    id: "a1000000-0000-0000-0000-000000000055",
    strand: { ms: "Perpuluhan", en: "Decimals" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tukar Perpuluhan dan Peratus", en: "Converting Decimals and Percentages" },
    yearLevel: 5,
    explanation: {
      ms: "Untuk tukar perpuluhan kepada peratus, darabkan dengan 100 (anjak titik perpuluhan 2 tempat ke kanan). Untuk arah bertentangan, bahagikan dengan 100.\n\nContoh harian: Ahmad mendapat markah 0.85 daripada 1 dalam ujian. Berapa peratus markahnya?",
      en: "To convert a decimal to a percentage, multiply by 100 (shift the decimal point 2 places right). For the reverse, divide by 100.\n\nEveryday example: Ahmad scores 0.85 out of 1 in a test. What percentage is that?",
    },
    tips: [
      { ms: "Perpuluhan ke peratus: anjak titik perpuluhan 2 tempat ke KANAN.", en: "Decimal to percentage: shift the decimal point 2 places RIGHT." },
      { ms: "Peratus ke perpuluhan: anjak titik perpuluhan 2 tempat ke KIRI.", en: "Percentage to decimal: shift the decimal point 2 places LEFT." },
      {
        ms: "JANGAN buat ini: 0.85 ditukar kepada peratus dengan anjak 1 tempat sahaja dan mendapat 8.5%. SALAH — anda MESTI anjak 2 tempat (darab dengan 100). Jawapan yang betul ialah 85%.",
        en: "DON'T do this: 0.85 converted to a percentage by shifting only 1 place and getting 8.5%. WRONG — you MUST shift 2 places (multiply by 100). The correct answer is 85%.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti arah penukaran (perpuluhan ke peratus, atau sebaliknya).", en: "Identify the conversion direction (decimal to percentage, or the reverse)." },
      { ms: "Darab dengan 100 (ke peratus) atau bahagi dengan 100 (ke perpuluhan).", en: "Multiply by 100 (to percentage) or divide by 100 (to decimal)." },
      { ms: "Semak: adakah anda anjak titik perpuluhan tepat 2 tempat?", en: "Check: did you shift the decimal point exactly 2 places?" },
    ],
    workedExample: {
      problem: { ms: "0.85 = ?%", en: "0.85 = ?%" },
      steps: [
        { ms: "Darab dengan 100: 0.85 × 100 = 85", en: "Multiply by 100: 0.85 × 100 = 85" },
        { ms: "Jawapan: 85%", en: "Answer: 85%" },
      ],
      answer: "85",
    },
    commonMistakes: [
      { mistakeType: "decimal_percentage_scale_error", description: { ms: "Murid anjak titik perpuluhan ke arah yang salah, atau salah bilangan tempat.", en: "The student shifts the decimal point in the wrong direction, or by the wrong number of places." } },
      { mistakeType: "shifted_one_place_only", description: { ms: "Murid anjak titik perpuluhan 1 tempat sahaja berbanding 2 tempat (darab/bahagi dengan 10 bukan 100).", en: "The student shifts the decimal point only 1 place instead of 2 (multiplying/dividing by 10 instead of 100)." } },
      { mistakeType: "confused_direction", description: { ms: "Murid keliru arah penukaran — anjak ke kanan apabila patut ke kiri (atau sebaliknya).", en: "The student confuses the conversion direction — shifting right when they should shift left (or vice versa)." } },
      { mistakeType: "misplaced_decimal_point", description: { ms: "Murid guna faktor 100 yang betul tetapi letakkan titik perpuluhan pada kedudukan yang salah dalam jawapan akhir.", en: "The student uses the correct factor of 100 but places the decimal point in the wrong position in the final answer." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "decimal_percentage_convert", config: { maxWhole: 0 } },
      { type: "fill", difficulty: 3, generatorKey: "decimal_percentage_convert", config: { maxWhole: 1 } },
      { type: "word_problem", difficulty: 2, generatorKey: "decimal_percentage_convert", config: { maxWhole: 0, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "decimal_percentage_convert", config: { maxWhole: 1, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_percentage_convert", config: { maxWhole: 0, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "decimal_percentage_convert", config: { maxWhole: 0, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000056": {
    id: "a1000000-0000-0000-0000-000000000056",
    strand: { ms: "Peratus", en: "Percentage" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Tambah & Tolak Peratus", en: "Adding & Subtracting Percentages" },
    yearLevel: 6,
    explanation: {
      ms: "Kedai runcit Encik Faisal menaikkan harga barang 20% bulan lepas kerana kos import naik, kemudian menaikkannya lagi 15% bulan ini kerana permintaan Hari Raya. Berapakah jumlah peratus kenaikan harga barang itu sejak dua bulan lepas?\n\nPeratus boleh ditambah atau ditolak terus, sama seperti nombor bulat biasa — jawapan juga dalam peratus.",
      en: "Encik Faisal's shop raised prices 20% last month because import costs went up, then raised them another 15% this month due to Raya demand. What's the total percentage price increase over the two months?\n\nPercentages can be added or subtracted directly, just like regular whole numbers — the answer is also a percentage.",
    },
    tips: [
      { ms: "Peratus + peratus = peratus, sama seperti nombor + nombor = nombor. Buang % dahulu, kira, letak % semula!", en: "Percent + percent = percent, just like number + number = number. Drop the % first, calculate, put the % back!" },
      { ms: "JANGAN buat ini: 30% + 25% = 5%. SALAH — ini tolak, bukan tambah! Semak simbol operasi (+ atau −) dengan teliti sebelum mengira.", en: "DON'T do this: 30% + 25% = 5%. WRONG — that's subtraction, not addition! Check the operation symbol (+ or −) carefully before calculating." },
      { ms: "Untuk semak jawapan tambah dengan cepat: jawapan mesti lebih besar daripada kedua-dua nilai asal.", en: "Quick check for addition: the answer must be bigger than both original values." },
    ],
    howTo: [
      { ms: "Kenal pasti sama ada soalan itu tambah (+) atau tolak (−).", en: "Identify whether the question is addition (+) or subtraction (−)." },
      { ms: "Buang simbol % buat sementara dan layan nombor itu seperti nombor bulat biasa.", en: "Drop the % symbol temporarily and treat the numbers like whole numbers." },
      { ms: "Tambah atau tolak nombor itu mengikut operasi yang dikenal pasti.", en: "Add or subtract the numbers according to the operation identified." },
      { ms: "Letak semula simbol % pada jawapan.", en: "Put the % symbol back on the answer." },
      { ms: "Semak: untuk tambah, jawapan mesti lebih besar daripada kedua-dua nilai asal.", en: "Check: for addition, the answer must be bigger than both original values." },
    ],
    workedExample: {
      problem: { ms: "Harga naik 20%, kemudian naik lagi 15%. Berapakah jumlah kenaikan?", en: "Price rises 20%, then rises another 15%. What is the total increase?" },
      steps: [
        { ms: "Kenal pasti operasi: tambah, kerana harga naik dua kali.", en: "Identify the operation: addition, since the price rose twice." },
        { ms: "Buang %: 20 + 15", en: "Drop the %: 20 + 15" },
        { ms: "20 + 15 = 35", en: "20 + 15 = 35" },
        { ms: "Letak semula %: 35%", en: "Put the % back: 35%" },
        { ms: "Semak: 35% lebih besar daripada 20% dan 15% ✓", en: "Check: 35% is bigger than both 20% and 15% ✓" },
      ],
      answer: "35",
    },
    commonMistakes: [
      { mistakeType: "wrong_operation", description: { ms: "Murid menolak walaupun soalan meminta tambah (atau sebaliknya), kerana tidak membaca simbol operasi dengan teliti.", en: "Student subtracts when the question asks to add (or vice versa), because they didn't read the operation symbol carefully." } },
      { mistakeType: "ignored_one_value", description: { ms: "Murid hanya menulis salah satu nilai peratus sebagai jawapan akhir, terlupa menggabungkan kedua-dua nilai.", en: "Student writes only one of the two percentage values as the final answer, forgetting to combine both." } },
      { mistakeType: "place_value_error", description: { ms: "Murid tersilap baca atau tulis digit semasa mengira (contohnya 15 tertulis sebagai 51), menyebabkan jawapan tersasar jauh.", en: "Student misreads or miswrites a digit while calculating (e.g. 15 written as 51), causing the answer to be far off." } },
      { mistakeType: "special_case_error", description: { ms: "Murid keliru apabila jawapan tambah melebihi 100%, dan menganggap ini mustahil lalu menetapkan semula kepada 100% atau kurang.", en: "Student gets confused when an addition answer exceeds 100%, assumes it's impossible, and caps it at 100% or less." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "percentage_add_subtract", config: { maxPct: 40, opFixed: "add" } },
      { type: "mcq", difficulty: 2, generatorKey: "percentage_add_subtract", config: { maxPct: 60 } },
      { type: "fill", difficulty: 2, generatorKey: "percentage_add_subtract", config: { maxPct: 50 } },
      { type: "word_problem", difficulty: 2, generatorKey: "percentage_add_subtract", config: { context: "price_change", extraInfoChance: 0.3 } },
      { type: "mcq", difficulty: 3, generatorKey: "percentage_add_subtract", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "percentage_add_subtract", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "percentage_add_subtract", config: { maxPct: 40, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000057": {
    id: "a1000000-0000-0000-0000-000000000057",
    strand: { ms: "Pecahan", en: "Fractions" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Bahagi Nombor Bercampur Dengan Nombor Bulat", en: "Dividing a Mixed Number by a Whole Number" },
    yearLevel: 6,
    explanation: {
      ms: "Untuk membahagikan nombor bercampur dengan nombor bulat, TUKAR nombor bercampur kepada pecahan tak wajar dahulu, kemudian gunakan peraturan yang sama seperti membahagi pecahan biasa.\n\nContoh harian: 2 1/2 keping kek hendak dikongsi sama rata antara 5 orang kawan. Berapa bahagian setiap orang dapat?",
      en: "To divide a mixed number by a whole number, FIRST convert the mixed number to an improper fraction, then use the same rule as dividing a regular fraction.\n\nEveryday example: 2 1/2 cakes need to be shared equally among 5 friends. How much does each friend get?",
    },
    tips: [
      { ms: "Tukar nombor bercampur kepada pecahan tak wajar dahulu — jangan bahagi bahagian pecahan sahaja.", en: "Convert the mixed number to an improper fraction first — don't divide only the fraction part." },
      { ms: "Selepas tukar, gunakan peraturan biasa: (a/b) ÷ c = a/(b × c).", en: "After converting, use the regular rule: (a/b) ÷ c = a/(b × c)." },
      {
        ms: "JANGAN buat ini: 2 1/2 ÷ 5 dikira sebagai 1/(2×5) = 1/10 (hanya bahagikan bahagian pecahan, terlepas pandang nombor bulat 2). SALAH — tukar 2 1/2 kepada 5/2 dahulu, jadi jawapan yang betul ialah 5/(2×5) = 1/2.",
        en: "DON'T do this: 2 1/2 ÷ 5 calculated as 1/(2×5) = 1/10 (dividing only the fraction part, ignoring the whole number 2). WRONG — convert 2 1/2 to 5/2 first, so the correct answer is 5/(2×5) = 1/2.",
      },
    ],
    howTo: [
      { ms: "Tukar nombor bercampur kepada pecahan tak wajar: (bulat × penyebut + pengangka)/penyebut.", en: "Convert the mixed number to an improper fraction: (whole × denominator + numerator)/denominator." },
      { ms: "Darabkan penyebut dengan nombor bulat pembahagi.", en: "Multiply the denominator by the whole-number divisor." },
      { ms: "Permudahkan jawapan jika boleh.", en: "Simplify the answer if possible." },
      { ms: "Semak: adakah anda tukar kepada pecahan tak wajar SEBELUM membahagi?", en: "Check: did you convert to an improper fraction BEFORE dividing?" },
    ],
    workedExample: {
      problem: { ms: "2 1/2 ÷ 5", en: "2 1/2 ÷ 5" },
      steps: [
        { ms: "Tukar kepada pecahan tak wajar: (2×2+1)/2 = 5/2", en: "Convert to improper fraction: (2×2+1)/2 = 5/2" },
        { ms: "Darabkan penyebut: 2 × 5 = 10", en: "Multiply the denominator: 2 × 5 = 10" },
        { ms: "Jawapan: 5/10 = 1/2", en: "Answer: 5/10 = 1/2" },
      ],
      answer: "1/2",
    },
    commonMistakes: [
      { mistakeType: "ignored_whole_number_part", description: { ms: "Murid tidak tukar kepada pecahan tak wajar, hanya membahagikan bahagian pecahan sahaja.", en: "The student doesn't convert to an improper fraction, only dividing the fraction part." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid darab berbanding membahagikan.", en: "The student multiplies instead of dividing." } },
      { mistakeType: "forgot_to_simplify", description: { ms: "Murid dapat jawapan yang betul tetapi lupa permudahkan pecahan itu.", en: "The student gets the correct answer but forgets to simplify the fraction." } },
      { mistakeType: "arithmetic_error_in_conversion", description: { ms: "Murid tukar kepada pecahan tak wajar dengan salah (cth. darab atau tambah nombor yang salah).", en: "The student converts to an improper fraction incorrectly (e.g. multiplying or adding the wrong numbers)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_mixed_by_whole", config: { denominators: [2, 3, 4, 5, 6] } },
      { type: "fill", difficulty: 3, generatorKey: "fractions_divide_mixed_by_whole", config: { denominators: [2, 3, 4, 5, 6] } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_mixed_by_whole", config: { denominators: [2, 3, 4], type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_mixed_by_whole", config: { denominators: [2, 3, 4, 5, 6], errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_mixed_by_whole", config: { denominators: [2, 3, 4], reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_mixed_by_whole", config: { denominators: [2, 3, 4], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000058": {
    id: "a1000000-0000-0000-0000-000000000058",
    strand: { ms: "Koordinat", en: "Coordinates" },
    bidang: BIDANG.relationshipAlgebra,
    title: { ms: "Perkadaran Untuk Cari Nilai", en: "Proportion to Find a Value" },
    yearLevel: 5,
    explanation: {
      ms: "Apabila nisbah dua kuantiti diketahui, dan satu kuantiti diketahui nilainya, kita boleh cari nilai kuantiti yang satu lagi dengan mencari faktor skala.\n\nContoh harian: Nisbah kucing kepada anjing di sebuah kedai haiwan ialah 2:3. Jika terdapat 8 ekor kucing, berapa ekor anjing?",
      en: "When the ratio of two quantities is known, and one quantity's value is known, we can find the other quantity's value by finding the scale factor.\n\nEveryday example: The ratio of cats to dogs in a pet shop is 2:3. If there are 8 cats, how many dogs are there?",
    },
    tips: [
      { ms: "Faktor skala = kuantiti diketahui ÷ nombor nisbah yang sepadan.", en: "Scale factor = known quantity ÷ the matching ratio number." },
      { ms: "Darabkan nombor nisbah yang satu lagi dengan faktor skala yang sama.", en: "Multiply the other ratio number by that same scale factor." },
      {
        ms: "JANGAN buat ini: nisbah 2:3, terdapat 8 ekor kucing, dikira sebagai 8 + (3-2) = 9 ekor anjing. SALAH — kadaran bukan tambah beza, ia PENSKALAAN. Faktor skala ialah 8÷2=4, jadi anjing = 3×4 = 12.",
        en: "DON'T do this: ratio 2:3, 8 cats, calculated as 8 + (3-2) = 9 dogs. WRONG — proportion isn't adding the difference, it's SCALING. The scale factor is 8÷2=4, so dogs = 3×4 = 12.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti nombor nisbah yang sepadan dengan kuantiti yang diketahui.", en: "Identify which ratio number corresponds to the known quantity." },
      { ms: "Cari faktor skala: kuantiti diketahui ÷ nombor nisbah itu.", en: "Find the scale factor: known quantity ÷ that ratio number." },
      { ms: "Darabkan nombor nisbah yang satu lagi dengan faktor skala.", en: "Multiply the other ratio number by the scale factor." },
      { ms: "Semak: adakah nisbah jawapan anda kepada kuantiti yang diketahui SAMA dengan nisbah asal?", en: "Check: is the ratio of your answer to the known quantity the SAME as the original ratio?" },
    ],
    workedExample: {
      problem: { ms: "Nisbah 2:3, kucing=8 ekor. Berapa anjing?", en: "Ratio 2:3, cats=8. How many dogs?" },
      steps: [
        { ms: "Faktor skala: 8 ÷ 2 = 4", en: "Scale factor: 8 ÷ 2 = 4" },
        { ms: "Anjing: 3 × 4 = 12", en: "Dogs: 3 × 4 = 12" },
      ],
      answer: 12,
    },
    commonMistakes: [
      { mistakeType: "added_instead_of_scaled", description: { ms: "Murid menambah beza antara nombor nisbah berbanding mencari faktor skala.", en: "The student adds the difference between the ratio numbers instead of finding the scale factor." } },
      { mistakeType: "used_wrong_ratio_number", description: { ms: "Murid guna nombor nisbah yang salah sebagai faktor skala, mengabaikan kuantiti mana yang sepadan dengan yang mana.", en: "The student uses the wrong ratio number as the scale factor, mixing up which quantity corresponds to which." } },
      { mistakeType: "swapped_ratio_order", description: { ms: "Murid tertukar susunan nisbah (cth. anggap 2:3 sebagai anjing:kucing berbanding kucing:anjing).", en: "The student swaps the ratio order (e.g. treats 2:3 as dogs:cats instead of cats:dogs)." } },
      { mistakeType: "arithmetic_error_in_scaling", description: { ms: "Murid kenal pasti faktor skala dengan betul tetapi tersilap kira semasa mendarab.", en: "The student correctly identifies the scale factor but makes an arithmetic slip while multiplying." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "proportion", config: { maxScale: 6 } },
      { type: "fill", difficulty: 3, generatorKey: "proportion", config: { maxScale: 6 } },
      { type: "word_problem", difficulty: 3, generatorKey: "proportion", config: { maxScale: 5, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "proportion", config: { maxScale: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "proportion", config: { maxScale: 5, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "proportion", config: { maxScale: 5, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000059": {
    id: "a1000000-0000-0000-0000-000000000059",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Invois, Resit, dan Cukai Perkhidmatan", en: "Invoice, Receipt, and Service Tax" },
    yearLevel: 6,
    explanation: {
      ms: "Cukai perkhidmatan (SST) ialah peratus tambahan yang dikenakan atas jumlah invois. Jumlah perlu dibayar = jumlah invois + jumlah cukai.\n\nContoh harian: Sebuah invois berjumlah RM50. Cukai perkhidmatan 6% dikenakan. Berapakah jumlah perlu dibayar?",
      en: "Service tax (SST) is an extra percentage charged on top of an invoice amount. Total payable = invoice amount + tax amount.\n\nEveryday example: An invoice totals RM50. A 6% service tax is charged. What is the total amount payable?",
    },
    tips: [
      { ms: "Cari jumlah cukai dahulu (jumlah invois × peratus cukai ÷ 100), kemudian TAMBAH pada jumlah invois.", en: "Find the tax amount first (invoice amount × tax percent ÷ 100), then ADD it to the invoice amount." },
      { ms: "Jangan berhenti selepas kira cukai — itu bukan jumlah akhir.", en: "Don't stop after calculating the tax — that's not the final amount." },
      {
        ms: "JANGAN buat ini: invois RM50 dengan cukai 6%, jawab RM3 (jumlah cukai sahaja). SALAH — RM3 itu cukai TAMBAHAN, bukan jumlah perlu dibayar. Jawapan yang betul ialah RM50 + RM3 = RM53.",
        en: "DON'T do this: invoice RM50 with 6% tax, answered RM3 (the tax amount alone). WRONG — RM3 is the ADDITIONAL tax, not the total payable. The correct answer is RM50 + RM3 = RM53.",
      },
    ],
    howTo: [
      { ms: "Kira jumlah cukai: jumlah invois × peratus cukai ÷ 100.", en: "Calculate the tax amount: invoice amount × tax percent ÷ 100." },
      { ms: "Tambah jumlah cukai pada jumlah invois.", en: "Add the tax amount to the invoice amount." },
      { ms: "Semak: adakah jawapan anda LEBIH BESAR daripada jumlah invois asal?", en: "Check: is your answer LARGER than the original invoice amount?" },
    ],
    workedExample: {
      problem: { ms: "RM50 dengan cukai 6%", en: "RM50 with 6% tax" },
      steps: [
        { ms: "Jumlah cukai: 50 × 6 ÷ 100 = RM3", en: "Tax amount: 50 × 6 ÷ 100 = RM3" },
        { ms: "Jumlah perlu dibayar: 50 + 3 = RM53", en: "Total payable: 50 + 3 = RM53" },
      ],
      answer: "RM53.00",
    },
    commonMistakes: [
      { mistakeType: "gave_tax_only", description: { ms: "Murid beri jumlah cukai sahaja, bukan jumlah perlu dibayar.", en: "The student gives only the tax amount, not the total payable." } },
      { mistakeType: "subtracted_instead_of_added", description: { ms: "Murid tolak cukai daripada jumlah invois berbanding menambahnya.", en: "The student subtracts the tax from the invoice amount instead of adding it." } },
      { mistakeType: "wrong_percentage_used", description: { ms: "Murid guna kadar cukai yang salah atau salah letak titik perpuluhan semasa kira peratus.", en: "The student uses the wrong tax rate or misplaces the decimal point when calculating the percentage." } },
      { mistakeType: "arithmetic_error_in_addition", description: { ms: "Murid kira jumlah cukai dengan betul tetapi tersilap kira semasa menambah.", en: "The student calculates the tax amount correctly but makes an arithmetic slip while adding." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "service_tax", config: { maxRM: 200 } },
      { type: "fill", difficulty: 3, generatorKey: "service_tax", config: { maxRM: 200 } },
      { type: "word_problem", difficulty: 3, generatorKey: "service_tax", config: { maxRM: 150 } },
      { type: "mcq", difficulty: 3, generatorKey: "service_tax", config: { maxRM: 200, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "service_tax", config: { maxRM: 150, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "service_tax", config: { maxRM: 150, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000060": {
    id: "a1000000-0000-0000-0000-000000000060",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Faedah dan Dividen", en: "Interest and Dividend" },
    yearLevel: 6,
    explanation: {
      ms: "Encik Hakim membeli 200 unit saham dalam Syarikat Maju Jaya. Pada hujung tahun, syarikat itu mengisytiharkan dividen RM0.15 bagi setiap saham sebagai bahagian keuntungan kepada pemegang saham. Berapakah jumlah dividen yang Encik Hakim terima?\n\nDividen ialah bahagian keuntungan syarikat yang dibayar kepada pemegang saham, biasanya dalam sen bagi setiap saham. Jumlah dividen = bilangan saham × dividen bagi setiap saham.",
      en: "Encik Hakim buys 200 shares in Syarikat Maju Jaya. At year-end, the company declares a dividend of RM0.15 per share as a portion of profit paid to shareholders. What is Encik Hakim's total dividend?\n\nA dividend is a share of a company's profit paid to shareholders, usually in sen per share. Total dividend = number of shares × dividend per share.",
    },
    tips: [
      { ms: "Bilangan saham didarab dengan dividen — banyak saham, banyak kali ganda dividen!", en: "Number of shares multiplied by the dividend — more shares, more times the dividend!" },
      { ms: "JANGAN buat ini: 200 saham + RM0.15 = RM200.15. SALAH — ini darab, bukan tambah! Setiap saham memberi dividen yang sama, jadi ia berulang (darab), bukan sekali sahaja (tambah).", en: "DON'T do this: 200 shares + RM0.15 = RM200.15. WRONG — this is multiplication, not addition! Every share earns the same dividend, so it repeats (multiply), not a one-time add." },
      { ms: "Semak unit: dividen bagi setiap saham biasanya dalam sen (RM0.05-RM0.25) — jika jawapan akhir kelihatan beribu-ribu ringgit untuk beberapa ratus saham, semak semula pengiraan.", en: "Check the unit: dividend per share is usually in sen (RM0.05-RM0.25) — if the final answer looks like thousands of ringgit for a few hundred shares, recheck the calculation." },
    ],
    howTo: [
      { ms: "Kenal pasti bilangan saham dan dividen bagi setiap saham.", en: "Identify the number of shares and the dividend per share." },
      { ms: "Pastikan kedua-dua nilai dalam unit yang sama (RM atau sen).", en: "Make sure both values are in the same unit (RM or sen)." },
      { ms: "Darabkan bilangan saham dengan dividen bagi setiap saham.", en: "Multiply the number of shares by the dividend per share." },
      { ms: "Tulis jawapan dalam format RM dengan dua tempat perpuluhan.", en: "Write the answer in RM format with two decimal places." },
      { ms: "Semak: bahagikan jumlah dividen dengan bilangan saham — jawapan mesti sama dengan dividen bagi setiap saham asal.", en: "Check: divide the total dividend by the number of shares — it should match the original dividend per share." },
    ],
    workedExample: {
      problem: { ms: "200 saham × RM0.15 setiap saham", en: "200 shares × RM0.15 per share" },
      steps: [
        { ms: "Kenal pasti: 200 saham, RM0.15 setiap saham.", en: "Identify: 200 shares, RM0.15 per share." },
        { ms: "200 × 0.15 = 30", en: "200 × 0.15 = 30" },
        { ms: "Jawapan: RM30.00", en: "Answer: RM30.00" },
        { ms: "Semak: RM30.00 ÷ 200 saham = RM0.15 setiap saham ✓", en: "Check: RM30.00 ÷ 200 shares = RM0.15 per share ✓" },
      ],
      answer: "RM30.00",
    },
    commonMistakes: [
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah bilangan saham dengan dividen bagi setiap saham, bukan mendarab, kerana menganggap ia seperti dua nilai berasingan yang perlu digabungkan.", en: "Student adds the number of shares to the dividend per share instead of multiplying, treating them as two separate values to combine rather than a repeated amount." } },
      { mistakeType: "unit_confusion", description: { ms: "Murid mengira dividen sen sebagai RM (contohnya 15 sen dikira sebagai RM15), menyebabkan jawapan 100 kali lebih besar daripada sepatutnya.", en: "Student treats the sen value as if it were RM (e.g. 15 sen calculated as RM15), making the answer 100 times too large." } },
      { mistakeType: "place_value_error", description: { ms: "Murid tersilap letak titik perpuluhan semasa menulis jawapan akhir (contohnya RM30.00 ditulis sebagai RM3.00 atau RM300.00).", en: "Student misplaces the decimal point when writing the final answer (e.g. RM30.00 written as RM3.00 or RM300.00)." } },
      { mistakeType: "special_case_error", description: { ms: "Murid keliru apabila bilangan saham bukan gandaan bulat yang mudah (contohnya 175 saham), dan cuba membundarkannya sebelum mendarab.", en: "Student gets confused when the number of shares isn't a simple round number (e.g. 175 shares), and tries to round it before multiplying." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "dividend", config: { maxShares: 200 } },
      { type: "mcq", difficulty: 3, generatorKey: "dividend", config: { maxShares: 500 } },
      { type: "fill", difficulty: 3, generatorKey: "dividend", config: { maxShares: 300 } },
      { type: "word_problem", difficulty: 3, generatorKey: "dividend", config: { maxShares: 300, extraInfoChance: 0.3 } },
      { type: "mcq", difficulty: 3, generatorKey: "dividend", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "dividend", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "dividend", config: { maxShares: 300, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000061": {
    id: "a1000000-0000-0000-0000-000000000061",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Aset dan Liabiliti", en: "Asset and Liability" },
    yearLevel: 6,
    explanation: {
      ms: "Encik Vijay menyenaraikan hartanya untuk rekod kewangan keluarga: sebuah rumah yang telah dijelaskan sepenuhnya, wang simpanan di bank, dan baki pinjaman kereta yang belum dijelaskan. Yang manakah aset dan yang manakah liabiliti?\n\nAset ialah sesuatu yang anda MILIKI dan bernilai (cth. rumah, wang simpanan). Liabiliti ialah sesuatu yang anda TERHUTANG (cth. pinjaman, hutang). Rumah dan wang simpanan menambah kekayaan Encik Vijay, jadi kedua-duanya aset; baki pinjaman kereta perlu dibayar balik, jadi ia liabiliti.",
      en: "Encik Vijay lists his property for a family financial record: a house fully paid off, savings in the bank, and an unpaid balance on a car loan. Which are assets and which are liabilities?\n\nAn asset is something you OWN that has value (e.g. a house, savings). A liability is something you OWE (e.g. a loan, debt). The house and savings add to Encik Vijay's wealth, so both are assets; the unpaid car loan balance must be paid back, so it's a liability.",
    },
    tips: [
      { ms: "Aset = MILIK, Liabiliti = HUTANG — ingat 'M' untuk Milik, 'H' untuk Hutang!", en: "Asset = OWN, Liability = OWE — remember 'O' for Own, 'O' for Owe, so ask which one it is!" },
      { ms: "JANGAN buat ini: menganggap kereta itu liabiliti kerana kosnya mahal. SALAH — kos penyelenggaraan tidak menjadikan sesuatu itu liabiliti. Kereta yang dimiliki (walaupun mahal diselenggara) tetap ASET; hanya baki PINJAMAN yang belum dijelaskan itu liabiliti.", en: "DON'T do this: assuming a car is a liability because it's expensive to maintain. WRONG — maintenance cost doesn't make something a liability. An owned car (even an expensive one to maintain) is still an ASSET; only an unpaid LOAN balance on it is a liability." },
      { ms: "Petua pantas: tanya 'adakah ini menambah nilai kekayaan saya, atau adakah saya perlu membayarnya balik?' Tambah = aset. Bayar balik = liabiliti.", en: "Quick trick: ask 'does this add to my wealth, or do I need to pay it back?' Adds = asset. Pay back = liability." },
    ],
    howTo: [
      { ms: "Kenal pasti item yang perlu dikelaskan.", en: "Identify the item that needs to be classified." },
      { ms: "Baca perihalan item itu dengan teliti — perhatikan perkataan seperti 'belum dijelaskan' atau 'terhutang'.", en: "Read the item description carefully — watch for words like 'unpaid' or 'owed'." },
      { ms: "Tanya: adakah saya MILIKI ini (menambah kekayaan), atau adakah saya TERHUTANG ini (perlu bayar balik)?", en: "Ask: do I OWN this (adds to wealth), or do I OWE this (must be paid back)?" },
      { ms: "Kelaskan sebagai Aset (milik) atau Liabiliti (hutang).", en: "Classify it as Asset (own) or Liability (owe)." },
      { ms: "Semak: kos penyelenggaraan atau nilai tinggi TIDAK menukar sesuatu daripada aset kepada liabiliti — hanya hutang yang belum dijelaskan yang menjadikannya liabiliti.", en: "Check: maintenance cost or high value does NOT turn an asset into a liability — only an unpaid debt does." },
    ],
    workedExample: {
      problem: { ms: "Hutang kad kredit — aset atau liabiliti?", en: "Credit card debt — asset or liability?" },
      steps: [
        { ms: "Baca perihalan: hutang kad kredit ialah wang yang telah dibelanjakan tetapi belum dibayar balik.", en: "Read the description: credit card debt is money already spent but not yet paid back." },
        { ms: "Tanya: adakah ini milik saya, atau adakah saya terhutang?", en: "Ask: is this something I own, or something I owe?" },
        { ms: "Ini wang yang perlu dibayar balik — jadi saya TERHUTANG.", en: "This is money that needs to be paid back — so I OWE it." },
        { ms: "Jawapan: Liabiliti", en: "Answer: Liability" },
        { ms: "Semak: hutang kad kredit tidak menambah kekayaan, ia menguranginya — konsisten dengan liabiliti ✓", en: "Check: credit card debt doesn't add to wealth, it reduces it — consistent with being a liability ✓" },
      ],
      answer: "liability",
    },
    commonMistakes: [
      { mistakeType: "wrong_operation", description: { ms: "Semasa mengira bilangan aset/liabiliti dalam satu senarai, murid menambah jumlah keseluruhan dan bilangan aset untuk cari liabiliti, bukan menolak.", en: "When counting assets/liabilities in a list, student adds the total and the asset count to find liabilities, instead of subtracting." } },
      { mistakeType: "special_case_error", description: { ms: "Murid mengelaskan item bernilai tinggi (seperti kereta atau rumah) sebagai liabiliti semata-mata kerana ia mahal, tanpa mengambil kira sama ada terdapat hutang berkaitan.", en: "Student classifies a high-value item (like a car or house) as a liability purely because it's expensive, without checking whether there's actually a related debt." } },
      { mistakeType: "keyword_only_classification", description: { ms: "Murid mengelaskan item berdasarkan nama sahaja (contohnya 'kereta' = aset) tanpa membaca keseluruhan perihalan, lalu terlepas maklumat penting seperti 'belum dijelaskan'.", en: "Student classifies an item by name alone (e.g. 'car' = asset) without reading the full description, missing key information like 'unpaid'." } },
      { mistakeType: "value_vs_debt_confusion", description: { ms: "Murid mengelaskan kos penyelenggaraan atau bil berkaitan (seperti insurans kereta) sebagai sifat item itu sendiri, bukan sebagai liabiliti berasingan.", en: "Student treats a related cost or bill (like car insurance) as a property of the item itself, rather than as its own separate liability." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "asset_liability", config: { pool: "asset" } },
      { type: "mcq", difficulty: 2, generatorKey: "asset_liability", config: { pool: "liability" } },
      { type: "mcq", difficulty: 2, generatorKey: "asset_liability", config: {} },
      { type: "word_problem", difficulty: 3, generatorKey: "asset_liability", config: { type: "word_problem", listSize: 4, extraInfoChance: 0.3 } },
      { type: "mcq", difficulty: 3, generatorKey: "asset_liability", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "asset_liability", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "asset_liability", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000062": {
    id: "a1000000-0000-0000-0000-000000000062",
    strand: { ms: "Pecahan", en: "Fractions" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Bahagi Pecahan Dengan Pecahan", en: "Dividing a Fraction by a Fraction" },
    yearLevel: 6,
    explanation: {
      ms: "Untuk membahagikan pecahan dengan pecahan, TERBALIKKAN pecahan kedua, kemudian DARAB. Ini dipanggil \"terbalik dan darab\".\n\nContoh harian: Ada 3/4 liter jus. Jika setiap gelas memerlukan 1/8 liter, berapa gelas boleh diisi?",
      en: "To divide a fraction by a fraction, FLIP the second fraction, then MULTIPLY. This is called \"flip and multiply\".\n\nEveryday example: There is 3/4 litre of juice. If each glass needs 1/8 litre, how many glasses can be filled?",
    },
    tips: [
      { ms: "Peraturan: (a/b) ÷ (c/d) = (a/b) × (d/c).", en: "The rule: (a/b) ÷ (c/d) = (a/b) × (d/c)." },
      { ms: "Selepas terbalik, darabkan pengangka dengan pengangka, dan penyebut dengan penyebut.", en: "After flipping, multiply numerator by numerator, and denominator by denominator." },
      {
        ms: "JANGAN buat ini: 3/4 ÷ 1/8 dikira sebagai 3/4 × 1/8 = 3/32 (darab terus tanpa terbalikkan pecahan kedua). SALAH — anda MESTI terbalikkan 1/8 kepada 8/1 dahulu. Jawapan yang betul ialah 3/4 × 8/1 = 6.",
        en: "DON'T do this: 3/4 ÷ 1/8 calculated as 3/4 × 1/8 = 3/32 (multiplying straight across without flipping the second fraction). WRONG — you MUST flip 1/8 to 8/1 first. The correct answer is 3/4 × 8/1 = 6.",
      },
    ],
    howTo: [
      { ms: "Terbalikkan pecahan kedua (tukar pengangka dan penyebut).", en: "Flip the second fraction (swap numerator and denominator)." },
      { ms: "Tukar tanda bahagi kepada darab.", en: "Change the division sign to multiplication." },
      { ms: "Darabkan kedua-dua pecahan, kemudian permudahkan.", en: "Multiply the two fractions, then simplify." },
      { ms: "Semak: adakah anda terbalikkan pecahan KEDUA sahaja, bukan yang pertama?", en: "Check: did you flip only the SECOND fraction, not the first?" },
    ],
    workedExample: {
      problem: { ms: "3/4 ÷ 1/8", en: "3/4 ÷ 1/8" },
      steps: [
        { ms: "Terbalikkan pecahan kedua: 1/8 → 8/1", en: "Flip the second fraction: 1/8 → 8/1" },
        { ms: "Darab: 3/4 × 8/1 = 24/4", en: "Multiply: 3/4 × 8/1 = 24/4" },
        { ms: "Permudahkan: 24/4 = 6", en: "Simplify: 24/4 = 6" },
      ],
      answer: "6/1",
    },
    commonMistakes: [
      { mistakeType: "forgot_to_flip", description: { ms: "Murid darab terus tanpa terbalikkan pecahan kedua.", en: "The student multiplies straight across without flipping the second fraction." } },
      { mistakeType: "flipped_wrong_fraction", description: { ms: "Murid terbalikkan pecahan PERTAMA berbanding yang kedua.", en: "The student flips the FIRST fraction instead of the second one." } },
      { mistakeType: "forgot_to_simplify", description: { ms: "Murid dapat jawapan yang betul tetapi lupa permudahkan pecahan itu.", en: "The student gets the correct answer but forgets to simplify the fraction." } },
      { mistakeType: "arithmetic_error_in_multiplication", description: { ms: "Murid terbalikkan dengan betul tetapi tersilap kira semasa mendarab.", en: "The student flips correctly but makes an arithmetic slip while multiplying." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_by_fraction", config: { denominators: [2, 3, 4, 5, 6] } },
      { type: "fill", difficulty: 3, generatorKey: "fractions_divide_by_fraction", config: { denominators: [2, 3, 4, 5, 6] } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_by_fraction", config: { denominators: [2, 3, 4], type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_by_fraction", config: { denominators: [2, 3, 4, 5, 6], errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_by_fraction", config: { denominators: [2, 3, 4], reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_by_fraction", config: { denominators: [2, 3, 4], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000063": {
    id: "a1000000-0000-0000-0000-000000000063",
    strand: { ms: "Pecahan", en: "Fractions" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Bahagi Nombor Bercampur Dengan Pecahan", en: "Dividing a Mixed Number by a Fraction" },
    yearLevel: 6,
    explanation: {
      ms: "Untuk membahagikan nombor bercampur dengan pecahan, TUKAR nombor bercampur kepada pecahan tak wajar dahulu, kemudian \"terbalik dan darab\" seperti biasa.\n\nContoh harian: 1 1/2 bekas air hendak dituang ke dalam botol bersaiz 1/4 bekas. Berapa botol diperlukan?",
      en: "To divide a mixed number by a fraction, FIRST convert the mixed number to an improper fraction, then \"flip and multiply\" as usual.\n\nEveryday example: 1 1/2 containers of water need to be poured into bottles that hold 1/4 container each. How many bottles are needed?",
    },
    tips: [
      { ms: "Tukar nombor bercampur kepada pecahan tak wajar dahulu — ini langkah yang paling mudah terlepas pandang.", en: "Convert the mixed number to an improper fraction first — this is the step most often skipped." },
      { ms: "Selepas tukar, gunakan peraturan biasa: terbalik dan darab.", en: "After converting, use the usual rule: flip and multiply." },
      {
        ms: "JANGAN buat ini: 1 1/2 ÷ 1/4 dikira dengan terbalik dan darab bahagian pecahan sahaja (1/2 × 4/1 = 2), lupa nombor bulat 1. SALAH — tukar 1 1/2 kepada 3/2 dahulu. Jawapan yang betul ialah 3/2 × 4/1 = 6.",
        en: "DON'T do this: 1 1/2 ÷ 1/4 calculated by flipping and multiplying only the fraction part (1/2 × 4/1 = 2), forgetting the whole number 1. WRONG — convert 1 1/2 to 3/2 first. The correct answer is 3/2 × 4/1 = 6.",
      },
    ],
    howTo: [
      { ms: "Tukar nombor bercampur kepada pecahan tak wajar.", en: "Convert the mixed number to an improper fraction." },
      { ms: "Terbalikkan pecahan kedua dan tukar bahagi kepada darab.", en: "Flip the second fraction and change division to multiplication." },
      { ms: "Darabkan dan permudahkan.", en: "Multiply and simplify." },
      { ms: "Semak: adakah anda tukar kepada pecahan tak wajar SEBELUM terbalik dan darab?", en: "Check: did you convert to an improper fraction BEFORE flipping and multiplying?" },
    ],
    workedExample: {
      problem: { ms: "1 1/2 ÷ 1/4", en: "1 1/2 ÷ 1/4" },
      steps: [
        { ms: "Tukar kepada pecahan tak wajar: 1 1/2 = 3/2", en: "Convert to improper fraction: 1 1/2 = 3/2" },
        { ms: "Terbalik dan darab: 3/2 × 4/1 = 12/2", en: "Flip and multiply: 3/2 × 4/1 = 12/2" },
        { ms: "Permudahkan: 12/2 = 6", en: "Simplify: 12/2 = 6" },
      ],
      answer: "6/1",
    },
    commonMistakes: [
      { mistakeType: "fraction_calculation_error", description: { ms: "Murid tidak tukar kepada pecahan tak wajar sebelum terbalik dan darab.", en: "The student doesn't convert to an improper fraction before flipping and multiplying." } },
      { mistakeType: "forgot_to_flip", description: { ms: "Murid tukar kepada pecahan tak wajar dengan betul tetapi lupa terbalikkan pecahan kedua.", en: "The student correctly converts to an improper fraction but forgets to flip the second fraction." } },
      { mistakeType: "forgot_to_simplify", description: { ms: "Murid dapat jawapan yang betul tetapi lupa permudahkan pecahan itu.", en: "The student gets the correct answer but forgets to simplify the fraction." } },
      { mistakeType: "arithmetic_error_in_conversion", description: { ms: "Murid tukar kepada pecahan tak wajar dengan salah (cth. darab atau tambah nombor yang salah).", en: "The student converts to an improper fraction incorrectly (e.g. multiplying or adding the wrong numbers)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_mixed_by_fraction", config: { denominators: [2, 3, 4, 5, 6] } },
      { type: "fill", difficulty: 3, generatorKey: "fractions_divide_mixed_by_fraction", config: { denominators: [2, 3, 4, 5, 6] } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_mixed_by_fraction", config: { denominators: [2, 3, 4], type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_mixed_by_fraction", config: { denominators: [2, 3, 4, 5, 6], errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_mixed_by_fraction", config: { denominators: [2, 3, 4], reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_mixed_by_fraction", config: { denominators: [2, 3, 4], challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000064": {
    id: "a1000000-0000-0000-0000-000000000064",
    strand: { ms: "Masa dan Waktu", en: "Time" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Tambah & Tolak Masa (Unit Lebih Besar)", en: "Adding & Subtracting Time (Bigger Units)" },
    yearLevel: 5,
    explanation: {
      ms: "Sama seperti tambah/tolak jam dan minit, tetapi kini menggunakan unit lebih besar seperti tahun/bulan atau dekad/tahun. Regroup apabila unit kecil mencapai had faktor penukaran (cth. 12 bulan = 1 tahun).\n\nContoh harian: Sebuah bangunan berumur 2 tahun 8 bulan. 1 tahun 5 bulan kemudian, berapa umurnya?",
      en: "Same as adding/subtracting hours and minutes, but now using bigger units like years/months or decades/years. Regroup when the smaller unit reaches its conversion limit (e.g. 12 months = 1 year).\n\nEveryday example: A building is 2 years 8 months old. 1 year 5 months later, how old is it?",
    },
    tips: [
      { ms: "Kenal pasti faktor penukaran untuk pasangan unit itu dahulu (cth. 12 bulan=1 tahun, 10 tahun=1 dekad).", en: "Identify the conversion factor for that unit pair first (e.g. 12 months=1 year, 10 years=1 decade)." },
      { ms: "Tambah/tolak unit kecil dahulu, kemudian regroup jika perlu.", en: "Add/subtract the smaller unit first, then regroup if needed." },
      {
        ms: "JANGAN buat ini: 2 tahun 8 bulan + 1 tahun 5 bulan dijawab sebagai 3 tahun 13 bulan. SALAH — bulan tidak boleh melebihi 11! 13 bulan MESTI ditukar kepada 1 tahun 1 bulan dahulu, jadi jawapan sebenar ialah 4 tahun 1 bulan.",
        en: "DON'T do this: 2 years 8 months + 1 year 5 months answered as 3 years 13 months. WRONG — months can't exceed 11! 13 months MUST be converted into 1 year 1 month first, so the real answer is 4 years 1 month.",
      },
    ],
    howTo: [
      { ms: "Tambah atau tolak unit kecil dahulu.", en: "Add or subtract the smaller unit first." },
      { ms: "Jika unit kecil mencapai atau melebihi faktor penukaran, regroup ke unit besar.", en: "If the smaller unit reaches or exceeds the conversion factor, regroup into the larger unit." },
      { ms: "Tambah atau tolak unit besar.", en: "Add or subtract the larger unit." },
      { ms: "Semak: adakah bahagian unit kecil dalam jawapan anda kurang daripada faktor penukaran?", en: "Check: is the smaller-unit part of your answer less than the conversion factor?" },
    ],
    workedExample: {
      problem: { ms: "2 tahun 8 bulan + 1 tahun 5 bulan", en: "2 years 8 months + 1 year 5 months" },
      steps: [
        { ms: "Tambah bulan: 8 + 5 = 13 bulan", en: "Add the months: 8 + 5 = 13 months" },
        { ms: "13 bulan = 1 tahun 1 bulan", en: "13 months = 1 year 1 month" },
        { ms: "Tambah tahun: 2 + 1 + 1 = 4 tahun", en: "Add the years: 2 + 1 + 1 = 4 years" },
        { ms: "Jawapan: 4 tahun 1 bulan", en: "Answer: 4 years 1 month" },
      ],
      answer: "4yr 1mth",
    },
    commonMistakes: [
      { mistakeType: "time_carry_error", description: { ms: "Murid tidak regroup apabila unit kecil melebihi faktor penukaran.", en: "The student doesn't regroup when the smaller unit exceeds the conversion factor." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah berbanding menolak (atau sebaliknya) apabila menyelesaikan masalah.", en: "The student adds instead of subtracting (or vice versa) when solving the problem." } },
      { mistakeType: "borrow_error", description: { ms: "Semasa menolak, murid tidak pinjam daripada unit besar apabila unit kecil yang ditolak lebih besar.", en: "When subtracting, the student doesn't borrow from the larger unit when the smaller unit being subtracted is larger." } },
      { mistakeType: "wrong_conversion_factor", description: { ms: "Murid guna faktor penukaran yang salah untuk pasangan unit itu (cth. anggap 10 bulan=1 tahun).", en: "The student uses the wrong conversion factor for that unit pair (e.g. assumes 10 months=1 year)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "time_unit_add_subtract", config: { pairs: [{ big: "yr", small: "mth", factor: 12 }], maxBig: 6 } },
      { type: "fill", difficulty: 3, generatorKey: "time_unit_add_subtract", config: { pairs: [{ big: "yr", small: "mth", factor: 12 }], maxBig: 6 } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_unit_add_subtract", config: { pairs: [{ big: "dec", small: "yr", factor: 10 }], maxBig: 5, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "time_unit_add_subtract", config: { pairs: [{ big: "yr", small: "mth", factor: 12 }], maxBig: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_unit_add_subtract", config: { pairs: [{ big: "dec", small: "yr", factor: 10 }], maxBig: 5, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_unit_add_subtract", config: { pairs: [{ big: "yr", small: "mth", factor: 12 }], maxBig: 5, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000065": {
    id: "a1000000-0000-0000-0000-000000000065",
    strand: { ms: "Koordinat", en: "Coordinates" },
    bidang: BIDANG.relationshipAlgebra,
    title: { ms: "Jarak Antara Dua Koordinat", en: "Distance Between Two Coordinates" },
    yearLevel: 6,
    explanation: {
      ms: "Jarak antara dua titik pada grid koordinat boleh dikira dalam DUA langkah: (1) cari jarak grid (beza antara nilai koordinat yang berbeza), dan (2) jika diberi skala (contohnya \"1 unit mewakili 150 m\"), darabkan jarak grid itu dengan skala untuk dapatkan JARAK SEBENAR di dunia sebenar.\n\nContoh harian: Pada peta sebuah taman (skala 1 unit = 150 m), gerai makanan berada 3 unit dari pintu masuk. Jarak sebenar dari pintu masuk ke gerai makanan ialah 3 \u00d7 150 m = 450 m.",
      en: "The distance between two points on a coordinate grid can be found in TWO steps: (1) find the grid distance (the difference between the coordinate values that differ), and (2) if a scale is given (e.g. \"1 unit represents 150 m\"), multiply that grid distance by the scale to get the REAL distance in the real world.\n\nEveryday example: On a park map (scale 1 unit = 150 m), a food stall is 3 units from the entrance. The real distance from the entrance to the food stall is 3 \u00d7 150 m = 450 m.",
    },
    tips: [
      { ms: "Cari nilai koordinat yang SAMA \u2014 itu petunjuk sama ada jarak itu mendatar atau menegak.", en: "Find the coordinate value that's the SAME \u2014 that tells you whether the distance is horizontal or vertical." },
      { ms: "Jarak grid = beza (tolak) antara nilai koordinat yang BERBEZA. Jarak SEBENAR = jarak grid \u00d7 skala.", en: "Grid distance = the difference (subtraction) between the coordinate values that DIFFER. REAL distance = grid distance \u00d7 scale." },
      {
        ms: "JANGAN buat ini: skala 1 unit = 150 m diberi, tetapi jarak grid (contoh 3 unit) terus dijadikan jawapan akhir tanpa darab dengan skala. SALAH \u2014 anda MESTI darab jarak grid dengan skala untuk dapat jarak sebenar. Jawapan yang betul ialah 3 \u00d7 150 m = 450 m, bukan 3.",
        en: "DON'T do this: a scale of 1 unit = 150 m is given, but the grid distance (e.g. 3 units) is used directly as the final answer without multiplying by the scale. WRONG \u2014 you MUST multiply the grid distance by the scale to get the real distance. The correct answer is 3 \u00d7 150 m = 450 m, not 3.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti sama ada nilai-x atau nilai-y adalah sama untuk kedua-dua titik.", en: "Identify whether the x-values or y-values are the same for both points." },
      { ms: "Tolak nilai koordinat yang berbeza untuk dapatkan jarak grid.", en: "Subtract the differing coordinate values to get the grid distance." },
      { ms: "Jika diberi skala (contoh \"1 unit mewakili 150 m\"), darabkan jarak grid dengan skala itu untuk dapat jarak sebenar.", en: "If a scale is given (e.g. \"1 unit represents 150 m\"), multiply the grid distance by that scale to get the real distance." },
      { ms: "Jika soalan minta jawapan dalam km tetapi skala dalam m, tukar unit (bahagikan dengan 1000) sebelum menjawab.", en: "If the question asks for the answer in km but the scale is in m, convert the unit (divide by 1000) before answering." },
      { ms: "Semak: adakah jawapan anda beza (tolak), bukan jumlah (tambah)? Dan adakah anda sudah darab dengan skala jika diberi?", en: "Check: is your answer a difference (subtraction), not a sum (addition)? And did you multiply by the scale if one was given?" },
    ],
    workedExample: {
      problem: { ms: "A(2, 3) dan B(2, 9). Skala: 1 unit mewakili 150 m. Cari jarak sebenar antara A dan B, dalam m.", en: "A(2, 3) and B(2, 9). Scale: 1 unit represents 150 m. Find the real distance between A and B, in m." },
      steps: [
        { ms: "Nilai-x sama (2), jadi bandingkan nilai-y", en: "The x-value is the same (2), so compare the y-values" },
        { ms: "Jarak grid = 9 \u2212 3 = 6 unit", en: "Grid distance = 9 \u2212 3 = 6 units" },
        { ms: "Jarak sebenar = 6 \u00d7 150 m = 900 m", en: "Real distance = 6 \u00d7 150 m = 900 m" },
      ],
      answer: "900 m",
    },
    commonMistakes: [
      { mistakeType: "forgot_to_apply_scale", description: { ms: "Murid berikan jarak grid (dalam unit) sebagai jawapan akhir, terlupa darab dengan skala untuk dapat jarak sebenar.", en: "The student gives the grid distance (in units) as the final answer, forgetting to multiply by the scale to get the real distance." } },
      { mistakeType: "added_instead_of_subtracted", description: { ms: "Murid menambah dua nilai koordinat berbanding mencari beza.", en: "The student adds the two coordinate values instead of finding the difference." } },
      { mistakeType: "wrong_axis_confusion", description: { ms: "Murid keliru sama ada jarak itu mendatar (nilai-y sama) atau menegak (nilai-x sama).", en: "The student confuses whether the distance is horizontal (same y-value) or vertical (same x-value)." } },
      { mistakeType: "calculation_error", description: { ms: "Murid darab dengan skala yang betul tetapi terlupa tukar unit (contohnya m kepada km) yang diminta oleh soalan.", en: "The student multiplies by the correct scale but forgets to convert to the unit (e.g. m to km) the question asked for." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "coordinate_distance", config: { maxCoord: 12 } },
      { type: "fill", difficulty: 2, generatorKey: "coordinate_distance", config: { maxCoord: 12 } },
      { type: "mcq", difficulty: 3, generatorKey: "coordinate_distance", config: { maxCoord: 12, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "coordinate_distance", config: { maxCoord: 10, scaled: true, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "coordinate_distance", config: { maxCoord: 10, scaled: true, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "coordinate_distance", config: { maxCoord: 12, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "coordinate_distance", config: { maxCoord: 10, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000066": {
    id: "a1000000-0000-0000-0000-000000000066",
    strand: { ms: "Statistik", en: "Statistics" },
    bidang: BIDANG.statisticsProbability,
    title: { ms: "Mod, Julat, Median, dan Min", en: "Mode, Range, Median, and Mean" },
    yearLevel: 5,
    explanation: {
      ms: "Terdapat empat cara untuk menggambarkan set data: MOD (nilai paling kerap), JULAT (beza antara maksimum dan minimum), MEDIAN (nilai tengah apabila disusun), dan MIN (jumlah dibahagi bilangan data — sama seperti purata).\n\nContoh harian: Markah ujian 5 murid ialah 12, 15, 12, 18, 20. Apakah mod markah itu?",
      en: "There are four ways to describe a data set: MODE (the most frequent value), RANGE (the difference between the maximum and minimum), MEDIAN (the middle value when sorted), and MEAN (the sum divided by the count — same as average).\n\nEveryday example: 5 students' test scores are 12, 15, 12, 18, 20. What is the mode of these scores?",
    },
    tips: [
      { ms: "Mod = nilai yang MUNCUL PALING KERAP.", en: "Mode = the value that APPEARS MOST OFTEN." },
      { ms: "Julat = nilai TERBESAR tolak nilai TERKECIL.", en: "Range = the LARGEST value minus the SMALLEST value." },
      { ms: "Median: susun data mengikut turutan dahulu, kemudian cari nilai TENGAH.", en: "Median: sort the data in order first, then find the MIDDLE value." },
      { ms: "Min: tambah SEMUA nilai, kemudian bahagikan dengan BILANGAN nilai.", en: "Mean: add ALL the values, then divide by the NUMBER of values." },
      {
        ms: "Cabaran: jika satu nilai BAHARU ditambah, ia mungkin menjadi nilai MAKSIMUM atau MINIMUM baharu — jangan guna julat lama, kira semula.",
        en: "Challenge: if a NEW value is added, it might become the new MAXIMUM or MINIMUM — don't use the old range, recalculate it.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti yang mana satu diminta: mod, julat, median, atau min.", en: "Identify which one is being asked for: mode, range, median, or mean." },
      { ms: "Susun data mengikut turutan jika perlu (untuk median atau julat).", en: "Sort the data in order if needed (for median or range)." },
      { ms: "Kira ikut definisi yang betul untuk statistik itu.", en: "Calculate using the correct definition for that statistic." },
      { ms: "Semak: adakah jawapan anda sepadan dengan statistik yang DITANYA, bukan yang lain? Jika satu nilai baharu ditambah, semak sama ada ia mengubah maksimum atau minimum sebelum kira semula.", en: "Check: does your answer match the statistic that was ASKED for, not a different one? If a new value is added, check whether it changes the maximum or minimum before recalculating." },
    ],
    workedExample: {
      problem: { ms: "12, 15, 12, 18, 20 — cari mod", en: "12, 15, 12, 18, 20 — find the mode" },
      steps: [
        { ms: "12 muncul dua kali, yang lain sekali sahaja", en: "12 appears twice, the others only once" },
        { ms: "Jawapan: Mod = 12", en: "Answer: Mode = 12" },
      ],
      answer: 12,
    },
    commonMistakes: [
      { mistakeType: "confused_statistic_type", description: { ms: "Murid keliru antara mod, julat, median, dan min.", en: "The student confuses mode, range, median, and mean." } },
      { mistakeType: "forgot_to_sort", description: { ms: "Murid cari median tanpa menyusun data mengikut turutan dahulu.", en: "The student finds the median without sorting the data in order first." } },
      { mistakeType: "arithmetic_error_in_mean", description: { ms: "Murid tambah nilai dengan betul tetapi bahagi dengan bilangan yang salah, atau tersilap kira jumlah.", en: "The student adds the values correctly but divides by the wrong count, or makes a sum error." } },
      { mistakeType: "mode_with_no_repeat", description: { ms: "Murid anggap set data itu ada mod walaupun tiada nilai yang berulang, atau salah kenal pasti nilai yang berulang.", en: "The student assumes a data set has a mode even when no value repeats, or misidentifies the repeated value." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Apabila satu nilai baharu ditambah, murid guna julat LAMA dan tidak perasan nilai baharu itu mengubah maksimum atau minimum.", en: "When a new value is added, the student uses the OLD range and doesn't notice the new value changes the maximum or minimum." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "mode_range_median_mean", config: { maxValue: 20 } },
      { type: "fill", difficulty: 3, generatorKey: "mode_range_median_mean", config: { maxValue: 30 } },
      { type: "word_problem", difficulty: 2, generatorKey: "mode_range_median_mean", config: { maxValue: 20, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "mode_range_median_mean", config: { maxValue: 20, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "mode_range_median_mean", config: { maxValue: 20, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "mode_range_median_mean", config: { maxValue: 20, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000067": {
    id: "a1000000-0000-0000-0000-000000000067",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Beli Secara Tunai atau Ansuran", en: "Purchasing Via Cash or Instalment" },
    yearLevel: 5,
    explanation: {
      ms: "Membeli secara ansuran (kredit) biasanya kos LEBIH TINGGI berbanding tunai, kerana bayaran pendahuluan ditambah bayaran bulanan biasanya melebihi harga tunai.\n\nContoh harian: Sebuah peti sejuk berharga RM800 secara tunai. Secara ansuran, bayaran pendahuluan RM80, diikuti 12 bulan pada RM65 sebulan. Berapakah lebihan bayaran secara ansuran?",
      en: "Buying on instalment (credit) usually costs MORE than paying cash, because the deposit plus monthly payments usually add up to more than the cash price.\n\nEveryday example: A fridge costs RM800 in cash. On instalment, the deposit is RM80, followed by 12 months at RM65 per month. How much extra does buying on instalment cost?",
    },
    tips: [
      { ms: "Kira jumlah keseluruhan ansuran dahulu: bayaran pendahuluan + (bayaran bulanan × bilangan bulan).", en: "Calculate the total instalment cost first: deposit + (monthly payment × number of months)." },
      { ms: "Lebihan = jumlah ansuran − harga tunai.", en: "Extra amount = instalment total − cash price." },
      {
        ms: "JANGAN buat ini: jumlah ansuran RM860 dijawab terus sebagai jawapan akhir. SALAH — soalan tanya LEBIHAN, bukan jumlah ansuran. Jawapan yang betul ialah RM860 − RM800 = RM60.",
        en: "DON'T do this: the instalment total RM860 given directly as the final answer. WRONG — the question asks for the EXTRA amount, not the instalment total. The correct answer is RM860 − RM800 = RM60.",
      },
    ],
    howTo: [
      { ms: "Kira jumlah keseluruhan secara ansuran: bayaran pendahuluan + (bayaran bulanan × bilangan bulan).", en: "Calculate the total instalment amount: deposit + (monthly payment × number of months)." },
      { ms: "Tolak harga tunai daripada jumlah ansuran itu.", en: "Subtract the cash price from that instalment total." },
      { ms: "Semak: adakah jawapan anda jauh LEBIH KECIL daripada jumlah ansuran keseluruhan?", en: "Check: is your answer much SMALLER than the full instalment total?" },
    ],
    workedExample: {
      problem: { ms: "Tunai RM800; ansuran RM80 + (RM65 × 12 bulan)", en: "Cash RM800; instalment RM80 + (RM65 × 12 months)" },
      steps: [
        { ms: "Jumlah ansuran: 80 + (65 × 12) = 80 + 780 = RM860", en: "Instalment total: 80 + (65 × 12) = 80 + 780 = RM860" },
        { ms: "Lebihan: 860 − 800 = RM60", en: "Extra: 860 − 800 = RM60" },
      ],
      answer: "RM60.00",
    },
    commonMistakes: [
      { mistakeType: "gave_credit_total_not_difference", description: { ms: "Murid beri jumlah ansuran keseluruhan, bukan lebihan berbanding tunai.", en: "The student gives the full instalment total, not the extra amount compared to cash." } },
      { mistakeType: "forgot_deposit", description: { ms: "Murid kira bayaran bulanan sahaja, terlepas pandang bayaran pendahuluan.", en: "The student calculates only the monthly payments, overlooking the deposit." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid tambah harga tunai dan jumlah ansuran berbanding cari beza (tolak).", en: "The student adds the cash price and instalment total instead of finding the difference (subtracting)." } },
      { mistakeType: "arithmetic_error_in_step", description: { ms: "Murid ikut kaedah yang betul tetapi tersilap kira semasa mendarab atau menolak.", en: "The student follows the correct method but makes an arithmetic slip while multiplying or subtracting." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "credit_vs_cash", config: { maxCashRM: 2000 } },
      { type: "fill", difficulty: 3, generatorKey: "credit_vs_cash", config: { maxCashRM: 2000 } },
      { type: "word_problem", difficulty: 3, generatorKey: "credit_vs_cash", config: { maxCashRM: 1500 } },
      { type: "mcq", difficulty: 3, generatorKey: "credit_vs_cash", config: { maxCashRM: 2000, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "credit_vs_cash", config: { maxCashRM: 1500, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "credit_vs_cash", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000068": {
    id: "a1000000-0000-0000-0000-000000000068",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Insurans dan Takaful", en: "Insurance and Takaful" },
    yearLevel: 6,
    explanation: {
      ms: "Puan Amira membandingkan dua pelan perlindungan untuk keluarganya: satu dikendalikan syarikat insurans dengan premium bulanan tetap untuk keuntungan syarikat, satu lagi berdasarkan sumbangan bersama peserta mengikut prinsip Syariah tanpa riba. Yang manakah insurans dan yang manakah takaful?\n\nInsurans dan takaful kedua-duanya melindungi anda daripada risiko kewangan, tetapi beroperasi secara berbeza. Insurans konvensional dikendalikan syarikat dengan premium tetap untuk keuntungan syarikat. Takaful berdasarkan prinsip Syariah — peserta saling membantu melalui sumbangan bersama, tanpa riba.",
      en: "Puan Amira compares two protection plans for her family: one run by an insurance company with a fixed monthly premium for company profit, the other based on mutual participant contributions under Shariah principles with no interest. Which is insurance and which is takaful?\n\nInsurance and takaful both protect you from financial risk, but operate differently. Conventional insurance is company-run with a fixed premium for the company's profit. Takaful is based on Shariah principles — participants mutually help each other through shared contributions, with no interest involved.",
    },
    tips: [
      { ms: "Kata kunci untuk Takaful: Syariah, sumbangan bersama, tiada riba, perkongsian keuntungan.", en: "Keywords for Takaful: Shariah, mutual contribution, no interest, profit-sharing." },
      { ms: "JANGAN buat ini: menganggap sesuatu itu insurans semata-mata kerana ada bayaran secara berkala. SALAH — takaful JUGA ada sumbangan berkala (tabarru'). Bayaran berkala TIDAK membezakan kedua-duanya; prinsip Syariah lawan konvensional itulah pembeza sebenar.", en: "DON'T do this: assuming something is insurance just because there's a regular payment. WRONG — takaful ALSO has regular contributions (tabarru'). A regular payment does NOT distinguish the two; Shariah vs. conventional principle is the real difference." },
      { ms: "Petua pantas: cari perkataan 'Syariah', 'mudharabah', atau 'sumbangan' untuk Takaful; cari 'premium' dan 'syarikat' untuk Insurans.", en: "Quick trick: look for 'Shariah', 'mudharabah', or 'contribution' for Takaful; look for 'premium' and 'company' for Insurance." },
    ],
    howTo: [
      { ms: "Baca perihalan pelan itu dengan teliti.", en: "Read the plan's description carefully." },
      { ms: "Cari kata kunci prinsip operasi: Syariah/sumbangan bersama, atau premium konvensional/keuntungan syarikat.", en: "Look for operating-principle keywords: Shariah/mutual contribution, or conventional premium/company profit." },
      { ms: "Abaikan sama ada terdapat bayaran berkala — kedua-dua jenis pelan ada ini.", en: "Ignore whether there's a regular payment — both plan types have this." },
      { ms: "Kelaskan sebagai Insurans (konvensional) atau Takaful (Syariah).", en: "Classify it as Insurance (conventional) or Takaful (Shariah)." },
      { ms: "Semak: adakah jawapan anda berdasarkan prinsip operasi (Syariah lawan konvensional), bukan sekadar kewujudan bayaran?", en: "Check: is your answer based on the operating principle (Shariah vs. conventional), not just the presence of a payment?" },
    ],
    workedExample: {
      problem: { ms: "Pelan berasaskan prinsip mudharabah, tiada riba", en: "A plan based on mudharabah principles, no interest" },
      steps: [
        { ms: "Baca perihalan: pelan mengagihkan lebihan dana mengikut prinsip mudharabah.", en: "Read the description: the plan distributes surplus funds under mudharabah principles." },
        { ms: "Cari kata kunci: \"mudharabah\" dan \"tiada riba\" ialah prinsip Syariah.", en: "Look for keywords: \"mudharabah\" and \"no interest\" are Shariah principles." },
        { ms: "Prinsip Syariah + sumbangan bersama = Takaful.", en: "Shariah principle + mutual contribution = Takaful." },
        { ms: "Jawapan: Takaful", en: "Answer: Takaful" },
        { ms: "Semak: tiada sebutan syarikat mengambil keuntungan tetap — konsisten dengan Takaful ✓", en: "Check: no mention of a company taking fixed profit — consistent with Takaful ✓" },
      ],
      answer: "takaful",
    },
    commonMistakes: [
      { mistakeType: "special_case_error", description: { ms: "Murid menganggap sesuatu pelan itu insurans semata-mata kerana ada bayaran berkala, tanpa sedar takaful juga menggunakan sumbangan berkala (tabarru').", en: "Student assumes a plan is insurance purely because there's a regular payment, not realising takaful also uses regular contributions (tabarru')." } },
      { mistakeType: "keyword_only_classification", description: { ms: "Murid hanya fokus pada perkataan 'pelan perlindungan' atau 'polisi' secara umum tanpa membaca prinsip operasi yang dinyatakan dalam soalan.", en: "Student focuses only on the general phrase 'protection plan' or 'policy' without reading the operating principle stated in the question." } },
      { mistakeType: "wrong_operation", description: { ms: "Semasa mengira bilangan pelan Takaful dalam satu senarai, murid menambah jumlah keseluruhan dan bilangan Takaful untuk cari bilangan Insurans, bukan menolak.", en: "When counting Takaful plans in a list, student adds the total and Takaful count to find the Insurance count, instead of subtracting." } },
      { mistakeType: "profit_sharing_confusion", description: { ms: "Murid mengelaskan pelan sebagai Insurans walaupun terdapat sebutan perkongsian keuntungan (mudharabah) kepada peserta, kerana tidak mengenali istilah itu sebagai ciri Takaful.", en: "Student classifies a plan as Insurance even when profit-sharing (mudharabah) to participants is mentioned, because they don't recognise that term as a Takaful feature." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "insurance_takaful", config: { pool: "takaful" } },
      { type: "mcq", difficulty: 2, generatorKey: "insurance_takaful", config: { pool: "insurance" } },
      { type: "mcq", difficulty: 3, generatorKey: "insurance_takaful", config: {} },
      { type: "word_problem", difficulty: 3, generatorKey: "insurance_takaful", config: { type: "word_problem", listSize: 3 } },
      { type: "mcq", difficulty: 3, generatorKey: "insurance_takaful", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "insurance_takaful", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "insurance_takaful", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000069": {
    id: "a1000000-0000-0000-0000-000000000069",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Panjang dan Jisim Bergabung", en: "Combined Length and Mass" },
    yearLevel: 6,
    explanation: {
      ms: "Tahun 6 menggabungkan lebih daripada satu jenis ukuran dalam satu soalan — cth. panjang DAN jisim dalam situasi yang sama. Selesaikan setiap bahagian secara berasingan menggunakan kaedah yang sudah dipelajari.\n\nContoh harian: Seutas tali panjangnya 3 m dan beratnya 1.2 kg. Ia dipotong kepada 4 bahagian sama. Berapakah panjang setiap bahagian?",
      en: "Year 6 combines more than one type of measurement in a single question — e.g. length AND mass in the same situation. Solve each part separately using methods already learned.\n\nEveryday example: A rope is 3 m long and weighs 1.2 kg. It is cut into 4 equal pieces. What is the length of each piece?",
    },
    tips: [
      { ms: "Baca soalan dengan teliti — kenal pasti kuantiti MANA yang sebenarnya ditanya (panjang atau berat).", en: "Read the question carefully — identify which quantity is actually being asked for (length or weight)." },
      { ms: "Selesaikan panjang dan jisim secara berasingan — jangan campurkan kedua-duanya.", en: "Solve length and mass separately — don't mix the two together." },
      {
        ms: "JANGAN buat ini: soalan tanya berat setiap bahagian, tetapi anda kira dan jawab panjang setiap bahagian. SALAH — sentiasa semak semula kuantiti yang DITANYA sebelum menulis jawapan akhir.",
        en: "DON'T do this: the question asks for the weight of each piece, but you calculate and answer with the length of each piece instead. WRONG — always double-check which quantity was ASKED before writing your final answer.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti kuantiti yang ditanya: panjang atau berat.", en: "Identify the quantity being asked for: length or weight." },
      { ms: "Bahagikan jumlah kuantiti itu (panjang ATAU berat) dengan bilangan bahagian.", en: "Divide that total quantity (length OR weight) by the number of pieces." },
      { ms: "Semak semula: adakah jawapan anda untuk kuantiti yang betul-betul ditanya?", en: "Double-check: is your answer for the quantity that was actually asked?" },
    ],
    workedExample: {
      problem: { ms: "Tali 3 m, 1.2 kg, dipotong kepada 4 bahagian. Panjang setiap bahagian?", en: "Rope 3 m, 1.2 kg, cut into 4 equal pieces. Length of each piece?" },
      steps: [
        { ms: "Fokus pada panjang sahaja: 3 m = 300 cm", en: "Focus on length only: 3 m = 300 cm" },
        { ms: "300 cm ÷ 4 = 75 cm", en: "300 cm ÷ 4 = 75 cm" },
      ],
      answer: "75cm",
    },
    commonMistakes: [
      { mistakeType: "mixed_up_measurement_quantity", description: { ms: "Murid jawab kuantiti yang salah (berat berbanding panjang, atau sebaliknya).", en: "The student answers the wrong quantity (weight instead of length, or vice versa)." } },
      { mistakeType: "gave_total_instead_of_per_piece", description: { ms: "Murid beri jumlah keseluruhan, lupa bahagikan dengan bilangan bahagian.", en: "The student gives the overall total, forgetting to divide by the number of pieces." } },
      { mistakeType: "forgot_to_divide_back", description: { ms: "Dalam soalan berbalik, murid beri nilai setiap bahagian semula, lupa darab untuk cari jumlah asal.", en: "In reverse-style questions, the student gives the per-piece value again, forgetting to multiply to find the original total." } },
      { mistakeType: "unit_conversion_error", description: { ms: "Murid tersilap semasa menukar unit (cth. m ke cm atau kg ke g) sebelum membahagi.", en: "The student makes a unit-conversion error (e.g. m to cm or kg to g) before dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "combined_length_mass", config: { maxPieces: 6 } },
      { type: "fill", difficulty: 3, generatorKey: "combined_length_mass", config: { maxPieces: 6 } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_length_mass", config: { maxPieces: 4 } },
      { type: "mcq", difficulty: 3, generatorKey: "combined_length_mass", config: { maxPieces: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_length_mass", config: { maxPieces: 4, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_length_mass", config: { maxPieces: 5, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000070": {
    id: "a1000000-0000-0000-0000-000000000070",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Panjang dan Isipadu Bergabung", en: "Combined Length and Volume" },
    yearLevel: 6,
    explanation: {
      ms: "Panjang dan isipadu boleh digabungkan dalam satu situasi sebenar — cth. hos taman dan baja cecair yang dibahagikan sama rata. Selesaikan setiap bahagian secara berasingan menggunakan kaedah yang sudah dipelajari.\n\nContoh harian: Hos taman panjangnya 6 m dan botol baja berisi 1 L 200 ml. Kedua-duanya dibahagikan kepada 3 bahagian taman. Berapakah panjang setiap bahagian?",
      en: "Length and volume can be combined in one real-world situation — e.g. a garden hose and liquid fertiliser divided equally. Solve each part separately using methods already learned.\n\nEveryday example: A garden hose is 6 m long and a fertiliser bottle holds 1 L 200 ml. Both are divided among 3 garden sections. What is the length of each section?",
    },
    tips: [
      { ms: "Baca soalan dengan teliti — kenal pasti kuantiti MANA yang sebenarnya ditanya (panjang atau isipadu).", en: "Read the question carefully — identify which quantity is actually being asked for (length or volume)." },
      { ms: "Selesaikan panjang dan isipadu secara berasingan — jangan campurkan kedua-duanya.", en: "Solve length and volume separately — don't mix the two together." },
      {
        ms: "JANGAN buat ini: soalan tanya isipadu setiap bahagian, tetapi anda kira dan jawab panjang setiap bahagian. SALAH — sentiasa semak semula kuantiti yang DITANYA sebelum menulis jawapan akhir.",
        en: "DON'T do this: the question asks for the volume of each section, but you calculate and answer with the length of each section instead. WRONG — always double-check which quantity was ASKED before writing your final answer.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti kuantiti yang ditanya: panjang atau isipadu.", en: "Identify the quantity being asked for: length or volume." },
      { ms: "Bahagikan jumlah kuantiti itu (panjang ATAU isipadu) dengan bilangan bahagian.", en: "Divide that total quantity (length OR volume) by the number of sections." },
      { ms: "Semak semula: adakah jawapan anda untuk kuantiti yang betul-betul ditanya?", en: "Double-check: is your answer for the quantity that was actually asked?" },
    ],
    workedExample: {
      problem: { ms: "Hos 6 m, baja 1 L 200 ml, dibahagikan kepada 3 bahagian. Panjang setiap bahagian?", en: "Hose 6 m, fertiliser 1 L 200 ml, divided into 3 equal parts. Length of each part?" },
      steps: [
        { ms: "Fokus pada panjang sahaja: 6 m = 600 cm", en: "Focus on length only: 6 m = 600 cm" },
        { ms: "600 cm ÷ 3 = 200 cm", en: "600 cm ÷ 3 = 200 cm" },
      ],
      answer: "200cm",
    },
    commonMistakes: [
      { mistakeType: "mixed_up_measurement_quantity", description: { ms: "Murid jawab kuantiti yang salah (isipadu berbanding panjang, atau sebaliknya).", en: "The student answers the wrong quantity (volume instead of length, or vice versa)." } },
      { mistakeType: "gave_total_instead_of_per_section", description: { ms: "Murid beri jumlah keseluruhan, lupa bahagikan dengan bilangan bahagian.", en: "The student gives the overall total, forgetting to divide by the number of sections." } },
      { mistakeType: "forgot_to_divide_back", description: { ms: "Dalam soalan berbalik, murid beri nilai setiap bahagian semula, lupa darab untuk cari jumlah asal.", en: "In reverse-style questions, the student gives the per-section value again, forgetting to multiply to find the original total." } },
      { mistakeType: "unit_conversion_error", description: { ms: "Murid tersilap semasa menukar unit (cth. m ke cm atau L ke ml) sebelum membahagi.", en: "The student makes a unit-conversion error (e.g. m to cm or L to ml) before dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "combined_length_volume", config: { maxSections: 6 } },
      { type: "fill", difficulty: 3, generatorKey: "combined_length_volume", config: { maxSections: 6 } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_length_volume", config: { maxSections: 4 } },
      { type: "mcq", difficulty: 3, generatorKey: "combined_length_volume", config: { maxSections: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_length_volume", config: { maxSections: 4, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_length_volume", config: { maxSections: 5, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000071": {
    id: "a1000000-0000-0000-0000-000000000071",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Jisim dan Isipadu Bergabung", en: "Combined Mass and Volume" },
    yearLevel: 6,
    explanation: {
      ms: "Jisim dan isipadu boleh digabungkan dalam satu situasi sebenar — cth. resipi yang menggunakan tepung dan susu, dibahagikan kepada beberapa bahagian sama banyak. Selesaikan setiap bahagian secara berasingan menggunakan kaedah yang sudah dipelajari.\n\nContoh harian: Satu resipi menggunakan 900 g tepung dan 1 L 500 ml susu untuk membuat 3 bahagian sama banyak. Berapakah berat tepung bagi setiap bahagian?",
      en: "Mass and volume can be combined in one real-world situation — e.g. a recipe using flour and milk, divided into several equal batches. Solve each part separately using methods already learned.\n\nEveryday example: A recipe uses 900 g of flour and 1 L 500 ml of milk to make 3 equal batches. What is the mass of flour for each batch?",
    },
    tips: [
      { ms: "Baca soalan dengan teliti — kenal pasti kuantiti MANA yang sebenarnya ditanya (berat tepung atau isipadu susu).", en: "Read the question carefully — identify which quantity is actually being asked for (mass of flour or volume of milk)." },
      { ms: "Selesaikan jisim dan isipadu secara berasingan — jangan campurkan kedua-duanya.", en: "Solve mass and volume separately — don't mix the two together." },
      {
        ms: "JANGAN buat ini: soalan tanya isipadu susu setiap bahagian, tetapi anda kira dan jawab berat tepung. SALAH — sentiasa semak semula kuantiti yang DITANYA sebelum menulis jawapan akhir.",
        en: "DON'T do this: the question asks for the volume of milk per batch, but you calculate and answer with the mass of flour instead. WRONG — always double-check which quantity was ASKED before writing your final answer.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti kuantiti yang ditanya: berat tepung atau isipadu susu.", en: "Identify the quantity being asked for: mass of flour or volume of milk." },
      { ms: "Bahagikan jumlah kuantiti itu dengan bilangan bahagian.", en: "Divide that total quantity by the number of batches." },
      { ms: "Semak semula: adakah jawapan anda untuk kuantiti yang betul-betul ditanya?", en: "Double-check: is your answer for the quantity that was actually asked?" },
    ],
    workedExample: {
      problem: { ms: "Tepung 900 g, susu 1 L 500 ml, dibahagikan kepada 3 bahagian. Berat tepung setiap bahagian?", en: "Flour 900 g, milk 1 L 500 ml, divided into 3 equal batches. Mass of flour per batch?" },
      steps: [
        { ms: "Fokus pada jisim sahaja: 900 g ÷ 3", en: "Focus on mass only: 900 g ÷ 3" },
        { ms: "900 g ÷ 3 = 300 g", en: "900 g ÷ 3 = 300 g" },
      ],
      answer: "300g",
    },
    commonMistakes: [
      { mistakeType: "mixed_up_measurement_quantity", description: { ms: "Murid jawab kuantiti yang salah (isipadu susu berbanding berat tepung, atau sebaliknya).", en: "The student answers the wrong quantity (volume of milk instead of mass of flour, or vice versa)." } },
      { mistakeType: "gave_total_instead_of_per_batch", description: { ms: "Murid beri jumlah keseluruhan, lupa bahagikan dengan bilangan bahagian.", en: "The student gives the overall total, forgetting to divide by the number of batches." } },
      { mistakeType: "forgot_to_multiply_back", description: { ms: "Dalam soalan berbalik, murid beri nilai setiap bahagian semula, lupa darab untuk cari jumlah asal.", en: "In reverse-style questions, the student gives the per-batch value again, forgetting to multiply to find the original total." } },
      { mistakeType: "unit_conversion_error", description: { ms: "Murid tersilap semasa menukar unit (cth. kg ke g atau L ke ml) sebelum membahagi.", en: "The student makes a unit-conversion error (e.g. kg to g or L to ml) before dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "combined_mass_volume", config: { maxBatches: 6 } },
      { type: "fill", difficulty: 3, generatorKey: "combined_mass_volume", config: { maxBatches: 6 } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_mass_volume", config: { maxBatches: 4 } },
      { type: "mcq", difficulty: 3, generatorKey: "combined_mass_volume", config: { maxBatches: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_mass_volume", config: { maxBatches: 4, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "combined_mass_volume", config: { maxBatches: 5, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000072": {
    id: "a1000000-0000-0000-0000-000000000072",
    strand: { ms: "Statistik", en: "Statistics" },
    bidang: BIDANG.statisticsProbability,
    title: { ms: "Membaca Carta Pai", en: "Reading Pie Charts" },
    yearLevel: 6,
    explanation: {
      ms: "Carta pai menunjukkan data sebagai pecahan daripada keseluruhan bulatan — setiap petak mewakili satu pecahan (cth. 1/4, 1/8). Untuk cari bilangan sebenar dalam satu kumpulan, darabkan pecahan itu dengan jumlah keseluruhan data.\n\nContoh harian: Sebuah carta pai menunjukkan pecahan murid yang menggemari 4 sukan berbeza daripada 24 orang murid. Jika satu kumpulan mewakili 1/4, berapakah bilangan murid dalam kumpulan itu?",
      en: "A pie chart shows data as a fraction of a whole circle — each slice represents a fraction (e.g. 1/4, 1/8). To find the actual count in one group, multiply that fraction by the overall total.\n\nEveryday example: A pie chart shows the fraction of pupils who like 4 different sports, out of 24 pupils. If one group represents 1/4, how many pupils are in that group?",
    },
    tips: [
      { ms: "Setiap petak carta pai ialah PECAHAN daripada jumlah keseluruhan — bukan bilangan sebenar. Darabkan pecahan dengan jumlah untuk dapat bilangan sebenar.", en: "Each pie slice is a FRACTION of the total — not the actual count. Multiply the fraction by the total to get the actual count." },
      { ms: "Jangan anggap semua petak sama besar — semak nombor pada petak itu (pengangka dan penyebut) sebelum mengira.", en: "Don't assume every slice is the same size — check the numbers on that slice (numerator and denominator) before calculating." },
      {
        ms: "JANGAN buat ini: cari bilangan murid kumpulan A (3/8 daripada 24) dengan mengira 24 ÷ 8 = 3 sahaja (abaikan pengangka 3). SALAH — anda MESTI darab pecahan PENUH (3/8) dengan jumlah, bukan anggap ia 1/8. Jawapan yang betul ialah 24 × 3/8 = 9.",
        en: "DON'T do this: find group A's count (3/8 of 24) by calculating just 24 ÷ 8 = 3 (ignoring the numerator 3). WRONG — you MUST multiply the FULL fraction (3/8) by the total, not treat it as 1/8. The correct answer is 24 × 3/8 = 9.",
      },
      {
        ms: "Cabaran: jika soalan minta \"berapa lebih daripada DUA KALI\" satu kumpulan, gandakan bilangan sebenar kumpulan itu DAHULU sebelum tolak.",
        en: "Challenge: if the question asks \"how much more than DOUBLE\" one group, double that group's actual count FIRST before subtracting.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti pecahan bagi kumpulan yang ditanya.", en: "Identify the fraction for the group being asked about." },
      { ms: "Darabkan pecahan itu dengan jumlah keseluruhan data untuk dapat bilangan sebenar.", en: "Multiply that fraction by the overall total to get the actual count." },
      { ms: "Untuk soalan beza, cari bilangan sebenar bagi KEDUA-DUA kumpulan dahulu, kemudian tolak.", en: "For a difference question, find the actual count for BOTH groups first, then subtract." },
      { ms: "Semak: tambahkan bilangan sebenar bagi SEMUA kumpulan — jumlahnya mesti menyamai jumlah keseluruhan data. Jika ada perkataan tambahan seperti \"dua kali\", buat langkah itu SEBELUM tolak.", en: "Check: add up the actual counts for ALL groups — the total should equal the overall data total. If there's an extra word like \"double\", do that step BEFORE subtracting." },
    ],
    workedExample: {
      problem: { ms: "Carta pai: kumpulan A = 1/4, jumlah murid = 24. Berapakah bilangan murid dalam kumpulan A?", en: "Pie chart: group A = 1/4, total students = 24. How many students are in group A?" },
      steps: [
        { ms: "Pecahan bagi A ialah 1/4", en: "The fraction for A is 1/4" },
        { ms: "24 × 1/4 = 6", en: "24 × 1/4 = 6" },
      ],
      answer: 6,
      diagram: {
        kind: "pie_chart",
        segments: [
          { label: "A", numerator: 1, denominator: 4 },
          { label: "B", numerator: 1, denominator: 4 },
          { label: "C", numerator: 1, denominator: 4 },
          { label: "D", numerator: 1, denominator: 4 },
        ],
      },
    },
    commonMistakes: [
      { mistakeType: "treated_as_unit_fraction", description: { ms: "Murid anggap setiap petak carta pai bersamaan 1 bahagian sahaja (cth. mengira jumlah ÷ penyebut) tanpa mengambil kira pengangka sebenar.", en: "The student assumes every pie slice is worth a single 1-part fraction (e.g. total ÷ denominator) without accounting for the actual numerator." } },
      { mistakeType: "misread_pie_sector", description: { ms: "Murid baca pecahan bagi petak yang salah semasa mengira.", en: "The student reads the fraction for the wrong slice while calculating." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari jumlah keseluruhan (diberi bilangan sebenar satu kumpulan dan pecahannya), murid darab berbanding bahagi.", en: "When finding the overall total (given one group's actual count and its fraction), the student multiplies instead of dividing." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak sama ada bilangan sebenar itu munasabah — ia mesti kurang daripada jumlah keseluruhan.", en: "The student doesn't check whether the actual count is reasonable — it should be less than the overall total." } },
      { mistakeType: "stopped_at_intermediate_step", description: { ms: "Dalam soalan \"berapa lebih daripada dua kali\", murid kira beza biasa sahaja dan lupa gandakan bilangan itu dahulu.", en: "In a \"how much more than double\" question, the student calculates a plain difference and forgets to double the count first." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "pie_chart", config: {} },
      { type: "fill", difficulty: 3, generatorKey: "pie_chart", config: {} },
      { type: "word_problem", difficulty: 3, generatorKey: "pie_chart", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "pie_chart", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "pie_chart", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "pie_chart", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000073": {
    id: "a1000000-0000-0000-0000-000000000073",
    strand: { ms: "Masa dan Waktu", en: "Time" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Zon Waktu", en: "Time Zones" },
    yearLevel: 6,
    explanation: {
      ms: "Bandar-bandar di seluruh dunia berada dalam zon waktu yang berbeza, ditulis sebagai GMT+ atau GMT− (beza jam daripada Greenwich Mean Time). Untuk cari masa di sebuah bandar lain, cari BEZA GMT antara kedua-dua bandar, kemudian tambah atau tolak beza itu daripada masa yang diberi.\n\nContoh harian: Kuala Lumpur ialah GMT+8 dan Tokyo ialah GMT+9. Jika masa di Kuala Lumpur ialah 14:00, pukul berapakah masa di Tokyo?",
      en: "Cities around the world sit in different time zones, written as GMT+ or GMT− (the hour difference from Greenwich Mean Time). To find the time in another city, find the GMT DIFFERENCE between the two cities, then add or subtract that difference from the given time.\n\nEveryday example: Kuala Lumpur is GMT+8 and Tokyo is GMT+9. If the time in Kuala Lumpur is 14:00, what time is it in Tokyo?",
    },
    tips: [
      { ms: "Jika bandar kedua mempunyai GMT yang LEBIH TINGGI, masanya LEBIH LEWAT — tambah jam. Jika lebih rendah, masanya lebih awal — tolak jam.", en: "If the second city has a HIGHER GMT, its time is LATER — add hours. If lower, its time is earlier — subtract hours." },
      { ms: "Bandingkan nombor GMT dahulu sebelum mengira — itulah beza jam yang perlu ditambah atau ditolak.", en: "Compare the GMT numbers first before calculating — that's the hour difference you need to add or subtract." },
      {
        ms: "JANGAN buat ini: Kuala Lumpur (GMT+8) ke Tokyo (GMT+9), masa 14:00 dikira sebagai 14:00 − 1 = 13:00 (tolak, arah terbalik). SALAH — GMT Tokyo LEBIH TINGGI, jadi anda MESTI tambah. Jawapan yang betul ialah 15:00.",
        en: "DON'T do this: Kuala Lumpur (GMT+8) to Tokyo (GMT+9), time 14:00 calculated as 14:00 − 1 = 13:00 (subtracting, wrong direction). WRONG — Tokyo's GMT is HIGHER, so you MUST add. The correct answer is 15:00.",
      },
    ],
    howTo: [
      { ms: "Cari beza GMT antara kedua-dua bandar (GMT bandar destinasi − GMT bandar asal).", en: "Find the GMT difference between the two cities (destination city's GMT − origin city's GMT)." },
      { ms: "Tambahkan beza itu (jika positif) atau tolak (jika negatif) daripada masa asal.", en: "Add that difference (if positive) or subtract it (if negative) from the original time." },
      { ms: "Semak: kira semula ke arah bertentangan (destinasi ke asal) — anda mesti dapat semula masa asal.", en: "Check: calculate in the reverse direction (destination back to origin) — you should get the original time back." },
    ],
    workedExample: {
      problem: { ms: "Kuala Lumpur (GMT+8), Tokyo (GMT+9). Masa di Kuala Lumpur: 14:00. Pukul berapa di Tokyo?", en: "Kuala Lumpur (GMT+8), Tokyo (GMT+9). Time in Kuala Lumpur: 14:00. What time is it in Tokyo?" },
      steps: [
        { ms: "Beza GMT = 9 − 8 = +1 jam", en: "GMT difference = 9 − 8 = +1 hour" },
        { ms: "14:00 + 1 jam = 15:00", en: "14:00 + 1 hour = 15:00" },
      ],
      answer: "15:00",
    },
    commonMistakes: [
      { mistakeType: "wrong_offset_direction", description: { ms: "Murid tolak beza GMT sepatutnya tambah, atau sebaliknya.", en: "The student subtracts the GMT difference when they should add it, or vice versa." } },
      { mistakeType: "forgot_to_convert", description: { ms: "Murid berikan masa asal tanpa melaraskannya mengikut beza GMT.", en: "The student gives the original time without adjusting it for the GMT difference." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari GMT bandar yang tidak diketahui (diberi masa kedua-dua bandar), murid tolak beza jam daripada GMT yang diketahui berbanding tambah.", en: "When finding an unknown city's GMT (given both cities' times), the student subtracts the hour difference from the known GMT instead of adding it." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak sama ada masa akhir munasabah — beza jam yang besar (lebih daripada 12 jam) patut dipersoalkan semula.", en: "The student doesn't check whether the final time is reasonable — a large hour difference (more than 12 hours) should raise a flag." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "time_zones", config: {} },
      { type: "fill", difficulty: 3, generatorKey: "time_zones", config: {} },
      { type: "word_problem", difficulty: 3, generatorKey: "time_zones", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "time_zones", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_zones", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_zones", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000074": {
    id: "a1000000-0000-0000-0000-000000000074",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Nombor Perdana dan Nombor Gubahan", en: "Prime Numbers and Composite Numbers" },
    yearLevel: 6,
    explanation: {
      ms: "Nombor PERDANA hanya boleh dibahagi tepat dengan 1 dan dirinya sendiri (cth. 2, 3, 5, 7, 11). Nombor GUBAHAN mempunyai lebih daripada dua faktor (cth. 4, 6, 8, 9). Nombor 1 adalah istimewa — ia BUKAN nombor perdana MAHUPUN nombor gubahan, kerana ia hanya mempunyai SATU faktor (dirinya sendiri).\n\nContoh harian: 7 hanya boleh dibahagi tepat dengan 1 dan 7 — jadi 7 ialah nombor perdana. 8 boleh dibahagi tepat dengan 1, 2, 4, dan 8 — jadi 8 ialah nombor gubahan.",
      en: "A PRIME number can only be divided exactly by 1 and itself (e.g. 2, 3, 5, 7, 11). A COMPOSITE number has more than two factors (e.g. 4, 6, 8, 9). The number 1 is special — it is NEITHER prime NOR composite, because it only has ONE factor (itself).\n\nEveryday example: 7 can only be divided exactly by 1 and 7 — so 7 is prime. 8 can be divided exactly by 1, 2, 4, and 8 — so 8 is composite.",
    },
    tips: [
      { ms: "Cuba bahagikan nombor itu dengan 2, 3, 5, 7... Jika TIADA yang boleh bahagi tepat (selain 1 dan nombor itu sendiri), ia perdana.", en: "Try dividing the number by 2, 3, 5, 7... If NONE of them divide it exactly (other than 1 and the number itself), it's prime." },
      { ms: "1 bukan perdana dan bukan gubahan — ramai murid tersilap anggap 1 itu perdana.", en: "1 is neither prime nor composite — many students mistakenly assume 1 is prime." },
      { ms: "Semua nombor genap selain 2 adalah nombor gubahan (kerana boleh dibahagi dengan 2).", en: "Every even number except 2 is composite (since it can be divided by 2)." },
    ],
    howTo: [
      { ms: "Senaraikan faktor-faktor nombor itu.", en: "List the number's factors." },
      { ms: "Jika hanya ADA 2 faktor (1 dan dirinya sendiri), ia perdana.", en: "If it has EXACTLY 2 factors (1 and itself), it's prime." },
      { ms: "Jika ada LEBIH daripada 2 faktor, ia gubahan. Jika HANYA 1 faktor (nombor itu ialah 1), ia bukan kedua-duanya.", en: "If it has MORE than 2 factors, it's composite. If it has ONLY 1 factor (the number is 1), it's neither." },
    ],
    workedExample: {
      problem: { ms: "Adakah 9 nombor perdana atau nombor gubahan?", en: "Is 9 a prime number or a composite number?" },
      steps: [
        { ms: "Faktor bagi 9: 1, 3, 9", en: "Factors of 9: 1, 3, 9" },
        { ms: "Terdapat 3 faktor (lebih daripada 2), jadi 9 ialah nombor gubahan", en: "There are 3 factors (more than 2), so 9 is composite" },
      ],
      answer: "composite",
    },
    commonMistakes: [
      { mistakeType: "prime_composite_misconception", description: { ms: "Murid anggap 1 ialah nombor perdana, atau lupa semak semua faktor yang mungkin sebelum membuat kesimpulan.", en: "The student assumes 1 is prime, or forgets to check all possible factors before concluding." } },
      { mistakeType: "incomplete_factor_check", description: { ms: "Murid berhenti menyemak faktor terlalu awal dan terlepas faktor yang membuktikan nombor itu gubahan.", en: "The student stops checking factors too early and misses a factor that would prove the number is composite." } },
      { mistakeType: "confused_even_and_composite", description: { ms: "Murid anggap semua nombor genap adalah gubahan, terlepas pandang bahawa 2 itu sendiri adalah perdana.", en: "The student assumes all even numbers are composite, overlooking that 2 itself is prime." } },
      { mistakeType: "assumed_large_numbers_are_composite", description: { ms: "Murid anggap nombor yang besar semestinya gubahan tanpa menyemak faktornya, terlepas pandang nombor perdana yang besar seperti 97.", en: "The student assumes a large number must be composite without checking its factors, overlooking large primes like 97." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "prime_composite", config: {} },
      { type: "mcq", difficulty: 2, generatorKey: "prime_composite", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "prime_composite", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "prime_composite", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "prime_composite", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000075": {
    id: "a1000000-0000-0000-0000-000000000075",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Sudut Pedalaman Poligon Sekata", en: "Interior Angles of Regular Polygons" },
    yearLevel: 6,
    explanation: {
      ms: "Poligon sekata (regular polygon) mempunyai semua sisi dan semua sudut yang sama saiz. Jumlah semua sudut pedalaman = (bilangan sisi − 2) × 180°. Setiap sudut pedalaman = jumlah itu ÷ bilangan sisi.\n\nContoh harian: Sebuah pentagon sekata mempunyai 5 sisi. Jumlah sudut pedalaman = (5 − 2) × 180° = 540°. Setiap sudut = 540° ÷ 5 = 108°.",
      en: "A regular polygon has all sides and all angles equal in size. The sum of all interior angles = (number of sides − 2) × 180°. Each interior angle = that sum ÷ number of sides.\n\nEveryday example: A regular pentagon has 5 sides. Sum of interior angles = (5 − 2) × 180° = 540°. Each angle = 540° ÷ 5 = 108°.",
    },
    tips: [
      { ms: "Jangan lupa TOLAK 2 daripada bilangan sisi dahulu, sebelum darab dengan 180°.", en: "Don't forget to SUBTRACT 2 from the number of sides first, before multiplying by 180°." },
      { ms: "Untuk cari SATU sudut, bahagikan jumlah keseluruhan dengan bilangan sisi.", en: "To find ONE angle, divide the total sum by the number of sides." },
      {
        ms: "JANGAN buat ini: heksagon (6 sisi) dikira sebagai 6 × 180° = 1080°. SALAH — anda MESTI tolak 2 daripada bilangan sisi dahulu. Jawapan yang betul ialah (6 − 2) × 180° = 720°.",
        en: "DON'T do this: a hexagon (6 sides) calculated as 6 × 180° = 1080°. WRONG — you MUST subtract 2 from the number of sides first. The correct answer is (6 − 2) × 180° = 720°.",
      },
    ],
    howTo: [
      { ms: "Kira jumlah sudut pedalaman: (bilangan sisi − 2) × 180°.", en: "Calculate the sum of interior angles: (number of sides − 2) × 180°." },
      { ms: "Jika soalan minta SATU sudut, bahagikan jumlah itu dengan bilangan sisi.", en: "If the question asks for ONE angle, divide that sum by the number of sides." },
      { ms: "Semak: adakah anda tolak 2 daripada bilangan sisi SEBELUM darab dengan 180°?", en: "Check: did you subtract 2 from the number of sides BEFORE multiplying by 180°?" },
    ],
    workedExample: {
      problem: { ms: "Berapakah setiap sudut pedalaman bagi heksagon sekata (6 sisi)?", en: "What is each interior angle of a regular hexagon (6 sides)?" },
      steps: [
        { ms: "Jumlah = (6 − 2) × 180° = 720°", en: "Sum = (6 − 2) × 180° = 720°" },
        { ms: "Setiap sudut = 720° ÷ 6 = 120°", en: "Each angle = 720° ÷ 6 = 120°" },
      ],
      answer: "120",
    },
    commonMistakes: [
      { mistakeType: "polygon_angle_formula_error", description: { ms: "Murid lupa tolak 2 daripada bilangan sisi, atau lupa bahagikan jumlah dengan bilangan sisi untuk dapatkan satu sudut.", en: "The student forgets to subtract 2 from the number of sides, or forgets to divide the sum by the number of sides to get one angle." } },
      { mistakeType: "confused_sum_and_each_angle", description: { ms: "Murid beri jumlah keseluruhan sudut apabila soalan minta satu sudut sahaja, atau sebaliknya.", en: "The student gives the total sum of angles when the question only asks for one angle, or vice versa." } },
      { mistakeType: "wrong_side_count", description: { ms: "Murid kira bilangan sisi poligon itu dengan salah.", en: "The student miscounts the number of sides of the polygon." } },
      { mistakeType: "arithmetic_error_in_formula", description: { ms: "Murid guna formula yang betul tetapi tersilap kira semasa mendarab atau membahagi.", en: "The student uses the correct formula but makes an arithmetic slip while multiplying or dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "regular_polygon_angles", config: {} },
      { type: "fill", difficulty: 3, generatorKey: "regular_polygon_angles", config: {} },
      { type: "word_problem", difficulty: 3, generatorKey: "regular_polygon_angles", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "regular_polygon_angles", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "regular_polygon_angles", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "regular_polygon_angles", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000076": {
    id: "a1000000-0000-0000-0000-000000000076",
    strand: { ms: "Wang", en: "Money" },
    bidang: BIDANG.numbersOperations,
    title: { ms: "Faedah Kompaun", en: "Compound Interest" },
    yearLevel: 5,
    explanation: {
      ms: "Faedah KOMPAUN berbeza daripada faedah mudah — setiap tahun, faedah dikira daripada JUMLAH TERKINI (prinsipal + faedah tahun-tahun sebelumnya), bukan daripada prinsipal asal sahaja. Ini bermakna jumlah faedah bertambah lebih cepat setiap tahun.\n\nContoh harian: RM100 dilaburkan pada kadar 10% setahun. Tahun 1: faedah = RM10, jumlah = RM110. Tahun 2: faedah dikira daripada RM110 (bukan RM100) = RM11, jumlah = RM121. Jumlah faedah kompaun selepas 2 tahun = RM21.",
      en: "COMPOUND interest is different from simple interest — each year, interest is calculated on the CURRENT total (principal + previous years' interest), not just the original principal. This means the total interest grows faster each year.\n\nEveryday example: RM100 is invested at 10% per year. Year 1: interest = RM10, total = RM110. Year 2: interest is calculated on RM110 (not RM100) = RM11, total = RM121. Total compound interest after 2 years = RM21.",
    },
    tips: [
      { ms: "Kira faedah SATU TAHUN pada satu masa — jangan darab terus dengan bilangan tahun seperti faedah mudah.", en: "Calculate interest ONE YEAR at a time — don't multiply straight through by the number of years like simple interest." },
      { ms: "Selepas setiap tahun, TAMBAHKAN faedah itu kepada jumlah sebelum mengira tahun seterusnya.", en: "After each year, ADD that interest to the total before calculating the next year." },
      {
        ms: "JANGAN buat ini: RM100 pada kadar 10% selama 2 tahun dikira sebagai 100 × 10% × 2 = RM20 (faedah mudah). SALAH — faedah kompaun MESTI dikira daripada jumlah terkini setiap tahun. Jawapan yang betul ialah RM21.00.",
        en: "DON'T do this: RM100 at 10% for 2 years calculated as 100 × 10% × 2 = RM20 (simple interest). WRONG — compound interest MUST be calculated from the current total each year. The correct answer is RM21.00.",
      },
    ],
    howTo: [
      { ms: "Kira faedah tahun 1: prinsipal × kadar ÷ 100. Tambahkan kepada prinsipal.", en: "Calculate year 1's interest: principal × rate ÷ 100. Add it to the principal." },
      { ms: "Kira faedah tahun 2 daripada JUMLAH BAHARU itu (bukan prinsipal asal). Ulang untuk setiap tahun.", en: "Calculate year 2's interest from that NEW total (not the original principal). Repeat for every year." },
      { ms: "Jumlah faedah kompaun = jumlah akhir − prinsipal asal.", en: "Total compound interest = final total − original principal." },
      { ms: "Semak: faedah kompaun mesti SENTIASA lebih besar daripada faedah mudah (prinsipal × kadar × tahun) bagi tempoh yang sama.", en: "Check: compound interest should ALWAYS be bigger than simple interest (principal × rate × years) for the same period." },
    ],
    workedExample: {
      problem: { ms: "RM100 dilaburkan pada kadar faedah kompaun 10% setahun selama 2 tahun. Berapakah jumlah faedah kompaun?", en: "RM100 invested at a compound interest rate of 10% per year for 2 years. What is the total compound interest?" },
      steps: [
        { ms: "Tahun 1: RM100 × 10% = RM10 faedah. Jumlah = RM100 + RM10 = RM110", en: "Year 1: RM100 × 10% = RM10 interest. Total = RM100 + RM10 = RM110" },
        { ms: "Tahun 2: RM110 × 10% = RM11 faedah. Jumlah = RM110 + RM11 = RM121", en: "Year 2: RM110 × 10% = RM11 interest. Total = RM110 + RM11 = RM121" },
        { ms: "Jumlah faedah kompaun = RM121 − RM100 = RM21", en: "Total compound interest = RM121 − RM100 = RM21" },
      ],
      answer: "RM21.00",
    },
    commonMistakes: [
      { mistakeType: "used_simple_interest_formula", description: { ms: "Murid guna formula faedah mudah (prinsipal × kadar × tahun) dan lupa faedah kompaun mengira daripada jumlah terkini setiap tahun.", en: "The student uses the simple interest formula (principal × rate × years) and forgets compound interest calculates from the current total each year." } },
      { mistakeType: "stopped_compounding_early", description: { ms: "Murid hanya kira faedah untuk 1 tahun dan lupa teruskan untuk baki tahun.", en: "The student only calculates 1 year's interest and forgets to continue for the remaining years." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari prinsipal (diberi faedah tahun 1 dan kadar), murid anggap jumlah faedah itu sendiri ialah prinsipal.", en: "When finding the principal (given year 1's interest and the rate), the student treats the interest amount itself as the principal." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak sama ada faedah kompaun mereka lebih besar daripada faedah mudah untuk tempoh yang sama, jadi tidak perasan jawapan mereka tersilap.", en: "The student doesn't check whether their compound interest is bigger than simple interest for the same period, so doesn't notice their answer is off." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "compound_interest", config: { maxPrincipalRM: 20 } },
      { type: "fill", difficulty: 3, generatorKey: "compound_interest", config: { maxPrincipalRM: 15 } },
      { type: "word_problem", difficulty: 3, generatorKey: "compound_interest", config: { maxPrincipalRM: 15, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "compound_interest", config: { maxPrincipalRM: 15, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "compound_interest", config: { maxPrincipalRM: 15, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "compound_interest", config: { maxPrincipalRM: 15, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000077": {
    id: "a1000000-0000-0000-0000-000000000077",
    strand: { ms: "Statistik", en: "Statistics" },
    bidang: BIDANG.statisticsProbability,
    title: { ms: "Membaca Piktograf", en: "Reading Pictographs" },
    yearLevel: 4,
    explanation: {
      ms: "Piktograf menggunakan IKON (gambar kecil) untuk mewakili data — tetapi setiap ikon tidak semestinya mewakili 1 sahaja. KUNCI piktograf (cth. \"= 5 unit\") memberitahu berapa banyak yang diwakili oleh SETIAP ikon. Untuk cari bilangan sebenar, darabkan bilangan ikon dengan kunci itu.\n\nContoh harian: Piktograf menunjukkan peniaga A mempunyai 4 ikon buah, dan kunci menunjukkan setiap ikon = 5 biji buah. Jadi peniaga A menjual 4 × 5 = 20 biji buah.",
      en: "A pictograph uses ICONS (small pictures) to represent data — but each icon doesn't necessarily represent just 1. The pictograph's KEY (e.g. \"= 5 units\") tells you how much EACH icon represents. To find the actual count, multiply the icon count by that key.\n\nEveryday example: A pictograph shows seller A has 4 fruit icons, and the key shows each icon = 5 fruits. So seller A sold 4 × 5 = 20 fruits.",
    },
    tips: [
      { ms: "SENTIASA semak kunci dahulu sebelum mengira — jangan anggap setiap ikon mewakili 1 sahaja.", en: "ALWAYS check the key first before calculating — don't assume each icon represents just 1." },
      { ms: "Untuk soalan beza, tukar KEDUA-DUA baris kepada unit sebenar dahulu, kemudian tolak.", en: "For a difference question, convert BOTH rows to actual units first, then subtract." },
      {
        ms: "JANGAN buat ini: peniaga A ada 4 ikon (kunci = 5 setiap ikon) dan bilangan buah dijawab sebagai 4 (bilangan ikon sahaja). SALAH — anda MESTI darab bilangan ikon dengan kunci itu. Jawapan yang betul ialah 4 × 5 = 20.",
        en: "DON'T do this: seller A has 4 icons (key = 5 per icon) and the fruit count answered as 4 (just the icon count). WRONG — you MUST multiply the icon count by the key. The correct answer is 4 × 5 = 20.",
      },
    ],
    howTo: [
      { ms: "Kira bilangan ikon bagi kumpulan yang ditanya.", en: "Count the number of icons for the group being asked about." },
      { ms: "Darabkan bilangan ikon itu dengan kunci (unit setiap ikon) untuk dapat bilangan sebenar.", en: "Multiply that icon count by the key (units per icon) to get the actual count." },
      { ms: "Semak: bahagikan bilangan sebenar dengan kunci — jawapannya mesti menyamai bilangan ikon yang anda kira.", en: "Check: divide the actual count by the key — the answer should match the icon count you counted." },
    ],
    workedExample: {
      problem: { ms: "Peniaga A mempunyai 4 ikon. Kunci: setiap ikon = 5 biji buah. Berapakah bilangan buah peniaga A?", en: "Seller A has 4 icons. Key: each icon = 5 fruits. How many fruits does Seller A have?" },
      steps: [
        { ms: "Bilangan ikon = 4, kunci = 5 setiap ikon", en: "Icon count = 4, key = 5 per icon" },
        { ms: "4 × 5 = 20", en: "4 × 5 = 20" },
      ],
      answer: 20,
      diagram: { kind: "pictograph", segments: [{ label: "A", iconCount: 4 }], unitsPerIcon: 5 },
    },
    commonMistakes: [
      { mistakeType: "forgot_pictograph_key", description: { ms: "Murid berikan bilangan ikon sahaja tanpa mendarabkan dengan kunci.", en: "The student gives the icon count alone without multiplying by the key." } },
      { mistakeType: "subtracted_icons_not_units", description: { ms: "Murid tolak bilangan ikon terus tanpa menukarkannya kepada unit sebenar dahulu.", en: "The student subtracts icon counts directly without converting them to actual units first." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari bilangan ikon yang perlu dilukis (diberi jumlah sebenar dan kunci), murid darab berbanding bahagi.", en: "When finding how many icons to draw (given the actual total and the key), the student multiplies instead of dividing." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak sama ada bilangan sebenar itu munasabah berbanding bilangan ikon yang dilukis.", en: "The student doesn't check whether the actual count is reasonable compared to the number of icons drawn." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "pictograph", config: {} },
      { type: "fill", difficulty: 2, generatorKey: "pictograph", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "pictograph", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "pictograph", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "pictograph", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "pictograph", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000078": {
    id: "a1000000-0000-0000-0000-000000000078",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Garis Selari dan Garis Serenjang", en: "Parallel Lines and Perpendicular Lines" },
    yearLevel: 4,
    explanation: {
      ms: "Semasa gotong-royong membersihkan padang sekolah, Cikgu Daniel menandakan dua barisan pelajar berdiri berjajar untuk membentuk barisan lurus yang tidak pernah bertemu. Adakah kedua-dua barisan ini selari atau serenjang?\n\nGaris SELARI (parallel) ialah dua garis yang sentiasa berjarak sama antara satu sama lain dan TIDAK AKAN bertemu walaupun disambung sepanjang mana pun. Garis SERENJANG (perpendicular) ialah dua garis yang bersilang tepat pada sudut 90°. Jika dua garis bersilang tetapi BUKAN pada 90°, ia bukan kedua-duanya.",
      en: "During a school field gotong-royong, Cikgu Daniel lines up two rows of students standing side by side, always the same distance apart, never meeting. Are these two rows parallel or perpendicular?\n\nPARALLEL lines are two lines that always stay the same distance apart and will NEVER meet, no matter how far they're extended. PERPENDICULAR lines are two lines that cross at exactly a 90° angle. If two lines cross but NOT at 90°, they're neither.",
    },
    tips: [
      { ms: "Ingat: SE-lari, SE-jarak — kedua-duanya bermula dengan 'se' kerana garis selari sentiasa SEsama jarak!", en: "Remember: parallel lines are like train tracks — always running side by side, same distance, never touching!" },
      { ms: "JANGAN buat ini: menganggap sebarang dua garis yang bersilang itu serenjang. SALAH — garis mesti bersilang tepat pada 90° (bertanda petak □) untuk jadi serenjang. Jika sudutnya condong (contohnya 60° atau 120°), ia BUKAN kedua-duanya.", en: "DON'T do this: assuming any two crossing lines are perpendicular. WRONG — lines must cross at exactly 90° (marked with a square □) to be perpendicular. If the angle looks slanted (e.g. 60° or 120°), it's NEITHER." },
      { ms: "Petua pantas: bayangkan sudut bilik darjah anda — dinding dan lantai selalunya serenjang; tepi meja panjang yang berhadapan biasanya selari.", en: "Quick trick: picture the corner of your classroom — the wall and floor are usually perpendicular; the long opposite edges of a table are usually parallel." },
    ],
    howTo: [
      { ms: "Lihat rajah dengan teliti — kenal pasti sama ada dua garis itu bersilang.", en: "Look at the diagram carefully — identify whether the two lines cross." },
      { ms: "Jika TIDAK bersilang dan berjarak sama sepanjang garis, ia selari.", en: "If they DON'T cross and stay the same distance apart, they're parallel." },
      { ms: "Jika BERSILANG, cari petanda petak kecil (□) di titik persilangan.", en: "If they DO cross, look for a small square mark (□) at the crossing point." },
      { ms: "Jika ada petanda petak, ia serenjang (90°). Jika tiada, ia bukan kedua-duanya.", en: "If there's a square mark, it's perpendicular (90°). If not, it's neither." },
      { ms: "Semak: jika anda kata 'serenjang', pastikan sudut itu kelihatan seperti sudut bilik/kertas, bukan condong.", en: "Check: if you say 'perpendicular', make sure the angle really looks like a room/paper corner, not slanted." },
    ],
    workedExample: {
      problem: { ms: "Dua garis bersilang membentuk petak kecil (□) di titik persilangan. Apakah hubungan antara kedua-dua garis ini?", en: "Two lines cross forming a small square (□) at the intersection point. What is the relationship between these two lines?" },
      steps: [
        { ms: "Lihat rajah: kedua-dua garis bersilang (bukan selari).", en: "Look at the diagram: the two lines cross (not parallel)." },
        { ms: "Cari petanda: terdapat petak kecil (□) di titik persilangan.", en: "Look for a marker: there's a small square (□) at the crossing point." },
        { ms: "Petak kecil menunjukkan sudut 90° tepat.", en: "The small square shows an exact 90° angle." },
        { ms: "Dua garis yang bersilang pada 90° ialah garis serenjang.", en: "Two lines crossing at 90° are perpendicular lines." },
        { ms: "Semak: garis ini bersilang (bukan selari) DAN bertanda 90° tepat — konsisten dengan serenjang ✓", en: "Check: these lines cross (not parallel) AND are marked exactly 90° — consistent with perpendicular ✓" },
      ],
      answer: "perpendicular",
      diagram: { kind: "line_pair", relationship: "perpendicular", angleDeg: 90 },
    },
    commonMistakes: [
      { mistakeType: "special_case_error", description: { ms: "Murid menganggap sebarang dua garis yang bersilang adalah serenjang, walaupun sudutnya condong (bukan 90°).", en: "Student assumes any two crossing lines are perpendicular, even when the angle is slanted (not 90°)." } },
      { mistakeType: "notation_confusion", description: { ms: "Murid keliru antara penanda anak panah (untuk selari) dan penanda petak (untuk serenjang), lalu memberi jawapan bertentangan dengan apa yang ditunjukkan rajah.", en: "Student confuses the arrow-tick marker (for parallel) with the square marker (for perpendicular), giving an answer opposite to what the diagram actually shows." } },
      { mistakeType: "keyword_only_classification", description: { ms: "Murid mengelaskan berdasarkan konteks objek (contohnya 'tangga' = serenjang) tanpa melihat sudut sebenar dalam rajah, walaupun tangga yang condong sebenarnya 'bukan kedua-duanya'.", en: "Student classifies based on the object's name alone (e.g. 'ladder' = perpendicular) without checking the actual angle in the diagram, even though a leaning ladder is actually 'neither'." } },
      { mistakeType: "parallel_perpendicular_confusion", description: { ms: "Murid menukar takrifan — mengatakan garis yang tidak bertemu itu serenjang, dan garis yang bersilang 90° itu selari.", en: "Student swaps the definitions — calling lines that never meet 'perpendicular', and lines crossing at 90° 'parallel'." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "line_pair_classify", config: { target: "parallel" } },
      { type: "mcq", difficulty: 1, generatorKey: "line_pair_classify", config: { target: "perpendicular" } },
      { type: "mcq", difficulty: 2, generatorKey: "line_pair_classify", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "line_pair_classify", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "line_pair_classify", config: { errorSpotting: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000079": {
    id: "a1000000-0000-0000-0000-000000000079",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Isi Padu Kuboid", en: "Volume of a Cuboid" },
    yearLevel: 4,
    explanation: {
      ms: "Isi padu ialah ruang yang diisi oleh sesuatu bentuk pepejal. Untuk kuboid, isi padu = panjang × lebar × tinggi. Ini berbeza daripada luas (yang hanya guna DUA dimensi) — isi padu guna KETIGA-TIGA dimensi.\n\nContoh harian: Sebuah kotak berbentuk kuboid mempunyai panjang 5 cm, lebar 3 cm, dan tinggi 2 cm. Isi padu kotak itu = 5 × 3 × 2 = 30 cm³.",
      en: "Volume is the space filled by a solid shape. For a cuboid, volume = length × width × height. This is different from area (which only uses TWO dimensions) — volume uses ALL THREE dimensions.\n\nEveryday example: A box shaped like a cuboid has a length of 5 cm, a width of 3 cm, and a height of 2 cm. The box's volume = 5 × 3 × 2 = 30 cm³.",
    },
    tips: [
      { ms: "Isi padu guna KETIGA-TIGA dimensi (panjang, lebar, DAN tinggi) — jangan tertinggal satu dimensi seperti mengira luas.", en: "Volume uses ALL THREE dimensions (length, width, AND height) — don't leave one out like when calculating area." },
      { ms: "Unit isi padu ialah unit padu (cth. cm³), bukan unit petak (cm²) seperti luas.", en: "Volume units are cubic units (e.g. cm³), not square units (cm²) like area." },
      {
        ms: "JANGAN buat ini: kuboid panjang 5 cm, lebar 3 cm, tinggi 2 cm dikira sebagai 5 × 3 = 15 cm³ (terlepas pandang tinggi). SALAH — anda MESTI darab KETIGA-TIGA dimensi. Jawapan yang betul ialah 5 × 3 × 2 = 30 cm³.",
        en: "DON'T do this: a cuboid with length 5 cm, width 3 cm, height 2 cm calculated as 5 × 3 = 15 cm³ (leaving out the height). WRONG — you MUST multiply ALL THREE dimensions. The correct answer is 5 × 3 × 2 = 30 cm³.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti panjang, lebar, dan tinggi kuboid itu.", en: "Identify the cuboid's length, width, and height." },
      { ms: "Darabkan ketiga-tiga nilai itu: panjang × lebar × tinggi.", en: "Multiply all three values together: length × width × height." },
      { ms: "Semak: adakah unit jawapan anda unit PADU (cth. cm³), bukan unit petak (cm²)?", en: "Check: are your answer's units CUBIC (e.g. cm³), not square units (cm²)?" },
    ],
    workedExample: {
      problem: { ms: "Kuboid: panjang 5 cm, lebar 3 cm, tinggi 2 cm. Cari isi padu.", en: "Cuboid: length 5 cm, width 3 cm, height 2 cm. Find the volume." },
      steps: [
        { ms: "Isi padu = panjang × lebar × tinggi", en: "Volume = length × width × height" },
        { ms: "5 × 3 × 2 = 30 cm³", en: "5 × 3 × 2 = 30 cm³" },
      ],
      answer: "30 cm³",
    },
    commonMistakes: [
      { mistakeType: "treated_volume_as_area", description: { ms: "Murid hanya darabkan DUA daripada tiga dimensi, seperti mengira luas.", en: "The student only multiplies TWO of the three dimensions, like calculating area." } },
      { mistakeType: "added_instead_of_multiplied", description: { ms: "Murid tambah ketiga-tiga dimensi berbanding mendarabkannya.", en: "The student adds the three dimensions instead of multiplying them." } },
      { mistakeType: "used_wrong_dimensions", description: { ms: "Dalam soalan berbalik, murid bahagikan isi padu dengan dimensi yang salah, atau gunakan hanya satu dimensi yang diketahui.", en: "In reverse-style questions, the student divides the volume by the wrong dimension, or uses only one known dimension." } },
      { mistakeType: "arithmetic_error_in_multiplication", description: { ms: "Murid kenal pasti ketiga-tiga dimensi dengan betul tetapi tersilap kira semasa mendarab.", en: "The student correctly identifies all three dimensions but makes an arithmetic slip while multiplying." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "volume_cuboid", config: { min: 2, max: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "volume_cuboid", config: { min: 2, max: 8 } },
      { type: "word_problem", difficulty: 2, generatorKey: "volume_cuboid", config: { min: 2, max: 8, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "volume_cuboid", config: { min: 2, max: 10, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "volume_cuboid", config: { min: 2, max: 8, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "volume_cuboid", config: { min: 1, max: 4, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000080": {
    id: "a1000000-0000-0000-0000-000000000080",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Isi Padu Bentuk Gubahan", en: "Volume of Composite Shapes" },
    yearLevel: 5,
    explanation: {
      ms: "Bentuk gubahan tiga dimensi ialah bentuk pepejal yang dibina daripada dua atau lebih kuboid yang digabungkan. Untuk mencari jumlah isi padu, kita kira isi padu SETIAP kuboid secara berasingan (panjang × lebar × tinggi), kemudian tambahkan kesemuanya.\n\nContoh harian: Sebuah bangunan berbentuk 'L' dibina daripada dua blok kuboid. Berapakah jumlah isi padu bangunan itu?",
      en: "A 3D composite shape is a solid built by combining two or more cuboids. To find the total volume, we calculate EACH cuboid's volume separately (length × width × height), then add them all together.\n\nEveryday example: An L-shaped building is made of two cuboid blocks. What is the total volume of the building?",
    },
    tips: [
      { ms: "Kira isi padu SETIAP kuboid secara berasingan dahulu — jangan cuba gabungkan semua nombor dalam satu langkah.", en: "Work out EACH cuboid's volume separately first — don't try to combine all the numbers in one step." },
      { ms: "Ingat isi padu perlukan KETIGA-TIGA dimensi bagi setiap kuboid, bukan hanya dua seperti luas.", en: "Remember volume needs ALL THREE dimensions for each cuboid, not just two like area." },
      {
        ms: "JANGAN buat ini: kira isi padu Kuboid A sebagai 4×3=12 (guna dua dimensi sahaja, seperti luas). SALAH — anda MESTI darab KETIGA-TIGA dimensi (panjang×lebar×tinggi = 4×3×2=24). Jawapan yang betul bagi Kuboid A ialah 24 cm³.",
        en: "DON'T do this: calculate Cuboid A's volume as 4×3=12 (using only two dimensions, like area). WRONG — you MUST multiply ALL THREE dimensions (length×width×height = 4×3×2=24). The correct answer for Cuboid A is 24 cm³.",
      },
    ],
    howTo: [
      { ms: "Bahagikan bentuk gubahan itu kepada dua atau lebih kuboid.", en: "Split the composite shape into two or more cuboids." },
      { ms: "Kira isi padu setiap kuboid secara berasingan (panjang × lebar × tinggi).", en: "Calculate each cuboid's volume separately (length × width × height)." },
      { ms: "Tambahkan semua isi padu itu untuk dapatkan jumlah keseluruhan.", en: "Add all those volumes together to get the total." },
      { ms: "Semak: pastikan anda darab tiga nombor bagi setiap kuboid, bukan dua.", en: "Check: make sure you multiplied three numbers for each cuboid, not two." },
    ],
    workedExample: {
      problem: { ms: "Kuboid A: 4 cm × 3 cm × 2 cm, Kuboid B: 3 cm × 2 cm × 2 cm", en: "Cuboid A: 4 cm × 3 cm × 2 cm, Cuboid B: 3 cm × 2 cm × 2 cm" },
      steps: [
        { ms: "Isi padu A = 4 × 3 × 2 = 24 cm³", en: "Volume A = 4 × 3 × 2 = 24 cm³" },
        { ms: "Isi padu B = 3 × 2 × 2 = 12 cm³", en: "Volume B = 3 × 2 × 2 = 12 cm³" },
        { ms: "Jumlah = 24 + 12 = 36 cm³", en: "Total = 24 + 12 = 36 cm³" },
      ],
      answer: "36 cm³",
    },
    commonMistakes: [
      { mistakeType: "forgot_second_cuboid", description: { ms: "Murid hanya mengira isi padu satu kuboid sahaja.", en: "The student only calculates the volume of one cuboid." } },
      { mistakeType: "volume_addition_error", description: { ms: "Murid darabkan hanya dua dimensi setiap kuboid (seperti luas) berbanding ketiga-tiga.", en: "The student multiplies only two dimensions per cuboid (like area) instead of all three." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari dimensi yang hilang (diberi jumlah isi padu), murid tolak isi padu A daripada jumlah tetapi terlupa bahagikan dengan dua dimensi Kuboid B yang diketahui.", en: "When finding a missing dimension (given the total volume), the student subtracts Cuboid A's volume from the total but forgets to divide by Cuboid B's two known dimensions." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak anggarkan jumlah isi padu dahulu, jadi tidak perasan jawapan akhir tidak munasabah (contohnya lebih kecil daripada salah satu isi padu komponen).", en: "The student doesn't estimate the total volume first, so doesn't notice when the final answer doesn't make sense (e.g. smaller than one of the component volumes)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "volume_composite", config: { min: 2, max: 8 } },
      { type: "fill", difficulty: 3, generatorKey: "volume_composite", config: { min: 2, max: 6 } },
      { type: "word_problem", difficulty: 3, generatorKey: "volume_composite", config: { min: 2, max: 6, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "volume_composite", config: { min: 2, max: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "volume_composite", config: { min: 2, max: 6, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "volume_composite", config: { min: 2, max: 5, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000081": {
    id: "a1000000-0000-0000-0000-000000000081",
    strand: { ms: "Ruang", en: "Space" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Perimeter Bentuk Gubahan", en: "Perimeter of Composite Shapes" },
    yearLevel: 5,
    explanation: {
      ms: "Bentuk gubahan berbentuk 'L' terbentuk daripada segi empat tepat besar dengan satu petak kecil dipotong daripada penjuru. Fakta penting: memotong petak kecil itu TIDAK mengubah perimeter keseluruhan! Ini kerana bahagian sisi yang hilang digantikan oleh panjang yang sama pada sisi baharu di dalam. Jadi, perimeter bentuk-L = perimeter segi empat tepat ASAL (sebelum dipotong) = 2 × (panjang + lebar).\n\nContoh harian: Sebuah taman berbentuk 'L' dibentuk daripada segi empat tepat 10 m × 6 m dengan petak 4 m × 3 m dipotong daripada satu penjuru. Perimeter taman itu = 2 × (10 + 6) = 32 m — saiz petak yang dipotong tidak penting!",
      en: "An L-shaped composite shape is formed from a large rectangle with a small notch cut from one corner. Key fact: cutting that notch does NOT change the overall perimeter! This is because the side length that's removed is replaced by an equal length on a new inner side. So the L-shape's perimeter = the perimeter of the ORIGINAL rectangle (before cutting) = 2 × (length + width).\n\nEveryday example: An L-shaped garden is formed from a 10 m × 6 m rectangle with a 4 m × 3 m notch cut from one corner. The garden's perimeter = 2 × (10 + 6) = 32 m — the size of the cut-out notch doesn't matter!",
    },
    tips: [
      { ms: "Jangan tertipu oleh saiz petak yang dipotong — ia TIDAK mengubah perimeter keseluruhan.", en: "Don't be fooled by the size of the cut-out notch — it does NOT change the overall perimeter." },
      { ms: "Guna sahaja dimensi segi empat tepat BESAR (keseluruhan) untuk kira perimeter, abaikan petak kecil.", en: "Just use the LARGE (overall) rectangle's dimensions to calculate the perimeter — ignore the small notch." },
      {
        ms: "JANGAN buat ini: perimeter bentuk-L dikira sebagai perimeter segi empat tepat besar TOLAK perimeter petak yang dipotong (32 − 14 = 18 m). SALAH — memotong petak itu TIDAK mengurangkan perimeter langsung. Jawapan yang betul kekal 32 m.",
        en: "DON'T do this: the L-shape's perimeter calculated as the big rectangle's perimeter MINUS the cut-out notch's perimeter (32 − 14 = 18 m). WRONG — cutting the notch does NOT reduce the perimeter at all. The correct answer stays 32 m.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti dimensi segi empat tepat BESAR (keseluruhan) — panjang dan lebar.", en: "Identify the LARGE (overall) rectangle's dimensions — length and width." },
      { ms: "Kira perimeter menggunakan formula biasa: 2 × (panjang + lebar). Abaikan petak kecil yang dipotong.", en: "Calculate the perimeter using the normal formula: 2 × (length + width). Ignore the small cut-out notch." },
      { ms: "Semak: perimeter bentuk-L mesti SAMA dengan perimeter segi empat tepat asal, tidak kira saiz petak yang dipotong.", en: "Check: the L-shape's perimeter should be EQUAL to the original rectangle's perimeter, regardless of the notch's size." },
    ],
    workedExample: {
      problem: { ms: "Segi empat tepat 10 m × 6 m dengan petak 4 m × 3 m dipotong daripada satu penjuru. Cari perimeter bentuk-L.", en: "Rectangle 10 m × 6 m with a 4 m × 3 m section cut from one corner. Find the perimeter of the L-shape." },
      steps: [
        { ms: "Perimeter bentuk-L = perimeter segi empat tepat ASAL", en: "The L-shape's perimeter = the ORIGINAL rectangle's perimeter" },
        { ms: "2 × (10 + 6) = 32 m", en: "2 × (10 + 6) = 32 m" },
      ],
      answer: "32 m",
    },
    commonMistakes: [
      { mistakeType: "notch_assumed_to_reduce_perimeter", description: { ms: "Murid anggap memotong petak itu mengurangkan perimeter, lalu menolak perimeter petak kecil itu.", en: "The student assumes cutting the notch reduces the perimeter, and subtracts the notch's perimeter." } },
      { mistakeType: "found_area_not_perimeter", description: { ms: "Murid kira LUAS bentuk-L berbanding perimeter.", en: "The student calculates the L-shape's AREA instead of its perimeter." } },
      { mistakeType: "calculation_error", description: { ms: "Semasa cari dimensi yang hilang (diberi perimeter), murid tersilap semasa bahagi perimeter dengan 2 atau tolak dimensi yang diketahui.", en: "When finding a missing dimension (given the perimeter), the student makes an error dividing the perimeter by 2 or subtracting the known dimension." } },
      { mistakeType: "estimation_mismatch", description: { ms: "Murid tidak semak sama ada perimeter bentuk-L munasabah berbanding perimeter segi empat tepat besar, jadi tidak perasan jawapan mereka jauh berbeza.", en: "The student doesn't check whether the L-shape's perimeter is reasonable compared to the big rectangle's, so doesn't notice their answer is way off." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "perimeter_composite", config: { min: 6, max: 20 } },
      { type: "fill", difficulty: 3, generatorKey: "perimeter_composite", config: { min: 8, max: 25 } },
      { type: "word_problem", difficulty: 3, generatorKey: "perimeter_composite", config: { min: 8, max: 25, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "perimeter_composite", config: { min: 8, max: 25, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "perimeter_composite", config: { min: 8, max: 20, reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "perimeter_composite", config: { min: 8, max: 16, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000082": {
    id: "a1000000-0000-0000-0000-000000000082",
    strand: { ms: "Koordinat", en: "Coordinates" },
    bidang: BIDANG.relationshipAlgebra,
    title: { ms: "Membaca Koordinat", en: "Reading Coordinates" },
    yearLevel: 4,
    explanation: {
      ms: "Setiap titik pada grid mempunyai koordinat (x, y) — nombor x menunjukkan berapa banyak ke KANAN, dan nombor y menunjukkan berapa banyak ke ATAS daripada asalan (0, 0).\n\nContoh harian: Sebuah titik terletak 3 petak ke kanan dan 2 petak ke atas daripada asalan. Koordinatnya ialah (3, 2).",
      en: "Every point on a grid has coordinates (x, y) — the x number shows how far RIGHT, and the y number shows how far UP from the origin (0, 0).\n\nEveryday example: A point sits 3 squares to the right and 2 squares up from the origin. Its coordinates are (3, 2).",
    },
    tips: [
      { ms: "Baca ATAS PANJANG (x) dahulu, kemudian NAIK (y). Susunan itu penting!", en: "Read ACROSS (x) first, then UP (y). The order matters!" },
      { ms: "Mulakan mengira daripada asalan (0, 0), bukan daripada tepi grid.", en: "Start counting from the origin (0, 0), not from the edge of the grid." },
      {
        ms: "JANGAN buat ini: titik yang 3 petak ke kanan dan 2 petak ke atas ditulis sebagai (2, 3). SALAH — nombor ATAS PANJANG (x) MESTI ditulis dahulu. Jawapan yang betul ialah (3, 2).",
        en: "DON'T do this: a point that is 3 squares right and 2 squares up written as (2, 3). WRONG — the ACROSS number (x) MUST be written first. The correct answer is (3, 2).",
      },
    ],
    howTo: [
      { ms: "Kira berapa petak ke kanan daripada asalan — itulah nombor x.", en: "Count how many squares right from the origin — that's the x number." },
      { ms: "Kira berapa petak ke atas daripada asalan — itulah nombor y.", en: "Count how many squares up from the origin — that's the y number." },
      { ms: "Tuliskan sebagai (x, y).", en: "Write it as (x, y)." },
      { ms: "Semak: adakah nombor pertama yang anda tulis untuk pergerakan ATAS PANJANG (kanan), bukan NAIK (atas)?", en: "Check: is the first number you wrote for the ACROSS (right) movement, not the UP movement?" },
    ],
    workedExample: {
      problem: { ms: "Sebuah titik terletak 3 petak ke kanan dan 2 petak ke atas daripada asalan.", en: "A point is located 3 squares right and 2 squares up from the origin." },
      steps: [
        { ms: "Ke kanan 3 petak → x = 3", en: "3 squares right → x = 3" },
        { ms: "Ke atas 2 petak → y = 2", en: "2 squares up → y = 2" },
      ],
      answer: "(3, 2)",
      diagram: { kind: "coordinate_grid", x: 3, y: 2, gridSize: 6 },
    },
    commonMistakes: [
      { mistakeType: "swapped_x_and_y", description: { ms: "Murid baca NAIK (y) dahulu, kemudian ATAS PANJANG (x), menyebabkan koordinat tertukar.", en: "The student reads UP (y) first, then ACROSS (x), swapping the coordinates." } },
      { mistakeType: "miscounted_squares", description: { ms: "Murid tersilap kira bilangan petak, biasanya terlepas atau kira dua kali garisan grid.", en: "The student miscounts the number of squares, usually skipping or double-counting a grid line." } },
      { mistakeType: "started_from_wrong_point", description: { ms: "Murid mula mengira daripada tepi grid atau titik lain, bukan daripada asalan (0, 0).", en: "The student starts counting from the edge of the grid or another point, not from the origin (0, 0)." } },
      { mistakeType: "confused_axis_direction", description: { ms: "Murid keliru arah paksi-x (mendatar) dengan paksi-y (menegak).", en: "The student confuses the direction of the x-axis (horizontal) with the y-axis (vertical)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "coordinates", config: { gridSize: 6 } },
      { type: "fill", difficulty: 2, generatorKey: "coordinates", config: { gridSize: 6 } },
      { type: "word_problem", difficulty: 2, generatorKey: "coordinates", config: { gridSize: 6, type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "coordinates", config: { gridSize: 6, errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "coordinates", config: { gridSize: 6, challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000083": {
    id: "a1000000-0000-0000-0000-000000000083",
    strand: { ms: "Nisbah", en: "Ratio" },
    bidang: BIDANG.relationshipAlgebra,
    title: { ms: "Nisbah", en: "Ratio" },
    yearLevel: 4,
    explanation: {
      ms: "Cikgu Nurul mengatur murid dalam bilik darjah: bagi setiap 1 orang guru, terdapat 10 orang murid. Bagaimanakah kita tuliskan hubungan ini sebagai nisbah?\n\nNisbah membandingkan dua kuantiti. Pada Tahun 4, kita menulis nisbah dalam bentuk 1:n — iaitu \"bagi setiap 1 [benda A], terdapat n [benda B]\". Contoh: bagi setiap 1 guru, terdapat 10 murid, jadi nisbah guru kepada murid ialah 1:10.",
      en: "Cikgu Nurul arranges the classroom: for every 1 teacher, there are 10 students. How do we write this relationship as a ratio?\n\nA ratio compares two quantities. In Year 4, we write ratios in the form 1:n — meaning \"for every 1 [item A], there are n [item B]\". Example: for every 1 teacher, there are 10 students, so the ratio of teachers to students is 1:10.",
    },
    tips: [
      { ms: "Ingat: SATU dahulu, SELALU! Bahagian pertama nisbah pada Tahun 4 sentiasa bermula dengan 1.", en: "Remember: ONE first, ALWAYS! The first part of the ratio in Year 4 always starts with 1." },
      { ms: "JANGAN buat ini: menulis nisbah sebagai n:1 (contohnya 10:1) apabila soalan bermula dengan \"bagi setiap 1 guru\". SALAH — susunan mesti ikut ayat soalan; \"guru kepada murid\" bermaksud guru (1) ditulis dahulu: 1:10.", en: "DON'T do this: writing the ratio as n:1 (e.g. 10:1) when the question starts with \"for every 1 teacher\". WRONG — the order must follow the sentence; \"teachers to students\" means teachers (1) is written first: 1:10." },
      { ms: "Petua pantas: cari perkataan \"bagi setiap 1\" — nombor selepasnya terus jadi bahagian kedua nisbah (1:n).", en: "Quick trick: look for the phrase \"for every 1\" — the number right after it becomes the second part of the ratio (1:n)." },
    ],
    howTo: [
      { ms: "Kenal pasti dua kuantiti yang dibandingkan.", en: "Identify the two quantities being compared." },
      { ms: "Cari nombor yang bersamaan dengan \"1\" dalam ayat soalan (contohnya \"bagi setiap 1 guru\").", en: "Find the number that goes with \"1\" in the question (e.g. \"for every 1 teacher\")." },
      { ms: "Cari nombor kedua yang berkaitan (contohnya \"10 murid\").", en: "Find the second related number (e.g. \"10 students\")." },
      { ms: "Tuliskan sebagai nisbah 1:n, mengikut susunan yang disebut dalam soalan.", en: "Write it as the ratio 1:n, following the order stated in the question." },
      { ms: "Semak: bahagian pertama nisbah anda mesti 1, bukan nombor lain.", en: "Check: the first part of your ratio must be 1, not any other number." },
    ],
    workedExample: {
      problem: { ms: "Bagi setiap 1 guru, terdapat 10 murid. Tuliskan nisbah guru kepada murid.", en: "For every 1 teacher, there are 10 students. Write the ratio of teachers to students." },
      steps: [
        { ms: "Kenal pasti kuantiti: guru dan murid.", en: "Identify the quantities: teachers and students." },
        { ms: "Cari nombor bersama \"1\": 1 guru.", en: "Find the number with \"1\": 1 teacher." },
        { ms: "Cari nombor kedua: 10 murid.", en: "Find the second number: 10 students." },
        { ms: "Tuliskan nisbah guru kepada murid = 1:10", en: "Write the ratio of teachers to students = 1:10" },
        { ms: "Semak: bahagian pertama ialah 1 ✓, susunan ikut soalan (guru dahulu) ✓", en: "Check: the first part is 1 ✓, order follows the question (teachers first) ✓" },
      ],
      answer: "1:10",
    },
    commonMistakes: [
      { mistakeType: "special_case_error", description: { ms: "Murid menulis nisbah sebagai n:1 (contohnya 10:1) bukan 1:n, terbalik daripada susunan yang ditetapkan pada Tahun 4.", en: "Student writes the ratio as n:1 (e.g. 10:1) instead of 1:n, reversed from the order fixed at Year 4 level." } },
      { mistakeType: "wrong_operation", description: { ms: "Murid menambah kedua-dua nombor (contohnya 1 + 10 = 11:1) bukan membandingkannya sebagai nisbah.", en: "Student adds the two numbers together (e.g. 1 + 10 = 11:1) instead of comparing them as a ratio." } },
      { mistakeType: "place_value_error", description: { ms: "Untuk nisbah skala seperti 1:100 atau 1:1000, murid tertinggal atau menambah sifar, menyebabkan magnitud nisbah tersasar (contohnya 1:100 ditulis sebagai 1:10).", en: "For scale ratios like 1:100 or 1:1000, student drops or adds a zero, throwing off the ratio's magnitude (e.g. 1:100 written as 1:10)." } },
      { mistakeType: "keyword_only_classification", description: { ms: "Murid tidak mengenal pasti kuantiti mana yang bersamaan dengan \"1\" dalam ayat, lalu menulis nombor yang salah pada bahagian pertama nisbah.", en: "Student fails to identify which quantity matches \"1\" in the sentence, writing the wrong number in the first part of the ratio." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "write_ratio", config: {} },
      { type: "mcq", difficulty: 1, generatorKey: "write_ratio", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "write_ratio", config: { wordProblem: true } },
      { type: "mcq", difficulty: 3, generatorKey: "write_ratio", config: { scale: true } },
      { type: "mcq", difficulty: 3, generatorKey: "write_ratio", config: { errorSpotting: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000084": {
    id: "a1000000-0000-0000-0000-000000000084",
    strand: { ms: "Nisbah", en: "Ratio" },
    bidang: BIDANG.relationshipAlgebra,
    title: { ms: "Kadaran", en: "Proportion" },
    yearLevel: 4,
    explanation: {
      ms: "Kadaran ialah cara untuk cari kuantiti baharu apabila kita tahu kadar (harga bagi satu unit). Cari harga SATU item dahulu (kaedah unit), kemudian darabkan dengan kuantiti yang ditanya.\n\nContoh harian: 2 batang pensel berharga RM4. Berapakah harga 5 batang pensel? Harga satu pensel = RM4 ÷ 2 = RM2. Harga 5 pensel = RM2 × 5 = RM10.",
      en: "Proportion is a way to find a new quantity when we know a rate (the price for one unit). Find the price of ONE item first (the unitary method), then multiply by the quantity being asked about.\n\nEveryday example: 2 pencils cost RM4. How much do 5 pencils cost? Price of one pencil = RM4 ÷ 2 = RM2. Price of 5 pencils = RM2 × 5 = RM10.",
    },
    tips: [
      { ms: "SENTIASA cari harga SATU item dahulu sebelum mengira kuantiti lain.", en: "ALWAYS find the price of ONE item first before working out a different quantity." },
      { ms: "Jangan terus darabkan harga kumpulan dengan kuantiti baharu — itu akan memberi jawapan yang terlalu besar.", en: "Don't just multiply the group price by the new quantity directly — that gives an answer that's far too big." },
      {
        ms: "JANGAN buat ini: 2 pensel = RM4, berapa harga 5 pensel? Dikira sebagai RM4 × 5 = RM20. SALAH — RM4 itu harga UNTUK 2 batang, bukan untuk SATU batang. Cari harga satu dahulu: RM4 ÷ 2 = RM2, jadi 5 batang = RM2 × 5 = RM10.",
        en: "DON'T do this: 2 pencils = RM4, what's the price of 5 pencils? Calculated as RM4 × 5 = RM20. WRONG — RM4 is the price FOR 2 pencils, not for ONE. Find the one-item price first: RM4 ÷ 2 = RM2, so 5 pencils = RM2 × 5 = RM10.",
      },
    ],
    howTo: [
      { ms: "Bahagikan harga kumpulan dengan kuantiti asal untuk cari harga SATU item.", en: "Divide the group price by the original quantity to find the price of ONE item." },
      { ms: "Darabkan harga satu item itu dengan kuantiti baharu yang ditanya.", en: "Multiply that one-item price by the new quantity being asked about." },
      { ms: "Semak: adakah anda cari harga SATU item dahulu, sebelum darab?", en: "Check: did you find the price of ONE item first, before multiplying?" },
    ],
    workedExample: {
      problem: { ms: "2 batang pensel berharga RM4. Berapakah harga 5 batang pensel?", en: "2 pencils cost RM4. What is the price of 5 pencils?" },
      steps: [
        { ms: "Harga satu pensel = RM4 ÷ 2 = RM2", en: "Price of one pencil = RM4 ÷ 2 = RM2" },
        { ms: "Harga 5 pensel = RM2 × 5 = RM10", en: "Price of 5 pencils = RM2 × 5 = RM10" },
      ],
      answer: "RM10",
    },
    commonMistakes: [
      { mistakeType: "skipped_unit_step", description: { ms: "Murid terus darabkan harga kumpulan asal dengan kuantiti baharu, tanpa cari harga satu item dahulu.", en: "The student directly multiplies the original group price by the new quantity, without finding the one-item price first." } },
      { mistakeType: "added_instead_of_scaled", description: { ms: "Murid tambah beza kuantiti kepada harga kumpulan berbanding mengira secara berkadar.", en: "The student adds the quantity difference to the group price instead of scaling proportionally." } },
      { mistakeType: "divided_by_wrong_quantity", description: { ms: "Murid bahagikan harga kumpulan dengan kuantiti BAHARU berbanding kuantiti ASAL semasa cari harga satu item.", en: "The student divides the group price by the NEW quantity instead of the ORIGINAL quantity when finding the one-item price." } },
      { mistakeType: "arithmetic_error_in_step", description: { ms: "Murid ikut kaedah unit yang betul tetapi tersilap kira semasa membahagi atau mendarab.", en: "The student follows the correct unitary method but makes an arithmetic slip while dividing or multiplying." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "unitary_proportion", config: {} },
      { type: "fill", difficulty: 2, generatorKey: "unitary_proportion", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "unitary_proportion", config: { type: "word_problem" } },
      { type: "mcq", difficulty: 3, generatorKey: "unitary_proportion", config: { errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unitary_proportion", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "unitary_proportion", config: { challenge: true } },
    ],
  },
  "a1000000-0000-0000-0000-000000000085": {
    id: "a1000000-0000-0000-0000-000000000085",
    strand: { ms: "Masa dan Waktu", en: "Time" },
    bidang: BIDANG.measurementGeometry,
    title: { ms: "Format 12 Jam dan 24 Jam", en: "12-Hour and 24-Hour Time" },
    yearLevel: 5,
    explanation: {
      ms: "Format 24 jam digunakan dalam jadual bas, keretapi, dan penerbangan supaya tiada kekeliruan antara pagi dan petang. Ia menggunakan 4 digit (0000-2359), tanpa a.m./p.m.\n\nPeraturan asas: 12 tengah malam = 0000, 12 tengah hari = 1200. Untuk waktu petang/malam (selepas 12 tengah hari, bukan 12 tengah hari itu sendiri), tambah 12 pada jamnya.\n\nContoh harian: Jadual bas sekolah menunjukkan bas ke Ipoh bertolak pada 1445. Pukul berapakah ini dalam format 12 jam?",
      en: "24-hour format is used on bus, train, and flight timetables so there's no confusion between morning and evening. It uses 4 digits (0000-2359), no a.m./p.m.\n\nBase rule: 12 midnight = 0000, 12 noon = 1200. For afternoon/evening times (after noon, not noon itself), add 12 to the hour.\n\nEveryday example: the school bus timetable shows the Ipoh bus departs at 1445. What time is that in 12-hour format?",
    },
    tips: [
      { ms: "Petang tambah dua-belas, pagi kekal — kecuali tengah malam jadi kosong-kosong!", en: "Afternoon add twelve, morning stays the same — except midnight becomes zero-zero!" },
      { ms: "JANGAN buat ini: 12:30 t.hari → 0030. SALAH — 12 t.hari ialah 1200, bukan 0000. 12 tengah malam pula ialah 0000, bukan 1200.", en: "DON'T do this: 12:30 p.m. → 0030. WRONG — 12 noon is 1200, not 0000. 12 midnight is 0000, not 1200." },
      { ms: "Untuk tukar 24 jam ke 12 jam: jika jam melebihi 12, tolak 12 dan letak 'petang'.", en: "To convert 24-hour to 12-hour: if the hour is above 12, subtract 12 and label it 'p.m.'" },
    ],
    howTo: [
      { ms: "Kenal pasti sama ada waktu itu pagi (a.m.) atau petang/malam (p.m.).", en: "Identify whether the time is a.m. or p.m." },
      { ms: "Jika p.m. dan bukan 12 tengah hari, tambah 12 pada jam.", en: "If it's p.m. and not 12 noon, add 12 to the hour." },
      { ms: "Kes khas: 12 tengah malam → 0000. 12 tengah hari → kekal 1200.", en: "Special cases: 12 midnight → 0000. 12 noon → stays 1200." },
      { ms: "Tulis dalam 4 digit, minit dikekalkan sama.", en: "Write as 4 digits, minutes stay the same." },
      { ms: "Semak: waktu selepas 1200 sepatutnya jatuh pada petang/malam sahaja.", en: "Check: any time after 1200 should only fall in the afternoon/evening." },
    ],
    workedExample: {
      problem: { ms: "Tukar 2:45 petang kepada format 24 jam", en: "Convert 2:45 pm to 24-hour format" },
      steps: [
        { ms: "2:45 petang ialah p.m. dan bukan 12 tengah hari.", en: "2:45 p.m. is p.m. and not 12 noon." },
        { ms: "Tambah 12 pada jam: 2 + 12 = 14", en: "Add 12 to the hour: 2 + 12 = 14" },
        { ms: "Minit kekal 45.", en: "Minutes stay 45." },
        { ms: "Jawapan: 1445", en: "Answer: 1445" },
      ],
      answer: "1445",
    },
    commonMistakes: [
      { mistakeType: "noon_midnight_confusion", description: { ms: "Murid menganggap 12 t.hari = 0000 dan 12 tgh malam = 1200 (bertukar).", en: "Student swaps 12 noon (thinks it's 0000) with 12 midnight (thinks it's 1200)." } },
      { mistakeType: "added_12_to_am", description: { ms: "Murid menambah 12 walaupun waktu itu pagi (a.m.).", en: "Student adds 12 even though the time is a.m." } },
      { mistakeType: "forgot_leading_zero", description: { ms: "Murid menulis 145 bukan 0145 untuk 1:45 pagi.", en: "Student writes 145 instead of 0145 for 1:45 a.m." } },
      { mistakeType: "subtracted_instead_of_added", description: { ms: "Semasa tukar 12 jam ke 24 jam, murid menolak 12 bukan menambah.", en: "Converting 12-hour to 24-hour, student subtracts 12 instead of adding." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "time_format_convert", config: { direction: "to24", excludeNoonMidnight: true } },
      { type: "fill", difficulty: 2, generatorKey: "time_format_convert", config: { direction: "to24", includeNoonMidnight: true } },
      { type: "fill", difficulty: 2, generatorKey: "time_format_convert", config: { direction: "to12" } },
      { type: "word_problem", difficulty: 2, generatorKey: "time_format_convert", config: { direction: "to24", context: "bus_schedule", extraInfoChance: 0.3 } },
      { type: "mcq", difficulty: 3, generatorKey: "time_format_convert", config: { direction: "to24", errorSpotting: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_format_convert", config: { reverseProblem: true } },
      { type: "word_problem", difficulty: 3, generatorKey: "time_format_convert", config: { challenge: true } },
    ],
  },
};
