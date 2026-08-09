import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const DIV_Y6_NAMES = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
const DIV_Y6_ITEMS = [
  { ms: "biji buku", en: "books" },
  { ms: "tin makanan", en: "tins of food" },
  { ms: "botol air", en: "bottles of water" },
] as const;

// Year 6 KSSR "Divide by a 2-Digit Number". Retrofitted per the Round 19
// content standard: added an equal-sharing word_problem, errorSpotting,
// and a reverseProblem that finds the divisor (the "how many groups"
// framing of division) given the dividend and the quotient.
export function generateWholeNumbersDivision(params: GeneratorParams): GeneratedQuestion {
  const minQuotient = Number(params.minQuotient ?? 10);
  const maxQuotient = Number(params.maxQuotient ?? 99);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const divisor = randInt(11, 25); // 2-digit divisor, matching KSSR Y6 level
  const quotient = randInt(minQuotient, maxQuotient);
  const dividend = divisor * quotient; // keep it exact — no remainder at this level
  const context = { dividend, divisor, correct: quotient };
  const challenge = Boolean(params.challenge);

  // ---- challenge (TP6 / non-routine): a genuine two-hop question — the
  // SAME total is regrouped into a DIFFERENT number of classes. Built
  // from scratch as divisor × divisor2 × k so it divides cleanly both
  // ways by construction (rather than hoping a random second divisor
  // happens to factor the first quotient's dividend) — hop 2 needs the
  // regrouped total, so it can't be shortcut into a single division.
  if (challenge) {
    const divisorOptions = [11, 13, 15, 17, 19, 21, 23, 25].filter((d) => d !== divisor);
    const divisor2 = pick(divisorOptions);
    const k = randInt(2, 5);
    const bigDividend = divisor * divisor2 * k;
    const quotient1 = bigDividend / divisor;
    const quotient2 = bigDividend / divisor2;
    const name = pick(DIV_Y6_NAMES);
    const item = pick(DIV_Y6_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${bigDividend.toLocaleString("en-US")} ${item.ms} milik ${name} mula-mula diagihkan sama rata kepada ${divisor} buah kelas. Kemudian, ${item.ms} yang SAMA disusun semula dan diagihkan sama rata kepada ${divisor2} buah kelas sahaja. Berapa ${item.ms} setiap kelas terima selepas disusun semula?`,
        en: `${name} first shares ${bigDividend.toLocaleString("en-US")} ${item.en} equally among ${divisor} classes. Then, the SAME ${item.en} are regrouped and shared equally among just ${divisor2} classes instead. How many ${item.en} does each class get after regrouping?`,
      },
      type: "word_problem",
      correctAnswer: String(quotient2),
      context: { bigDividend, divisor, divisor2, quotient1, quotient2 },
      generatorKey: "whole_numbers_division",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after the first grouping and
    // gives that quotient as the final answer, ignoring the regroup.
    const stoppedAtFirstGrouping = String(quotient1);
    const distractors = [stoppedAtFirstGrouping].filter((d) => d !== String(quotient2));
    question.options = shuffleOptions(String(quotient2), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, quotient2 + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the dividend and the quotient (amount per
  // group), find the divisor (number of groups).
  if (reverseProblem) {
    const name = pick(DIV_Y6_NAMES);
    const item = pick(DIV_Y6_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${dividend.toLocaleString("en-US")} ${item.ms} milik ${name} diagihkan sama rata kepada beberapa kelas, dan setiap kelas menerima ${quotient} ${item.ms}. Berapa kelas kesemuanya?`,
        en: `${name} shares ${dividend.toLocaleString("en-US")} ${item.en} equally among several classes, and each class receives ${quotient} ${item.en}. How many classes are there?`,
      },
      type: "word_problem",
      correctAnswer: String(divisor),
      context,
      generatorKey: "whole_numbers_division",
      difficulty: 3,
    };
    // Classic mistake: multiplied the dividend by the quotient instead of dividing.
    const multipliedInstead = dividend * quotient;
    const distractors = [String(multipliedInstead)].filter((d) => d !== String(divisor));
    question.options = shuffleOptions(String(divisor), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, divisor + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "subtracted instead of divided"
  // mistake, must give the correct quotient.
  if (errorSpotting) {
    const wrongAnswer = dividend - divisor;
    if (wrongAnswer !== quotient) {
      const name = pick(DIV_Y6_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${dividend.toLocaleString("en-US")} ÷ ${divisor} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${dividend.toLocaleString("en-US")} ÷ ${divisor} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(quotient),
        context,
        generatorKey: "whole_numbers_division",
        difficulty: 3,
        options: shuffleOptions(String(quotient), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(quotient + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) > 0) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: equal-sharing scenario.
  if (type === "word_problem") {
    const name = pick(DIV_Y6_NAMES);
    const item = pick(DIV_Y6_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${dividend.toLocaleString("en-US")} ${item.ms} milik ${name} hendak diagihkan sama rata kepada ${divisor} buah kelas. Berapa ${item.ms} setiap kelas terima?`,
        en: `${name} wants to share ${dividend.toLocaleString("en-US")} ${item.en} equally among ${divisor} classes. How many ${item.en} does each class get?`,
      },
      type: "word_problem",
      correctAnswer: String(quotient),
      context,
      generatorKey: "whole_numbers_division",
      difficulty: 3,
    };
    const subtractedInstead = dividend - divisor;
    const addedInstead = dividend + divisor;
    const distractors = Array.from(
      new Set([String(subtractedInstead), String(addedInstead)].filter((d) => d !== String(quotient)))
    );
    question.options = shuffleOptions(String(quotient), distractors);
    while (question.options.length < 3) {
      const candidate = String(quotient + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) > 0) question.options.push(candidate);
    }
    return question;
  }

  const equation = `${dividend.toLocaleString("en-US")} ÷ ${divisor} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(quotient),
    context,
    generatorKey: "whole_numbers_division",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: subtracting instead of dividing.
    const subtractedInstead = dividend - divisor;
    // Classic mistake: adding instead of dividing.
    const addedInstead = dividend + divisor;
    const distractors = Array.from(
      new Set([String(subtractedInstead), String(addedInstead)].filter((d) => d !== String(quotient)))
    );
    question.options = shuffleOptions(String(quotient), distractors);
    while (question.options.length < 3) {
      const candidate = String(quotient + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) > 0) question.options.push(candidate);
    }
  }

  return question;
}
