import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateWholeNumbersDivision(params: GeneratorParams): GeneratedQuestion {
  const minQuotient = Number(params.minQuotient ?? 10);
  const maxQuotient = Number(params.maxQuotient ?? 99);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const divisor = randInt(11, 25); // 2-digit divisor, matching KSSR Y6 level
  const quotient = randInt(minQuotient, maxQuotient);
  const dividend = divisor * quotient; // keep it exact — no remainder at this level

  const equation = `${dividend.toLocaleString("en-US")} ÷ ${divisor} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(quotient),
    context: { dividend, divisor, correct: quotient },
    generatorKey: "whole_numbers_division",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: subtracting instead of dividing.
    const subtractedInstead = dividend - divisor;
    // Classic mistake: adding instead of dividing.
    const addedInstead = dividend + divisor;
    const distractors = Array.from(
      new Set([String(subtractedInstead), String(addedInstead)].filter((d) => d !== String(quotient)))
    );
    question.options = shuffleOptions(String(quotient), distractors);
    while (question.options.length < 3) {
      const candidate = String(quotient + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) > 0) question.options.push(candidate);
    }
  }

  return question;
}
