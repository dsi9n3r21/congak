import { pick, randInt, shuffleOptions, gcd } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateSimplifyRatio(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const maxMultiplier = Number(params.maxMultiplier ?? 6);

  // Build a ratio that isn't already in simplest form, by scaling a small
  // simple ratio up by a random factor — guarantees genuine simplification
  // work rather than a trivial already-reduced ratio.
  const baseA = randInt(1, 6);
  const baseB = randInt(1, 6);
  const factor = randInt(2, maxMultiplier);
  const a = baseA * factor;
  const b = baseB * factor;

  const divisor = gcd(a, b);
  const simplifiedA = a / divisor;
  const simplifiedB = b / divisor;
  const correct = `${simplifiedA}:${simplifiedB}`;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Permudahkan nisbah ${a}:${b} kepada bentuk paling ringkas.`,
      en: `Simplify the ratio ${a}:${b} to its simplest form.`,
    },
    type,
    correctAnswer: correct,
    context: { a, b, simplifiedA, simplifiedB },
    generatorKey: "simplify_ratio",
    difficulty: factor > 4 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: dividing only one side, leaving it partially simplified.
    const partialSimplify = `${a / 2}:${b}`;
    // Classic mistake: reversing the ratio order.
    const reversed = `${simplifiedB}:${simplifiedA}`;
    question.options = shuffleOptions(
      correct,
      Array.from(new Set([partialSimplify, reversed].filter((d) => d !== correct && d !== `${a}:${b}`)))
    );
    while (question.options.length < 3) {
      const candidate = `${simplifiedA + randInt(1, 3)}:${simplifiedB + randInt(1, 3)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
