import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";
import { formatRM } from "./money";

// Year 5 KSSR "Purchasing Via Credit and Cash" — comparing the total cost
// of paying by instalment (deposit + monthly payments) against paying the
// full cash price up front. The instalment total is always higher (that's
// the whole point of the lesson) — the question asks for the difference.
export function generateCreditVsCash(params: GeneratorParams): GeneratedQuestion {
  const maxCashRM = Number(params.maxCashRM ?? 2000);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const cashRM = randInt(5, maxCashRM / 100) * 100; // round hundreds, e.g. RM500-RM2000
  const depositRM = Math.round(cashRM * 0.1); // 10% deposit
  const months = randInt(6, 24);
  // Choose a monthly instalment slightly above what a 0%-interest plan
  // would need, so the credit total always exceeds the cash price.
  const baseMonthlyRM = Math.ceil((cashRM - depositRM) / months);
  const monthlyRM = baseMonthlyRM + randInt(2, 10);
  const creditTotalRM = depositRM + monthlyRM * months;
  const differenceRM = creditTotalRM - cashRM;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah peti sejuk berharga RM${cashRM} secara tunai. Secara ansuran, bayaran pendahuluan ialah RM${depositRM}, diikuti ${months} bulan pada RM${monthlyRM} sebulan. Berapakah lebihan bayaran jika beli secara ansuran berbanding tunai?`,
      en: `A fridge costs RM${cashRM} in cash. On instalment, the deposit is RM${depositRM}, followed by ${months} months at RM${monthlyRM} per month. How much more does buying on instalment cost compared to cash?`,
    },
    type,
    correctAnswer: formatRM(differenceRM * 100),
    context: { cashRM, depositRM, months, monthlyRM, creditTotalRM, differenceRM },
    generatorKey: "credit_vs_cash",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: gives the full instalment total, not just the
    // difference from the cash price.
    const gaveCreditTotal = formatRM(creditTotalRM * 100);
    const distractors = Array.from(new Set([gaveCreditTotal].filter((d) => d !== formatRM(differenceRM * 100))));
    question.options = shuffleOptions(formatRM(differenceRM * 100), distractors);
    while (question.options.length < 3) {
      const candidateRM = Math.max(1, differenceRM + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateRM * 100);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
