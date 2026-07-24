import type { GeneratedQuestion } from "../questions/types";
import type { Bilingual } from "../i18n/dictionary";

/** Mirrors the no-carry simulation in wholeNumbers.ts so we can detect
 * the exact same mistake pattern from a free-typed "fill" answer, not
 * just from picking the matching MCQ distractor. */
function noCarryAdd(a: number, b: number): number {
  const da = String(a).split("").reverse();
  const db = String(b).split("").reverse();
  const len = Math.max(da.length, db.length);
  let result = "";
  for (let i = 0; i < len; i++) {
    const digitA = Number(da[i] ?? 0);
    const digitB = Number(db[i] ?? 0);
    result = String((digitA + digitB) % 10) + result;
  }
  return Number(result);
}

/** Mirrors the no-borrow simulation in wholeNumbersSubtraction.ts so we
 * can detect the same mistake pattern from a free-typed "fill" answer. */
function noBorrowSubtract(a: number, b: number): number {
  const da = String(a).split("").reverse();
  const db = String(b).split("").reverse();
  const len = Math.max(da.length, db.length);
  let result = "";
  for (let i = 0; i < len; i++) {
    const digitA = Number(da[i] ?? 0);
    const digitB = Number(db[i] ?? 0);
    result = String(Math.abs(digitA - digitB)) + result;
  }
  return Number(result);
}

export interface ClassificationResult {
  mistakeType: string;
  /** Short, kid-facing hint used as a fallback if the AI call fails/is skipped */
  hint: Bilingual;
}

/**
 * Rule-based, deterministic, and free — this runs on every wrong answer,
 * before (and independent of) any OpenAI call. Professor Nombor's AI text
 * (Phase 2) explains the mistake_type in natural language; this function
 * decides WHICH mistake_type it is.
 */
