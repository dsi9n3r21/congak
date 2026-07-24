import { pick, randInt, shuffleOptions, gcd } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 5 KSSR "Multiplication of Fractions" — proper fraction × whole
// number: (a/b) × c = (a×c)/b, then simplify.
export function generateFractionsMultiply(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6, 8];
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const denom = pick(denominators);
  const num = randInt(1, denom - 1);
  const whole = randInt(2, 6);

  const rawNum = num * whole;
  const g = gcd(rawNum, denom);
  const correctNum = rawNum / g;
  const correctDenom = denom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;

  const question: GeneratedQuestion = {
    prompt: { ms: `${num}/${denom} × ${whole} = ?`, en: `${num}/${denom} × ${whole} = ?` },
    type,
    correctAnswer,
    context: { num, denom, whole, correctNum, correctDenom },
    generatorKey: "fractions_multiply",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying the denominator too (dividing by the
    // whole number, the fractions_divide_by_whole rule, applied backwards).
    const multipliedDenomToo = `${num}/${denom * whole}`;
    // Classic mistake: the unsimplified answer.
    const unsimplified = `${rawNum}/${denom}`;
    const distractors = Array.from(new Set([multipliedDenomToo, unsimplified].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
