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

    default:
      return {
        mistakeType: "unknown",
        hint: { ms: "Cuba semak semula jawapan anda.", en: "Try checking your answer again." },
      };
  }
}
