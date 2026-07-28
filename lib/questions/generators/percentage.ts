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
// falls 5% — net change is (20-5)%). Retrofitted per the Round 19 content
// standard: word_problem now actually builds a Malaysian scenario instead
// of returning the bare arithmetic prompt regardless of type, and MCQ
// distractors map to documented misconceptions instead of multiply/divide.
export function generatePercentageAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxPct = Number(params.maxPct ?? 60);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const opFixed = params.opFixed as "add" | "subtract" | undefined;
  const busSchedule = params.context === "price_change";
  const extraInfoChance = Number(params.extraInfoChance ?? 0);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const op = opFixed ?? pick(["add", "subtract"] as const);
  let a = randInt(5, maxPct);
  let b = randInt(5, maxPct);
  if (op === "subtract" && b > a) [a, b] = [b, a];
  const correct = op === "add" ? a + b : a - b;
  const symbol = op === "add" ? "+" : "−";

  // ---- reverseProblem: given the total and one part, find the missing
  // part (still just subtraction — no algebra notation needed at Y6).
  if (reverseProblem) {
    const total = randInt(30, 90);
    const known = randInt(10, total - 10);
    const missing = total - known;
    const item = pick(["baju sekolah", "beg sekolah", "basikal", "telefon pintar"]);
    const itemEn = { "baju sekolah": "school uniform", "beg sekolah": "school bag", basikal: "bicycle", "telefon pintar": "smartphone" }[item];

    const question: GeneratedQuestion = {
      prompt: {
        ms: `Jumlah kenaikan harga ${item} tahun ini ialah ${total}%. Kenaikan pertama ialah ${known}%. Berapakah peratus kenaikan kedua?`,
        en: `The total price increase for a ${itemEn} this year is ${total}%. The first increase was ${known}%. What was the second percentage increase?`,
      },
      type: "word_problem",
      correctAnswer: String(missing),
      context: { total, known, missing },
      generatorKey: "percentage_add_subtract",
      difficulty: 3,
    };
    // Classic mistake: added total + known instead of subtracting.
    const wrongOperation = String(total + known);
    // Classic mistake: gave the total itself, not realising a second value is needed.
    const gaveTotal = String(total);
    const distractors = Array.from(new Set([wrongOperation, gaveTotal].filter((d) => d !== String(missing))));
    question.options = shuffleOptions(String(missing), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, missing + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown a documented wrong working, must give the
  // correct answer.
  if (errorSpotting) {
    const name = pick(["Ali", "Siti", "Hakim", "Mei Ling", "Priya"]);
    const wrongAnswer = op === "add" ? a - b : a + b; // wrong_operation misconception
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mengira ${a}% ${symbol} ${b}% dan mendapat ${wrongAnswer}%. Apakah jawapan yang betul?`,
        en: `${name} calculated ${a}% ${symbol} ${b}% and got ${wrongAnswer}%. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: String(correct),
      context: { a, b, op, wrongAnswer },
      generatorKey: "percentage_add_subtract",
      difficulty: 3,
    };
    const distractors = [String(wrongAnswer)];
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- base case: direct calculation, optionally wrapped in a
  // Malaysian price-change word problem with an irrelevant-info decoy.
  let promptMs: string;
  let promptEn: string;
  if (busSchedule) {
    const item = pick(["durian", "bas sekolah", "buku teks", "kek raya"]);
    const itemEn = { durian: "durians", "bas sekolah": "the school bus fare", "buku teks": "textbooks", "kek raya": "Raya cakes" }[item];
    const withDecoy = Math.random() < extraInfoChance;
    const priceRM = pick([15, 20, 25, 30]);
    const decoyMs = withDecoy ? ` Harga asal ialah RM${priceRM}.` : "";
    const decoyEn = withDecoy ? ` The original price was RM${priceRM}.` : "";
    if (op === "add") {
      promptMs = `Harga ${item} naik ${a}% bulan lepas, kemudian naik lagi ${b}% bulan ini.${decoyMs} Berapakah jumlah peratus kenaikan?`;
      promptEn = `The price of ${itemEn} rose ${a}% last month, then rose another ${b}% this month.${decoyEn} What is the total percentage increase?`;
    } else {
      promptMs = `Harga ${item} naik ${a}% bulan lepas, tetapi harga itu kemudiannya diturunkan ${b}% semasa jualan murah.${decoyMs} Berapakah peratus kenaikan bersih?`;
      promptEn = `The price of ${itemEn} rose ${a}% last month, but was then reduced by ${b}% during a sale.${decoyEn} What is the net percentage increase?`;
    }
  } else {
    promptMs = `${a}% ${symbol} ${b}% = ?%`;
    promptEn = `${a}% ${symbol} ${b}% = ?%`;
  }

  const question: GeneratedQuestion = {
    prompt: { ms: promptMs, en: promptEn },
    type: busSchedule ? "word_problem" : type,
    correctAnswer: String(correct),
    context: { a, b, correct, op },
    generatorKey: "percentage_add_subtract",
    difficulty: 2,
  };

  if (question.type === "mcq" || question.type === "word_problem") {
    // wrong_operation: did the opposite operation.
    const wrongOperation = op === "add" ? a - b : a + b;
    // ignored_one_value: only wrote one of the two percentages.
    const ignoredOneValue = pick([a, b]);
    // place_value_error: misread a digit, added/subtracted 10 off.
    const digitMisread = correct + pick([-10, 10]);
    const distractors = Array.from(
      new Set([wrongOperation, ignoredOneValue, digitMisread].map(String).filter((d) => d !== String(correct) && Number(d) >= 0))
    );
    question.options = shuffleOptions(String(correct), distractors.slice(0, 3));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 9)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
