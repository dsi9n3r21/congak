import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Proportion" — verified against the real Y4 textbook ToC
// (Coordinates, Ratio, and Proportion, p.222+). This is the introductory
// "unitary method" skill: given a price for a group of items, find the
// price for a different quantity by scaling from a single unit.
// Deliberately distinct from Y5's "Proportion to Find a Value" (which
// starts from a stated a:b ratio, not a price-per-item scenario).
//
// Retrofitted per the Round 19 content standard: the function previously
// ignored `params` entirely and hard-coded `type: "mcq"` on every
// return — so the `word_problem` template already configured for this
// topic in topics.ts had always rendered as mcq-typed output regardless
// (an even more basic version of the recurring "output doesn't branch on
// `type`" bug). Fixed to properly read `type`, and added errorSpotting
// plus a reverseProblem that stays firmly in the unitary-method framing
// (never reveals the ratio directly): given the group price and the
// TOTAL spent on a different quantity, find how many items that bought
// — still requires finding the one-item price first, just applying it
// in the reverse (division) direction instead of the base's
// multiplication.
export function generateUnitaryProportion(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["pensel", "buku tulis", "epal", "biskut"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    pensel: "pencils",
    "buku tulis": "notebooks",
    epal: "apples",
    biskut: "biscuits",
  };

  // ---- reverseProblem: given the group price and a total spent on more
  // of the same item, find how many were bought — still the unitary
  // method (find the one-item price first), applied in reverse.
  if (reverseProblem) {
    const pricePerItem = randInt(1, 5);
    const unitQty = randInt(2, 5);
    const unitCost = pricePerItem * unitQty;
    let targetQty = randInt(2, 10);
    if (targetQty === unitQty) targetQty = targetQty === 10 ? 9 : targetQty + 1;
    const targetCost = pricePerItem * targetQty;
    const item = pick(items);

    const question: GeneratedQuestion = {
      prompt: {
        ms: `${unitQty} batang ${item} berharga RM${unitCost}. Pada kadar yang sama, ${item} berapa batang boleh dibeli dengan RM${targetCost}?`,
        en: `${unitQty} ${itemsEn[item]} cost RM${unitCost}. At the same rate, how many ${itemsEn[item]} can be bought with RM${targetCost}?`,
      },
      type: "word_problem",
      correctAnswer: String(targetQty),
      context: { pricePerItem, unitQty, unitCost, targetQty, targetCost },
      generatorKey: "unitary_proportion",
      difficulty: 3,
    };
    // Classic mistake: divided the total by the group cost instead of the one-item price.
    const dividedByGroupCost = Math.round(targetCost / unitCost);
    // Classic mistake: gave the group quantity again instead of solving for the new quantity.
    const gaveGroupQty = unitQty;
    const distractors = Array.from(
      new Set([dividedByGroupCost, gaveGroupQty].map(String).filter((d) => d !== String(targetQty)))
    );
    question.options = shuffleOptions(String(targetQty), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, targetQty + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const pricePerItem = randInt(1, 5);
  const unitQty = randInt(2, 5);
  const unitCost = pricePerItem * unitQty;
  let targetQty = randInt(2, 10);
  if (targetQty === unitQty) targetQty = targetQty === 10 ? 9 : targetQty + 1;

  const correct = pricePerItem * targetQty;

  // ---- errorSpotting: shown the documented "skipped the unit step"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const item = pick(items);
    const wrongAnswer = unitCost * targetQty;
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${unitQty} batang ${item} berharga RM${unitCost}. ${name} mengira harga ${targetQty} batang ${item} pada kadar yang sama dan mendapat RM${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${unitQty} ${itemsEn[item]} cost RM${unitCost}. ${name} calculated the price of ${targetQty} ${itemsEn[item]} at the same rate and got RM${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { pricePerItem, unitQty, unitCost, targetQty, correct, wrongAnswer },
        generatorKey: "unitary_proportion",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(1, correct + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  const item = pick(items);
  const question: GeneratedQuestion = {
    prompt: {
      ms: `${unitQty} batang ${item} berharga RM${unitCost}. Berapakah harga ${targetQty} batang ${item}, pada kadar yang sama?`,
      en: `${unitQty} ${itemsEn[item]} cost RM${unitCost}. At the same rate, how much do ${targetQty} ${itemsEn[item]} cost?`,
    },
    type,
    correctAnswer: String(correct),
    context: { pricePerItem, unitQty, unitCost, targetQty, correct },
    generatorKey: "unitary_proportion",
    difficulty: 2,
  };

  if (type === "mcq" || type === "word_problem") {
    // Classic mistake: forgot to find the price of ONE item first — just
    // used the group price directly (multiplied unitCost by targetQty).
    const forgotUnitStep = unitCost * targetQty;
    // Classic mistake: added the difference in quantity to the group cost
    // instead of scaling proportionally.
    const addedDifference = unitCost + Math.abs(targetQty - unitQty);
    const distractors = Array.from(new Set([forgotUnitStep, addedDifference].map(String))).filter(
      (d) => d !== String(correct)
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
