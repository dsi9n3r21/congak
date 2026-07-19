import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const CANTEEN_ITEMS = [
  { name: "nasi lemak", price: 2.5 },
  { name: "air kotak", price: 1.5 },
  { name: "roti canai", price: 1.8 },
  { name: "kuih", price: 1.0 },
  { name: "mee goreng", price: 3.5 },
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
  const priceSen = item ? toSen(item.price) : toSen(randInt(2, Number(params.maxPrice ?? 15)));
  // Paid amount must be a note/coin value bigger than the price.
  const noteOptions = [500, 1000, 2000, 5000]; // RM5, RM10, RM20, RM50 in sen
  const paidSen = pick(noteOptions.filter((n) => n > priceSen)) ?? 5000;

  const changeSen = paidSen - priceSen;

  const prompt = useContext
    ? `Aisyah beli ${item!.name} berharga ${formatRM(priceSen)} di kantin. Dia bayar dengan wang ${formatRM(paidSen)}. Berapakah baki wang Aisyah?`
    : `Bayaran: ${formatRM(paidSen)}. Harga barang: ${formatRM(priceSen)}. Berapakah baki?`;

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
      [conversionErrorDistractor, borrowErrorDistractor].filter((d) => d !== question.correctAnswer)
    );
  }

  return question;
}
