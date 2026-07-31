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
// Retrofitted per the Round 19 content standard: added a real running-
// distance word_problem (matching this topic's explanation text),
// errorSpotting, and reverseProblem.
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
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const activities = ["berlari", "berjalan", "berbasikal"] as const;
  const activitiesEn: Record<(typeof activities)[number], string> = { berlari: "ran", berjalan: "walked", berbasikal: "cycled" };

  const op = pick(["add", "subtract"] as const);
  let a = randomDecimal1dp(maxWhole);
  let b = randomDecimal1dp(maxWhole);
  if (op === "subtract" && b > a) [a, b] = [b, a]; // keep it non-negative for this level
  const correct = op === "add" ? Math.round((a + b) * 10) / 10 : Math.round((a - b) * 10) / 10;

  // ---- reverseProblem: given the total distance and one leg, find the
  // other leg (subtraction).
  if (reverseProblem) {
    const name = pick(names);
    const activity = pick(activities);
    const total = Math.round((a + b) * 10) / 10;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} ${activity} sejauh jumlah ${total} km dalam dua sesi. Sesi pertama sejauh ${a} km. Berapa km sesi kedua?`,
        en: `${name} ${activitiesEn[activity]} a total of ${total} km across two sessions. The first session was ${a} km. How many km was the second session?`,
      },
      type: "word_problem",
      correctAnswer: b.toFixed(1),
      context: { a, b, total },
      generatorKey: "decimal_add_subtract_y4",
      difficulty: 2,
    };
    const addedInstead = (total + a).toFixed(1);
    const gaveTotal = total.toFixed(1);
    question.options = finalizeOptions(b.toFixed(1), [addedInstead, gaveTotal], () =>
      Math.max(0, Math.round((b + randInt(1, 5) * (Math.random() > 0.5 ? 0.1 : -0.1)) * 10) / 10).toFixed(1)
    );
    return question;
  }

  // ---- errorSpotting: shown the classic "ignored the decimal point"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = op === "add" ? Math.round(a) + Math.round(b) : Math.abs(Math.round(a) - Math.round(b));
    const wrongStr = wrongAnswer.toFixed(1);
    const correctStr = correct.toFixed(1);
    const symbol = op === "add" ? "+" : "−";
    if (wrongStr === correctStr) {
      // No genuine rounding difference for this pair — fall through to
      // the base mcq shape instead of shipping a collapsed distractor.
    } else {
      return {
        prompt: {
          ms: `${name} mengira ${a} ${symbol} ${b} dan mendapat ${wrongStr}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${a} ${symbol} ${b} and got ${wrongStr}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: correctStr,
        context: { a, b, correct, wrongAnswer },
        generatorKey: "decimal_add_subtract_y4",
        difficulty: 3,
        options: finalizeOptions(correctStr, [wrongStr], () =>
          (Math.round((correct + randInt(1, 9) * (Math.random() > 0.5 ? 0.1 : -0.1)) * 10) / 10).toFixed(1)
        ),
      };
    }
  }

  // ---- word_problem: running-distance scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const activity = pick(activities);
    const question: GeneratedQuestion = {
      prompt:
        op === "add"
          ? {
              ms: `${name} ${activity} sejauh ${a} km pada waktu pagi dan ${b} km pada waktu petang. Berapakah jumlah jarak ${activity} ${name}?`,
              en: `${name} ${activitiesEn[activity]} ${a} km in the morning and ${b} km in the evening. What is ${name}'s total distance ${activitiesEn[activity]}?`,
            }
          : {
              ms: `Sasaran mingguan ${name} ialah ${activity} sejauh ${a} km. Setakat ini ${name} telah ${activity} sejauh ${b} km. Berapa km lagi untuk mencapai sasaran?`,
              en: `${name}'s weekly target is to ${activity === "berlari" ? "run" : activity === "berjalan" ? "walk" : "cycle"} ${a} km. So far ${name} has done ${b} km. How many more km to reach the target?`,
            },
      type: "word_problem",
      correctAnswer: correct.toFixed(1),
      context: { a, b, correct, op },
      generatorKey: "decimal_add_subtract_y4",
      difficulty: 2,
    };
    const ignoredPoint = op === "add" ? Math.round(a) + Math.round(b) : Math.abs(Math.round(a) - Math.round(b));
    const misaligned = Math.round((correct + (Math.random() > 0.5 ? 0.9 : -0.9)) * 10) / 10;
    question.options = finalizeOptions(
      correct.toFixed(1),
      [ignoredPoint.toFixed(1), misaligned.toFixed(1)],
      () => (Math.round((correct + randInt(1, 9) * (Math.random() > 0.5 ? 0.1 : -0.1)) * 10) / 10).toFixed(1)
    );
    return question;
  }

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