export function classifyMistake(question: GeneratedQuestion, studentAnswer: string): ClassificationResult {
  const answer = studentAnswer.trim();

  switch (question.generatorKey) {
    case "whole_numbers_addition": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      if (Number(answer) === noCarryAdd(a, b)) {
        return {
          mistakeType: "forgot_carry",
          hint: {
            ms: "Jangan lupa \"simpan\" apabila jumlah lajur lebih 9.",
            en: "Don't forget to \"carry\" when a column's total is more than 9.",
          },
        };
      }
      if (Math.abs(Number(answer) - correct) % 10 === 0 && answer !== String(correct)) {
        return {
          mistakeType: "place_value_misalignment",
          hint: {
            ms: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?",
            en: "Double check: is every digit lined up in the correct place value column?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cuba tambah semula langkah demi langkah, bermula dari lajur sa.",
          en: "Try adding again step by step, starting from the ones column.",
        },
      };
    }

    case "fractions_same_denominator": {
      const { numA, numB, denom, correctNum } = question.context as {
        numA: number; numB: number; denom: number; correctNum: number;
      };
      if (answer === `${correctNum}/${denom * 2}`) {
        return {
          mistakeType: "denominator_addition_error",
          hint: {
            ms: "Penyebut sepatutnya kekal sama — hanya pengangka (nombor atas) yang ditambah.",
            en: "The denominator should stay the same — only the numerator (top number) gets added.",
          },
        };
      }
      if (answer === `${numA}/${denom}` || answer === `${numB}/${denom}`) {
        return {
          mistakeType: "incomplete_addition",
          hint: {
            ms: "Nampaknya hanya satu pecahan sahaja dikira. Tambah KEDUA-DUA pengangka.",
            en: "It looks like only one fraction was counted. Add BOTH numerators.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Semak semula pengangka: adakah kedua-dua nombor atas sudah ditambah?",
          en: "Check the numerator again: have both top numbers been added?",
        },
      };
    }

    case "money_change": {
      const { priceSen, paidSen, changeSen } = question.context as {
        priceSen: number; paidSen: number; changeSen: number;
      };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      if (Math.abs(answerSen - changeSen) === 100) {
        return {
          mistakeType: "subtraction_borrow_error",
          hint: {
            ms: "Semak semula proses \"pinjam\" semasa menolak — beza jawapan anda tepat RM1.00.",
            en: "Check the \"borrowing\" step in your subtraction again — your answer is off by exactly RM1.00.",
          },
        };
      }
      if (!Number.isNaN(answerSen) && answerSen !== changeSen) {
        return {
          mistakeType: "ringgit_sen_conversion_error",
          hint: {
            ms: "Cuba tukar semua kepada sen dahulu sebelum menolak, contohnya RM5.00 = 500 sen.",
            en: "Try converting everything to sen first before subtracting, e.g. RM5.00 = 500 sen.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cuba kira semula: Wang Dibayar − Harga Barang.",
          en: "Try calculating again: Money Paid − Item Price.",
        },
      };
    }

    case "perimeter": {
      const { length, width, correct } = question.context as { length: number; width: number; correct: number };
      if (Number(answer) === length * width) {
        return {
          mistakeType: "perimeter_area_confusion",
          hint: {
            ms: "Perimeter ialah jumlah semua sisi, bukan luas. Cuba 2 × (panjang + lebar).",
            en: "Perimeter is the total of all sides, not the area. Try 2 × (length + width).",
          },
        };
      }
      if (Number(answer) === length + width) {
        return {
          mistakeType: "forgot_double_perimeter",
          hint: {
            ms: "Jangan lupa gandakan (panjang + lebar) dengan 2, kerana setiap sisi berulang dua kali.",
            en: "Don't forget to double (length + width) by 2, since each side is repeated twice.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 2 × (panjang + lebar).", en: "Try calculating again: 2 × (length + width)." },
      };
    }

    case "decimal_add_subtract": {
      return {
        mistakeType: "decimal_point_misalignment",
        hint: {
          ms: "Semak semula: adakah titik perpuluhan disusun lurus semasa mengira?",
          en: "Check again: were the decimal points lined up correctly when calculating?",
        },
      };
    }

    case "percentage_of_quantity": {
      const { percent, quantity, correct } = question.context as { percent: number; quantity: number; correct: number };
      if (Number(answer) === percent * quantity) {
        return {
          mistakeType: "forgot_divide_by_100",
          hint: {
            ms: "Peratus perlu dibahagi 100 dahulu sebelum didarab dengan kuantiti.",
            en: "The percentage needs to be divided by 100 first before multiplying by the quantity.",
          },
        };
      }
      if (Math.abs(Number(answer) - Math.round(quantity / percent)) < 1) {
        return {
          mistakeType: "inverted_percentage_operation",
          hint: {
            ms: "Cuba darab kuantiti dengan peratus/100, bukan bahagi.",
            en: "Try multiplying the quantity by percent/100, not dividing.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: (peratus ÷ 100) × kuantiti.", en: "Try calculating again: (percent ÷ 100) × quantity." },
      };
    }

    case "time_duration": {
      const { startHour, startMinute, durationMinutes, correct } = question.context as {
        startHour: number; startMinute: number; durationMinutes: number; correct: string;
      };
      const noCarryMinute = (startMinute + durationMinutes) % 60;
      const noCarryTime = `${((startHour - 1) % 12) + 1}:${String(noCarryMinute).padStart(2, "0")}`;
      if (answer === noCarryTime) {
        return {
          mistakeType: "time_carry_error",
          hint: {
            ms: "Apabila minit melebihi 60, tukar 60 minit kepada 1 jam dan tambah pada jam.",
            en: "When minutes go past 60, convert 60 minutes into 1 hour and add it to the hour.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: `Cuba kira semula bermula dari ${correct === answer ? "" : "waktu mula"}.`, en: "Try calculating again from the start time." },
      };
    }

    case "average": {
      const { sum, count } = question.context as { sum: number; count: number };
      if (Number(answer) === sum) {
        return {
          mistakeType: "forgot_divide_average",
          hint: {
            ms: "Purata perlu dibahagi dengan bilangan nombor — jangan berhenti pada jumlah sahaja.",
            en: "The average needs to be divided by how many numbers there are — don't stop at just the sum.",
          },
        };
      }
      if (Number(answer) === Math.round(sum / (count - 1))) {
        return {
          mistakeType: "wrong_count_average",
          hint: {
            ms: "Semak semula: berapa banyak nombor sepatutnya anda bahagikan dengan?",
            en: "Double check: how many numbers should you actually be dividing by?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Purata = Jumlah ÷ Bilangan nombor.", en: "Average = Sum ÷ Count of numbers." },
      };
    }

    case "simplify_ratio": {
      const { a, b, simplifiedA, simplifiedB } = question.context as {
        a: number; b: number; simplifiedA: number; simplifiedB: number;
      };
      if (answer === `${simplifiedB}:${simplifiedA}`) {
        return {
          mistakeType: "ratio_order_reversed",
          hint: {
            ms: "Susunan nisbah penting — pastikan bahagian pertama kekal di depan.",
            en: "The order in a ratio matters — make sure the first part stays first.",
          },
        };
      }
      return {
        mistakeType: "ratio_not_fully_simplified",
        hint: {
          ms: "Cari nombor terbesar yang boleh membahagikan kedua-dua bahagian nisbah dengan tepat.",
          en: "Find the largest number that divides both parts of the ratio evenly.",
        },
      };
    }

    case "volume": {
      const { totalMlA, mlB, correctMl } = question.context as { totalMlA: number; mlB: number; correctMl: number };
      if (Number(answer) === mlB + (totalMlA - Math.floor(totalMlA / 1000) * 1000)) {
        return {
          mistakeType: "volume_conversion_error",
          hint: {
            ms: "Tukar liter kepada ml dahulu (1 L = 1000 ml) sebelum menambah.",
            en: "Convert litres to ml first (1 L = 1000 ml) before adding.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Tukar semua kepada ml dahulu, kemudian tambah.", en: "Convert everything to ml first, then add." },
      };
    }

    case "area_rectangle": {
      const { length, width, correct } = question.context as { length: number; width: number; correct: number };
      if (Number(answer) === 2 * (length + width)) {
        return {
          mistakeType: "area_perimeter_confusion",
          hint: {
            ms: "Luas ialah panjang × lebar, bukan perimeter. Cuba darab, bukan tambah.",
            en: "Area is length × width, not perimeter. Try multiplying, not adding.",
          },
        };
      }
      if (Number(answer) === length + width) {
        return {
          mistakeType: "forgot_multiply_area",
          hint: {
            ms: "Untuk mencari luas, darabkan panjang dengan lebar.",
            en: "To find the area, multiply the length by the width.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: panjang × lebar.", en: "Try calculating again: length × width." },
      };
    }

    case "angles_straight_line": {
      const { angleA, correct } = question.context as { angleA: number; correct: number };
      if (Number(answer) === Math.abs(90 - angleA)) {
        return {
          mistakeType: "confused_with_complementary",
          hint: {
            ms: "Sudut pada garis lurus berjumlah 180°, bukan 90°.",
            en: "Angles on a straight line add up to 180°, not 90°.",
          },
        };
      }
      if (Number(answer) === angleA) {
        return {
          mistakeType: "no_operation_performed",
          hint: {
            ms: "Tolak sudut yang diberi daripada 180° untuk cari sudut satu lagi.",
            en: "Subtract the given angle from 180° to find the other angle.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 180° − sudut yang diberi.", en: "Try calculating again: 180° − the given angle." },
      };
    }

    case "area_composite": {
      const { area1, correct } = question.context as { area1: number; correct: number };
      if (Number(answer) === area1) {
        return {
          mistakeType: "forgot_second_rectangle",
          hint: {
            ms: "Jangan lupa kira luas KEDUA-DUA segi empat tepat, kemudian tambah.",
            en: "Don't forget to work out the area of BOTH rectangles, then add them.",
          },
        };
      }
      return {
        mistakeType: "area_addition_error",
        hint: {
          ms: "Kira luas setiap segi empat tepat berasingan (panjang × lebar), kemudian tambah kedua-duanya.",
          en: "Calculate each rectangle's area separately (length × width), then add the two together.",
        },
      };
    }

    case "angles_triangle_sum": {
      const { angleA, angleB, correct } = question.context as { angleA: number; angleB: number; correct: number };
      if (Number(answer) === 360 - angleA - angleB) {
        return {
          mistakeType: "confused_angle_sum_360",
          hint: {
            ms: "Sudut dalam segi tiga berjumlah 180°, bukan 360°. 360° ialah untuk sudut pada satu titik.",
            en: "Angles in a triangle add up to 180°, not 360°. 360° is for angles at a point.",
          },
        };
      }
      if (Number(answer) === 180 - angleA) {
        return {
          mistakeType: "only_subtracted_one_angle",
          hint: {
            ms: "Tolak KEDUA-DUA sudut yang diberi daripada 180°, bukan satu sahaja.",
            en: "Subtract BOTH given angles from 180°, not just one.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 180° − sudut pertama − sudut kedua.", en: "Try calculating again: 180° − first angle − second angle." },
      };
    }

    case "angles_classify": {
      const { degrees, correctType } = question.context as { degrees: number; correctType: string };
      if (answer === "right" && correctType !== "right") {
        return {
          mistakeType: "confused_with_right_angle",
          hint: {
            ms: "Sudut tegak (right angle) ialah TEPAT 90°. Sudut ini bukan tepat 90°.",
            en: "A right angle is EXACTLY 90°. This angle isn't exactly 90°.",
          },
        };
      }
      if (correctType === "reflex" && answer !== "reflex") {
        return {
          mistakeType: "missed_reflex_angle",
          hint: {
            ms: "Sudut refleks lebih besar daripada 180°. Lihat bahagian rajah yang lebih besar.",
            en: "A reflex angle is greater than 180°. Look at the larger part of the diagram.",
          },
        };
      }
      return {
        mistakeType: "angle_type_confusion",
        hint: {
          ms: "Ingat: Tirus < 90° < Tegak = 90° < Cakah < 180° < Refleks < 360°.",
          en: "Remember: Acute < 90° < Right = 90° < Obtuse < 180° < Reflex < 360°.",
        },
      };
    }

    case "area_triangle": {
      const { base, height, correct } = question.context as { base: number; height: number; correct: number };
      if (Number(answer) === base * height) {
        return {
          mistakeType: "forgot_to_halve",
          hint: {
            ms: "Luas segi tiga ialah SEPARUH daripada tapak × tinggi. Jangan lupa bahagi dengan 2.",
            en: "The area of a triangle is HALF of base × height. Don't forget to divide by 2.",
          },
        };
      }
      if (Number(answer) === Math.round((base / 2) * (height / 2))) {
        return {
          mistakeType: "halved_both_dimensions",
          hint: {
            ms: "Darab tapak dengan tinggi dahulu, kemudian bahagikan HASIL itu dengan 2 — bukan bahagikan kedua-dua nombor dahulu.",
            en: "Multiply base by height first, then divide that RESULT by 2 — not divide both numbers first.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: (tapak × tinggi) ÷ 2.", en: "Try calculating again: (base × height) ÷ 2." },
      };
    }

    case "angles_at_point": {
      const { angleA, angleB, correct } = question.context as { angleA: number; angleB: number; correct: number };
      if (Number(answer) === Math.abs(180 - angleA - angleB)) {
        return {
          mistakeType: "confused_with_180",
          hint: {
            ms: "Sudut pada satu titik berjumlah 360°, bukan 180°. 180° ialah untuk sudut pada garis lurus atau dalam segi tiga.",
            en: "Angles at a point add up to 360°, not 180°. 180° is for angles on a straight line or in a triangle.",
          },
        };
      }
      if (Number(answer) === 360 - angleA) {
        return {
          mistakeType: "only_subtracted_one_angle",
          hint: {
            ms: "Tolak KEDUA-DUA sudut yang diberi daripada 360°, bukan satu sahaja.",
            en: "Subtract BOTH given angles from 360°, not just one.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 360° − sudut pertama − sudut kedua.", en: "Try calculating again: 360° − first angle − second angle." },
      };
    }

    case "circumference": {
      const { radius, correct } = question.context as { radius: number; correct: number };
      const PI = 3.142;
      if (answer === (radius * PI).toFixed(2)) {
        return {
          mistakeType: "forgot_to_double_radius",
          hint: {
            ms: "Lilitan = 2 × π × jejari. Jangan lupa gandakan jejari (×2) sebelum darab dengan π.",
            en: "Circumference = 2 × π × radius. Don't forget to double the radius (×2) before multiplying by π.",
          },
        };
      }
      if (answer === (radius * radius * PI).toFixed(2)) {
        return {
          mistakeType: "confused_with_area_formula",
          hint: {
            ms: "Itu ialah formula LUAS bulatan (π × jejari²), bukan lilitan. Lilitan ialah 2 × π × jejari.",
            en: "That's the AREA formula for a circle (π × radius²), not circumference. Circumference is 2 × π × radius.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 2 × π × jejari (guna π = 3.142).", en: "Try calculating again: 2 × π × radius (use π = 3.142)." },
      };
    }

    case "area_circle": {
      const { radius, correct } = question.context as { radius: number; correct: number };
      const PI = 3.142;
      if (answer === (2 * radius * PI).toFixed(2)) {
        return {
          mistakeType: "confused_with_circumference_formula",
          hint: {
            ms: "Itu ialah formula LILITAN (2 × π × jejari), bukan luas. Luas ialah π × jejari × jejari.",
            en: "That's the CIRCUMFERENCE formula (2 × π × radius), not area. Area is π × radius × radius.",
          },
        };
      }
      if (answer === (2 * radius * (2 * radius) * PI).toFixed(2)) {
        return {
          mistakeType: "squared_diameter_instead",
          hint: {
            ms: "Anda mendarab diameter (2 × jejari) dengan dirinya, bukan jejari. Guna jejari sahaja: π × jejari × jejari.",
            en: "You squared the diameter (2 × radius) instead of the radius. Use the radius only: π × radius × radius.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: π × jejari × jejari (guna π = 3.142).", en: "Try calculating again: π × radius × radius (use π = 3.142)." },
      };
    }

    case "whole_numbers_subtraction": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      if (Number(answer) === noBorrowSubtract(a, b)) {
        return {
          mistakeType: "forgot_borrow",
          hint: {
            ms: "Apabila digit atas lebih kecil daripada digit bawah, anda perlu \"pinjam\" 1 daripada lajur sebelah kiri.",
            en: "When the top digit is smaller than the bottom digit, you need to \"borrow\" 1 from the column on the left.",
          },
        };
      }
      if (Math.abs(Number(answer) - correct) % 10 === 0 && answer !== String(correct)) {
        return {
          mistakeType: "place_value_misalignment",
          hint: {
            ms: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?",
            en: "Double check: is every digit lined up in the correct place value column?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula, lajur demi lajur dari kanan.", en: "Try calculating again, column by column from the right." },
      };
    }

    case "whole_numbers_multiplication": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      const tens = Math.floor(b / 10);
      const ones = b % 10;
      if (Number(answer) === a * tens + a * ones) {
        return {
          mistakeType: "forgot_shift",
          hint: {
            ms: "Apabila darab dengan digit puluh, jangan lupa tambah satu 0 di hujung hasil darab kedua sebelum menambahnya.",
            en: "When multiplying by the tens digit, don't forget to add a trailing 0 to that partial product before adding it.",
          },
        };
      }
      if (Number(answer) === a + b) {
        return {
          mistakeType: "added_instead_of_multiplied",
          hint: {
            ms: "Ini soalan darab, bukan tambah. Darabkan kedua-dua nombor itu.",
            en: "This is a multiplication question, not addition. Multiply the two numbers together.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula hasil darab itu.", en: "Try calculating the product again." },
      };
    }

    case "whole_numbers_division": {
      const { dividend, divisor, correct } = question.context as { dividend: number; divisor: number; correct: number };
      if (Number(answer) === dividend - divisor) {
        return {
          mistakeType: "subtracted_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tolak. Berapa kali boleh anda tolak pembahagi daripada nombor itu?",
            en: "This is a division question, not subtraction. How many times does the divisor fit into the number?",
          },
        };
      }
      if (Number(answer) === dividend + divisor) {
        return {
          mistakeType: "added_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tambah. Cari berapa kali pembahagi masuk ke dalam nombor itu.",
            en: "This is a division question, not addition. Find how many times the divisor fits into the number.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: berapa kali pembahagi boleh masuk ke dalam nombor itu.", en: "Try calculating again: how many times does the divisor fit into the number." },
      };
    }

    case "whole_numbers_division_y5": {
      const { dividend, divisor, correct } = question.context as { dividend: number; divisor: number; correct: number };
      if (Number(answer) === dividend - divisor) {
        return {
          mistakeType: "subtracted_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tolak. Berapa kali boleh anda tolak pembahagi daripada nombor itu?",
            en: "This is a division question, not subtraction. How many times does the divisor fit into the number?",
          },
        };
      }
      if (Number(answer) === dividend + divisor) {
        return {
          mistakeType: "added_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tambah. Cari berapa kali pembahagi masuk ke dalam nombor itu.",
            en: "This is a division question, not addition. Find how many times the divisor fits into the number.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: berapa kali pembahagi boleh masuk ke dalam nombor itu.", en: "Try calculating again: how many times does the divisor fit into the number." },
      };
    }

    case "whole_numbers_multiplication_y6": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      const tens = Math.floor(b / 10);
      const ones = b % 10;
      if (Number(answer) === a * tens + a * ones) {
        return {
          mistakeType: "forgot_shift",
          hint: {
            ms: "Apabila darab dengan digit puluh, jangan lupa tambah satu 0 di hujung hasil darab kedua sebelum menambahnya.",
            en: "When multiplying by the tens digit, don't forget to add a trailing 0 to that partial product before adding it.",
          },
        };
      }
      if (Number(answer) === a + b) {
        return {
          mistakeType: "added_instead_of_multiplied",
          hint: {
            ms: "Ini soalan darab, bukan tambah. Darabkan kedua-dua nombor itu.",
            en: "This is a multiplication question, not addition. Multiply the two numbers together.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula hasil darab itu.", en: "Try calculating the product again." },
      };
    }

    case "mixed_operations": {
      const { a, b, c, correct } = question.context as { a: number; b: number; c: number; correct: number };
      if (Number(answer) === (a + b) * c) {
        return {
          mistakeType: "ignored_order_of_operations",
          hint: {
            ms: "Buat pendaraban dahulu, kemudian penambahan — bukan dari kiri ke kanan.",
            en: "Do the multiplication first, then the addition — not strictly left to right.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: darab dahulu, kemudian tambah.", en: "Try calculating again: multiply first, then add." },
      };
    }

    case "whole_numbers_multiplication_y4": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      const digits = String(a).split("").reverse();
      let noCarry = "";
      for (const d of digits) noCarry = String((Number(d) * b) % 10) + noCarry;
      if (Number(answer) === Number(noCarry)) {
        return {
          mistakeType: "forgot_carry",
          hint: {
            ms: "Apabila hasil darab satu digit lebih daripada 9, jangan lupa \"simpan\" baki ke lajur seterusnya.",
            en: "When one digit's product is more than 9, don't forget to \"carry\" the extra into the next column.",
          },
        };
      }
      if (Number(answer) === a + b) {
        return {
          mistakeType: "added_instead_of_multiplied",
          hint: {
            ms: "Ini soalan darab, bukan tambah. Darabkan kedua-dua nombor itu.",
            en: "This is a multiplication question, not addition. Multiply the two numbers together.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula hasil darab itu.", en: "Try calculating the product again." },
      };
    }

    case "whole_numbers_division_y4": {
      const { dividend, divisor, correct } = question.context as { dividend: number; divisor: number; correct: number };
      if (Number(answer) === dividend - divisor) {
        return {
          mistakeType: "subtracted_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tolak. Berapa kali boleh anda tolak pembahagi daripada nombor itu?",
            en: "This is a division question, not subtraction. How many times does the divisor fit into the number?",
          },
        };
      }
      if (Number(answer) === dividend + divisor) {
        return {
          mistakeType: "added_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tambah. Cari berapa kali pembahagi masuk ke dalam nombor itu.",
            en: "This is a division question, not addition. Find how many times the divisor fits into the number.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: berapa kali pembahagi boleh masuk ke dalam nombor itu.", en: "Try calculating again: how many times does the divisor fit into the number." },
      };
    }

    case "whole_numbers_addition_y5": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      if (Number(answer) === noCarryAdd(a, b)) {
        return {
          mistakeType: "forgot_carry",
          hint: {
            ms: "Jangan lupa \"simpan\" apabila jumlah lajur lebih 9.",
            en: "Don't forget to \"carry\" when a column's total is more than 9.",
          },
        };
      }
      if (Math.abs(Number(answer) - correct) % 100 === 0 && answer !== String(correct)) {
        return {
          mistakeType: "place_value_misalignment",
          hint: {
            ms: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?",
            en: "Double check: is every digit lined up in the correct place value column?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cuba tambah semula langkah demi langkah, bermula dari lajur sa.",
          en: "Try adding again step by step, starting from the ones column.",
        },
      };
    }

    case "whole_numbers_subtraction_y5": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      if (Number(answer) === noBorrowSubtract(a, b)) {
        return {
          mistakeType: "forgot_borrow",
          hint: {
            ms: "Apabila digit atas lebih kecil daripada digit bawah, anda perlu \"pinjam\" 1 daripada lajur sebelah kiri.",
            en: "When the top digit is smaller than the bottom digit, you need to \"borrow\" 1 from the column on the left.",
          },
        };
      }
      if (Math.abs(Number(answer) - correct) % 100 === 0 && answer !== String(correct)) {
        return {
          mistakeType: "place_value_misalignment",
          hint: {
            ms: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?",
            en: "Double check: is every digit lined up in the correct place value column?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula, lajur demi lajur dari kanan.", en: "Try calculating again, column by column from the right." },
      };
    }

    case "whole_numbers_addition_y6": {
      const { a, b } = question.context as { a: number; b: number; c: number; correct: number };
      if (Number(answer) === a + b) {
        return {
          mistakeType: "forgot_addend",
          hint: {
            ms: "Ada TIGA nombor dalam soalan ini — semak semula anda sudah tambah kesemuanya.",
            en: "There are THREE numbers in this question — double check you've added all of them.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba tambah semula ketiga-tiga nombor itu, satu demi satu.", en: "Try adding all three numbers again, one at a time." },
      };
    }

    case "whole_numbers_subtraction_y6": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      if (Number(answer) === noBorrowSubtract(a, b)) {
        return {
          mistakeType: "forgot_borrow",
          hint: {
            ms: "Apabila digit atas ialah 0 dan digit bawah lebih besar, anda perlu \"pinjam\" merentasi beberapa lajur 0 secara berturutan.",
            en: "When the top digit is 0 and the bottom digit is bigger, you need to \"borrow\" across several zero columns in a row.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula, lajur demi lajur dari kanan — berhati-hati dengan lajur 0.", en: "Try calculating again, column by column from the right — watch the zero columns carefully." },
      };
    }

    case "fractions_subtract_same_denominator": {
      const { numA, numB, denom, correctNum } = question.context as {
        numA: number; numB: number; denom: number; correctNum: number;
      };
      if (answer === `${numA + numB}/${denom}`) {
        return {
          mistakeType: "added_instead_of_subtracted",
          hint: {
            ms: "Ini soalan tolak, bukan tambah. Tolak pengangka kedua daripada pengangka pertama.",
            en: "This is a subtraction question, not addition. Subtract the second numerator from the first.",
          },
        };
      }
      if (answer === `${correctNum}/${Math.max(denom - numB, 1)}`) {
        return {
          mistakeType: "denominator_subtraction_error",
          hint: {
            ms: "Penyebut sepatutnya kekal sama — hanya pengangka (nombor atas) yang ditolak.",
            en: "The denominator should stay the same — only the numerator (top number) gets subtracted.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Semak semula pengangka: adakah pengangka kedua sudah ditolak daripada pengangka pertama?",
          en: "Check the numerator again: has the second numerator been subtracted from the first?",
        },
      };
    }

    case "decimal_add_subtract_y4": {
      return {
        mistakeType: "decimal_point_misalignment",
        hint: {
          ms: "Semak semula: adakah titik perpuluhan disusun lurus semasa mengira?",
          en: "Check again: were the decimal points lined up correctly when calculating?",
        },
      };
    }

    case "decimal_multiply": {
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      if (Math.abs(Number(answer) - Math.round(a * 10) * b) < 0.05) {
        return {
          mistakeType: "ignored_decimal_point",
          hint: {
            ms: "Jangan abaikan titik perpuluhan semasa mendarab — letakkan semula selepas mengira.",
            en: "Don't ignore the decimal point while multiplying — place it back after calculating.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba darab semula, kemudian semak kedudukan titik perpuluhan.", en: "Try multiplying again, then check where the decimal point goes." },
      };
    }

    case "decimal_divide": {
      const { dividend, divisor, correct } = question.context as { dividend: number; divisor: number; correct: number };
      if (Math.abs(Number(answer) - Math.round(dividend * 10) / divisor) < 0.05) {
        return {
          mistakeType: "ignored_decimal_point",
          hint: {
            ms: "Jangan abaikan titik perpuluhan semasa membahagi — letakkan semula selepas mengira.",
            en: "Don't ignore the decimal point while dividing — place it back after calculating.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba bahagi semula, kemudian semak kedudukan titik perpuluhan.", en: "Try dividing again, then check where the decimal point goes." },
      };
    }

    case "fractions_divide_by_whole": {
      const { num, denom, whole, correctNum, correctDenom } = question.context as {
        num: number; denom: number; whole: number; correctNum: number; correctDenom: number;
      };
      if (answer === `${num * whole}/${denom}`) {
        return {
          mistakeType: "multiplied_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan darab. Darabkan PENYEBUT dengan nombor bulat itu, bukan pengangka.",
            en: "This is a division question, not multiplication. Multiply the DENOMINATOR by the whole number, not the numerator.",
          },
        };
      }
      if (answer === `${num}/${denom * whole}` && `${num}/${denom * whole}` !== `${correctNum}/${correctDenom}`) {
        return {
          mistakeType: "forgot_to_simplify",
          hint: {
            ms: "Jawapan itu betul tetapi belum dipermudahkan. Bahagikan pengangka dan penyebut dengan faktor sepunya.",
            en: "That answer is correct but not simplified. Divide both numerator and denominator by their common factor.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Ingat peraturan: (a/b) ÷ c = a/(b × c).",
          en: "Remember the rule: (a/b) ÷ c = a/(b × c).",
        },
      };
    }

    case "money_add_subtract": {
      return {
        mistakeType: "ringgit_sen_carry_error",
        hint: {
          ms: "Semak semula: adakah sen dan ringgit \"disimpan\"/\"dipinjam\" dengan betul apabila sen melebihi 100?",
          en: "Check again: were the ringgit and sen carried/borrowed correctly when the sen total passed 100?",
        },
      };
    }

    case "money_multiply_divide": {
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Tukar kepada sen dahulu, kira, kemudian tukar semula kepada RM.",
          en: "Convert to sen first, calculate, then convert back to RM.",
        },
      };
    }

    case "simple_interest": {
      const { principalRM, rate, years, interestSen } = question.context as {
        principalRM: number; rate: number; years: number; interestSen: number;
      };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      if (Math.abs(answerSen - Math.round((principalRM * 100 * rate) / 100)) < 5) {
        return {
          mistakeType: "forgot_years_multiplier",
          hint: {
            ms: "Jangan lupa darabkan dengan bilangan TAHUN — faedah berulang setiap tahun.",
            en: "Don't forget to multiply by the number of YEARS — interest accumulates every year.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Formula: Faedah = Prinsipal × Kadar × Tahun ÷ 100.",
          en: "Formula: Interest = Principal × Rate × Years ÷ 100.",
        },
      };
    }

    case "profit_loss": {
      const { costSen, sellingSen, resultSen } = question.context as {
        costSen: number; sellingSen: number; resultSen: number;
      };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      if (Math.abs(answerSen - (costSen + sellingSen)) < 5) {
        return {
          mistakeType: "added_instead_of_subtracted",
          hint: {
            ms: "Untung/rugi ialah BEZA antara harga jualan dan harga kos, bukan jumlahnya.",
            en: "Profit/loss is the DIFFERENCE between selling price and cost price, not their sum.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula beza antara harga jualan dan harga kos.", en: "Try calculating the difference between selling price and cost price again." },
      };
    }

    case "time_add_subtract": {
      return {
        mistakeType: "time_base60_carry_error",
        hint: {
          ms: "Ingat: 60 minit = 1 jam. Semak semula sama ada anda \"simpan\"/\"pinjam\" jam dengan betul.",
          en: "Remember: 60 minutes = 1 hour. Check whether you carried/borrowed the hour correctly.",
        },
      };
    }

    case "length_add_subtract": {
      return {
        mistakeType: "length_base100_carry_error",
        hint: {
          ms: "Ingat: 100 cm = 1 m. Semak semula sama ada anda \"simpan\"/\"pinjam\" meter dengan betul.",
          en: "Remember: 100 cm = 1 m. Check whether you carried/borrowed the metre correctly.",
        },
      };
    }

    case "unit_convert": {
      const { factor, bigToSmall } = question.context as unknown as { factor: number; bigToSmall: string };
      const wasBigToSmall = bigToSmall === "yes";
      return {
        mistakeType: "wrong_conversion_factor",
        hint: {
          ms: `Semak semula faktor penukaran itu — betulkah anda ${wasBigToSmall ? "darab" : "bahagi"} dengan ${factor}?`,
          en: `Double check the conversion factor — did you ${wasBigToSmall ? "multiply" : "divide"} by ${factor}?`,
        },
      };
    }

    case "discount": {
      const { discountSen, finalSen } = question.context as { discountSen: number; finalSen: number };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      if (Math.abs(answerSen - discountSen) < 5) {
        return {
          mistakeType: "gave_discount_amount_not_final_price",
          hint: {
            ms: "Itu jumlah diskaun sahaja. Soalan minta harga SELEPAS diskaun — tolak diskaun daripada harga asal.",
            en: "That's just the discount amount. The question asks for the price AFTER the discount — subtract the discount from the original price.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cari jumlah diskaun dahulu, kemudian tolak daripada harga asal.", en: "Find the discount amount first, then subtract it from the original price." },
      };
    }

    case "likelihood": {
      return {
        mistakeType: "likelihood_misconception",
        hint: {
          ms: "Fikirkan: berapa banyak cara untuk berjaya, berbanding jumlah keseluruhan?",
          en: "Think about it: how many ways to succeed, compared to the total?",
        },
      };
    }

    case "fractions_percentage_convert": {
      return {
        mistakeType: "fraction_percentage_conversion_error",
        hint: {
          ms: "Ingat: peratus ialah \"per seratus\". Skalakan pengangka dan penyebut supaya penyebut menjadi 100.",
          en: "Remember: percent means \"per hundred\". Scale the numerator and denominator so the denominator becomes 100.",
        },
      };
    }

    case "fractions_multiply": {
      const { num, denom, whole } = question.context as { num: number; denom: number; whole: number };
      if (answer === `${num}/${denom * whole}`) {
        return {
          mistakeType: "multiplied_denominator_instead",
          hint: {
            ms: "Ini soalan darab, bukan bahagi. Darabkan PENGANGKA dengan nombor bulat itu, bukan penyebut.",
            en: "This is a multiplication question, not division. Multiply the NUMERATOR by the whole number, not the denominator.",
          },
        };
      }
      return {
        mistakeType: "forgot_to_simplify",
        hint: {
          ms: "Semak semula sama ada jawapan anda sudah dipermudahkan.",
          en: "Check whether your answer is already in simplest form.",
        },
      };
    }

    case "decimal_percentage_convert": {
      return {
        mistakeType: "decimal_percentage_scale_error",
        hint: {
          ms: "Ingat: darab dengan 100 untuk tukar perpuluhan kepada peratus, bahagi dengan 100 untuk arah bertentangan.",
          en: "Remember: multiply by 100 to convert a decimal to a percentage, divide by 100 for the reverse.",
        },
      };
    }

    case "percentage_add_subtract": {
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Layan peratus seperti nombor bulat biasa — tambah atau tolak terus.",
          en: "Treat the percentages like regular whole numbers — add or subtract directly.",
        },
      };
    }

    case "fractions_divide_mixed_by_whole": {
      const { fracNum, denom, divisor } = question.context as { fracNum: number; denom: number; divisor: number };
      if (answer === `${fracNum}/${denom * divisor}`) {
        return {
          mistakeType: "ignored_whole_number_part",
          hint: {
            ms: "Jangan lupa tukar nombor bercampur kepada pecahan tak wajar dahulu, sebelum membahagi.",
            en: "Don't forget to convert the mixed number to an improper fraction first, before dividing.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Tukar kepada pecahan tak wajar dahulu, kemudian darabkan penyebut dengan nombor bulat itu.",
          en: "Convert to an improper fraction first, then multiply the denominator by the whole number.",
        },
      };
    }

    case "service_tax": {
      const { taxSen, totalSen } = question.context as { taxSen: number; totalSen: number };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      if (Math.abs(answerSen - taxSen) < 5) {
        return {
          mistakeType: "gave_tax_only",
          hint: {
            ms: "Itu jumlah cukai sahaja. Soalan minta JUMLAH PERLU DIBAYAR — tambah cukai pada jumlah invois.",
            en: "That's just the tax amount. The question asks for the TOTAL PAYABLE — add the tax to the invoice amount.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cari jumlah cukai dahulu, kemudian tambah pada jumlah invois.", en: "Find the tax amount first, then add it to the invoice total." },
      };
    }

    case "dividend": {
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Darabkan bilangan saham dengan dividen bagi setiap saham.",
          en: "Multiply the number of shares by the dividend per share.",
        },
      };
    }

    case "proportion": {
      const { a, b, knownVal } = question.context as { a: number; b: number; knownVal: number };
      if (Number(answer) === knownVal + Math.abs(a - b)) {
        return {
          mistakeType: "added_instead_of_scaled",
          hint: {
            ms: "Ini soalan nisbah — cari FAKTOR SKALA dahulu (bahagikan), jangan tambah beza.",
            en: "This is a ratio question — find the SCALE FACTOR first (by dividing), don't add the difference.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cari faktor skala daripada kuantiti yang diketahui, kemudian gunakan pada sisi nisbah yang satu lagi.",
          en: "Find the scale factor from the known quantity, then apply it to the other side of the ratio.",
        },
      };
    }

    case "asset_liability": {
      return {
        mistakeType: "asset_liability_misconception",
        hint: {
          ms: "Aset ialah sesuatu yang anda MILIKI dan bernilai. Liabiliti ialah sesuatu yang anda TERHUTANG.",
          en: "An asset is something you OWN that has value. A liability is something you OWE.",
        },
      };
    }

    case "bar_graph": {
      const ctx = question.context as { variant: string; v0: number; v1: number; v2: number; v3: number; correct: number; iHigh?: number; iLow?: number };
      const values = [ctx.v0, ctx.v1, ctx.v2, ctx.v3];
      if (ctx.variant === "total") {
        const forgotOneOptions = values.map((_, i) => ctx.correct - values[i]);
        if (forgotOneOptions.includes(Number(answer))) {
          return {
            mistakeType: "forgot_one_bar",
            hint: {
              ms: "Semak semula: adakah anda tambah kesemua 4 kumpulan, atau terlepas satu?",
              en: "Double check: did you add up all 4 groups, or miss one?",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: { ms: "Cuba tambah semula nilai bagi kesemua 4 kumpulan.", en: "Try adding up the values for all 4 groups again." },
        };
      }
      if (Number(answer) === values[0] + values[1]) {
        return {
          mistakeType: "added_instead_of_subtracted",
          hint: {
            ms: "Soalan ini minta BEZA (perbezaan), bukan jumlah — tolak nilai yang lebih kecil daripada nilai yang lebih besar.",
            en: "This question asks for the DIFFERENCE, not a total — subtract the smaller value from the bigger one.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cari nilai kumpulan tertinggi dan terendah, kemudian tolak.", en: "Find the highest and lowest group's values, then subtract." },
      };
    }

    case "coordinates": {
      const { x, y } = question.context as { x: number; y: number };
      if (answer === `(${y}, ${x})`) {
        return {
          mistakeType: "swapped_x_and_y",
          hint: {
            ms: "Baca koordinat ATAS PANJANG (x) dahulu, kemudian NAIK (y). Susunan itu penting!",
            en: "Read coordinates ACROSS (x) first, then UP (y). The order matters!",
          },
        };
      }
      return {
        mistakeType: "misread_grid_position",
        hint: {
          ms: "Kira semula: berapa unit ke kanan (x), kemudian berapa unit ke atas (y) dari titik asalan?",
          en: "Recount: how many units to the right (x), then how many units up (y) from the origin?",
        },
      };
    }

    default:
      return {
        mistakeType: "unknown",
        hint: { ms: "Cuba semak semula jawapan anda.", en: "Try checking your answer again." },
      };
  }
}
