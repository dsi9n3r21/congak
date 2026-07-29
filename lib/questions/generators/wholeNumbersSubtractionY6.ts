import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/** Mirrors wholeNumbersSubtraction.ts's no-borrow simulation. */
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

/**
 * The Y6-distinctive challenge: subtracting from a round number (e.g.
 * 500,000) forces a "cascading borrow" through several zero columns in a
 * row — a well-known KSSR Y6 pain point, distinct from Y5's plain 6-digit
 * subtraction where the minuend's digits are just random.
 */
/**
 * The Y6-distinctive challenge: subtracting from a round number (e.g.
 * 500,000) forces a "cascading borrow" through several zero columns in a
 * row — a well-known KSSR Y6 pain point, distinct from Y5's plain 6-digit
 * subtraction where the minuend's digits are just random.
 *
 * Retrofitted per the Round 19 content standard: same missing-scenario
 * bug as wholeNumbersAdditionY6.ts — "word_problem" config previously
 * returned the bare equation. Now builds a real factory/target-production
 * scenario (matching this topic's explanation text), plus errorSpotting
 * and reverseProblem variants.
 */
export function generateWholeNumbersSubtractionY6(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10000);
  const max = Number(params.max ?? 99999);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const a = randInt(2, 9) * 100000; // round number with 5 trailing zeros, e.g. 200000-900000
  const b = randInt(min, max);
  const correct = a - b;
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the round-number target and the produced
  // amount, find how many units are still remaining (i.e. solve for b
  // instead of the difference).
  if (reverseProblem) {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} bekerja di sebuah kilang yang mensasarkan pengeluaran ${a.toLocaleString("en-US")} unit. Setakat ini, ${correct.toLocaleString("en-US")} unit telah dikeluarkan. Berapa unit lagi yang belum dikeluarkan?`,
        en: `${name} works at a factory targeting ${a.toLocaleString("en-US")} units. So far, ${correct.toLocaleString("en-US")} units have been produced. How many units are still remaining?`,
      },
      type: "word_problem",
      correctAnswer: String(b),
      context: { a, b, correct },
      generatorKey: "whole_numbers_subtraction_y6",
      difficulty: 3,
    };
    const addedInstead = a + correct; // wrong_operation
    const gaveTarget = a; // gave the target itself, not the remaining amount
    const distractors = Array.from(new Set([addedInstead, gaveTarget])).filter((d) => d !== b).map(String);
    question.options = shuffleOptions(String(b), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, b + randInt(100, 999) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot to borrow across zero
  // columns" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = noBorrowSubtract(a, b);
    return {
      prompt: {
        ms: `${name} mengira ${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} dan mendapat ${wrongAnswer.toLocaleString("en-US")}. Apakah jawapan yang betul?`,
        en: `${name} calculated ${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} and got ${wrongAnswer.toLocaleString("en-US")}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: String(correct),
      context: { a, b, correct, wrongAnswer },
      generatorKey: "whole_numbers_subtraction_y6",
      difficulty: 3,
      options: shuffleOptions(String(correct), [String(wrongAnswer)].filter((d) => d !== String(correct))),
    };
  }

  // ---- word_problem: a real factory/target-production scenario, not a
  // bare equation.
  if (type === "word_problem") {
    const name = pick(names);
    const scenario = pick(["factory", "school_fundraiser"] as const);
    const prompt =
      scenario === "factory"
        ? {
            ms: `${name} bekerja di sebuah kilang yang mensasarkan pengeluaran ${a.toLocaleString("en-US")} unit. Setakat ini, ${b.toLocaleString("en-US")} unit belum dikeluarkan. Berapa unit sudah dikeluarkan?`,
            en: `${name} works at a factory targeting ${a.toLocaleString("en-US")} units. So far, ${b.toLocaleString("en-US")} units have not yet been produced. How many units have been produced?`,
          }
        : {
            ms: `Sekolah ${name} mensasarkan kutipan derma RM${a.toLocaleString("en-US")} untuk tabung kebajikan. Baki yang masih perlu dikumpul ialah RM${b.toLocaleString("en-US")}. Berapakah jumlah yang telah dikumpul setakat ini?`,
            en: `${name}'s school targets RM${a.toLocaleString("en-US")} in donations for a welfare fund. RM${b.toLocaleString("en-US")} is still needed. How much has been collected so far?`,
          };
    const question: GeneratedQuestion = {
      prompt,
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, correct },
      generatorKey: "whole_numbers_subtraction_y6",
      difficulty: 3,
    };
    const forgotBorrowDistractor = noBorrowSubtract(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 100 : -100) * randInt(1, 9);
    const distractors = Array.from(new Set([String(forgotBorrowDistractor), String(misalignedDistractor)].filter((d) => d !== String(correct))));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
    return question;
  }

  const equation = `${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, correct },
    generatorKey: "whole_numbers_subtraction_y6",
    difficulty: 3,
  };

  if (type === "mcq") {
    const forgotBorrowDistractor = noBorrowSubtract(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 100 : -100) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotBorrowDistractor), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