// Year 5 KSSR "Adding & Subtracting Decimals" (2 decimal places). Retrofitted
// per the Round 19 content standard: added a real shopping-context
// word_problem (this was previously mcq/fill only — the explanation text
// already used a shopping example, so this generator gets the matching
// scenario), plus errorSpotting and reverseProblem variants.
export function generateDecimalAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxWhole = Number(params.maxWhole ?? 20);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["buku", "pensel", "beg sekolah", "botol air", "payung"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    buku: "book",
    pensel: "pencil",
    "beg sekolah": "school bag",
    "botol air": "water bottle",
    payung: "umbrella",
  };

  const op = pick(["add", "subtract"] as const);
  let a = randomDecimal(maxWhole);
  let b = randomDecimal(maxWhole);
  if (op === "subtract" && b > a) [a, b] = [b, a];
  const correct = op === "add" ? Math.round((a + b) * 100) / 100 : Math.round((a - b) * 100) / 100;

  // ---- reverseProblem: given the total spent and the price of one item,
  // find the price of the other (subtraction, framed as missing price).
  if (reverseProblem) {
    const name = pick(names);
    const item1 = pick(items);
    const item2 = pick(items.filter((i) => i !== item1));
    const total = Math.round((a + b) * 100) / 100;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membeli sebuah ${item1} dan sebuah ${item2}, dan membayar sejumlah RM${total.toFixed(2)}. Jika ${item1} berharga RM${a.toFixed(2)}, berapakah harga ${item2}?`,
        en: `${name} buys a ${itemsEn[item1]} and a ${itemsEn[item2]}, paying a total of RM${total.toFixed(2)}. If the ${itemsEn[item1]} costs RM${a.toFixed(2)}, what does the ${itemsEn[item2]} cost?`,
      },
      type: "word_problem",
      correctAnswer: `RM${b.toFixed(2)}`,
      context: { a, b, total },
      generatorKey: "decimal_add_subtract",
      difficulty: 3,
    };
    const addedInstead = `RM${(total + a).toFixed(2)}`; // wrong_operation
    const gaveTotal = `RM${total.toFixed(2)}`;
    const distractors = Array.from(new Set([addedInstead, gaveTotal])).filter((d) => d !== `RM${b.toFixed(2)}`);
    question.options = finalizeOptions(`RM${b.toFixed(2)}`, distractors, () =>
      `RM${Math.max(0, Math.round((b + randInt(1, 9) * (Math.random() > 0.5 ? 0.1 : -0.1)) * 100) / 100).toFixed(2)}`
    );
    return question;
  }

  // ---- errorSpotting: shown the classic "no carry across the decimal
  // point" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = Math.round((correct + (op === "add" ? -0.1 : 0.1)) * 100) / 100;
    const symbol = op === "add" ? "+" : "−";
    return {
      prompt: {
        ms: `${name} mengira RM${a.toFixed(2)} ${symbol} RM${b.toFixed(2)} dan mendapat RM${wrongAnswer.toFixed(2)}. Apakah jawapan yang betul?`,
        en: `${name} calculated RM${a.toFixed(2)} ${symbol} RM${b.toFixed(2)} and got RM${wrongAnswer.toFixed(2)}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: `RM${correct.toFixed(2)}`,
      context: { a, b, correct, wrongAnswer, op },
      generatorKey: "decimal_add_subtract",
      difficulty: 3,
      options: finalizeOptions(`RM${correct.toFixed(2)}`, [`RM${wrongAnswer.toFixed(2)}`], () =>
        `RM${Math.max(0, Math.round((correct + randInt(1, 9) * (Math.random() > 0.5 ? 0.1 : -0.1)) * 100) / 100).toFixed(2)}`
      ),
    };
  }

  // ---- word_problem: shopping scenario, matches this topic's explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const item1 = pick(items);
    const item2 = pick(items.filter((i) => i !== item1));
    const question: GeneratedQuestion = {
      prompt:
        op === "add"
          ? {
              ms: `${name} membeli sebuah ${item1} berharga RM${a.toFixed(2)} dan sebuah ${item2} berharga RM${b.toFixed(2)}. Berapakah jumlah perbelanjaan ${name}?`,
              en: `${name} buys a ${itemsEn[item1]} for RM${a.toFixed(2)} and a ${itemsEn[item2]} for RM${b.toFixed(2)}. How much did ${name} spend in total?`,
            }
          : {
              ms: `${name} ada simpanan RM${a.toFixed(2)}. ${name} membeli sebuah ${item1} berharga RM${b.toFixed(2)}. Berapakah baki wang ${name}?`,
              en: `${name} has RM${a.toFixed(2)} in savings. ${name} buys a ${itemsEn[item1]} for RM${b.toFixed(2)}. How much money does ${name} have left?`,
            },
      type: "word_problem",
      correctAnswer: `RM${correct.toFixed(2)}`,
      context: { a, b, correct, op },
      generatorKey: "decimal_add_subtract",
      difficulty: 2,
    };
    const misaligned = Math.round((correct + (Math.random() > 0.5 ? 0.9 : -0.9)) * 100) / 100;
    const noCarryAcrossPoint = Math.round((correct + (op === "add" ? -0.1 : 0.1)) * 100) / 100;
    question.options = finalizeOptions(
      `RM${correct.toFixed(2)}`,
      [`RM${misaligned.toFixed(2)}`, `RM${noCarryAcrossPoint.toFixed(2)}`],
      () => `RM${Math.max(0, Math.round((correct + randInt(1, 9) * (Math.random() > 0.5 ? 0.01 : -0.01)) * 100) / 100).toFixed(2)}`
    );
    return question;
  }

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
