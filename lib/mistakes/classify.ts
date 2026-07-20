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

    default:
      return {
        mistakeType: "unknown",
        hint: { ms: "Cuba semak semula jawapan anda.", en: "Try checking your answer again." },
      };
  }
}
