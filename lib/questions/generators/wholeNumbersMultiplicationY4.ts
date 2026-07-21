import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/** Simulates the "forgot to carry" mistake for multiplication: multiplies
 * each digit by the multiplier independently, keeping only the ones digit
 * of each partial product, instead of carrying the overflow leftward. */
function noCarryMultiply(a: number, multiplier: number): number {
  const digits = String(a).split("").reverse();
  let result = "";
  for (const d of digits) {
    result = String((Number(d) * multiplier) % 10) + result;
  }
  return Number(result);
}

export function generateWholeNumbersMultiplicationY4(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 1000);
  const max = Number(params.max ?? 9999);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const a = randInt(min, max);
  const b = randInt(2, 9); // 1-digit multiplier, matching KSSR Y4 level
  const correct = a * b;

  const equation = `${a.toLocaleString("en-US")} × ${b} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, correct },
    generatorKey: "whole_numbers_multiplication_y4",
    difficulty: 1,
  };

  if (type === "mcq") {
    const forgotCarry = noCarryMultiply(a, b);
    const addedInstead = a + b;
    const distractors = Array.from(
      new Set([String(forgotCarry), String(addedInstead)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
