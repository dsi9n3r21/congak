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

// Year 6 KSSR "Dividing Proper Fractions with Proper Fractions" — third of
// four fraction-division sub-topics. Rule: (a/b) ÷ (c/d) = (a/b) × (d/c) =
// (a×d)/(b×c), then simplify — "flip and multiply".
export function generateFractionsDivideByFraction(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6];
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const denomA = pick(denominators);
  const numA = randInt(1, denomA - 1);
  const denomB = pick(denominators.filter((d) => d !== denomA)) ?? denomA;
  const numB = randInt(1, denomB - 1);

  const rawNum = numA * denomB;
  const rawDenom = denomA * numB;
  const g = gcd(rawNum, rawDenom);
  const correctNum = rawNum / g;
  const correctDenom = rawDenom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;

  const question: GeneratedQuestion = {
    prompt: { ms: `${numA}/${denomA} ÷ ${numB}/${denomB} = ?`, en: `${numA}/${denomA} ÷ ${numB}/${denomB} = ?` },
    type,
    correctAnswer,
    context: { numA, denomA, numB, denomB, correctNum, correctDenom },
    generatorKey: "fractions_divide_by_fraction",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying straight across without flipping the
    // second fraction first.
    const forgotToFlip = (() => {
      const n = numA * numB, d = denomA * denomB;
      const g2 = gcd(n, d);
      return `${n / g2}/${d / g2}`;
    })();
    const distractors = Array.from(new Set([forgotToFlip].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Dividing Mixed Numbers with Proper Fractions" — fourth and
// final fraction-division sub-topic. Convert the mixed number to an
// improper fraction first, then apply the same "flip and multiply" rule.
export function generateFractionsDivideMixedByFraction(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6];
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const denomA = pick(denominators);
  const wholePart = randInt(1, 3);
  const fracNum = randInt(1, denomA - 1);
  const improperNum = wholePart * denomA + fracNum;

  const denomB = pick(denominators.filter((d) => d !== denomA)) ?? denomA;
  const numB = randInt(1, denomB - 1);

  const rawNum = improperNum * denomB;
  const rawDenom = denomA * numB;
  const g = gcd(rawNum, rawDenom);
  const correctNum = rawNum / g;
  const correctDenom = rawDenom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `${wholePart} ${fracNum}/${denomA} ÷ ${numB}/${denomB} = ?`,
      en: `${wholePart} ${fracNum}/${denomA} ÷ ${numB}/${denomB} = ?`,
    },
    type,
    correctAnswer,
    context: { wholePart, fracNum, denomA, numB, denomB, improperNum, correctNum, correctDenom },
    generatorKey: "fractions_divide_mixed_by_fraction",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to convert to an improper fraction first.
    const ignoredWholePart = (() => {
      const n = fracNum * denomB, d = denomA * numB;
      const g2 = gcd(n, d);
      return `${n / g2}/${d / g2}`;
    })();
    const distractors = Array.from(new Set([ignoredWholePart].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
