import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/** Simulates the "forgot to carry" mistake for multiplication: multiplies
 * each digit by the multiplier independently, keeping only the ones digit
 * of each partial product, instead of carrying the overflow leftward. */
function noCarryMultiply(a: number, multiplier: number): number {
  const digits = String(a).split("").reverse();
  let result = "";
  for (const d of digits) {
    result = String((Number(d) * multiplier) % 10) + result;
  }
  return Number(result);
}

// Year 4 KSSR "Multiplying by a 1-Digit Number". Retrofitted per the
// Round 19 content standard: added a real egg-shop word_problem (matches
// this topic's explanation text), errorSpotting, and a reverseProblem
// that finds the multiplicand given the product and the multiplier
// (dividing back).
export function generateWholeNumbersMultiplicationY4(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 1000);
  const max = Number(params.max ?? 9999);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["telur", "guli", "setem"] as const;
  const itemsEn: Record<(typeof items)[number], string> = { telur: "eggs", guli: "marbles", setem: "stamps" };

  // ---- reverseProblem: given the total sold over several days and how
  // many days, find how many were sold per day — dividing back.
  if (reverseProblem) {
    const perDay = randInt(Math.ceil(min / 9), Math.floor(max / 9));
    const days = randInt(2, 9);
    const total = perDay * days;
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kedai menjual ${item} pada kadar yang sama setiap hari. Dalam ${days} hari, sejumlah ${total.toLocaleString("en-US")} biji ${item} telah dijual. Berapa biji ${item} dijual setiap hari?`,
        en: `A shop sells ${itemsEn[item]} at the same rate every day. Over ${days} days, a total of ${total.toLocaleString("en-US")} ${itemsEn[item]} were sold. How many ${itemsEn[item]} were sold each day?`,
      },
      type: "word_problem",
      correctAnswer: String(perDay),
      context: { perDay, days, total },
      generatorKey: "whole_numbers_multiplication_y4",
      difficulty: 2,
    };
    // Classic mistake: subtracted the days from the total instead of dividing.
    const subtractedInstead = Math.max(1, total - days);
    // Classic mistake: gave the total again, forgetting to divide.
    const gaveTotal = total;
    const distractors = Array.from(new Set([String(subtractedInstead), String(gaveTotal)])).filter(
      (d) => d !== String(perDay)
    );
    question.options = shuffleOptions(String(perDay), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, perDay + randInt(10, 99) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const a = randInt(min, max);
  const b = randInt(2, 9); // 1-digit multiplier, matching KSSR Y4 level
  const correct = a * b;
  const challenge = Boolean(params.challenge);

  // ---- challenge (TP6 / non-routine): a genuine two-hop question — the
  // per-day rate `a` is given implicitly through the first `b`-day total,
  // then projected forward over a DIFFERENT number of days `b2`. Same
  // shape as the Y5 version (whole_numbers_multiplication), scaled down
  // to Y4's 1-digit multiplier range.
  if (challenge) {
    let b2 = randInt(2, 9);
    while (b2 === b) b2 = randInt(2, 9);
    const finalTotal = a * b2;
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Kedai ${name} menjual ${a.toLocaleString("en-US")} biji ${item} setiap hari selama ${b} hari. Jika kedai itu buka selama ${b2} hari pada minggu depan (dengan kadar jualan yang sama), berapa biji ${item} akan dijual?`,
        en: `${name}'s shop sells ${a.toLocaleString("en-US")} ${itemsEn[item]} every day for ${b} days. If the shop is open for ${b2} days next week (at the same daily rate), how many ${itemsEn[item]} will be sold?`,
      },
      type: "word_problem",
      correctAnswer: String(finalTotal),
      context: { a, b, correct, b2, finalTotal },
      generatorKey: "whole_numbers_multiplication_y4",
      difficulty: 2,
    };
    // Classic non-routine mistake: stops after finding the daily rate
    // and gives that as the final answer.
    const stoppedAtDailyRate = String(a);
    // Classic mistake: reused the ORIGINAL total instead of recalculating
    // for the new number of days.
    const reusedOriginalTotal = String(correct);
    const distractors = Array.from(
      new Set([stoppedAtDailyRate, reusedOriginalTotal].filter((d) => d !== String(finalTotal)))
    );
    question.options = shuffleOptions(String(finalTotal), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, finalTotal + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot to carry" mistake, must
  // give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = noCarryMultiply(a, b);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${a.toLocaleString("en-US")} × ${b} dan mendapat ${wrongAnswer.toLocaleString("en-US")}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${a.toLocaleString("en-US")} × ${b} and got ${wrongAnswer.toLocaleString("en-US")}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { a, b, correct, wrongAnswer },
        generatorKey: "whole_numbers_multiplication_y4",
        difficulty: 1,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) >= 0) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: egg-shop-per-day scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Kedai ${name} menjual ${a.toLocaleString("en-US")} biji ${item} setiap hari. Berapa biji ${item} dijual dalam ${b} hari?`,
        en: `${name}'s shop sells ${a.toLocaleString("en-US")} ${itemsEn[item]} every day. How many ${itemsEn[item]} are sold in ${b} days?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, correct },
      generatorKey: "whole_numbers_multiplication_y4",
      difficulty: 1,
    };
    const forgotCarry = noCarryMultiply(a, b);
    const addedInstead = a + b;
    const distractors = Array.from(
      new Set([String(forgotCarry), String(addedInstead)].filter((d) => d !== String(correct)))
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
    context: { a, b, correct },
    generatorKey: "whole_numbers_multiplication_y4",
    difficulty: 1,
  };

  if (type === "mcq") {
    const forgotCarry = noCarryMultiply(a, b);
    const addedInstead = a + b;
    const distractors = Array.from(
      new Set([String(forgotCarry), String(addedInstead)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 99) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
