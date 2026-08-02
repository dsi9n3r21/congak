import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Percentage of a Quantity (Basic)". Retrofitted per the
// Round 19 content standard: the prompt previously never branched on
// `type` at all (word_problem silently rendered the same bare "Find X% of
// Y" prompt as mcq) — added a real rotten-apples word_problem (matches
// this topic's explanation text), errorSpotting, and reverseProblem.
export function generatePercentageOfQuantity(params: GeneratorParams): GeneratedQuestion {
  const percentages = (params.percentages as number[]) ?? [10, 20, 25, 50, 75];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["epal", "biskut", "pensel", "guli"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    epal: "apples",
    biskut: "biscuits",
    pensel: "pencils",
    guli: "marbles",
  };

  const percent = pick(percentages);
  // Keep the quantity a clean multiple so the answer is a whole number —
  // matches how this is actually taught at Year 6 basic level.
  const multiple = 100 / gcdOf(percent, 100);
  const quantity = multiple * randInt(1, 5);
  const correct = (percent / 100) * quantity;

  // ---- reverseProblem: given the part and the percentage, find the
  // original whole quantity (dividing back through the percentage).
  if (reverseProblem) {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${percent}% daripada ${item} dalam bakul ${name} ialah ${correct} biji. Berapa biji ${item} kesemuanya dalam bakul itu?`,
        en: `${percent}% of the ${itemsEn[item]} in ${name}'s basket is ${correct}. How many ${itemsEn[item]} are in the basket altogether?`,
      },
      type: "word_problem",
      correctAnswer: String(quantity),
      context: { percent, quantity, correct },
      generatorKey: "percentage_of_quantity",
      difficulty: 3,
    };
    // Classic mistake: multiplied the part by the percentage instead of dividing back.
    const multipliedInstead = correct * percent;
    // Classic mistake: gave the part again, instead of the whole.
    const gavePart = correct;
    const distractors = Array.from(new Set([String(multipliedInstead), String(gavePart)])).filter(
      (d) => d !== String(quantity)
    );
    question.options = shuffleOptions(String(quantity), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, quantity + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot to divide by 100"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = percent * quantity;
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${percent}% daripada ${quantity} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${percent}% of ${quantity} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { percent, quantity, correct, wrongAnswer },
        generatorKey: "percentage_of_quantity",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(0, correct + randInt(1, 9)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: rotten-items-in-a-basket scenario, matches this
  // topic's explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Ada ${quantity} biji ${item} dalam bakul ${name}. ${percent}% daripadanya busuk. Berapa biji ${item} yang busuk?`,
        en: `There are ${quantity} ${itemsEn[item]} in ${name}'s basket. ${percent}% of them are rotten. How many ${itemsEn[item]} are rotten?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { percent, quantity, correct },
      generatorKey: "percentage_of_quantity",
      difficulty: percent === 50 || percent === 25 ? 1 : 2,
    };
    const forgotDivide = percent * quantity;
    const invertedOperation = Math.round(quantity / percent);
    question.options = shuffleOptions(
      String(correct),
      [String(forgotDivide), String(invertedOperation)].filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      question.options.push(String(correct + randInt(1, 9)));
    }
    return question;
  }

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
// Retrofitted per the Round 19 content standard: added a real test-score
// word_problem (matches this topic's explanation text), errorSpotting, and
// a reverseProblem variant that asks for the complementary percentage
// (100% − pct) — a genuine second step past the base conversion, not just
// the same computation restated.
export function generateDecimalPercentageConvert(params: GeneratorParams): GeneratedQuestion {
  const maxWhole = Number(params.maxWhole ?? 0);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const subjects = ["ujian Matematik", "kuiz Sains", "peperiksaan Bahasa Melayu"] as const;
  const subjectsEn: Record<(typeof subjects)[number], string> = {
    "ujian Matematik": "Maths test",
    "kuiz Sains": "Science quiz",
    "peperiksaan Bahasa Melayu": "Malay exam",
  };

  const whole = randInt(0, maxWhole);
  const hundredths = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95]);
  const decimal = Math.round((whole + hundredths / 100) * 100) / 100;
  const pct = whole * 100 + hundredths;
  const decimalToPct = Math.random() > 0.5;

  // ---- reverseProblem: given the score answered correctly (as a
  // decimal out of 1), find the percentage answered WRONG — a genuine
  // second step (convert, then take the complement), always in [0,1] so
  // the complement stays a sensible 0-100%.
  if (reverseProblem) {
    const rHundredths = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95]);
    const rDecimal = rHundredths / 100;
    const rPctCorrect = rHundredths;
    const rPctWrong = 100 - rPctCorrect;
    const name = pick(names);
    const subject = pick(subjects);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} menjawab ${rDecimal} daripada soalan ${subject} dengan betul. Berapa peratuskah soalan yang dijawab SALAH?`,
        en: `${name} answered ${rDecimal} of the questions in the ${subjectsEn[subject]} correctly. What percentage of the questions did ${name} answer WRONG?`,
      },
      type: "word_problem",
      correctAnswer: String(rPctWrong),
      context: { decimal: rDecimal, pctCorrect: rPctCorrect, pctWrong: rPctWrong },
      generatorKey: "decimal_percentage_convert",
      difficulty: 3,
    };
    // Classic mistake: gave the "correct" percentage again, forgetting to take the complement.
    const gaveCorrectPct = rPctCorrect;
    // Classic mistake: forgot to multiply by 100, so subtracted from 1 not 100.
    const subtractedFromOne = Math.round((1 - rDecimal) * 100) / 100;
    const distractors = Array.from(
      new Set([String(gaveCorrectPct), String(subtractedFromOne)].filter((d) => d !== String(rPctWrong)))
    );
    question.options = shuffleOptions(String(rPctWrong), distractors.slice(0, 2));
    while (question.options!.length < 3) {
      const candidate = String(Math.max(0, rPctWrong + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options!.includes(candidate)) question.options!.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "shifted the decimal point by
  // the wrong number of places" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = decimalToPct ? pct / 10 : Math.round((pct / 10) * 100) / 100;
    const correctStr = decimalToPct ? String(pct) : decimal.toFixed(2);
    const wrongStr = decimalToPct ? String(wrongAnswer) : wrongAnswer.toFixed(2);
    if (wrongStr !== correctStr) {
      const question: GeneratedQuestion = {
        prompt: decimalToPct
          ? {
              ms: `${name} menukar ${decimal} kepada peratus dan mendapat ${wrongStr}%. Apakah jawapan yang betul?`,
              en: `${name} converted ${decimal} to a percentage and got ${wrongStr}%. What is the correct answer?`,
            }
          : {
              ms: `${name} menukar ${pct}% kepada perpuluhan dan mendapat ${wrongStr}. Apakah jawapan yang betul?`,
              en: `${name} converted ${pct}% to a decimal and got ${wrongStr}. What is the correct answer?`,
            },
        type: "mcq",
        correctAnswer: correctStr,
        context: { decimal, pct, decimalToPct: decimalToPct ? "yes" : "no", wrongAnswer: wrongStr },
        generatorKey: "decimal_percentage_convert",
        difficulty: 3,
        options: shuffleOptions(correctStr, [wrongStr]),
      };
      while (question.options!.length < 3) {
        const base = decimalToPct ? pct : Number(decimal.toFixed(2));
        const candidate = decimalToPct
          ? String(Math.max(0, base + randInt(1, 9)))
          : (base + randInt(1, 9) * 0.01).toFixed(2);
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: test-score scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const subject = pick(subjects);
    const question: GeneratedQuestion = {
      prompt: decimalToPct
        ? {
            ms: `${name} mendapat markah ${decimal} daripada 1 dalam ${subject}. Berapa peratus markahnya?`,
            en: `${name} scores ${decimal} out of 1 in the ${subjectsEn[subject]}. What percentage is that?`,
          }
        : {
            ms: `${name} mendapat ${pct}% dalam ${subject}. Tuliskan markah ini sebagai perpuluhan daripada 1.`,
            en: `${name} scores ${pct}% in the ${subjectsEn[subject]}. Write this score as a decimal out of 1.`,
          },
      type: "word_problem",
      correctAnswer: decimalToPct ? String(pct) : decimal.toFixed(2),
      context: { decimal, pct, decimalToPct: decimalToPct ? "yes" : "no" },
      generatorKey: "decimal_percentage_convert",
      difficulty: maxWhole > 0 ? 3 : 2,
    };
    if (decimalToPct) {
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
    return question;
  }

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
