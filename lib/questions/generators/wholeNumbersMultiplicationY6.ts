import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const MULT_Y6_NAMES = ["Razak", "Fatimah", "Kumar", "Chong", "Halim", "Zainab", "Rosli"];
const MULT_Y6_ITEMS = [
  { ms: "botol air", en: "bottles of water" },
  { ms: "beg simen", en: "bags of cement" },
  { ms: "batu bata", en: "bricks" },
] as const;

// Year 6 KSSR "Multiply a 4-Digit Number by a 2-Digit Number" — same
// skill as Y5's whole_numbers_multiplication, extended to 4-digit
// numbers. Retrofitted per the Round 19 content standard: added a
// construction/factory word_problem scaled up from Y5's framing (bricks
// and cement instead of milk tins, so it doesn't feel copy-pasted),
// errorSpotting, and a reverseProblem dividing back to find the daily rate.
export function generateWholeNumbersMultiplicationY6(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 1000);
  const max = Number(params.max ?? 9999);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);

  const a = randInt(min, max);
  const b = randInt(11, 99); // 2-digit multiplier, matching KSSR Y6 level (4-digit x 2-digit)
  const correct = a * b;
  const context = { a, b, correct };

  // ---- challenge (TP6 / non-routine): same "project the daily rate over a
  // DIFFERENT number of days" shape as whole_numbers_multiplication (021),
  // ported up to Y6's 4-digit × 2-digit range.
  if (challenge) {
    let b2 = randInt(11, 99);
    while (b2 === b) b2 = randInt(11, 99);
    const finalTotal = a * b2;
    const name = pick(MULT_Y6_NAMES);
    const item = pick(MULT_Y6_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kilang milik ${name} mengeluarkan ${item.ms} yang sama banyak setiap hari selama ${b} hari, dan menghasilkan ${correct.toLocaleString("en-US")} ${item.ms} kesemuanya. Jika kilang itu beroperasi selama ${b2} hari pada bulan depan (dengan kadar pengeluaran harian yang sama), berapa ${item.ms} akan dihasilkan?`,
        en: `${name}'s factory produces the same number of ${item.en} every day for ${b} days, producing ${correct.toLocaleString("en-US")} ${item.en} in total. If the factory operates for ${b2} days next month (at the same daily rate), how many ${item.en} will it produce?`,
      },
      type: "word_problem",
      correctAnswer: String(finalTotal),
      context: { ...context, b2, finalTotal },
      generatorKey: "whole_numbers_multiplication_y6",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after finding the daily rate (hop
    // 1) and gives that as the final answer, forgetting to project it.
    const stoppedAtDailyRate = String(a);
    // Classic mistake: reused the ORIGINAL total instead of recalculating
    // for the new number of days.
    const reusedOriginalTotal = String(correct);
    const distractors = Array.from(
      new Set([stoppedAtDailyRate, reusedOriginalTotal].filter((d) => d !== String(finalTotal)))
    );
    question.options = shuffleOptions(String(finalTotal), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, finalTotal + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the total and the number of days, find the
  // daily rate — dividing back through the product.
  if (reverseProblem) {
    const name = pick(MULT_Y6_NAMES);
    const item = pick(MULT_Y6_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kilang milik ${name} mengeluarkan ${item.ms} yang sama banyak setiap hari selama ${b} hari, dan menghasilkan ${correct.toLocaleString("en-US")} ${item.ms} kesemuanya. Berapa ${item.ms} dikeluarkan setiap hari?`,
        en: `${name}'s factory produces the same number of ${item.en} every day for ${b} days, producing ${correct.toLocaleString("en-US")} ${item.en} in total. How many ${item.en} are produced each day?`,
      },
      type: "word_problem",
      correctAnswer: String(a),
      context,
      generatorKey: "whole_numbers_multiplication_y6",
      difficulty: 3,
    };
    const multipliedInstead = correct * b;
    const distractors = [String(multipliedInstead)].filter((d) => d !== String(a));
    question.options = shuffleOptions(String(a), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, a + randInt(1, 200) * (Math.random() > 0.5 ? 1 : -1)));
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
      const name = pick(MULT_Y6_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${a.toLocaleString("en-US")} × ${b} dan mendapat ${wrongAnswer.toLocaleString("en-US")}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${a.toLocaleString("en-US")} × ${b} and got ${wrongAnswer.toLocaleString("en-US")}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context,
        generatorKey: "whole_numbers_multiplication_y6",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) >= 0) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: construction/factory scenario, scaled up from Y5's.
  if (type === "word_problem") {
    const name = pick(MULT_Y6_NAMES);
    const item = pick(MULT_Y6_ITEMS);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kilang milik ${name} mengeluarkan ${a.toLocaleString("en-US")} ${item.ms} setiap hari. Berapa ${item.ms} dikeluarkan dalam ${b} hari?`,
        en: `${name}'s factory produces ${a.toLocaleString("en-US")} ${item.en} every day. How many ${item.en} are produced in ${b} days?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context,
      generatorKey: "whole_numbers_multiplication_y6",
      difficulty: 3,
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
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
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
    generatorKey: "whole_numbers_multiplication_y6",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying by the tens digit but forgetting to
    // shift that partial product one place left (i.e. skipping the ×10).
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
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
