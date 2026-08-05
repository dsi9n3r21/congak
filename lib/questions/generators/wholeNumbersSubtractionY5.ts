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

// Year 5 KSSR "Subtraction Within 1,000,000" — same skill as Y4's
// whole_numbers_subtraction, extended to 6-digit numbers. Retrofitted per
// the Round 19 content standard: added a real warehouse-inventory
// word_problem, errorSpotting, and a reverseProblem that finds the
// original total given how many were removed and how many remain
// (adding back).
export function generateWholeNumbersSubtractionY5(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 100000);
  const max = Number(params.max ?? 999999);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["tin makanan", "botol air mineral", "beg beras"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    "tin makanan": "tins of food",
    "botol air mineral": "bottles of mineral water",
    "beg beras": "bags of rice",
  };

  // ---- reverseProblem: given how many were removed and how many remain,
  // find the original total — adding back through the subtraction.
  if (reverseProblem) {
    let a = randInt(min, max);
    let b = randInt(min, max);
    if (b > a) [a, b] = [b, a];
    const remaining = a - b;
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah gudang menghantar keluar ${b.toLocaleString("en-US")} ${item}, dan kini tinggal ${remaining.toLocaleString("en-US")}. Berapa ${item} yang ada pada mulanya?`,
        en: `A warehouse ships out ${b.toLocaleString("en-US")} ${itemsEn[item]}, and now has ${remaining.toLocaleString("en-US")} left. How many ${itemsEn[item]} were there at first?`,
      },
      type: "word_problem",
      correctAnswer: String(a),
      context: { a, b, remaining },
      generatorKey: "whole_numbers_subtraction_y5",
      difficulty: 2,
    };
    const subtractedInstead = Math.max(0, remaining - b);
    const gaveRemaining = remaining;
    const distractors = Array.from(new Set([String(subtractedInstead), String(gaveRemaining)])).filter(
      (d) => d !== String(a)
    );
    question.options = shuffleOptions(String(a), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, a + randInt(100, 9999) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) [a, b] = [b, a]; // keep the result non-negative for this level
  const correct = a - b;

  // ---- errorSpotting: shown the classic "forgot to borrow" mistake,
  // must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = noBorrowSubtract(a, b);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} dan mendapat ${wrongAnswer.toLocaleString("en-US")}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} and got ${wrongAnswer.toLocaleString("en-US")}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { a, b, correct, wrongAnswer },
        generatorKey: "whole_numbers_subtraction_y5",
        difficulty: 2,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) >= 0) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: warehouse-inventory scenario, scaled up from Y4's
  // egg-shop framing.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Gudang ${name} ada ${a.toLocaleString("en-US")} ${item} pada awal bulan. Selepas dihantar keluar ${b.toLocaleString("en-US")}, berapa yang tinggal?`,
        en: `${name}'s warehouse starts the month with ${a.toLocaleString("en-US")} ${itemsEn[item]}. After shipping out ${b.toLocaleString("en-US")}, how many are left?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, correct },
      generatorKey: "whole_numbers_subtraction_y5",
      difficulty: 2,
    };
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
    return question;
  }

  const equation = `${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, correct },
    generatorKey: "whole_numbers_subtraction_y5",
    difficulty: 2,
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
