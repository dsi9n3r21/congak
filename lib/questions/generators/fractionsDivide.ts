import { pick, randInt, shuffleOptions, gcd } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// KSSR Y6 rule: (a/b) ÷ c = a/(b×c) — multiply the denominator by the
// whole number, then simplify. First of four fraction-division sub-topics
// in the real textbook (proper÷whole, mixed÷whole, proper÷proper,
// mixed÷proper) — starting with the simplest, most foundational one.
export function generateFractionsDivideByWhole(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6, 8];
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const denom = pick(denominators);
  const num = randInt(1, denom - 1); // proper fraction
  const whole = randInt(2, 6);

  const rawDenom = denom * whole;
  const g = gcd(num, rawDenom);
  const correctNum = num / g;
  const correctDenom = rawDenom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;

  const question: GeneratedQuestion = {
    prompt: { ms: `${num}/${denom} ÷ ${whole} = ?`, en: `${num}/${denom} ÷ ${whole} = ?` },
    type,
    correctAnswer,
    context: { num, denom, whole, correctNum, correctDenom },
    generatorKey: "fractions_divide_by_whole",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying instead of dividing (multiplies the
    // numerator by the whole number rather than the denominator).
    const multipliedInstead = `${num * whole}/${denom}`;
    // Classic mistake: the unsimplified answer, when it differs from the
    // simplified one — tests whether the student remembers to simplify.
    const unsimplified = `${num}/${rawDenom}`;
    const distractors = Array.from(new Set([multipliedInstead, unsimplified].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
