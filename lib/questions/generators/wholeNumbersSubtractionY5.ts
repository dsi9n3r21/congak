import { randInt, shuffleOptions } from "../utils";
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

export function generateWholeNumbersSubtractionY5(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 100000);
  const max = Number(params.max ?? 999999);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) [a, b] = [b, a]; // keep the result non-negative for this level
  const correct = a - b;

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
