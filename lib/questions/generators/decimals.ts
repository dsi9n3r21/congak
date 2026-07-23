import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

function randomDecimal(maxWhole: number): number {
  const whole = randInt(0, maxWhole);
  const cents = randInt(0, 99);
  return Math.round((whole + cents / 100) * 100) / 100;
}

// Year 4 KSSR introduces decimals to ONE decimal place only (tenths) —
// two decimal places (cents-style) is a Year 5 step up, already covered by
// generateDecimalAddSubtract below. Keeping these as separate generators
// (rather than a shared one with a "places" param) mirrors how the other
// whole-number generators in this folder are split one-per-year-level.
function randomDecimal1dp(maxWhole: number): number {
  const whole = randInt(0, maxWhole);
  const tenths = randInt(0, 9);
  return Math.round((whole + tenths / 10) * 10) / 10;
}

// Small helper shared by every decimal generator below: dedupes distractors
// against each other and the correct answer, then pads with small random
// offsets until there are at least 2 distractors (3 options total) — a few
// of the arithmetic "classic mistakes" below can coincide with each other
// or with the correct answer for small inputs (e.g. a value of 0.0), so
// padding is required, not just a nice-to-have.
function finalizeOptions(correct: string, rawDistractors: string[], pad: () => string): string[] {
  const distractors = Array.from(new Set(rawDistractors.filter((d) => d !== correct)));
  const options = shuffleOptions(correct, distractors);
  let guard = 0;
  while (options.length < 3 && guard < 20) {
    const candidate = pad();
    if (!options.includes(candidate)) options.push(candidate);
    guard++;
  }
  return options;
}

export function generateDecimalAddSubtractY4(params: GeneratorParams): GeneratedQuestion {
  const maxWhole = Number(params.maxWhole ?? 10);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const op = pick(["add", "subtract"] as const);

  let a = randomDecimal1dp(maxWhole);
  let b = randomDecimal1dp(maxWhole);
  if (op === "subtract" && b > a) [a, b] = [b, a]; // keep it non-negative for this level

  const correct = op === "add" ? Math.round((a + b) * 10) / 10 : Math.round((a - b) * 10) / 10;
  const symbol = op === "add" ? "+" : "−";

  const question: GeneratedQuestion = {
    prompt: { ms: `${a} ${symbol} ${b} = ?`, en: `${a} ${symbol} ${b} = ?` },
    type,
    correctAnswer: correct.toFixed(1),
    context: { a, b, correct, op },
    generatorKey: "decimal_add_subtract_y4",
    difficulty: 1,
  };

  if (type === "mcq") {
    // Classic mistake: ignoring the decimal point entirely, adding/subtracting
    // as if both numbers were whole numbers.
    const ignoredPoint = op === "add" ? Math.round(a) + Math.round(b) : Math.abs(Math.round(a) - Math.round(b));
    // Classic mistake: misaligning the decimal point by one place.
    const misaligned = Math.round((correct + (Math.random() > 0.5 ? 0.9 : -0.9)) * 10) / 10;
    question.options = finalizeOptions(
      correct.toFixed(1),
      [ignoredPoint.toFixed(1), misaligned.toFixed(1)],
      () => (Math.round((correct + randInt(1, 9) * (Math.random() > 0.5 ? 0.1 : -0.1)) * 10) / 10).toFixed(1)
    );
  }

  return question;
}

