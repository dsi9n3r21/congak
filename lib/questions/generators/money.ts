import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const CANTEEN_ITEMS = [
  { ms: "nasi lemak", en: "nasi lemak", price: 2.5 },
  { ms: "air kotak", en: "packet drink", price: 1.5 },
  { ms: "roti canai", en: "roti canai", price: 1.8 },
  { ms: "kuih", en: "kuih (local snack)", price: 1.0 },
  { ms: "mee goreng", en: "fried noodles", price: 3.5 },
];

function toSen(rm: number): number {
  return Math.round(rm * 100);
}

function formatRM(sen: number): string {
  return `RM${(sen / 100).toFixed(2)}`;
}

export function generateMoneyChange(params: GeneratorParams): GeneratedQuestion {
  const maxPaidRM = Number(params.maxPaid ?? 20);
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const useContext = params.context === "canteen";

  const item = useContext ? pick(CANTEEN_ITEMS) : null;
  const priceSen = item ? toSen(item.price) : randInt(150, Number(params.maxPrice ?? 20) * 100);
  // Paid amount must be a note/coin value bigger than the price, and within
  // the configured ceiling — previously maxPaid was accepted but never
  // actually applied, so easy questions could get an oversized note.
  const noteOptions = [500, 1000, 2000, 5000]; // RM5, RM10, RM20, RM50 in sen
  const paidSen = pick(noteOptions.filter((n) => n > priceSen && n <= maxPaidRM * 100)) ?? 5000;

  const changeSen = paidSen - priceSen;

  const prompt = useContext
    ? {
        ms: `Aisyah beli ${item!.ms} berharga ${formatRM(priceSen)} di kantin. Dia bayar dengan wang ${formatRM(paidSen)}. Berapakah baki wang Aisyah?`,
        en: `Aisyah buys ${item!.en} for ${formatRM(priceSen)} at the canteen. She pays with ${formatRM(paidSen)}. What is Aisyah's change?`,
      }
    : {
        ms: `Bayaran: ${formatRM(paidSen)}. Harga barang: ${formatRM(priceSen)}. Berapakah baki?`,
        en: `Payment: ${formatRM(paidSen)}. Item price: ${formatRM(priceSen)}. What is the change?`,
      };

  const question: GeneratedQuestion = {
    prompt,
    type,
    correctAnswer: formatRM(changeSen),
    context: { priceSen, paidSen, changeSen },
    generatorKey: "money_change",
    difficulty: useContext ? 2 : 1,
  };

  if (type === "mcq") {
    // ringgit_sen_conversion_error: treats sen digits as decimal RM directly (e.g. 250 sen -> RM2.05 instead of RM2.50)
    const conversionErrorSen = Math.round(priceSen / 10) + priceSen - Math.round(priceSen / 100) * 100;
    const conversionErrorDistractor = formatRM(Math.abs(paidSen - conversionErrorSen));
    // subtraction_borrow_error: off by exactly RM1.00 (classic borrow slip)
    const borrowErrorDistractor = formatRM(Math.abs(changeSen - 100));

    question.options = shuffleOptions(
      question.correctAnswer,
      Array.from(
        new Set([conversionErrorDistractor, borrowErrorDistractor].filter((d) => d !== question.correctAnswer))
      )
    );
    // This generator never had a uniqueness-guaranteed fallback — the two
    // distractors above can collide with each other or the correct answer
    // for some price/payment combinations, leaving only 2 options.
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, changeSen + randInt(10, 90) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
