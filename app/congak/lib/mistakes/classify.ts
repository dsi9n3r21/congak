import type { GeneratedQuestion } from "../questions/types";

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
  hint: string;
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
        return { mistakeType: "forgot_carry", hint: "Jangan lupa \"simpan\" apabila jumlah lajur lebih 9." };
      }
      if (Math.abs(Number(answer) - correct) % 10 === 0 && answer !== String(correct)) {
        return { mistakeType: "place_value_misalignment", hint: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?" };
      }
      return { mistakeType: "calculation_error", hint: "Cuba tambah semula langkah demi langkah, bermula dari lajur sa." };
    }

    case "fractions_same_denominator": {
      const { numA, numB, denom, correctNum } = question.context as {
        numA: number; numB: number; denom: number; correctNum: number;
      };
      if (answer === `${correctNum}/${denom * 2}`) {
        return { mistakeType: "denominator_addition_error", hint: "Penyebut sepatutnya kekal sama — hanya pengangka (nombor atas) yang ditambah." };
      }
      if (answer === `${numA}/${denom}` || answer === `${numB}/${denom}`) {
        return { mistakeType: "incomplete_addition", hint: "Nampaknya hanya satu pecahan sahaja dikira. Tambah KEDUA-DUA pengangka." };
      }
      return { mistakeType: "fraction_calculation_error", hint: "Semak semula pengangka: adakah kedua-dua nombor atas sudah ditambah?" };
    }

    case "money_change": {
      const { priceSen, paidSen, changeSen } = question.context as {
        priceSen: number; paidSen: number; changeSen: number;
      };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      if (Math.abs(answerSen - changeSen) === 100) {
        return { mistakeType: "subtraction_borrow_error", hint: "Semak semula proses \"pinjam\" semasa menolak — beza jawapan anda tepat RM1.00." };
      }
      if (!Number.isNaN(answerSen) && answerSen !== changeSen) {
        return { mistakeType: "ringgit_sen_conversion_error", hint: "Cuba tukar semua kepada sen dahulu sebelum menolak, contohnya RM5.00 = 500 sen." };
      }
      return { mistakeType: "calculation_error", hint: "Cuba kira semula: Wang Dibayar − Harga Barang." };
    }

    default:
      return { mistakeType: "unknown", hint: "Cuba semak semula jawapan anda." };
  }
}
