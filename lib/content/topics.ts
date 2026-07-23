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

export interface TopicContent {
  id: string;
  strand: Bilingual;
  title: Bilingual;
  yearLevel: number;
  explanation: Bilingual;
  /** Short standalone reminders/shortcuts — shown as a bulleted list. */
  tips: Bilingual[];
  /** General, number-free method steps ("how to solve this type of question") —
   * distinct from workedExample, which walks one specific set of numbers. */
  howTo: Bilingual[];
  workedExample: { problem: string; steps: Bilingual[]; answer: string | number };
  commonMistakes: { mistakeType: string; description: Bilingual }[];
  questionTemplates: { type: "mcq" | "fill" | "word_problem"; difficulty: number; generatorKey: string; config: Record<string, unknown> }[];
}

export const TOPICS: Record<string, TopicContent> = {
  "a1000000-0000-0000-0000-000000000001": {
    id: "a1000000-0000-0000-0000-000000000001",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor menegak, ikut nilai tempat (sa di bawah sa, puluh di bawah puluh, dan seterusnya).", en: "Line the two numbers up vertically, matching place value (ones under ones, tens under tens, and so on)." },
      { ms: "Tambah lajur sa (paling kanan) dahulu.", en: "Add the ones column (rightmost) first." },
      { ms: "Jika jumlah lajur itu 10 atau lebih, tulis digit sa dan \"simpan\" 1 ke lajur sebelah kiri.", en: "If that column's total is 10 or more, write down the ones digit and \"carry\" the 1 to the column on the left." },
      { ms: "Ulang proses ini bagi setiap lajur sehingga ke kiri sekali.", en: "Repeat this for every column, moving left, until you reach the last one." },
    ],
    workedExample: {
      problem: "32450 + 18600",
      steps: [
        { ms: "Susun ikut nilai tempat", en: "Line up by place value" },
        { ms: "0+0=0 (sa)", en: "0+0=0 (ones)" },
        { ms: "5+0=5 (puluh)", en: "5+0=5 (tens)" },
        { ms: "4+6=10, tulis 0 simpan 1 (ratus)", en: "4+6=10, write 0 carry 1 (hundreds)" },
        { ms: "2+8+1(simpan)=11, tulis 1 simpan 1 (ribu)", en: "2+8+1(carried)=11, write 1 carry 1 (thousands)" },
        { ms: "3+1+1(simpan)=5 (puluh ribu)", en: "3+1+1(carried)=5 (ten thousands)" },
      ],
      answer: 51050,
    },
    commonMistakes: [
      { mistakeType: "place_value_misalignment", description: { ms: "Murid tidak susun nombor ikut nilai tempat dengan betul.", en: "The student doesn't line up digits by the correct place value column." } },
      { mistakeType: "forgot_carry", description: { ms: "Murid terlupa \"simpan\" apabila jumlah lajur melebihi 9.", en: "The student forgets to \"carry\" when a column's total is more than 9." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_addition", config: { min: 15000, max: 45000 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_addition", config: { min: 25000, max: 50000 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000002": {
    id: "a1000000-0000-0000-0000-000000000002",
    strand: { ms: "Pecahan", en: "Fractions" },
    title: { ms: "Tambah Pecahan Penyebut Sama", en: "Adding Fractions with the Same Denominator" },
    yearLevel: 4,
    explanation: {
      ms: "Apabila penyebut (nombor bawah) dua pecahan adalah SAMA, kita hanya tambah pengangka (nombor atas) sahaja. Penyebut kekal sama.\n\nContoh: 2/5 + 1/5 = (2+1)/5 = 3/5. Bayangkan 5 keping pizza dipotong sama besar — kita ambil 2 keping, kemudian 1 keping lagi.",
      en: "When two fractions have the SAME denominator (bottom number), we only add the numerators (top numbers). The denominator stays the same.\n\nExample: 2/5 + 1/5 = (2+1)/5 = 3/5. Imagine a pizza cut into 5 equal slices — we take 2 slices, then 1 more slice.",
    },
    tips: [
      {
        ms: "Penyebut sama = kongsi saiz bahagian yang sama. Hanya nombor atas (pengangka) yang berubah.",
        en: "Same denominator = the pieces are the same size. Only the top number (numerator) changes.",
      },
      {
        ms: "Jika jawapan pengangka lebih besar daripada penyebut (cth. 9/8), itu ialah pecahan tak wajar — anda boleh tukarkannya kepada nombor bercampur.",
        en: "If the numerator ends up bigger than the denominator (e.g. 9/8), that's an improper fraction — you can convert it to a mixed number.",
      },
    ],
    howTo: [
      { ms: "Semak sama ada kedua-dua pecahan mempunyai penyebut yang sama.", en: "Check that both fractions have the same denominator." },
      { ms: "Tambahkan pengangka (nombor atas) sahaja.", en: "Add just the numerators (top numbers) together." },
      { ms: "Kekalkan penyebut (nombor bawah) tanpa diubah.", en: "Keep the denominator (bottom number) unchanged." },
      { ms: "Permudahkan pecahan itu jika boleh.", en: "Simplify the fraction if possible." },
    ],
    workedExample: {
      problem: "3/8 + 2/8",
      steps: [
        { ms: "Penyebut sama, kekalkan 8", en: "Same denominator, keep it as 8" },
        { ms: "Tambah pengangka: 3+2=5", en: "Add the numerators: 3+2=5" },
      ],
      answer: "5/8",
    },
    commonMistakes: [
      { mistakeType: "denominator_addition_error", description: { ms: "Murid turut menambah penyebut (2/5 + 1/5 dijawab 3/10).", en: "The student also adds the denominators (answers 2/5 + 1/5 as 3/10)." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "fractions_same_denominator", config: { denominators: [4, 5, 6, 8, 10, 12] } },
      { type: "fill", difficulty: 2, generatorKey: "fractions_same_denominator", config: { denominators: [8, 10, 12, 15, 16] } },
    ],
  },
  "a1000000-0000-0000-0000-000000000003": {
    id: "a1000000-0000-0000-0000-000000000003",
    strand: { ms: "Wang", en: "Money" },
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
    ],
    howTo: [
      { ms: "Kenal pasti Wang Dibayar dan Harga Barang.", en: "Identify the Money Paid and the Item Price." },
      { ms: "Tukar kedua-dua nilai kepada sen sepenuhnya.", en: "Convert both values fully into sen." },
      { ms: "Tolak: Wang Dibayar − Harga Barang.", en: "Subtract: Money Paid − Item Price." },
      { ms: "Tukar jawapan itu balik kepada format RM.", en: "Convert the answer back into RM format." },
    ],
    workedExample: {
      problem: "RM10.00 - RM6.30",
      steps: [
        { ms: "Tukar kepada sen: 1000 sen - 630 sen", en: "Convert to sen: 1000 sen - 630 sen" },
        { ms: "= 370 sen", en: "= 370 sen" },
        { ms: "Tukar balik: RM3.70", en: "Convert back: RM3.70" },
      ],
      answer: "RM3.70",
    },
    commonMistakes: [
      { mistakeType: "ringgit_sen_conversion_error", description: { ms: "Murid tersilap semasa menukar antara ringgit dan sen.", en: "The student makes an error converting between ringgit and sen." } },
      { mistakeType: "subtraction_borrow_error", description: { ms: "Murid tersilap semasa proses \"pinjam\" dalam penolakan berlajur.", en: "The student makes an error during the \"borrow\" step in column subtraction." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "money_change", config: { maxPaid: 20, maxPrice: 18 } },
      { type: "word_problem", difficulty: 2, generatorKey: "money_change", config: { maxPaid: 50, maxPrice: 48, context: "canteen" } },
    ],
  },
  "a1000000-0000-0000-0000-000000000004": {
    id: "a1000000-0000-0000-0000-000000000004",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
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
    ],
    howTo: [
      { ms: "Kenal pasti bentuk itu — segi empat tepat atau segi empat sama.", en: "Identify the shape — rectangle or square." },
      { ms: "Untuk segi empat tepat: tambah panjang dan lebar, kemudian darab jumlah itu dengan 2.", en: "For a rectangle: add the length and width, then multiply that total by 2." },
      { ms: "Untuk segi empat sama: darab panjang satu sisi dengan 4.", en: "For a square: multiply one side's length by 4." },
      { ms: "Sertakan unit ukuran (cm, m) dalam jawapan akhir.", en: "Include the unit of measurement (cm, m) in your final answer." },
    ],
    workedExample: {
      problem: "Segi empat tepat 8 cm × 5 cm",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "perimeter", config: { min: 3, max: 12 } },
      { type: "fill", difficulty: 2, generatorKey: "perimeter", config: { min: 8, max: 20 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000005": {
    id: "a1000000-0000-0000-0000-000000000005",
    strand: { ms: "Perpuluhan", en: "Decimals" },
    title: { ms: "Tambah & Tolak Perpuluhan", en: "Adding & Subtracting Decimals" },
    yearLevel: 5,
    explanation: {
      ms: "Apabila menambah atau menolak nombor perpuluhan, titik perpuluhan MESTI disusun lurus antara satu sama lain, sama seperti nilai tempat dalam nombor bulat.\n\nContoh harian: Siti membeli buku RM12.50 dan pensel RM3.20. Berapa jumlah perbelanjaannya?",
      en: "When adding or subtracting decimal numbers, the decimal points MUST line up with each other, just like place value does for whole numbers.\n\nEveryday example: Siti buys a book for RM12.50 and a pencil for RM3.20. How much did she spend in total?",
    },
    tips: [
      {
        ms: "Susun nombor secara menegak dengan titik perpuluhan segaris. Tambah sifar jika perlu supaya kedua-dua nombor ada bilangan digit selepas titik perpuluhan yang sama.",
        en: "Line the numbers up vertically with decimal points aligned. Add a zero if needed so both numbers have the same number of digits after the decimal point.",
      },
      {
        ms: "Selepas mengira, semak semula titik perpuluhan dalam jawapan anda berada di kedudukan yang betul, segaris dengan soalan.",
        en: "After calculating, double-check the decimal point in your answer is in the correct spot, lined up with the question.",
      },
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor menegak dengan titik perpuluhan segaris.", en: "Line up both numbers vertically with the decimal points aligned." },
      { ms: "Tambah sifar pada hujung nombor yang lebih pendek jika perlu.", en: "Add a trailing zero to the shorter number if needed." },
      { ms: "Tambah atau tolak seperti nombor bulat biasa, lajur demi lajur dari kanan.", en: "Add or subtract as with whole numbers, column by column from the right." },
      { ms: "Letakkan titik perpuluhan dalam jawapan pada kedudukan yang sama segaris.", en: "Place the decimal point in your answer in the same lined-up position." },
    ],
    workedExample: {
      problem: "12.50 + 3.20",
      steps: [
        { ms: "Susun titik perpuluhan segaris", en: "Line up the decimal points" },
        { ms: "50 + 20 = 70 (bahagian perpuluhan)", en: "50 + 20 = 70 (decimal part)" },
        { ms: "12 + 3 = 15 (bahagian bulat)", en: "12 + 3 = 15 (whole part)" },
      ],
      answer: "15.70",
    },
    commonMistakes: [
      { mistakeType: "decimal_point_misalignment", description: { ms: "Murid tidak menyusun titik perpuluhan segaris, menyebabkan nilai tempat tersalah.", en: "The student doesn't line up the decimal points, causing digits to be added at the wrong place value." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "decimal_add_subtract", config: { maxWhole: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "decimal_add_subtract", config: { maxWhole: 25 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000006": {
    id: "a1000000-0000-0000-0000-000000000006",
    strand: { ms: "Peratus", en: "Percentage" },
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
    ],
    howTo: [
      { ms: "Tukar peratus itu kepada pecahan per seratus (cth. 20% = 20/100).", en: "Convert the percentage into a fraction over 100 (e.g. 20% = 20/100)." },
      { ms: "Darabkan pecahan itu dengan kuantiti yang diberi.", en: "Multiply that fraction by the given quantity." },
      { ms: "Permudahkan pengiraan itu untuk dapatkan jawapan.", en: "Simplify the calculation to get the answer." },
    ],
    workedExample: {
      problem: "20% daripada 50",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "percentage_of_quantity", config: { percentages: [50, 25, 10] } },
      { type: "word_problem", difficulty: 2, generatorKey: "percentage_of_quantity", config: { percentages: [20, 75, 5] } },
    ],
  },
  "a1000000-0000-0000-0000-000000000007": {
    id: "a1000000-0000-0000-0000-000000000007",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    title: { ms: "Waktu dan Masa", en: "Time & Duration" },
    yearLevel: 5,
    explanation: {
      ms: "Untuk mengira waktu tamat, kita tambah tempoh masa kepada waktu mula. Ingat: 60 minit = 1 jam. Jika jumlah minit melebihi 60, tukar 60 minit itu kepada 1 jam.\n\nContoh harian: Kelas tuisyen Amin bermula pukul 2:30 petang dan berlangsung 90 minit. Pukul berapakah ia tamat?",
      en: "To find the end time, we add the duration to the start time. Remember: 60 minutes = 1 hour. If the total minutes go past 60, convert that 60 minutes into 1 hour.\n\nEveryday example: Amin's tuition class starts at 2:30 pm and lasts 90 minutes. What time does it end?",
    },
    tips: [
      {
        ms: "Pisahkan tempoh masa kepada jam dan minit dahulu (90 minit = 1 jam 30 minit), kemudian tambah secara berasingan.",
        en: "Split the duration into hours and minutes first (90 minutes = 1 hour 30 minutes), then add each part separately.",
      },
      {
        ms: "Jika jawapan minit anda melebihi 60, tukar setiap 60 minit itu kepada 1 jam tambahan.",
        en: "If your minutes total goes past 60, convert every 60 minutes into an extra hour.",
      },
    ],
    howTo: [
      { ms: "Tukar tempoh masa kepada jam dan minit berasingan.", en: "Convert the duration into separate hours and minutes." },
      { ms: "Tambah bilangan jam kepada waktu mula.", en: "Add the number of hours to the start time." },
      { ms: "Tambah bilangan minit yang selebihnya.", en: "Add the remaining number of minutes." },
      { ms: "Jika jumlah minit mencapai 60 atau lebih, tukar kepada 1 jam dan laraskan waktu.", en: "If the minutes reach 60 or more, convert into an extra hour and adjust the time." },
    ],
    workedExample: {
      problem: "2:30 + 90 minit",
      steps: [
        { ms: "90 minit = 1 jam 30 minit", en: "90 minutes = 1 hour 30 minutes" },
        { ms: "2:30 + 1 jam = 3:30", en: "2:30 + 1 hour = 3:30" },
        { ms: "3:30 + 30 minit = 4:00", en: "3:30 + 30 minutes = 4:00" },
      ],
      answer: "4:00",
    },
    commonMistakes: [
      { mistakeType: "time_carry_error", description: { ms: "Murid tidak menukar 60 minit kepada 1 jam apabila jumlah minit melebihi 60.", en: "The student doesn't convert 60 minutes into 1 hour when the total minutes exceed 60." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "time_duration", config: {} },
      { type: "fill", difficulty: 2, generatorKey: "time_duration", config: {} },
    ],
  },
  "a1000000-0000-0000-0000-000000000008": {
    id: "a1000000-0000-0000-0000-000000000008",
    strand: { ms: "Statistik", en: "Statistics" },
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
    ],
    howTo: [
      { ms: "Tambahkan semua nilai dalam set data itu.", en: "Add up all the values in the data set." },
      { ms: "Kira berapa banyak nilai yang ada.", en: "Count how many values there are." },
      { ms: "Bahagikan jumlah itu dengan bilangan nilai.", en: "Divide the total by the number of values." },
    ],
    workedExample: {
      problem: "70, 80, 75, 75",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "average", config: { count: 3, maxValue: 15 } },
      { type: "fill", difficulty: 2, generatorKey: "average", config: { count: 4, maxValue: 20 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000009": {
    id: "a1000000-0000-0000-0000-000000000009",
    strand: { ms: "Nisbah", en: "Ratio" },
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
    ],
    howTo: [
      { ms: "Cari faktor sepunya terbesar (HCF/GCD) bagi kedua-dua nombor dalam nisbah.", en: "Find the highest common factor (HCF/GCD) of both numbers in the ratio." },
      { ms: "Bahagikan kedua-dua nombor itu dengan faktor sepunya terbesar tersebut.", en: "Divide both numbers by that highest common factor." },
      { ms: "Semak sama ada nisbah itu sudah dalam bentuk paling ringkas.", en: "Check that the ratio is now in its simplest form." },
    ],
    workedExample: {
      problem: "12:18",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "simplify_ratio", config: { maxMultiplier: 4 } },
      { type: "fill", difficulty: 2, generatorKey: "simplify_ratio", config: { maxMultiplier: 6 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000010": {
    id: "a1000000-0000-0000-0000-000000000010",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
    title: { ms: "Isipadu Cecair", en: "Volume of Liquid" },
    yearLevel: 6,
    explanation: {
      ms: "Isipadu cecair diukur dalam liter (L) dan mililiter (ml). 1 liter = 1000 mililiter. Apabila menambah isipadu yang dinyatakan dalam L dan ml, tukar semuanya kepada ml dahulu.\n\nContoh harian: Sebuah balang mengandungi 1 L 250 ml jus. 300 ml jus lagi dituang masuk. Berapakah jumlah isipadu jus sekarang?",
      en: "Liquid volume is measured in litres (L) and millilitres (ml). 1 litre = 1000 millilitres. When adding volumes given in both L and ml, convert everything to ml first.\n\nEveryday example: A jug contains 1 L 250 ml of juice. Another 300 ml is poured in. What is the total volume of juice now?",
    },
    tips: [
      {
        ms: "Selalu tukar liter kepada ml dahulu (darab dengan 1000) sebelum membuat sebarang pengiraan.",
        en: "Always convert litres to ml first (multiply by 1000) before doing any calculation.",
      },
      {
        ms: "Selepas mengira dalam ml, tukar balik kepada L dan ml jika soalan meminta jawapan dalam format itu.",
        en: "After calculating in ml, convert back to L and ml if the question asks for the answer in that format.",
      },
    ],
    howTo: [
      { ms: "Tukar semua nilai liter kepada ml (darab dengan 1000).", en: "Convert every litre value to ml (multiply by 1000)." },
      { ms: "Tambah atau tolak nilai-nilai itu dalam ml.", en: "Add or subtract the values in ml." },
      { ms: "Tukar jawapan itu balik kepada L dan ml jika perlu.", en: "Convert the answer back into L and ml if needed." },
    ],
    workedExample: {
      problem: "1 L 250 ml + 300 ml",
      steps: [
        { ms: "1 L = 1000 ml", en: "1 L = 1000 ml" },
        { ms: "1000 ml + 250 ml = 1250 ml", en: "1000 ml + 250 ml = 1250 ml" },
        { ms: "1250 ml + 300 ml = 1550 ml", en: "1250 ml + 300 ml = 1550 ml" },
      ],
      answer: "1550 ml",
    },
    commonMistakes: [
      { mistakeType: "volume_conversion_error", description: { ms: "Murid tidak menukar liter kepada ml dengan betul sebelum menambah.", en: "The student doesn't correctly convert litres to ml before adding." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "volume", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "volume", config: {} },
    ],
  },
  "a1000000-0000-0000-0000-000000000011": {
    id: "a1000000-0000-0000-0000-000000000011",
    strand: { ms: "Ruang", en: "Space" },
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
    ],
    howTo: [
      { ms: "Kenal pasti panjang dan lebar bentuk itu.", en: "Identify the length and width of the shape." },
      { ms: "Darabkan panjang dengan lebar.", en: "Multiply the length by the width." },
      { ms: "Tulis jawapan dengan unit persegi yang betul (cm², m²).", en: "Write the answer with the correct squared unit (cm², m²)." },
    ],
    workedExample: {
      problem: "Segi empat tepat 7 cm × 4 cm",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "area_rectangle", config: { min: 3, max: 10 } },
      { type: "fill", difficulty: 2, generatorKey: "area_rectangle", config: { min: 5, max: 15 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000012": {
    id: "a1000000-0000-0000-0000-000000000012",
    strand: { ms: "Ruang", en: "Space" },
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
    ],
    howTo: [
      { ms: "Kenal pasti sudut yang diberi pada garis lurus itu.", en: "Identify the given angle on the straight line." },
      { ms: "Tolak sudut itu daripada 180°.", en: "Subtract that angle from 180°." },
      { ms: "Jawapan itu ialah sudut satu lagi.", en: "The result is the other angle." },
    ],
    workedExample: {
      problem: "Satu sudut ialah 65° pada garis lurus",
      steps: [
        { ms: "Jumlah sudut pada garis lurus = 180°", en: "Total of angles on a straight line = 180°" },
        { ms: "180° − 65° = 115°", en: "180° − 65° = 115°" },
      ],
      answer: "115°",
    },
    commonMistakes: [
      { mistakeType: "confused_with_complementary", description: { ms: "Murid tolak daripada 90° (sudut bersandar) berbanding 180°.", en: "The student subtracts from 90° (complementary angles) instead of 180°." } },
      { mistakeType: "no_operation_performed", description: { ms: "Murid menulis semula sudut yang diberi tanpa membuat sebarang pengiraan.", en: "The student just restates the given angle without performing any calculation." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "angles_straight_line", config: {} },
      { type: "fill", difficulty: 2, generatorKey: "angles_straight_line", config: {} },
    ],
  },
  "a1000000-0000-0000-0000-000000000013": {
    id: "a1000000-0000-0000-0000-000000000013",
    strand: { ms: "Ruang", en: "Space" },
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
    ],
    howTo: [
      { ms: "Bahagikan bentuk gubahan itu kepada dua atau lebih segi empat tepat.", en: "Split the composite shape into two or more rectangles." },
      { ms: "Kira luas setiap segi empat tepat secara berasingan (panjang × lebar).", en: "Calculate each rectangle's area separately (length × width)." },
      { ms: "Tambahkan semua luas itu untuk dapatkan jumlah keseluruhan.", en: "Add all those areas together to get the total." },
    ],
    workedExample: {
      problem: "Segi Empat Tepat A: 6 cm × 3 cm, Segi Empat Tepat B: 4 cm × 2 cm",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "area_composite", config: { min: 2, max: 8 } },
      { type: "word_problem", difficulty: 2, generatorKey: "area_composite", config: { min: 3, max: 10 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000014": {
    id: "a1000000-0000-0000-0000-000000000014",
    strand: { ms: "Ruang", en: "Space" },
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
    ],
    howTo: [
      { ms: "Kenal pasti kedua-dua sudut yang diberi dalam segi tiga itu.", en: "Identify the two given angles in the triangle." },
      { ms: "Tambahkan kedua-dua sudut itu bersama.", en: "Add those two angles together." },
      { ms: "Tolak jumlah itu daripada 180°.", en: "Subtract that total from 180°." },
    ],
    workedExample: {
      problem: "Dua sudut: 50° dan 60°",
      steps: [
        { ms: "Tambah dua sudut: 50° + 60° = 110°", en: "Add the two angles: 50° + 60° = 110°" },
        { ms: "180° − 110° = 70°", en: "180° − 110° = 70°" },
      ],
      answer: "70°",
    },
    commonMistakes: [
      { mistakeType: "confused_angle_sum_360", description: { ms: "Murid tolak daripada 360° (sudut pada satu titik) berbanding 180°.", en: "The student subtracts from 360° (angles at a point) instead of 180°." } },
      { mistakeType: "only_subtracted_one_angle", description: { ms: "Murid hanya tolak satu daripada dua sudut yang diberi.", en: "The student only subtracts one of the two given angles." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "angles_triangle_sum", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "angles_triangle_sum", config: {} },
    ],
  },
  "a1000000-0000-0000-0000-000000000015": {
    id: "a1000000-0000-0000-0000-000000000015",
    strand: { ms: "Ruang", en: "Space" },
    title: { ms: "Jenis-Jenis Sudut", en: "Types of Angles" },
    yearLevel: 4,
    explanation: {
      ms: "Sudut boleh dikelaskan mengikut saiznya:\n• Sudut Tirus (Acute) — kurang daripada 90°\n• Sudut Tegak (Right Angle) — tepat 90°\n• Sudut Cakah (Obtuse) — lebih daripada 90° tetapi kurang daripada 180°\n• Sudut Refleks (Reflex) — lebih daripada 180° tetapi kurang daripada 360°\n\nContoh harian: Bucu meja biasanya sudut tegak (90°). Bucu jam menunjukkan pelbagai jenis sudut bergantung pada waktu.",
      en: "Angles are classified by their size:\n• Acute — less than 90°\n• Right Angle — exactly 90°\n• Obtuse — more than 90° but less than 180°\n• Reflex — more than 180° but less than 360°\n\nEveryday example: The corner of a table is usually a right angle (90°). A clock's hands show different angle types depending on the time.",
    },
    tips: [
      {
        ms: "Bandingkan sudut dengan bucu segi empat sama (90°) — jika ia nampak lebih kecil, ia tirus; jika lebih besar tetapi masih 'tertutup', ia cakah; jika ia 'terbuka luas' melebihi separuh pusingan, ia refleks.",
        en: "Compare the angle to the corner of a square (90°) — if it looks smaller, it's acute; if bigger but still 'closed', it's obtuse; if it's opened wide past a half-turn, it's reflex.",
      },
      {
        ms: "Hafal turutan ini: Tirus < Tegak < Cakah < Refleks — saiznya sentiasa bertambah mengikut susunan itu.",
        en: "Memorize this order: Acute < Right < Obtuse < Reflex — the size always increases in that order.",
      },
    ],
    howTo: [
      { ms: "Anggarkan saiz sudut itu berbanding sudut tegak (90°).", en: "Estimate the angle's size compared to a right angle (90°)." },
      { ms: "Jika ia kurang daripada 90°, kelaskan sebagai Tirus.", en: "If it's less than 90°, classify it as Acute." },
      { ms: "Jika ia tepat 90°, kelaskan sebagai Tegak.", en: "If it's exactly 90°, classify it as Right." },
      { ms: "Jika ia antara 90° dan 180°, kelaskan sebagai Cakah; jika lebih daripada 180°, kelaskan sebagai Refleks.", en: "If it's between 90° and 180°, classify it as Obtuse; if it's more than 180°, classify it as Reflex." },
    ],
    workedExample: {
      problem: "Sudut 130°",
      steps: [
        { ms: "130° lebih besar daripada 90°", en: "130° is greater than 90°" },
        { ms: "130° kurang daripada 180°", en: "130° is less than 180°" },
        { ms: "Jadi ia adalah Sudut Cakah (Obtuse)", en: "So it is an Obtuse angle" },
      ],
      answer: "Sudut Cakah (Obtuse)",
    },
    commonMistakes: [
      { mistakeType: "confused_with_right_angle", description: { ms: "Murid memilih 'Sudut Tegak' walaupun sudut itu bukan tepat 90°.", en: "The student picks 'Right Angle' even though the angle isn't exactly 90°." } },
      { mistakeType: "missed_reflex_angle", description: { ms: "Murid tidak menyedari sudut refleks perlu melebihi 180°.", en: "The student doesn't recognize that a reflex angle must be greater than 180°." } },
    ],
    questionTemplates: [{ type: "mcq", difficulty: 1, generatorKey: "angles_classify", config: {} }],
  },
  "a1000000-0000-0000-0000-000000000016": {
    id: "a1000000-0000-0000-0000-000000000016",
    strand: { ms: "Ruang", en: "Space" },
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
    ],
    howTo: [
      { ms: "Kenal pasti tapak dan tinggi segi tiga itu.", en: "Identify the triangle's base and height." },
      { ms: "Darabkan tapak dengan tinggi.", en: "Multiply the base by the height." },
      { ms: "Bahagikan hasil darab itu dengan 2.", en: "Divide that product by 2." },
    ],
    workedExample: {
      problem: "Tapak 8 cm, tinggi 5 cm",
      steps: [
        { ms: "Luas = ½ × tapak × tinggi", en: "Area = ½ × base × height" },
        { ms: "= ½ × 8 × 5", en: "= ½ × 8 × 5" },
        { ms: "= ½ × 40", en: "= ½ × 40" },
        { ms: "= 20 cm²", en: "= 20 cm²" },
      ],
      answer: "20 cm²",
    },
    commonMistakes: [
      { mistakeType: "forgot_to_halve", description: { ms: "Murid mengira tapak × tinggi tanpa membahagikan dengan 2.", en: "The student calculates base × height without dividing by 2." } },
      { mistakeType: "halved_both_dimensions", description: { ms: "Murid membahagikan tapak dan tinggi dengan 2 secara berasingan sebelum mendarab.", en: "The student divides the base and height by 2 separately before multiplying." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "area_triangle", config: { min: 4, max: 16 } },
      { type: "word_problem", difficulty: 2, generatorKey: "area_triangle", config: { min: 6, max: 20 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000017": {
    id: "a1000000-0000-0000-0000-000000000017",
    strand: { ms: "Ruang", en: "Space" },
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
    ],
    howTo: [
      { ms: "Tambahkan semua sudut yang diketahui.", en: "Add up all the known angles." },
      { ms: "Tolak jumlah itu daripada 360°.", en: "Subtract that total from 360°." },
      { ms: "Jawapan itu ialah sudut yang hilang.", en: "The result is the missing angle." },
    ],
    workedExample: {
      problem: "Dua sudut: 110° dan 95°",
      steps: [
        { ms: "Tambah dua sudut: 110° + 95° = 205°", en: "Add the two angles: 110° + 95° = 205°" },
        { ms: "360° − 205° = 155°", en: "360° − 205° = 155°" },
      ],
      answer: "155°",
    },
    commonMistakes: [
      { mistakeType: "confused_with_180", description: { ms: "Murid tolak daripada 180° (garis lurus/segi tiga) berbanding 360°.", en: "The student subtracts from 180° (straight line/triangle) instead of 360°." } },
      { mistakeType: "only_subtracted_one_angle", description: { ms: "Murid hanya tolak satu daripada dua sudut yang diberi.", en: "The student only subtracts one of the two given angles." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "angles_at_point", config: {} },
      { type: "word_problem", difficulty: 2, generatorKey: "angles_at_point", config: {} },
    ],
  },
  "a1000000-0000-0000-0000-000000000018": {
    id: "a1000000-0000-0000-0000-000000000018",
    strand: { ms: "Ruang", en: "Space" },
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
    ],
    howTo: [
      { ms: "Kenal pasti jejari bulatan itu.", en: "Identify the circle's radius." },
      { ms: "Gandakan jejari dengan 2 untuk dapatkan diameter.", en: "Double the radius to get the diameter." },
      { ms: "Darabkan diameter itu dengan π (3.142).", en: "Multiply that diameter by π (3.142)." },
    ],
    workedExample: {
      problem: "Jejari 7 cm",
      steps: [
        { ms: "Lilitan = 2 × π × jejari", en: "Circumference = 2 × π × radius" },
        { ms: "= 2 × 3.142 × 7", en: "= 2 × 3.142 × 7" },
        { ms: "= 43.99 cm", en: "= 43.99 cm" },
      ],
      answer: "43.99 cm",
    },
    commonMistakes: [
      { mistakeType: "forgot_to_double_radius", description: { ms: "Murid mendarab jejari dengan π sahaja, lupa gandakan dengan 2 dahulu.", en: "The student multiplies the radius by π alone, forgetting to double it first." } },
      { mistakeType: "confused_with_area_formula", description: { ms: "Murid menggunakan formula luas (π × jejari²) berbanding formula lilitan.", en: "The student uses the area formula (π × radius²) instead of the circumference formula." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "circumference", config: { min: 3, max: 20 } },
      { type: "fill", difficulty: 3, generatorKey: "circumference", config: { min: 5, max: 25 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000019": {
    id: "a1000000-0000-0000-0000-000000000019",
    strand: { ms: "Ruang", en: "Space" },
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
    ],
    howTo: [
      { ms: "Kenal pasti jejari bulatan itu (bahagikan diameter dengan 2 jika perlu).", en: "Identify the circle's radius (divide the diameter by 2 if needed)." },
      { ms: "Darabkan jejari dengan dirinya sendiri (jejari × jejari).", en: "Multiply the radius by itself (radius × radius)." },
      { ms: "Darabkan hasil itu dengan π (3.142).", en: "Multiply that result by π (3.142)." },
    ],
    workedExample: {
      problem: "Jejari 5 cm",
      steps: [
        { ms: "Luas = π × jejari × jejari", en: "Area = π × radius × radius" },
        { ms: "= 3.142 × 5 × 5", en: "= 3.142 × 5 × 5" },
        { ms: "= 78.55 cm²", en: "= 78.55 cm²" },
      ],
      answer: "78.55 cm²",
    },
    commonMistakes: [
      { mistakeType: "confused_with_circumference_formula", description: { ms: "Murid menggunakan formula lilitan (2 × π × jejari) berbanding formula luas.", en: "The student uses the circumference formula (2 × π × radius) instead of the area formula." } },
      { mistakeType: "squared_diameter_instead", description: { ms: "Murid mendarab diameter dengan dirinya, bukan jejari.", en: "The student squares the diameter instead of the radius." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "area_circle", config: { min: 3, max: 15 } },
      { type: "fill", difficulty: 3, generatorKey: "area_circle", config: { min: 4, max: 18 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000020": {
    id: "a1000000-0000-0000-0000-000000000020",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor menegak, nombor lebih besar di atas.", en: "Line the two numbers up vertically, with the bigger number on top." },
      { ms: "Tolak lajur sa (paling kanan) dahulu.", en: "Subtract the ones column (rightmost) first." },
      { ms: "Jika digit atas lebih kecil, \"pinjam\" 1 daripada lajur sebelah kiri sebelum menolak.", en: "If the top digit is smaller, \"borrow\" 1 from the column on the left before subtracting." },
      { ms: "Ulang proses ini bagi setiap lajur sehingga ke kiri sekali.", en: "Repeat this for every column, moving left, until you reach the last one." },
    ],
    workedExample: {
      problem: "84500 − 37800",
      steps: [
        { ms: "0 − 0 = 0 (sa)", en: "0 − 0 = 0 (ones)" },
        { ms: "0 − 0 = 0 (puluh)", en: "0 − 0 = 0 (tens)" },
        { ms: "5 − 8: pinjam 1, jadi 15 − 8 = 7 (ratus)", en: "5 − 8: borrow 1, so 15 − 8 = 7 (hundreds)" },
        { ms: "3(baki)−1(pinjam)=3, 3 − 7: pinjam 1, jadi 13 − 7 = 6 (ribu)", en: "3(remaining)−1(borrowed)=3, 3 − 7: borrow 1, so 13 − 7 = 6 (thousands)" },
        { ms: "7(baki)−1(pinjam)=6, 6 − 3 = 3 (puluh ribu)", en: "7(remaining)−1(borrowed)=6, 6 − 3 = 3 (ten thousands)" },
      ],
      answer: 46700,
    },
    commonMistakes: [
      { mistakeType: "forgot_borrow", description: { ms: "Murid tolak digit lebih kecil daripada digit lebih besar mengikut susunan terbalik (bukan pinjam).", en: "The student subtracts the smaller digit from the larger one regardless of position, instead of borrowing." } },
      { mistakeType: "place_value_misalignment", description: { ms: "Murid tidak susun nombor ikut nilai tempat dengan betul.", en: "The student doesn't line up digits by the correct place value column." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_subtraction", config: { min: 15000, max: 45000 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_subtraction", config: { min: 25000, max: 90000 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000021": {
    id: "a1000000-0000-0000-0000-000000000021",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Darabkan nombor pertama dengan digit sa nombor kedua.", en: "Multiply the first number by the ones digit of the second number." },
      { ms: "Darabkan nombor pertama dengan digit puluh nombor kedua, kemudian anjak hasil itu satu tempat ke kiri.", en: "Multiply the first number by the tens digit of the second number, then shift that result one place to the left." },
      { ms: "Tambahkan kedua-dua hasil darab itu.", en: "Add the two products together." },
    ],
    workedExample: {
      problem: "245 × 23",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_multiplication", config: { min: 100, max: 999 } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_multiplication", config: { min: 100, max: 500 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000022": {
    id: "a1000000-0000-0000-0000-000000000022",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Anggarkan berapa kali pembahagi boleh masuk ke dalam bahagi.", en: "Estimate how many times the divisor fits into the dividend." },
      { ms: "Darabkan anggaran itu dengan pembahagi dan bandingkan dengan bahagi.", en: "Multiply that estimate by the divisor and compare it to the dividend." },
      { ms: "Laraskan anggaran itu sehingga ia tepat.", en: "Adjust the estimate until it's exact." },
    ],
    workedExample: {
      problem: "1288 ÷ 23",
      steps: [
        { ms: "Anggaran: 23 × 50 = 1150 (terlalu kecil)", en: "Estimate: 23 × 50 = 1150 (too small)" },
        { ms: "Cuba 23 × 56 = 1288 ✓", en: "Try 23 × 56 = 1288 ✓" },
      ],
      answer: 56,
    },
    commonMistakes: [
      { mistakeType: "subtracted_instead_of_divided", description: { ms: "Murid menolak pembahagi daripada bahagi berbanding membahagikannya.", en: "The student subtracts the divisor from the dividend instead of dividing." } },
      { mistakeType: "added_instead_of_divided", description: { ms: "Murid menambah pembahagi kepada bahagi berbanding membahagikannya.", en: "The student adds the divisor to the dividend instead of dividing." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_division", config: { minQuotient: 10, maxQuotient: 99 } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_division", config: { minQuotient: 15, maxQuotient: 80 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000023": {
    id: "a1000000-0000-0000-0000-000000000023",
    strand: { ms: "Statistik", en: "Statistics" },
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
    ],
    howTo: [
      { ms: "Kenal pasti soalan itu meminta jumlah atau beza.", en: "Identify whether the question is asking for a total or a difference." },
      { ms: "Baca nilai setiap palang yang berkaitan daripada graf.", en: "Read the value of each relevant bar from the graph." },
      { ms: "Untuk jumlah: tambahkan semua nilai. Untuk beza: tolak nilai lebih kecil daripada nilai lebih besar.", en: "For a total: add all the values. For a difference: subtract the smaller value from the bigger one." },
    ],
    workedExample: {
      problem: "Kumpulan A=12, B=18, C=9, D=15",
      steps: [
        { ms: "Jumlah = 12 + 18 + 9 + 15", en: "Total = 12 + 18 + 9 + 15" },
        { ms: "= 54", en: "= 54" },
      ],
      answer: 54,
    },
    commonMistakes: [
      { mistakeType: "forgot_one_bar", description: { ms: "Murid tertinggal satu kumpulan semasa menambah jumlah keseluruhan.", en: "The student misses one group while adding up the total." } },
      { mistakeType: "added_instead_of_subtracted", description: { ms: "Murid menambah dua nilai berbanding mencari beza antara keduanya.", en: "The student adds two values instead of finding the difference between them." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "bar_graph", config: { min: 5, max: 32 } },
      { type: "fill", difficulty: 2, generatorKey: "bar_graph", config: { min: 8, max: 40 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000024": {
    id: "a1000000-0000-0000-0000-000000000024",
    strand: { ms: "Koordinat", en: "Coordinates" },
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
    ],
    howTo: [
      { ms: "Cari titik asalan (0, 0) di sudut bawah kiri grid.", en: "Find the origin (0, 0) at the bottom-left corner of the grid." },
      { ms: "Kira berapa unit titik itu berada ke KANAN daripada titik asalan — ini ialah nilai x.", en: "Count how many units the point is to the RIGHT of the origin — this is the x-value." },
      { ms: "Kira berapa unit titik itu berada ke ATAS daripada titik asalan — ini ialah nilai y.", en: "Count how many units the point is UP from the origin — this is the y-value." },
      { ms: "Tulis jawapan sebagai (x, y).", en: "Write the answer as (x, y)." },
    ],
    workedExample: {
      problem: "Titik berada 4 unit ke kanan dan 6 unit ke atas",
      steps: [
        { ms: "Nilai x = 4 (ke kanan)", en: "x-value = 4 (right)" },
        { ms: "Nilai y = 6 (ke atas)", en: "y-value = 6 (up)" },
        { ms: "Koordinat = (4, 6)", en: "Coordinates = (4, 6)" },
      ],
      answer: "(4, 6)",
    },
    commonMistakes: [
      { mistakeType: "swapped_x_and_y", description: { ms: "Murid menulis nilai y dahulu, kemudian x — tersalah susunan.", en: "The student writes the y-value first, then x — the order is reversed." } },
      { mistakeType: "misread_grid_position", description: { ms: "Murid silap kira bilangan unit pada grid.", en: "The student miscounts the number of units on the grid." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "coordinates", config: { gridSize: 10 } },
      { type: "mcq", difficulty: 2, generatorKey: "coordinates", config: { gridSize: 12 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000025": {
    id: "a1000000-0000-0000-0000-000000000025",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Anggarkan berapa kali pembahagi boleh masuk ke dalam bahagi, digit demi digit dari kiri.", en: "Estimate how many times the divisor fits into the dividend, digit by digit from the left." },
      { ms: "Darabkan anggaran itu dengan pembahagi dan bandingkan dengan bahagi.", en: "Multiply that estimate by the divisor and compare it to the dividend." },
      { ms: "Laraskan anggaran itu sehingga ia tepat.", en: "Adjust the estimate until it's exact." },
    ],
    workedExample: {
      problem: "738 ÷ 6",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_division_y5", config: { minQuotient: 100, maxQuotient: 999 } },
      { type: "word_problem", difficulty: 2, generatorKey: "whole_numbers_division_y5", config: { minQuotient: 100, maxQuotient: 500 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000026": {
    id: "a1000000-0000-0000-0000-000000000026",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Darabkan nombor pertama dengan digit sa nombor kedua.", en: "Multiply the first number by the ones digit of the second number." },
      { ms: "Darabkan nombor pertama dengan digit puluh nombor kedua, kemudian anjak hasil itu satu tempat ke kiri.", en: "Multiply the first number by the tens digit of the second number, then shift that result one place to the left." },
      { ms: "Tambahkan kedua-dua hasil darab itu.", en: "Add the two products together." },
    ],
    workedExample: {
      problem: "3450 × 34",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_multiplication_y6", config: { min: 1000, max: 9999 } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_multiplication_y6", config: { min: 1000, max: 5000 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000027": {
    id: "a1000000-0000-0000-0000-000000000027",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    title: { ms: "Operasi Bergabung Tanpa Kurungan", en: "Combined Operations Without Brackets" },
    yearLevel: 6,
    explanation: {
      ms: "Apabila satu soalan ada campuran tambah dan darab tanpa kurungan, kita MESTI buat pendaraban dahulu, kemudian penambahan — bukan dikira dari kiri ke kanan.\n\nContoh harian: Ali ada RM15, kemudian ibunya beri dia 4 keping not RM10. Berapakah jumlah wang Ali sekarang? (15 + 4 × 10)",
      en: "When a question mixes addition and multiplication with no brackets, we MUST do the multiplication first, then the addition — not simply left to right.\n\nEveryday example: Ali has RM15, then his mother gives him 4 pieces of RM10 notes. How much money does Ali have now? (15 + 4 × 10)",
    },
    tips: [
      {
        ms: "Ingat: \"Darab dan Bahagi dahulu, Tambah dan Tolak kemudian\" — ini dipanggil susunan operasi.",
        en: "Remember: \"Multiply and Divide first, Add and Subtract after\" — this is called order of operations.",
      },
      {
        ms: "Bulatkan atau garisi bahagi darab dalam soalan itu dahulu supaya anda tidak terlepas pandang untuk buat itu dahulu.",
        en: "Circle or underline the multiplication part of the question first so you don't accidentally skip doing it first.",
      },
    ],
    howTo: [
      { ms: "Cari bahagi darab (atau bahagi) dalam soalan itu dan selesaikan itu dahulu.", en: "Find the multiplication (or division) part of the question and solve that first." },
      { ms: "Kemudian buat penambahan (atau penolakan) menggunakan hasil daripada langkah pertama.", en: "Then do the addition (or subtraction) using the result from the first step." },
    ],
    workedExample: {
      problem: "15 + 4 × 10",
      steps: [
        { ms: "Darab dahulu: 4 × 10 = 40", en: "Multiply first: 4 × 10 = 40" },
        { ms: "Kemudian tambah: 15 + 40 = 55", en: "Then add: 15 + 40 = 55" },
      ],
      answer: 55,
    },
    commonMistakes: [
      { mistakeType: "ignored_order_of_operations", description: { ms: "Murid mengira dari kiri ke kanan (tambah dahulu, kemudian darab) berbanding ikut susunan operasi yang betul.", en: "The student calculates strictly left to right (adds first, then multiplies) instead of following the correct order of operations." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 80 } },
      { type: "word_problem", difficulty: 3, generatorKey: "mixed_operations", config: { min: 10, max: 50 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000028": {
    id: "a1000000-0000-0000-0000-000000000028",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Darabkan digit sa nombor besar itu dengan nombor 1 digit.", en: "Multiply the ones digit of the big number by the 1-digit number." },
      { ms: "Simpan apa-apa lebihan ke lajur seterusnya, kemudian ulang untuk setiap lajur.", en: "Carry any overflow to the next column, then repeat for every column." },
      { ms: "Gabungkan semua digit jawapan untuk dapatkan jawapan akhir.", en: "Combine all the answer digits to get the final answer." },
    ],
    workedExample: {
      problem: "1245 × 4",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_multiplication_y4", config: { min: 1000, max: 9999 } },
      { type: "word_problem", difficulty: 1, generatorKey: "whole_numbers_multiplication_y4", config: { min: 1000, max: 5000 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000029": {
    id: "a1000000-0000-0000-0000-000000000029",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Anggarkan berapa kali pembahagi boleh masuk ke dalam bahagi, digit demi digit dari kiri.", en: "Estimate how many times the divisor fits into the dividend, digit by digit from the left." },
      { ms: "Darabkan anggaran itu dengan pembahagi dan bandingkan dengan bahagi.", en: "Multiply that estimate by the divisor and compare it to the dividend." },
      { ms: "Laraskan anggaran itu sehingga ia tepat.", en: "Adjust the estimate until it's exact." },
    ],
    workedExample: {
      problem: "84 ÷ 4",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "whole_numbers_division_y4", config: { minQuotient: 10, maxQuotient: 99 } },
      { type: "word_problem", difficulty: 1, generatorKey: "whole_numbers_division_y4", config: { minQuotient: 10, maxQuotient: 50 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000030": {
    id: "a1000000-0000-0000-0000-000000000030",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor ikut nilai tempat.", en: "Line up both numbers by place value." },
      { ms: "Tambah bermula dari lajur sa, \"simpan\" apabila jumlah lajur lebih 9.", en: "Add starting from the ones column, carrying when a column's total is more than 9." },
      { ms: "Teruskan ke lajur seterusnya sehingga semua lajur ditambah.", en: "Continue to the next column until every column is added." },
    ],
    workedExample: {
      problem: "245600 + 318750",
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
    },
    commonMistakes: [
      { mistakeType: "forgot_carry", description: { ms: "Murid tambah setiap lajur secara berasingan tanpa \"simpan\" apabila jumlah lebih 9.", en: "The student adds each column separately without carrying when the total is more than 9." } },
      { mistakeType: "place_value_misalignment", description: { ms: "Murid tidak susun nombor ikut nilai tempat dengan betul.", en: "The student doesn't line up digits by the correct place value column." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_addition_y5", config: { min: 100000, max: 999999 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_addition_y5", config: { min: 100000, max: 500000 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000031": {
    id: "a1000000-0000-0000-0000-000000000031",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
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
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor ikut nilai tempat.", en: "Line up both numbers by place value." },
      { ms: "Tolak bermula dari lajur sa, \"pinjam\" apabila digit atas lebih kecil.", en: "Subtract starting from the ones column, borrowing when the top digit is smaller." },
      { ms: "Teruskan ke lajur seterusnya sehingga semua lajur ditolak.", en: "Continue to the next column until every column is subtracted." },
    ],
    workedExample: {
      problem: "876400 − 123850",
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
    },
    commonMistakes: [
      { mistakeType: "forgot_borrow", description: { ms: "Murid tolak digit lebih kecil daripada digit lebih besar mengikut susunan terbalik (bukan pinjam).", en: "The student subtracts the smaller digit from the larger one regardless of position, instead of borrowing." } },
      { mistakeType: "place_value_misalignment", description: { ms: "Murid tidak susun nombor ikut nilai tempat dengan betul.", en: "The student doesn't line up digits by the correct place value column." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "whole_numbers_subtraction_y5", config: { min: 100000, max: 999999 } },
      { type: "fill", difficulty: 2, generatorKey: "whole_numbers_subtraction_y5", config: { min: 200000, max: 900000 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000032": {
    id: "a1000000-0000-0000-0000-000000000032",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    title: { ms: "Tambah Tiga Nombor Bulat", en: "Adding Three Whole Numbers" },
    yearLevel: 6,
    explanation: {
      ms: "Apabila TIGA nombor perlu ditambah, kita boleh tambah dua nombor dahulu, kemudian tambah nombor ketiga dengan jumlah itu. Kaedah tambah (susun ikut nilai tempat, simpan apabila perlu) adalah sama.\n\nContoh harian: Sebuah kedai buku menjual 12,450 buku pada Januari, 15,800 buku pada Februari, dan 9,670 buku pada Mac. Berapa jumlah buku dijual dalam tiga bulan itu?",
      en: "When THREE numbers need to be added, we can add two of them first, then add the third number to that sum. The addition method (line up by place value, carry when needed) stays the same.\n\nEveryday example: A bookstore sold 12,450 books in January, 15,800 in February, and 9,670 in March. How many books were sold across those three months in total?",
    },
    tips: [
      {
        ms: "Semak semula anda sudah tambah SEMUA TIGA nombor — mudah tertinggal nombor ketiga.",
        en: "Double check you've added ALL THREE numbers — it's easy to accidentally miss the third one.",
      },
      {
        ms: "Tambah dua nombor dahulu untuk dapatkan jumlah, kemudian tambah nombor ketiga pada jumlah itu.",
        en: "Add two numbers first to get a subtotal, then add the third number to that subtotal.",
      },
    ],
    howTo: [
      { ms: "Tambah dua nombor pertama untuk dapatkan jumlah sementara.", en: "Add the first two numbers to get a running subtotal." },
      { ms: "Tambah nombor ketiga pada jumlah sementara itu.", en: "Add the third number to that subtotal." },
      { ms: "Semak jawapan akhir anda.", en: "Check your final answer." },
    ],
    workedExample: {
      problem: "12450 + 15800 + 9670",
      steps: [
        { ms: "12,450 + 15,800 = 28,250", en: "12,450 + 15,800 = 28,250" },
        { ms: "28,250 + 9,670 = 37,920", en: "28,250 + 9,670 = 37,920" },
      ],
      answer: 37920,
    },
    commonMistakes: [
      { mistakeType: "forgot_addend", description: { ms: "Murid hanya tambah dua daripada tiga nombor, tertinggal satu.", en: "The student only adds two of the three numbers, missing one." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_addition_y6", config: { min: 10000, max: 99999 } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_addition_y6", config: { min: 5000, max: 50000 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000033": {
    id: "a1000000-0000-0000-0000-000000000033",
    strand: { ms: "Nombor Bulat", en: "Whole Numbers" },
    title: { ms: "Tolak Daripada Nombor Bulat", en: "Subtracting from a Round Number" },
    yearLevel: 6,
    explanation: {
      ms: "Apabila menolak daripada nombor bulat seperti 500,000 (banyak digit 0), kita perlu \"pinjam\" merentasi beberapa lajur 0 secara berturutan sebelum sampai ke digit yang boleh dipinjam.\n\nContoh harian: Sebuah kilang mensasarkan pengeluaran 500,000 unit. Setakat ini, 187,650 unit belum dikeluarkan. Berapa unit sudah dikeluarkan?",
      en: "When subtracting from a round number like 500,000 (lots of 0 digits), you need to \"borrow\" across several zero columns in a row before reaching a digit that can actually lend.\n\nEveryday example: A factory targets 500,000 units. So far, 187,650 units have not yet been produced. How many units have been produced?",
    },
    tips: [
      {
        ms: "Apabila digit atas ialah 0 dan anda perlu pinjam, pinjam daripada lajur BUKAN-SIFAR yang paling hampir di sebelah kiri — ia akan \"beri pinjam\" merentasi setiap 0 di antaranya.",
        en: "When the top digit is 0 and you need to borrow, borrow from the nearest NON-ZERO column to the left — it will \"lend\" across every 0 in between.",
      },
      {
        ms: "Semak jawapan anda: tambah jawapan dengan nombor yang ditolak — ia MESTI menyamai nombor bulat asal.",
        en: "Check your answer: add your result to the number you subtracted — it MUST equal the original round number.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti lajur bukan-sifar yang paling hampir di sebelah kiri untuk dipinjam.", en: "Identify the nearest non-zero column to the left to borrow from." },
      { ms: "Pinjam daripada lajur itu — setiap lajur 0 di antaranya akan bertukar menjadi 9.", en: "Borrow from that column — every 0 column in between turns into a 9." },
      { ms: "Tolak setiap lajur seperti biasa, dari kanan ke kiri.", en: "Subtract each column as usual, from right to left." },
    ],
    workedExample: {
      problem: "500000 − 187650",
      steps: [
        { ms: "500,000 boleh ditulis sebagai 4 9 9 9 9 10 selepas pinjam", en: "500,000 can be rewritten as 4 9 9 9 9 10 after borrowing" },
        { ms: "10 − 0 = 10, tulis 0 (sa)", en: "10 − 0 = 10, write 0 (ones)" },
        { ms: "9 − 5 = 4 (puluh)", en: "9 − 5 = 4 (tens)" },
        { ms: "9 − 6 = 3 (ratus)", en: "9 − 6 = 3 (hundreds)" },
        { ms: "9 − 7 = 2 (ribu)", en: "9 − 7 = 2 (thousands)" },
        { ms: "9 − 8 = 1 (puluh ribu)", en: "9 − 8 = 1 (ten thousands)" },
        { ms: "4 − 1 = 3 (ratus ribu)", en: "4 − 1 = 3 (hundred thousands)" },
        { ms: "Jawapan: 312,350", en: "Answer: 312,350" },
      ],
      answer: 312350,
    },
    commonMistakes: [
      { mistakeType: "forgot_borrow", description: { ms: "Murid tidak tahu cara pinjam merentasi beberapa lajur 0, dan tolak digit lebih kecil daripada digit lebih besar mengikut susunan terbalik.", en: "The student doesn't know how to borrow across several zero columns, and subtracts the smaller digit from the larger regardless of position." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "whole_numbers_subtraction_y6", config: { min: 10000, max: 99999 } },
      { type: "word_problem", difficulty: 3, generatorKey: "whole_numbers_subtraction_y6", config: { min: 10000, max: 80000 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000034": {
    id: "a1000000-0000-0000-0000-000000000034",
    strand: { ms: "Pecahan", en: "Fractions" },
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
    ],
    howTo: [
      { ms: "Semak sama ada kedua-dua pecahan mempunyai penyebut yang sama.", en: "Check that both fractions have the same denominator." },
      { ms: "Tolak pengangka kedua daripada pengangka pertama.", en: "Subtract the second numerator from the first." },
      { ms: "Kekalkan penyebut (nombor bawah) tanpa diubah.", en: "Keep the denominator (bottom number) unchanged." },
    ],
    workedExample: {
      problem: "5/8 − 2/8",
      steps: [
        { ms: "Penyebut sama, kekalkan 8", en: "Same denominator, keep it as 8" },
        { ms: "Tolak pengangka: 5−2=3", en: "Subtract the numerators: 5−2=3" },
      ],
      answer: "3/8",
    },
    commonMistakes: [
      { mistakeType: "added_instead_of_subtracted", description: { ms: "Murid menambah pengangka berbanding menolaknya.", en: "The student adds the numerators instead of subtracting them." } },
      { mistakeType: "denominator_subtraction_error", description: { ms: "Murid turut menolak penyebut.", en: "The student also subtracts the denominators." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "fractions_subtract_same_denominator", config: { denominators: [4, 5, 6, 8, 10, 12] } },
      { type: "fill", difficulty: 2, generatorKey: "fractions_subtract_same_denominator", config: { denominators: [8, 10, 12, 15, 16] } },
    ],
  },
  "a1000000-0000-0000-0000-000000000035": {
    id: "a1000000-0000-0000-0000-000000000035",
    strand: { ms: "Perpuluhan", en: "Decimals" },
    title: { ms: "Tambah & Tolak Perpuluhan (1 Tempat Perpuluhan)", en: "Adding & Subtracting Decimals (1 Decimal Place)" },
    yearLevel: 4,
    explanation: {
      ms: "Perpuluhan 1 tempat perpuluhan (persepuluhan) seperti 3.5 bermaksud 3 dan 5 persepuluhan. Untuk tambah atau tolak, susun titik perpuluhan lurus, sama seperti nombor bulat biasa.\n\nContoh harian: Ali berlari 2.4 km pagi ini dan 1.3 km petang ini. Berapa jumlah jarak larian Ali?",
      en: "A 1-decimal-place number (tenths) like 3.5 means 3 and 5 tenths. To add or subtract, line up the decimal points, just like normal whole numbers.\n\nEveryday example: Ali ran 2.4 km this morning and 1.3 km this evening. What's his total running distance?",
    },
    tips: [
      {
        ms: "Sentiasa susun titik perpuluhan lurus (satu di atas satu) sebelum mengira.",
        en: "Always line up the decimal points directly above each other before calculating.",
      },
      {
        ms: "Fikirkan tempat persepuluhan seperti sen dalam wang — 0.5 hampir sama konsepnya dengan RM0.50.",
        en: "Think of the tenths place like small change — 0.5 works the same way as thinking about half of something.",
      },
    ],
    howTo: [
      { ms: "Susun kedua-dua nombor supaya titik perpuluhan sejajar.", en: "Line up both numbers so the decimal points align." },
      { ms: "Tambah atau tolak bermula dari lajur paling kanan (persepuluhan), sama seperti nombor bulat.", en: "Add or subtract starting from the rightmost column (tenths), just like whole numbers." },
      { ms: "Letakkan titik perpuluhan pada jawapan, pada kedudukan yang sama.", en: "Place the decimal point in your answer, in the same position." },
    ],
    workedExample: {
      problem: "2.4 + 1.3",
      steps: [
        { ms: "Susun titik perpuluhan lurus", en: "Line up the decimal points" },
        { ms: "Tambah persepuluhan: 4+3=7", en: "Add the tenths: 4+3=7" },
        { ms: "Tambah nombor bulat: 2+1=3", en: "Add the whole numbers: 2+1=3" },
        { ms: "Jawapan: 3.7", en: "Answer: 3.7" },
      ],
      answer: "3.7",
    },
    commonMistakes: [
      { mistakeType: "decimal_point_misalignment", description: { ms: "Murid tidak susun titik perpuluhan dengan betul semasa mengira.", en: "The student doesn't line up the decimal points correctly when calculating." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "decimal_add_subtract_y4", config: { maxWhole: 10 } },
      { type: "fill", difficulty: 1, generatorKey: "decimal_add_subtract_y4", config: { maxWhole: 20 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000036": {
    id: "a1000000-0000-0000-0000-000000000036",
    strand: { ms: "Perpuluhan", en: "Decimals" },
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
    ],
    howTo: [
      { ms: "Darab kedua-dua nombor seolah-olah nombor bulat, abaikan titik perpuluhan.", en: "Multiply both numbers as if they were whole numbers, ignoring the decimal point." },
      { ms: "Kira semula berapa tempat perpuluhan patut ada dalam jawapan.", en: "Work out how many decimal places the answer should have." },
      { ms: "Letakkan titik perpuluhan pada kedudukan yang betul.", en: "Place the decimal point in the correct position." },
    ],
    workedExample: {
      problem: "1.5 × 4",
      steps: [
        { ms: "Darab seolah-olah nombor bulat: 15 × 4 = 60", en: "Multiply as whole numbers: 15 × 4 = 60" },
        { ms: "1.5 ada 1 tempat perpuluhan, jadi letakkan titik: 6.0", en: "1.5 has 1 decimal place, so place the point: 6.0" },
        { ms: "Jawapan: 6.0", en: "Answer: 6.0" },
      ],
      answer: "6.0",
    },
    commonMistakes: [
      { mistakeType: "ignored_decimal_point", description: { ms: "Murid darab dengan betul tetapi lupa letakkan semula titik perpuluhan pada jawapan.", en: "The student multiplies correctly but forgets to place the decimal point back into the answer." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "decimal_multiply", config: { maxWhole: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "decimal_multiply", config: { maxWhole: 8 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000037": {
    id: "a1000000-0000-0000-0000-000000000037",
    strand: { ms: "Perpuluhan", en: "Decimals" },
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
    ],
    howTo: [
      { ms: "Letakkan titik perpuluhan pada jawapan, terus di atas titik perpuluhan bahagi.", en: "Place the decimal point in the answer, directly above the decimal point being divided." },
      { ms: "Bahagi seperti biasa, digit demi digit.", en: "Divide as usual, digit by digit." },
      { ms: "Semak jawapan akhir dengan darab semula.", en: "Check the final answer by multiplying back." },
    ],
    workedExample: {
      problem: "7.2 ÷ 3",
      steps: [
        { ms: "Letakkan titik perpuluhan pada jawapan terus di atas 7.2", en: "Place the decimal point in the answer directly above 7.2" },
        { ms: "7 ÷ 3 = 2, baki 1", en: "7 ÷ 3 = 2, remainder 1" },
        { ms: "12 ÷ 3 = 4 (bawa turun 2 persepuluhan)", en: "12 ÷ 3 = 4 (bring down the 2 tenths)" },
        { ms: "Jawapan: 2.4", en: "Answer: 2.4" },
      ],
      answer: "2.4",
    },
    commonMistakes: [
      { mistakeType: "ignored_decimal_point", description: { ms: "Murid membahagi dengan betul tetapi lupa letakkan semula titik perpuluhan pada jawapan.", en: "The student divides correctly but forgets to place the decimal point back into the answer." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "decimal_divide", config: { maxQuotientWhole: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "decimal_divide", config: { maxQuotientWhole: 8 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000038": {
    id: "a1000000-0000-0000-0000-000000000038",
    strand: { ms: "Pecahan", en: "Fractions" },
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
    ],
    howTo: [
      { ms: "Kenal pasti pengangka, penyebut, dan nombor bulat pembahagi.", en: "Identify the numerator, denominator, and the whole number divisor." },
      { ms: "Darabkan penyebut dengan nombor bulat itu. Pengangka kekal sama.", en: "Multiply the denominator by that whole number. The numerator stays the same." },
      { ms: "Permudahkan pecahan jawapan jika boleh.", en: "Simplify the resulting fraction if possible." },
    ],
    workedExample: {
      problem: "3/4 ÷ 2",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "fractions_divide_by_whole", config: { denominators: [2, 3, 4, 5, 6, 8] } },
      { type: "word_problem", difficulty: 3, generatorKey: "fractions_divide_by_whole", config: { denominators: [2, 3, 4, 6] } },
    ],
  },
  "a1000000-0000-0000-0000-000000000039": {
    id: "a1000000-0000-0000-0000-000000000039",
    strand: { ms: "Wang", en: "Money" },
    title: { ms: "Tambah & Tolak Wang", en: "Adding & Subtracting Money" },
    yearLevel: 4,
    explanation: {
      ms: "Wang dalam Ringgit Malaysia (RM) ditulis dengan 2 tempat perpuluhan (sen). 100 sen = RM1. Untuk tambah atau tolak wang, susun titik perpuluhan lurus, sama seperti nombor perpuluhan biasa.\n\nContoh harian: Ibu beli sayur RM8.50 dan ikan RM12.30. Berapa jumlah perbelanjaan ibu?",
      en: "Money in Ringgit Malaysia (RM) is written with 2 decimal places (sen). 100 sen = RM1. To add or subtract money, line up the decimal points, just like regular decimal numbers.\n\nEveryday example: Mother buys vegetables for RM8.50 and fish for RM12.30. What's her total spending?",
    },
    tips: [
      {
        ms: "Susun titik perpuluhan (antara ringgit dan sen) lurus sebelum mengira.",
        en: "Line up the decimal point (between ringgit and sen) before calculating.",
      },
      {
        ms: "Apabila sen mencapai 100 atau lebih, tukar 100 sen kepada RM1 dan \"simpan\" ke lajur ringgit.",
        en: "When the sen reaches 100 or more, convert 100 sen into RM1 and carry it into the ringgit column.",
      },
    ],
    howTo: [
      { ms: "Susun kedua-dua jumlah wang supaya titik perpuluhan sejajar.", en: "Line up both amounts so the decimal points align." },
      { ms: "Tambah atau tolak sen dahulu, kemudian ringgit.", en: "Add or subtract the sen first, then the ringgit." },
      { ms: "Jika sen melebihi 100, simpan 1 ke lajur ringgit (sama seperti nombor perpuluhan biasa).", en: "If the sen total is 100 or more, carry 1 into the ringgit column (same as regular decimals)." },
    ],
    workedExample: {
      problem: "RM8.50 + RM12.30",
      steps: [
        { ms: "Tambah sen: 50 + 30 = 80 sen", en: "Add the sen: 50 + 30 = 80 sen" },
        { ms: "Tambah ringgit: 8 + 12 = 20", en: "Add the ringgit: 8 + 12 = 20" },
        { ms: "Jawapan: RM20.80", en: "Answer: RM20.80" },
      ],
      answer: "RM20.80",
    },
    commonMistakes: [
      { mistakeType: "ringgit_sen_carry_error", description: { ms: "Murid tidak \"simpan\"/\"pinjam\" dengan betul apabila sen melebihi 100.", en: "The student doesn't carry/borrow correctly when the sen total passes 100." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 1, generatorKey: "money_add_subtract", config: { maxRM: 20 } },
      { type: "word_problem", difficulty: 1, generatorKey: "money_add_subtract", config: { maxRM: 15 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000040": {
    id: "a1000000-0000-0000-0000-000000000040",
    strand: { ms: "Wang", en: "Money" },
    title: { ms: "Darab & Bahagi Wang", en: "Multiplying & Dividing Money" },
    yearLevel: 4,
    explanation: {
      ms: "Untuk darab atau bahagi wang dengan nombor bulat, kira seperti biasa, kemudian pastikan jawapan ditulis dalam format RM yang betul (2 tempat perpuluhan).\n\nContoh harian: Sebuah buku berharga RM4.50. Berapa kos untuk 3 buah buku?",
      en: "To multiply or divide money by a whole number, calculate as usual, then make sure the answer is written in the correct RM format (2 decimal places).\n\nEveryday example: A book costs RM4.50. How much do 3 books cost?",
    },
    tips: [
      {
        ms: "Darab atau bahagi sen dan ringgit sebagai satu nombor perpuluhan, bukan berasingan.",
        en: "Multiply or divide sen and ringgit together as one decimal number, not separately.",
      },
      {
        ms: "Anggarkan dahulu untuk semak jawapan munasabah (cth. RM4.50 × 3 ≈ RM5 × 3 = RM15).",
        en: "Estimate first to check your answer is reasonable (e.g. RM4.50 × 3 ≈ RM5 × 3 = RM15).",
      },
    ],
    howTo: [
      { ms: "Kenal pasti sama ada soalan itu darab atau bahagi.", en: "Identify whether the question is multiplication or division." },
      { ms: "Kira seperti nombor perpuluhan biasa.", en: "Calculate as you would with regular decimals." },
      { ms: "Tulis jawapan dalam format RM dengan 2 tempat perpuluhan.", en: "Write the answer in RM format with 2 decimal places." },
    ],
    workedExample: {
      problem: "RM4.50 × 3",
      steps: [
        { ms: "Darab seolah-olah nombor bulat: 450 × 3 = 1350", en: "Multiply as whole numbers: 450 × 3 = 1350" },
        { ms: "Letakkan semula titik perpuluhan: RM13.50", en: "Place the decimal point back: RM13.50" },
      ],
      answer: "RM13.50",
    },
    commonMistakes: [
      { mistakeType: "calculation_error", description: { ms: "Murid tidak tukar kepada sen sebelum mengira, menyebabkan ralat titik perpuluhan.", en: "The student doesn't convert to sen before calculating, causing a decimal-point error." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "money_multiply_divide", config: { maxRM: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "money_multiply_divide", config: { maxRM: 8 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000041": {
    id: "a1000000-0000-0000-0000-000000000041",
    strand: { ms: "Wang", en: "Money" },
    title: { ms: "Faedah Mudah", en: "Simple Interest" },
    yearLevel: 5,
    explanation: {
      ms: "Faedah mudah ialah wang tambahan yang diperoleh apabila melabur atau disimpan di bank. Formula: Faedah = Prinsipal × Kadar × Tahun ÷ 100.\n\nContoh harian: Jika kamu simpan RM500 pada kadar faedah 4% setahun selama 2 tahun, berapa faedah yang kamu peroleh?",
      en: "Simple interest is the extra money earned when investing or saving in a bank. Formula: Interest = Principal × Rate × Years ÷ 100.\n\nEveryday example: If you save RM500 at an interest rate of 4% per year for 2 years, how much interest do you earn?",
    },
    tips: [
      {
        ms: "Prinsipal ialah jumlah wang asal yang dilaburkan atau disimpan.",
        en: "The principal is the original amount of money invested or saved.",
      },
      {
        ms: "Jangan lupa darabkan dengan bilangan TAHUN — faedah bertambah setiap tahun ia disimpan.",
        en: "Don't forget to multiply by the number of YEARS — interest builds up for every year it's saved.",
      },
    ],
    howTo: [
      { ms: "Kenal pasti prinsipal, kadar faedah (%), dan tempoh (tahun).", en: "Identify the principal, interest rate (%), and time period (years)." },
      { ms: "Darabkan ketiga-tiganya: Prinsipal × Kadar × Tahun.", en: "Multiply all three: Principal × Rate × Years." },
      { ms: "Bahagikan hasilnya dengan 100 untuk dapatkan faedah.", en: "Divide the result by 100 to get the interest." },
    ],
    workedExample: {
      problem: "RM500 pada 4% setahun selama 2 tahun",
      steps: [
        { ms: "500 × 4 × 2 = 4000", en: "500 × 4 × 2 = 4000" },
        { ms: "4000 ÷ 100 = 40", en: "4000 ÷ 100 = 40" },
        { ms: "Jawapan: RM40.00", en: "Answer: RM40.00" },
      ],
      answer: "RM40.00",
    },
    commonMistakes: [
      { mistakeType: "forgot_years_multiplier", description: { ms: "Murid tidak darabkan dengan bilangan tahun, mengira faedah untuk 1 tahun sahaja.", en: "The student doesn't multiply by the number of years, calculating interest for only 1 year." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 3, generatorKey: "simple_interest", config: { maxPrincipalRM: 20 } },
      { type: "word_problem", difficulty: 3, generatorKey: "simple_interest", config: { maxPrincipalRM: 15 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000042": {
    id: "a1000000-0000-0000-0000-000000000042",
    strand: { ms: "Wang", en: "Money" },
    title: { ms: "Untung dan Rugi", en: "Profit and Loss" },
    yearLevel: 6,
    explanation: {
      ms: "Harga kos ialah harga membeli sesuatu barang. Harga jualan ialah harga menjualnya semula. Jika harga jualan LEBIH TINGGI, itu untung. Jika harga jualan LEBIH RENDAH, itu rugi.\n\nContoh harian: Sebuah kedai beli basikal pada harga RM150 dan menjualnya pada RM180. Berapakah untung kedai itu?",
      en: "Cost price is the price something was bought for. Selling price is the price it's sold for. If the selling price is HIGHER, that's a profit. If it's LOWER, that's a loss.\n\nEveryday example: A shop buys a bicycle for RM150 and sells it for RM180. What is the shop's profit?",
    },
    tips: [
      {
        ms: "Untung/rugi = beza antara harga jualan dan harga kos, bukan jumlahnya.",
        en: "Profit/loss = the difference between selling price and cost price, not their sum.",
      },
      {
        ms: "Jualan > Kos = Untung. Jualan < Kos = Rugi.",
        en: "Selling > Cost = Profit. Selling < Cost = Loss.",
      },
    ],
    howTo: [
      { ms: "Bandingkan harga jualan dengan harga kos.", en: "Compare the selling price with the cost price." },
      { ms: "Tentukan sama ada ia untung (jualan lebih tinggi) atau rugi (jualan lebih rendah).", en: "Determine whether it's a profit (selling higher) or a loss (selling lower)." },
      { ms: "Cari beza antara kedua-dua harga itu.", en: "Find the difference between the two prices." },
    ],
    workedExample: {
      problem: "Harga kos RM150, harga jualan RM180",
      steps: [
        { ms: "RM180 > RM150, jadi ini untung", en: "RM180 > RM150, so this is a profit" },
        { ms: "Untung = RM180 − RM150 = RM30", en: "Profit = RM180 − RM150 = RM30" },
      ],
      answer: "RM30.00",
    },
    commonMistakes: [
      { mistakeType: "added_instead_of_subtracted", description: { ms: "Murid menambah harga kos dan harga jualan berbanding mencari beza.", en: "The student adds the cost price and selling price instead of finding the difference." } },
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "profit_loss", config: { maxRM: 100 } },
      { type: "word_problem", difficulty: 2, generatorKey: "profit_loss", config: { maxRM: 80 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000043": {
    id: "a1000000-0000-0000-0000-000000000043",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
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
    ],
    howTo: [
      { ms: "Tambah atau tolak minit dahulu.", en: "Add or subtract the minutes first." },
      { ms: "Jika minit mencapai 60 atau lebih, tukar 60 minit kepada 1 jam dan simpan ke lajur jam.", en: "If the minutes reach 60 or more, convert 60 minutes into 1 hour and carry it into the hours column." },
      { ms: "Tambah atau tolak jam.", en: "Add or subtract the hours." },
    ],
    workedExample: {
      problem: "1 jam 45 minit + 50 minit",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "time_add_subtract", config: { maxHours: 5 } },
      { type: "word_problem", difficulty: 2, generatorKey: "time_add_subtract", config: { maxHours: 3 } },
    ],
  },
  "a1000000-0000-0000-0000-000000000044": {
    id: "a1000000-0000-0000-0000-000000000044",
    strand: { ms: "Ukuran dan Sukatan", en: "Measurement" },
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
    ],
    howTo: [
      { ms: "Tambah atau tolak cm dahulu.", en: "Add or subtract the centimetres first." },
      { ms: "Jika cm mencapai 100 atau lebih, tukar 100 cm kepada 1 m dan simpan ke lajur meter.", en: "If the cm reach 100 or more, convert 100 cm into 1 m and carry it into the metres column." },
      { ms: "Tambah atau tolak meter.", en: "Add or subtract the metres." },
    ],
    workedExample: {
      problem: "2 m 40 cm + 1 m 75 cm",
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
    ],
    questionTemplates: [
      { type: "mcq", difficulty: 2, generatorKey: "length_add_subtract", config: { maxMetres: 10 } },
      { type: "word_problem", difficulty: 2, generatorKey: "length_add_subtract", config: { maxMetres: 6 } },
    ],
  },
};
