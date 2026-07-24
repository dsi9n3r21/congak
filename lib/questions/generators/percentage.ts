import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generatePercentageOfQuantity(params: GeneratorParams): GeneratedQuestion {
  const percentages = (params.percentages as number[]) ?? [10, 20, 25, 50, 75];
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";

  const percent = pick(percentages);
  // Keep the quantity a clean multiple so the answer is a whole number —
  // matches how this is actually taught at Year 6 basic level.
  const multiple = 100 / gcdOf(percent, 100);
  const quantity = multiple * randInt(1, 5);
  const correct = (percent / 100) * quantity;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari ${percent}% daripada ${quantity}.`,
      en: `Find ${percent}% of ${quantity}.`,
    },
    type,
    correctAnswer: String(correct),
    context: { percent, quantity, correct },
    generatorKey: "percentage_of_quantity",
    difficulty: percent === 50 || percent === 25 ? 1 : 2,
  };

  if (type === "mcq") {
    // Classic mistake: using the percent number directly as a multiplier
    // instead of dividing by 100 first (e.g. "25% of 40" answered as 25×40).
    const forgotDivide = percent * quantity;
    // Classic mistake: dividing the quantity by the percent number instead
    // of multiplying by percent/100.
    const invertedOperation = Math.round(quantity / percent);
    question.options = shuffleOptions(
      String(correct),
      [String(forgotDivide), String(invertedOperation)].filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      question.options.push(String(correct + randInt(1, 9)));
    }
  }

  return question;
}

function gcdOf(a: number, b: number): number {
  return b === 0 ? a : gcdOf(b, a % b);
}

// Reused for both Year 5 "Convert Mixed Numbers and Percentages" (the
// decimal-percentage half of it) and Year 6 "Convert Decimals to
// Percentages" — structurally the same conversion, just different number
// ranges/difficulty via config, same efficiency idea as unit_convert.
export function generateDecimalPercentageConvert(params: GeneratorParams): GeneratedQuestion {
  const maxWhole = Number(params.maxWhole ?? 0);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const whole = randInt(0, maxWhole);
  const hundredths = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95]);
  const decimal = Math.round((whole + hundredths / 100) * 100) / 100;
  const pct = whole * 100 + hundredths;
  const decimalToPct = Math.random() > 0.5;

  const question: GeneratedQuestion = {
    prompt: decimalToPct
      ? { ms: `${decimal} = ?%`, en: `${decimal} = ?%` }
      : { ms: `${pct}% = ? (perpuluhan)`, en: `${pct}% = ? (decimal)` },
    type,
    correctAnswer: decimalToPct ? String(pct) : decimal.toFixed(2),
    context: { decimal, pct, decimalToPct: decimalToPct ? "yes" : "no" },
    generatorKey: "decimal_percentage_convert",
    difficulty: maxWhole > 0 ? 3 : 2,
  };

  if (type === "mcq") {
    if (decimalToPct) {
      // Classic mistake: forgetting to multiply by 100 (giving the decimal
      // digits directly as the percentage, e.g. 0.35 → "35" is actually
      // correct; the mistake is treating 0.35 as "0.35%" or misplacing by
      // one factor of 10).
      const offByFactor10 = pct / 10;
      const offByFactor10b = pct * 10;
      const distractors = Array.from(new Set([offByFactor10, offByFactor10b].map(String).filter((d) => d !== String(pct))));
      question.options = shuffleOptions(String(pct), distractors);
    } else {
      const offByFactor10 = Math.round((pct / 1000) * 100) / 100;
      const offByFactor10b = Math.round((pct / 10) * 100) / 100;
      const distractors = Array.from(
        new Set([offByFactor10, offByFactor10b].map((d) => d.toFixed(2)).filter((d) => d !== decimal.toFixed(2)))
      );
      question.options = shuffleOptions(decimal.toFixed(2), distractors);
    }
    while (question.options.length < 3) {
      const base = decimalToPct ? pct : Number(decimal.toFixed(2));
      const candidate = decimalToPct
        ? String(Math.max(0, base + randInt(1, 9)))
        : (base + randInt(1, 9) * 0.01).toFixed(2);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Addition and Subtraction of Percentages" — adding/
// subtracting percentage figures directly (e.g. a price rises 20% then
// falls 5% — net change is (20-5)%).
export function generatePercentageAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxPct = Number(params.maxPct ?? 60);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const op = pick(["add", "subtract"] as const);

  let a = randInt(5, maxPct);
  let b = randInt(5, maxPct);
  if (op === "subtract" && b > a) [a, b] = [b, a];
  const correct = op === "add" ? a + b : a - b;
  const symbol = op === "add" ? "+" : "−";

  const question: GeneratedQuestion = {
    prompt: { ms: `${a}% ${symbol} ${b}% = ?%`, en: `${a}% ${symbol} ${b}% = ?%` },
    type,
    correctAnswer: String(correct),
    context: { a, b, correct, op },
    generatorKey: "percentage_add_subtract",
    difficulty: 2,
  };

  if (type === "mcq") {
    const distractors = Array.from(new Set([String(a * b), String(Math.round(a / b))].filter((d) => d !== String(correct) && Number(d) < 1000)));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 9)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
