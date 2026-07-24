import { pick, randInt, shuffleOptions, gcd } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Dividing Mixed Numbers with Whole Numbers" — second of four
// fraction-division sub-topics (see fractionsDivide.ts for the first,
// proper-fraction version). Convert the mixed number to an improper
// fraction first, then apply the same (a/b)÷c = a/(b×c) rule.
export function generateFractionsDivideMixedByWhole(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6, 8];
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const denom = pick(denominators);
  const wholePart = randInt(1, 4);
  const fracNum = randInt(1, denom - 1);
  const improperNum = wholePart * denom + fracNum;
  const divisor = randInt(2, 5);

  const rawDenom = denom * divisor;
  const g = gcd(improperNum, rawDenom);
  const correctNum = improperNum / g;
  const correctDenom = rawDenom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `${wholePart} ${fracNum}/${denom} ÷ ${divisor} = ?`,
      en: `${wholePart} ${fracNum}/${denom} ÷ ${divisor} = ?`,
    },
    type,
    correctAnswer,
    context: { wholePart, fracNum, denom, divisor, improperNum, correctNum, correctDenom },
    generatorKey: "fractions_divide_mixed_by_whole",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to convert to an improper fraction first
    // — dividing only the fractional part's denominator, ignoring the
    // whole-number part entirely.
    const ignoredWholePart = `${fracNum}/${denom * divisor}`;
    // Classic mistake: multiplying instead of dividing.
    const multipliedInstead = `${improperNum * divisor}/${denom}`;
    const distractors = Array.from(
      new Set([ignoredWholePart, multipliedInstead].filter((d) => d !== correctAnswer))
    );
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
