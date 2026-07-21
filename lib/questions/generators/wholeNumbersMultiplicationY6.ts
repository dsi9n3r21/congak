import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateWholeNumbersMultiplicationY6(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 1000);
  const max = Number(params.max ?? 9999);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const a = randInt(min, max);
  const b = randInt(11, 99); // 2-digit multiplier, matching KSSR Y6 level (4-digit x 2-digit)
  const correct = a * b;

  const equation = `${a.toLocaleString("en-US")} × ${b} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, correct },
    generatorKey: "whole_numbers_multiplication_y6",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying by the tens digit but forgetting to
    // shift that partial product one place left (i.e. skipping the ×10).
    const tens = Math.floor(b / 10);
    const ones = b % 10;
    const forgotShift = a * tens + a * ones;
    // Classic mistake: adding instead of multiplying.
    const addedInstead = a + b;
    const distractors = Array.from(
      new Set([String(forgotShift), String(addedInstead)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
