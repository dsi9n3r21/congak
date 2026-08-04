import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/** Simulates the "forgot to carry" mistake: adds each place-value column
 * independently without carrying the overflow into the next column. */
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

// Year 4 KSSR "Addition Within 100,000". Retrofitted per the Round 19
// content standard: added a real bookshop-stock word_problem (matches
// this topic's explanation text), errorSpotting, and a reverseProblem
// that finds one addend given the sum and the other addend (subtracting
// back).
export function generateWholeNumbersAddition(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10000);
  const max = Number(params.max ?? 99000);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["pensel", "buku", "botol air"] as const;
  const itemsEn: Record<(typeof items)[number], string> = { pensel: "pencils", buku: "books", "botol air": "bottles of water" };

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
        ms: `Sebuah kedai mempunyai ${total.toLocaleString("en-US")} biji ${item} kesemuanya, selepas ${name} menambah ${b.toLocaleString("en-US")} biji ${item} baru. Berapa biji ${item} yang ada sebelum itu?`,
        en: `A shop has ${total.toLocaleString("en-US")} ${itemsEn[item]} in total, after ${name} added ${b.toLocaleString("en-US")} new ${itemsEn[item]}. How many ${itemsEn[item]} were there before that?`,
      },
      type: "word_problem",
      correctAnswer: String(a),
      context: { a, b, total },
      generatorKey: "whole_numbers_addition",
      difficulty: 2,
    };
    // Classic mistake: added instead of subtracting back.
    const addedInstead = total + b;
    // Classic mistake: gave the total again, forgetting to subtract.
    const gaveTotal = total;
    const distractors = Array.from(new Set([String(addedInstead), String(gaveTotal)])).filter((d) => d !== String(a));
    question.options = shuffleOptions(String(a), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, a + randInt(10, 999) * (Math.random() > 0.5 ? 1 : -1)));
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
        generatorKey: "whole_numbers_addition",
        difficulty: 2,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: bookshop-stock scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Kedai ${name} ada ${a.toLocaleString("en-US")} biji ${item} dan menerima ${b.toLocaleString("en-US")} biji ${item} baru. Berapa biji ${item} kesemuanya sekarang?`,
        en: `${name}'s shop has ${a.toLocaleString("en-US")} ${itemsEn[item]} and receives ${b.toLocaleString("en-US")} new ${itemsEn[item]}. How many ${itemsEn[item]} are there now?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, correct },
      generatorKey: "whole_numbers_addition",
      difficulty: max > 50000 ? 2 : 1,
    };
    const forgotCarryDistractor = noCarryAdd(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 10 : -10) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotCarryDistractor), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
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
    generatorKey: "whole_numbers_addition",
    difficulty: max > 50000 ? 2 : 1,
  };

  if (type === "mcq") {
    const forgotCarryDistractor = noCarryAdd(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 10 : -10) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotCarryDistractor), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    // Guarantee 3 distinct options even on rare collisions — the previous
    // version pushed a random offset without checking it wasn't already
    // present, so it could (and did) produce duplicate options.
    while (question.options.length < 3) {
      const candidate = String(correct + (randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
