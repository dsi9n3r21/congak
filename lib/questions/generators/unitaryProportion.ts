import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Proportion" — verified against the real Y4 textbook ToC
// (Coordinates, Ratio, and Proportion, p.222+). This is the introductory
// "unitary method" skill: given a price for a group of items, find the
// price for a different quantity by scaling from a single unit.
// Deliberately distinct from Y5's "Proportion to Find a Value" (which
// starts from a stated a:b ratio, not a price-per-item scenario).
export function generateUnitaryProportion(_params: GeneratorParams): GeneratedQuestion {
  const pricePerItem = randInt(1, 5);
  const unitQty = randInt(2, 5);
  const unitCost = pricePerItem * unitQty;
  let targetQty = randInt(2, 10);
  if (targetQty === unitQty) targetQty = targetQty === 10 ? 9 : targetQty + 1;

  const correct = pricePerItem * targetQty;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `${unitQty} batang pensel berharga RM${unitCost}. Berapakah harga ${targetQty} batang pensel, pada kadar yang sama?`,
      en: `${unitQty} pencils cost RM${unitCost}. At the same rate, how much do ${targetQty} pencils cost?`,
    },
    type: "mcq",
    correctAnswer: String(correct),
    context: { pricePerItem, unitQty, unitCost, targetQty, correct },
    generatorKey: "unitary_proportion",
    difficulty: 2,
  };

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

  return question;
}
