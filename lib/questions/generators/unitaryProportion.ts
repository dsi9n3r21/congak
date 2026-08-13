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
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["pensel", "buku tulis", "epal", "biskut"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    pensel: "pencils",
    "buku tulis": "notebooks",
    epal: "apples",
    biskut: "biscuits",
  };

  // ---- challenge (TP6 / non-routine): TWO different items, each with
  // its own group price — find the COMBINED cost of new quantities of
  // BOTH. Stays firmly within the Y4 unitary method (no new maths, just
  // the same skill applied twice): genuine second hop past the base
  // skill and reverseProblem (both only ever involve ONE item): (1)
  // find item A's one-item price and scale it, (2) find item B's
  // one-item price and scale it, THEN (3) add both together.
  if (challenge) {
    const pricePerItemA = randInt(1, 5);
    const unitQtyA = randInt(2, 5);
    const unitCostA = pricePerItemA * unitQtyA;
    let targetQtyA = randInt(2, 10);
    if (targetQtyA === unitQtyA) targetQtyA = targetQtyA === 10 ? 9 : targetQtyA + 1;

    const pricePerItemB = randInt(1, 5);
    const unitQtyB = randInt(2, 5);
    const unitCostB = pricePerItemB * unitQtyB;
    let targetQtyB = randInt(2, 10);
    if (targetQtyB === unitQtyB) targetQtyB = targetQtyB === 10 ? 9 : targetQtyB + 1;

    const costA = pricePerItemA * targetQtyA;
    const costB = pricePerItemB * targetQtyB;
    const combined = costA + costB;

    const [itemA, itemB] = [...items].sort(() => Math.random() - 0.5).slice(0, 2);
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${unitQtyA} batang ${itemA} berharga RM${unitCostA}, dan ${unitQtyB} batang ${itemB} berharga RM${unitCostB}. Pada kadar yang sama, berapakah JUMLAH harga bagi ${targetQtyA} batang ${itemA} DAN ${targetQtyB} batang ${itemB} bersama-sama, yang ${name} ingin beli?`,
        en: `${unitQtyA} ${itemsEn[itemA]} cost RM${unitCostA}, and ${unitQtyB} ${itemsEn[itemB]} cost RM${unitCostB}. At the same rates, what is the TOTAL cost of ${targetQtyA} ${itemsEn[itemA]} AND ${targetQtyB} ${itemsEn[itemB]} together, which ${name} wants to buy?`,
      },
      type: "word_problem",
      correctAnswer: String(combined),
      context: { pricePerItemA, targetQtyA, costA, pricePerItemB, targetQtyB, costB, combined },
      generatorKey: "unitary_proportion",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after the first item, forgets
    // the second item's cost entirely.
    const stoppedAtFirstItem = costA;
    // Classic mistake: skips the unit step for BOTH items, using the
    // group price directly for each (the base skill's own classic
    // mistake, applied twice).
    const forgotUnitStepBoth = unitCostA * targetQtyA + unitCostB * targetQtyB;
    const distractors = Array.from(
      new Set([stoppedAtFirstItem, forgotUnitStepBoth].map(String).filter((d) => d !== String(combined)))
    );
    question.options = shuffleOptions(String(combined), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, combined + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

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
