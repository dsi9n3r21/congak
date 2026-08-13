import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/** Mirrors wholeNumbers.ts's no-carry simulation. */
function noCarryAdd(a: number, b: number): number {
  const da = String(a).split("").reverse();
  const db = String(b).split("").reverse();
  const len = Math.max(da.length, db.length);
  let result = "";
  for (let i = 0; i < len; i++) {
    const digitA = Number(da[i] ?? 0);
    const digitB = Number(db[i] ?? 0);
    result = String((digitA + digitB) % 10) + result;
  }
  return Number(result);
}

// Year 5 KSSR "Addition Within 1,000,000" — same skill as Y4's
// whole_numbers_addition, extended to 6-digit numbers. Retrofitted per
// the Round 19 content standard: added a real warehouse-inventory
// word_problem (scaled-up numbers feel distinct from Y4's bookshop
// framing), errorSpotting, and a reverseProblem that finds one addend
// given the sum and the other (subtracting back).
export function generateWholeNumbersAdditionY5(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 100000);
  const max = Number(params.max ?? 999999);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["tin makanan", "botol air mineral", "beg beras"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    "tin makanan": "tins of food",
    "botol air mineral": "bottles of mineral water",
    "beg beras": "bags of rice",
  };

  // ---- challenge (TP6 / non-routine): same "second delivery arrives, keep
  // going" shape as whole_numbers_addition (001), ported up to Y5's
  // 6-digit range.
  if (challenge) {
    const a = randInt(min, max);
    const b = randInt(min, max);
    const b2 = randInt(min, max);
    const correct = a + b;
    const finalTotal = a + b + b2;
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Gudang ${name} ada ${a.toLocaleString("en-US")} ${item}. Pembekal pertama menghantar ${b.toLocaleString("en-US")} ${item} tambahan, dan pembekal kedua menghantar ${b2.toLocaleString("en-US")} ${item} tambahan lagi. Berapa ${item} kesemuanya sekarang?`,
        en: `${name}'s warehouse has ${a.toLocaleString("en-US")} ${itemsEn[item]}. The first supplier delivers ${b.toLocaleString("en-US")} additional ${itemsEn[item]}, and a second supplier delivers ${b2.toLocaleString("en-US")} more. How many ${itemsEn[item]} are there now in total?`,
      },
      type: "word_problem",
      correctAnswer: String(finalTotal),
      context: { a, b, b2, correct, finalTotal },
      generatorKey: "whole_numbers_addition_y5",
      difficulty: 2,
    };
    // Classic non-routine mistake: stops after the first delivery.
    const stoppedAfterFirst = String(correct);
    const distractors = [stoppedAfterFirst].filter((d) => d !== String(finalTotal));
    question.options = shuffleOptions(String(finalTotal), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, finalTotal + randInt(100, 9999) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the total and one addend, find the other
  // addend — subtracting back through the sum.
  if (reverseProblem) {
    const a = randInt(min, max);
    const b = randInt(min, max);
    const total = a + b;
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah gudang mempunyai ${total.toLocaleString("en-US")} ${item} kesemuanya, selepas ${name} menghantar ${b.toLocaleString("en-US")} ${item} tambahan. Berapa ${item} yang ada sebelum itu?`,
        en: `A warehouse has ${total.toLocaleString("en-US")} ${itemsEn[item]} in total, after ${name} delivered ${b.toLocaleString("en-US")} additional ${itemsEn[item]}. How many ${itemsEn[item]} were there before that?`,
      },
      type: "word_problem",
      correctAnswer: String(a),
      context: { a, b, total },
      generatorKey: "whole_numbers_addition_y5",
      difficulty: 2,
    };
    const addedInstead = total + b;
    const gaveTotal = total;
    const distractors = Array.from(new Set([String(addedInstead), String(gaveTotal)])).filter((d) => d !== String(a));
    question.options = shuffleOptions(String(a), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, a + randInt(100, 9999) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const a = randInt(min, max);
  const b = randInt(min, max);
  const correct = a + b;

  // ---- errorSpotting: shown the classic "forgot to carry" mistake, must
  // give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = noCarryAdd(a, b);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${a.toLocaleString("en-US")} + ${b.toLocaleString("en-US")} dan mendapat ${wrongAnswer.toLocaleString("en-US")}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${a.toLocaleString("en-US")} + ${b.toLocaleString("en-US")} and got ${wrongAnswer.toLocaleString("en-US")}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { a, b, correct, wrongAnswer },
        generatorKey: "whole_numbers_addition_y5",
        difficulty: 2,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: warehouse-inventory scenario, scaled up from Y4's
  // bookshop framing.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Gudang ${name} ada ${a.toLocaleString("en-US")} ${item} dan menerima ${b.toLocaleString("en-US")} ${item} tambahan. Berapa ${item} kesemuanya sekarang?`,
        en: `${name}'s warehouse has ${a.toLocaleString("en-US")} ${itemsEn[item]} and receives ${b.toLocaleString("en-US")} additional ${itemsEn[item]}. How many ${itemsEn[item]} are there now?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, correct },
      generatorKey: "whole_numbers_addition_y5",
      difficulty: 2,
    };
    const forgotCarryDistractor = noCarryAdd(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 100 : -100) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotCarryDistractor), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const equation = `${a.toLocaleString("en-US")} + ${b.toLocaleString("en-US")} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, correct },
    generatorKey: "whole_numbers_addition_y5",
    difficulty: 2,
  };

  if (type === "mcq") {
    const forgotCarryDistractor = noCarryAdd(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 100 : -100) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotCarryDistractor), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
