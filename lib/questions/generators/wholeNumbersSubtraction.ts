import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/** Simulates the "forgot to borrow" mistake: subtracts each place-value
 * column independently, taking the absolute difference regardless of
 * which digit is bigger, instead of borrowing from the next column. */
function noBorrowSubtract(a: number, b: number): number {
  const da = String(a).split("").reverse();
  const db = String(b).split("").reverse();
  const len = Math.max(da.length, db.length);
  let result = "";
  for (let i = 0; i < len; i++) {
    const digitA = Number(da[i] ?? 0);
    const digitB = Number(db[i] ?? 0);
    result = String(Math.abs(digitA - digitB)) + result;
  }
  return Number(result);
}

// Year 4 KSSR "Subtracting Whole Numbers up to 100,000". Retrofitted per
// the Round 19 content standard: added a real egg-shop word_problem
// (matches this topic's explanation text), errorSpotting, and a
// reverseProblem that finds the original total given how many were sold
// and how many remain (adding back).
export function generateWholeNumbersSubtraction(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10000);
  const max = Number(params.max ?? 99000);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["telur", "guli", "setem"] as const;
  const itemsEn: Record<(typeof items)[number], string> = { telur: "eggs", guli: "marbles", setem: "stamps" };

  // ---- reverseProblem: given how many were sold and how many remain,
  // find the original total — adding back through the subtraction.
  if (reverseProblem) {
    let a = randInt(min, max);
    let b = randInt(min, max);
    if (b > a) [a, b] = [b, a];
    const remaining = a - b;
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kedai menjual ${b.toLocaleString("en-US")} biji ${item}, dan kini tinggal ${remaining.toLocaleString("en-US")} biji. Berapa biji ${item} yang ada pada mulanya?`,
        en: `A shop sells ${b.toLocaleString("en-US")} ${itemsEn[item]}, and now has ${remaining.toLocaleString("en-US")} left. How many ${itemsEn[item]} were there at first?`,
      },
      type: "word_problem",
      correctAnswer: String(a),
      context: { a, b, remaining },
      generatorKey: "whole_numbers_subtraction",
      difficulty: 2,
    };
    // Classic mistake: subtracted instead of adding back.
    const subtractedInstead = Math.max(0, remaining - b);
    // Classic mistake: gave the remaining amount again, forgetting to add back.
    const gaveRemaining = remaining;
    const distractors = Array.from(new Set([String(subtractedInstead), String(gaveRemaining)])).filter(
      (d) => d !== String(a)
    );
    question.options = shuffleOptions(String(a), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, a + randInt(10, 999) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) [a, b] = [b, a]; // keep the result non-negative for this level
  const correct = a - b;
  const challenge = Boolean(params.challenge);

  // ---- challenge (TP6 / non-routine): a genuine two-hop question — a
  // SECOND deduction is taken from what's left after the first one.
  // Same "buy then buy again" shape as money_change's challenge, applied
  // to plain whole-number subtraction.
  if (challenge) {
    const afterFirst = correct;
    if (afterFirst >= 2) {
      const b2 = randInt(1, afterFirst - 1);
      const finalRemaining = afterFirst - b2;
      const name = pick(names);
      const item = pick(items);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Sebuah kedai ${name} ada ${a.toLocaleString("en-US")} biji ${item}. ${b.toLocaleString("en-US")} biji terjual pada waktu pagi. Kemudian, ${b2.toLocaleString("en-US")} biji lagi terjual pada waktu petang. Berapa biji ${item} yang tinggal?`,
          en: `${name}'s shop has ${a.toLocaleString("en-US")} ${itemsEn[item]}. ${b.toLocaleString("en-US")} are sold in the morning. Then, ${b2.toLocaleString("en-US")} more are sold in the afternoon. How many ${itemsEn[item]} are left?`,
        },
        type: "word_problem",
        correctAnswer: String(finalRemaining),
        context: { a, b, b2, afterFirst, finalRemaining },
        generatorKey: "whole_numbers_subtraction",
        difficulty: 2,
      };
      // Classic non-routine mistake: stops after the morning sale.
      const stoppedAfterMorning = String(afterFirst);
      const distractors = [stoppedAfterMorning].filter((d) => d !== String(finalRemaining));
      question.options = shuffleOptions(String(finalRemaining), distractors);
      while (question.options.length < 3) {
        const candidate = String(Math.max(0, finalRemaining + randInt(10, 999) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options.includes(candidate)) question.options.push(candidate);
      }
      return question;
    }
    // Fall through to the base case on the rare draw where there's
    // nothing meaningful left to take a second deduction from.
  }

  // ---- errorSpotting: shown the classic "forgot to borrow" mistake,
  // must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = noBorrowSubtract(a, b);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} dan mendapat ${wrongAnswer.toLocaleString("en-US")}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} and got ${wrongAnswer.toLocaleString("en-US")}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { a, b, correct, wrongAnswer },
        generatorKey: "whole_numbers_subtraction",
        difficulty: 2,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) >= 0) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: egg-shop scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Kedai ${name} ada ${a.toLocaleString("en-US")} biji ${item} pada awal bulan. Selepas dijual ${b.toLocaleString("en-US")} biji, berapa biji yang tinggal?`,
        en: `${name}'s shop starts the month with ${a.toLocaleString("en-US")} ${itemsEn[item]}. After selling ${b.toLocaleString("en-US")}, how many are left?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, correct },
      generatorKey: "whole_numbers_subtraction",
      difficulty: max > 50000 ? 2 : 1,
    };
    const forgotBorrowDistractor = noBorrowSubtract(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 10 : -10) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotBorrowDistractor), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
    return question;
  }

  const equation = `${a.toLocaleString("en-US")} − ${b.toLocaleString("en-US")} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, correct },
    generatorKey: "whole_numbers_subtraction",
    difficulty: max > 50000 ? 2 : 1,
  };

  if (type === "mcq") {
    const forgotBorrowDistractor = noBorrowSubtract(a, b);
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 10 : -10) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotBorrowDistractor), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
