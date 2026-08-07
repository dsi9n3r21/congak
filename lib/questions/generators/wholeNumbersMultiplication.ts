import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const MULT_NAMES = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
const MULT_ITEMS = [
  { ms: "tin susu", en: "tins of milk" },
  { ms: "botol jus", en: "bottles of juice" },
  { ms: "kotak paku", en: "boxes of nails" },
] as const;

// Year 5 KSSR "Multiply by a 2-Digit Number". Retrofitted per the
// Round 19 content standard: added a factory-production word_problem,
// errorSpotting, and a reverseProblem that divides back through the
// total to find the daily rate (the natural inverse of this topic).
export function generateWholeNumbersMultiplication(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 100);
  const max = Number(params.max ?? 999);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const a = randInt(min, max);
  const b = randInt(11, 99); // 2-digit multiplier, matching KSSR Y5 level
  const correct = a * b;
  const context = { a, b, correct };

  // ---- reverseProblem: given the total and the number of days, find the
  // daily rate — dividing back through the product.
  if (reverseProblem) {
    const name = pick(MULT_NAMES);
    const item = pick(MULT_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kilang milik ${name} mengeluarkan ${item.ms} yang sama banyak setiap hari selama ${b} hari, dan menghasilkan ${correct.toLocaleString("en-US")} ${item.ms} kesemuanya. Berapa ${item.ms} dikeluarkan setiap hari?`,
        en: `${name}'s factory produces the same number of ${item.en} every day for ${b} days, producing ${correct.toLocaleString("en-US")} ${item.en} in total. How many ${item.en} are produced each day?`,
      },
      type: "word_problem",
      correctAnswer: String(a),
      context,
      generatorKey: "whole_numbers_multiplication",
      difficulty: 3,
    };
    // Classic mistake: multiplied instead of dividing.
    const multipliedInstead = correct * b;
    const distractors = [String(multipliedInstead)].filter((d) => d !== String(a));
    question.options = shuffleOptions(String(a), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, a + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot to shift" mistake, must
  // give the correct product.
  if (errorSpotting) {
    const tens = Math.floor(b / 10);
    const ones = b % 10;
    const wrongAnswer = a * tens + a * ones;
    if (wrongAnswer !== correct) {
      const name = pick(MULT_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${a.toLocaleString("en-US")} × ${b} dan mendapat ${wrongAnswer.toLocaleString("en-US")}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${a.toLocaleString("en-US")} × ${b} and got ${wrongAnswer.toLocaleString("en-US")}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context,
        generatorKey: "whole_numbers_multiplication",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) >= 0) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: factory-production scenario.
  if (type === "word_problem") {
    const name = pick(MULT_NAMES);
    const item = pick(MULT_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kilang milik ${name} mengeluarkan ${a.toLocaleString("en-US")} ${item.ms} setiap hari. Berapa ${item.ms} dikeluarkan dalam ${b} hari?`,
        en: `${name}'s factory produces ${a.toLocaleString("en-US")} ${item.en} every day. How many ${item.en} are produced in ${b} days?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context,
      generatorKey: "whole_numbers_multiplication",
      difficulty: 2,
    };
    const tens = Math.floor(b / 10);
    const ones = b % 10;
    const forgotShift = a * tens + a * ones;
    const addedInstead = a + b;
    const distractors = Array.from(
      new Set([String(forgotShift), String(addedInstead)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
    return question;
  }

  const equation = `${a.toLocaleString("en-US")} × ${b} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context,
    generatorKey: "whole_numbers_multiplication",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying by the tens digit but forgetting to
    // shift that partial product one place left (i.e. skipping the ×10) —
    // effectively computing a × (tens + ones) instead of a × (tens×10 + ones).
    const tens = Math.floor(b / 10);
    const ones = b % 10;
    const forgotShift = a * tens + a * ones;
    // Classic mistake: adding instead of multiplying.
    const addedInstead = a + b;
    const distractors = Array.from(
      new Set([String(forgotShift), String(addedInstead)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
