import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateWholeNumbersAdditionY6(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10000);
  const max = Number(params.max ?? 99999);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const a = randInt(min, max);
  const b = randInt(min, max);
  const c = randInt(min, max);
  const correct = a + b + c;

  const equation = `${a.toLocaleString("en-US")} + ${b.toLocaleString("en-US")} + ${c.toLocaleString("en-US")} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, c, correct },
    generatorKey: "whole_numbers_addition_y6",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to add the third number entirely.
    const forgotThirdNumber = a + b;
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 100 : -100) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotThirdNumber), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