export function generateDecimalAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxWhole = Number(params.maxWhole ?? 20);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const op = pick(["add", "subtract"] as const);

  let a = randomDecimal(maxWhole);
  let b = randomDecimal(maxWhole);
  if (op === "subtract" && b > a) [a, b] = [b, a]; // keep it non-negative for this level

  const correct = op === "add" ? Math.round((a + b) * 100) / 100 : Math.round((a - b) * 100) / 100;
  const symbol = op === "add" ? "+" : "−";

  const question: GeneratedQuestion = {
    prompt: { ms: `${a} ${symbol} ${b} = ?`, en: `${a} ${symbol} ${b} = ?` },
    type,
    correctAnswer: correct.toFixed(2),
    context: { a, b, correct, op },
    generatorKey: "decimal_add_subtract",
    difficulty: maxWhole > 10 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: misaligning the decimal point, effectively treating
    // the numbers as if the shorter one were shifted by a factor of 10.
    const misaligned = Math.round((correct + (Math.random() > 0.5 ? 0.9 : -0.9)) * 100) / 100;
    // Classic mistake: adding/subtracting the whole and decimal parts separately
    // without carrying/borrowing across the decimal point.
    const noCarryAcrossPoint = Math.round((correct + (op === "add" ? -0.1 : 0.1)) * 100) / 100;
    question.options = finalizeOptions(
      correct.toFixed(2),
      [misaligned.toFixed(2), noCarryAcrossPoint.toFixed(2)],
      () => (Math.round((correct + randInt(1, 9) * (Math.random() > 0.5 ? 0.01 : -0.01)) * 100) / 100).toFixed(2)
    );
  }

  return question;
}

export function generateDecimalMultiply(params: GeneratorParams): GeneratedQuestion {
  const maxWhole = Number(params.maxWhole ?? 10);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const a = randomDecimal1dp(Math.max(maxWhole, 1)) || 0.1; // avoid a=0, which collapses every distractor to 0
  const b = randInt(2, 9);
  const correct = Math.round(a * b * 10) / 10;

  const question: GeneratedQuestion = {
    prompt: { ms: `${a} × ${b} = ?`, en: `${a} × ${b} = ?` },
    type,
    correctAnswer: correct.toFixed(1),
    context: { a, b, correct },
    generatorKey: "decimal_multiply",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: ignoring the decimal point — multiplying as if `a`
    // were a whole number, and forgetting to place the decimal back.
    const ignoredPoint = Math.round(a * 10) * b;
    // Classic mistake: added instead of multiplied.
    const addedInstead = Math.round((a + b) * 10) / 10;
    question.options = finalizeOptions(
      correct.toFixed(1),
      [ignoredPoint.toFixed(1), addedInstead.toFixed(1)],
      () => (Math.round((correct + randInt(1, 9) * (Math.random() > 0.5 ? 0.1 : -0.1)) * 10) / 10).toFixed(1)
    );
  }

  return question;
}

export function generateDecimalDivide(params: GeneratorParams): GeneratedQuestion {
  const maxQuotientWhole = Number(params.maxQuotientWhole ?? 10);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  // Build from the quotient backwards (in tenths) so the division comes out
  // exact — Year 5 level: decimal ÷ 1-digit whole number, no remainder.
  // Start from 10 (i.e. 1.0) so the quotient is never 0, which would
  // collapse every "classic mistake" distractor to the same value.
  const quotientTenths = randInt(10, Math.max(maxQuotientWhole * 10, 20));
  const divisor = randInt(2, 9);
  const dividendTenths = quotientTenths * divisor;
  const dividend = Math.round(dividendTenths) / 10;
  const quotient = Math.round(quotientTenths) / 10;

  const question: GeneratedQuestion = {
    prompt: { ms: `${dividend} ÷ ${divisor} = ?`, en: `${dividend} ÷ ${divisor} = ?` },
    type,
    correctAnswer: quotient.toFixed(1),
    context: { dividend, divisor, correct: quotient },
    generatorKey: "decimal_divide",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: ignoring the decimal point — dividing as if the
    // dividend were a whole number, and forgetting to place the decimal.
    const ignoredPoint = Math.round(dividend * 10) / divisor;
    const addedInstead = Math.round((dividend + divisor) * 10) / 10;
    question.options = finalizeOptions(
      quotient.toFixed(1),
      [ignoredPoint.toFixed(1), addedInstead.toFixed(1)],
      () => (Math.round((quotient + randInt(1, 9) * (Math.random() > 0.5 ? 0.1 : -0.1)) * 10) / 10).toFixed(1)
    );
  }

  return question;
}
