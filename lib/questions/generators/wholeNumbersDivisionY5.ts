import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const DIV_Y5_NAMES = ["Aina", "Haris", "Wei Ling", "Kavitha", "Zulkifli", "Amirah", "Ravi"];
const DIV_Y5_ITEMS = [
  { ms: "biji gula-gula", en: "sweets" },
  { ms: "pensel warna", en: "coloured pencils" },
  { ms: "biji guli", en: "marbles" },
] as const;

// Year 5 KSSR "Divide by a 1-Digit Number" (dividend up to 3 digits) —
// same skill as Y4's whole_numbers_division_y4, extended to bigger
// dividends. Retrofitted per the Round 19 content standard: added an
// equal-sharing word_problem, errorSpotting, and a reverseProblem
// finding the divisor (number of students) given the dividend and quotient.
export function generateWholeNumbersDivisionY5(params: GeneratorParams): GeneratedQuestion {
  const minQuotient = Number(params.minQuotient ?? 100);
  const maxQuotient = Number(params.maxQuotient ?? 999);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);

  const divisor = randInt(2, 9); // 1-digit divisor, matching KSSR Y5 level
  const quotient = randInt(minQuotient, maxQuotient);
  const dividend = divisor * quotient; // keep it exact — no remainder at this level
  const context = { dividend, divisor, correct: quotient };

  // ---- challenge (TP6 / non-routine): same "regroup the same total into a
  // different number of groups" shape as whole_numbers_division's 2-digit
  // version, ported down to 1-digit divisors. Built from scratch as
  // divisor × divisor2 × k so it divides cleanly both ways by construction.
  if (challenge) {
    const divisorOptions = [2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d !== divisor);
    const divisor2 = pick(divisorOptions);
    const k = randInt(20, 90);
    const bigDividend = divisor * divisor2 * k;
    const quotient1 = bigDividend / divisor;
    const quotient2 = bigDividend / divisor2;
    const name = pick(DIV_Y5_NAMES);
    const item = pick(DIV_Y5_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${bigDividend.toLocaleString("en-US")} ${item.ms} milik ${name} mula-mula diagihkan sama rata kepada ${divisor} orang murid. Kemudian, ${item.ms} yang SAMA disusun semula dan diagihkan sama rata kepada ${divisor2} orang murid sahaja. Berapa ${item.ms} setiap murid terima selepas disusun semula?`,
        en: `${name} first shares ${bigDividend.toLocaleString("en-US")} ${item.en} equally among ${divisor} students. Then, the SAME ${item.en} are regrouped and shared equally among just ${divisor2} students instead. How many ${item.en} does each student get after regrouping?`,
      },
      type: "word_problem",
      correctAnswer: String(quotient2),
      context: { bigDividend, divisor, divisor2, quotient1, quotient2 },
      generatorKey: "whole_numbers_division_y5",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after the first sharing and gives
    // that quotient as the final answer, ignoring the regroup.
    const stoppedAtFirstSharing = String(quotient1);
    const distractors = [stoppedAtFirstSharing].filter((d) => d !== String(quotient2));
    question.options = shuffleOptions(String(quotient2), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, quotient2 + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the dividend and the quotient (amount per
  // student), find the divisor (number of students).
  if (reverseProblem) {
    const name = pick(DIV_Y5_NAMES);
    const item = pick(DIV_Y5_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${dividend.toLocaleString("en-US")} ${item.ms} milik ${name} diagihkan sama rata kepada beberapa orang murid, dan setiap murid menerima ${quotient} ${item.ms}. Berapa orang murid kesemuanya?`,
        en: `${name} shares ${dividend.toLocaleString("en-US")} ${item.en} equally among some students, and each student receives ${quotient} ${item.en}. How many students are there?`,
      },
      type: "word_problem",
      correctAnswer: String(divisor),
      context,
      generatorKey: "whole_numbers_division_y5",
      difficulty: 3,
    };
    const multipliedInstead = dividend * quotient;
    const distractors = [String(multipliedInstead)].filter((d) => d !== String(divisor));
    question.options = shuffleOptions(String(divisor), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, divisor + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "subtracted instead of divided"
  // mistake, must give the correct quotient.
  if (errorSpotting) {
    const wrongAnswer = dividend - divisor;
    if (wrongAnswer !== quotient) {
      const name = pick(DIV_Y5_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${dividend.toLocaleString("en-US")} ÷ ${divisor} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${dividend.toLocaleString("en-US")} ÷ ${divisor} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(quotient),
        context,
        generatorKey: "whole_numbers_division_y5",
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
    const name = pick(DIV_Y5_NAMES);
    const item = pick(DIV_Y5_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${dividend.toLocaleString("en-US")} ${item.ms} milik ${name} hendak diagihkan sama rata kepada ${divisor} orang murid. Berapa ${item.ms} setiap murid terima?`,
        en: `${name} wants to share ${dividend.toLocaleString("en-US")} ${item.en} equally among ${divisor} students. How many ${item.en} does each student get?`,
      },
      type: "word_problem",
      correctAnswer: String(quotient),
      context,
      generatorKey: "whole_numbers_division_y5",
      difficulty: 2,
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
    generatorKey: "whole_numbers_division_y5",
    difficulty: 2,
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
