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
  tips: Bilingual;
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
    tips: {
      ms: "Susun nombor ikut nilai tempat dengan kemas — guna kertas berpetak jika perlu. Sentiasa mula tambah dari lajur paling kanan (sa).",
      en: "Line up numbers neatly by place value — use grid paper if it helps. Always start adding from the rightmost column (ones).",
    },
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
    tips: {
      ms: "Penyebut sama = kongsi saiz bahagian yang sama. Hanya nombor atas (pengangka) yang berubah.",
      en: "Same denominator = the pieces are the same size. Only the top number (numerator) changes.",
    },
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
    tips: {
      ms: "Tukar semua kepada sen dahulu (RM5.00 = 500 sen) supaya lebih mudah tolak, kemudian tukar balik kepada RM jika perlu.",
      en: "Convert everything to sen first (RM5.00 = 500 sen) to make subtraction easier, then convert back to RM if needed.",
    },
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
    tips: {
      ms: "Bayangkan berjalan mengelilingi keseluruhan bentuk itu — perimeter ialah jumlah jarak yang anda jalani.",
      en: "Imagine walking all the way around the shape — the perimeter is the total distance you'd walk.",
    },
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
    tips: {
      ms: "Susun nombor secara menegak dengan titik perpuluhan segaris. Tambah sifar jika perlu supaya kedua-dua nombor ada bilangan digit selepas titik perpuluhan yang sama.",
      en: "Line the numbers up vertically with decimal points aligned. Add a zero if needed so both numbers have the same number of digits after the decimal point.",
    },
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
    tips: {
      ms: "50% ialah separuh, 25% ialah suku, 10% ialah selepas menggerakkan titik perpuluhan satu tempat ke kiri. Guna ini untuk anggaran pantas.",
      en: "50% is half, 25% is a quarter, 10% is moving the decimal point one place left. Use these as quick estimation checks.",
    },
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
    tips: {
      ms: "Pisahkan tempoh masa kepada jam dan minit dahulu (90 minit = 1 jam 30 minit), kemudian tambah secara berasingan.",
      en: "Split the duration into hours and minutes first (90 minutes = 1 hour 30 minutes), then add each part separately.",
    },
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
    tips: {
      ms: "Purata = Jumlah Semua Nilai ÷ Bilangan Nilai. Jangan lupa langkah bahagi — jumlah sahaja bukan purata.",
      en: "Average = Total of All Values ÷ Number of Values. Don't forget the division step — the sum alone isn't the average.",
    },
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
    tips: {
      ms: "Cuba bahagi kedua-dua bahagian dengan 2, kemudian 3, dan seterusnya sehingga tidak boleh dibahagi lagi tanpa baki.",
      en: "Try dividing both parts by 2, then 3, and so on until neither can be divided any further without a remainder.",
    },
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
    tips: {
      ms: "Selalu tukar liter kepada ml dahulu (darab dengan 1000) sebelum membuat sebarang pengiraan.",
      en: "Always convert litres to ml first (multiply by 1000) before doing any calculation.",
    },
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
};
