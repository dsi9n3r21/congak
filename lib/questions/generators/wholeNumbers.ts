import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/** Simulates the "forgot to carry" mistake: adds each place-value column
 * independently without carrying the overflow into the next column. */
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

export function generateWholeNumbersAddition(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10000);
  const max = Number(params.max ?? 99000);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const a = randInt(min, max);
  const b = randInt(min, max);
  const correct = a + b;

  const equation = `${a.toLocaleString("en-US")} + ${b.toLocaleString("en-US")} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, correct },
    generatorKey: "whole_numbers_addition",
    difficulty: max > 50000 ? 2 : 1,
  };

  if (type === "mcq") {
    const forgotCarryDistractor = noCarryAdd(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 10 : -10) * randInt(1, 9);
    question.options = shuffleOptions(
      String(correct),
      [String(forgotCarryDistractor), String(misalignedDistractor)].filter(
        (d) => d !== String(correct)
      )
    );
    // Guarantee 3 distinct options even on rare collisions
    while (question.options.length < 3) {
      question.options.push(String(correct + randInt(-99, 99) || 1));
    }
  }

  return question;
}
