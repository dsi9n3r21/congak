import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";
import { formatRM } from "./money";

// Year 5 KSSR "Purchasing Via Credit and Cash" — comparing the total cost
// of paying by instalment (deposit + monthly payments) against paying the
// full cash price up front. The instalment total is always higher (that's
// the whole point of the lesson) — the question asks for the difference.
//
// Retrofitted per the Round 19 content standard: the base prompt was
// already a real scenario for every `type`, but options were only ever
// built `if (type === "mcq")` — same bug family caught repeatedly since
// batch 14. Fixed by widening that guard, and added errorSpotting plus a
// reverseProblem variant that finds the monthly payment given the cash
// price, deposit, term, and the known instalment/cash difference.
export function generateCreditVsCash(params: GeneratorParams): GeneratedQuestion {
  const maxCashRM = Number(params.maxCashRM ?? 2000);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["peti sejuk", "televisyen", "basikal", "mesin basuh"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    "peti sejuk": "fridge",
    televisyen: "television",
    basikal: "bicycle",
    "mesin basuh": "washing machine",
  };

  // ---- challenge (TP6 / non-routine): TWO different stores' instalment
  // plans for the SAME item — find how much CHEAPER the better plan is.
  // Genuine second hop past the base skill and reverseProblem (both only
  // ever compare ONE instalment plan against cash): (1) find store A's
  // instalment total, THEN (2) find store B's instalment total, THEN (3)
  // find the difference between the two plans.
  if (challenge) {
    const depositA = randInt(5, 20) * 10;
    const monthsA = randInt(6, 18);
    const monthlyA = randInt(20, 100);
    const totalA = depositA + monthlyA * monthsA;

    const depositB = randInt(5, 20) * 10;
    const monthsB = randInt(6, 18);
    const monthlyB = randInt(20, 100);
    const totalB = depositB + monthlyB * monthsB;

    const diff = Math.abs(totalA - totalB);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah ${item} boleh dibeli secara ansuran daripada dua kedai. Kedai A: bayaran pendahuluan RM${depositA}, diikuti ${monthsA} bulan pada RM${monthlyA} sebulan. Kedai B: bayaran pendahuluan RM${depositB}, diikuti ${monthsB} bulan pada RM${monthlyB} sebulan. Berapakah beza harga antara kedua-dua pelan ansuran itu?`,
        en: `A ${itemsEn[item]} can be bought on instalment from two stores. Store A: deposit RM${depositA}, followed by ${monthsA} months at RM${monthlyA} per month. Store B: deposit RM${depositB}, followed by ${monthsB} months at RM${monthlyB} per month. What is the price difference between the two instalment plans?`,
      },
      type: "word_problem",
      correctAnswer: formatRM(diff * 100),
      context: { depositA, monthsA, monthlyA, totalA, depositB, monthsB, monthlyB, totalB, diff },
      generatorKey: "credit_vs_cash",
      difficulty: 3,
    };
    // Classic non-routine mistake: gives one store's total instead of the
    // difference between the two plans.
    const gaveOneTotal = formatRM(totalA * 100);
    // Classic non-routine mistake: adds both totals together instead of
    // finding the difference.
    const addedBothTotals = formatRM((totalA + totalB) * 100);
    const distractors = Array.from(
      new Set([gaveOneTotal, addedBothTotals].filter((d) => d !== formatRM(diff * 100)))
    );
    question.options = shuffleOptions(formatRM(diff * 100), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateRM = Math.max(1, diff + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateRM * 100);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the cash price, deposit, term, and the
  // known extra cost of buying on instalment, find the monthly payment.
  if (reverseProblem) {
    const cashRM = randInt(5, maxCashRM / 100) * 100;
    const depositRM = Math.round(cashRM * 0.1);
    const months = randInt(6, 24);
    const baseMonthlyRM = Math.ceil((cashRM - depositRM) / months);
    const monthlyRM = baseMonthlyRM + randInt(2, 10);
    const creditTotalRM = depositRM + monthlyRM * months;
    const differenceRM = creditTotalRM - cashRM;
    const item = pick(items);

    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah ${item} berharga RM${cashRM} secara tunai. Secara ansuran, bayaran pendahuluan ialah RM${depositRM} selama ${months} bulan, dan jumlah keseluruhannya RM${differenceRM} lebih mahal daripada tunai. Berapakah bayaran bulanan?`,
        en: `A ${itemsEn[item]} costs RM${cashRM} in cash. On instalment, the deposit is RM${depositRM} over ${months} months, and the total ends up RM${differenceRM} more than cash. What is the monthly payment?`,
      },
      type: "word_problem",
      correctAnswer: formatRM(monthlyRM * 100),
      context: { cashRM, depositRM, months, monthlyRM, creditTotalRM, differenceRM },
      generatorKey: "credit_vs_cash",
      difficulty: 3,
    };
    // Classic mistake: divided the difference (not the full instalment total minus deposit) by the months.
    const usedDifferenceOnly = Math.round((differenceRM * 100) / months);
    // Classic mistake: divided the cash price by the months instead of the instalment total.
    const usedCashPrice = Math.round((cashRM * 100) / months);
    const distractors = Array.from(
      new Set([usedDifferenceOnly, usedCashPrice].filter((d) => d !== monthlyRM * 100))
    );
    question.options = shuffleOptions(formatRM(monthlyRM * 100), distractors.map(formatRM).slice(0, 2));
    while (question.options.length < 3) {
      const candidateRM = Math.max(1, monthlyRM + randInt(2, 15) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateRM * 100);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const cashRM = randInt(5, maxCashRM / 100) * 100; // round hundreds, e.g. RM500-RM2000
  const depositRM = Math.round(cashRM * 0.1); // 10% deposit
  const months = randInt(6, 24);
  // Choose a monthly instalment slightly above what a 0%-interest plan
  // would need, so the credit total always exceeds the cash price.
  const baseMonthlyRM = Math.ceil((cashRM - depositRM) / months);
  const monthlyRM = baseMonthlyRM + randInt(2, 10);
  const creditTotalRM = depositRM + monthlyRM * months;
  const differenceRM = creditTotalRM - cashRM;

  // ---- errorSpotting: shown the documented "gave the full instalment
  // total, not the difference" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const item = pick(items);
    const wrongAnswer = formatRM(creditTotalRM * 100);
    if (wrongAnswer !== formatRM(differenceRM * 100)) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Sebuah ${item} berharga RM${cashRM} secara tunai. Secara ansuran, bayaran pendahuluan ialah RM${depositRM}, diikuti ${months} bulan pada RM${monthlyRM} sebulan. ${name} ditanya lebihan bayaran berbanding tunai, tetapi menjawab ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `A ${itemsEn[item]} costs RM${cashRM} in cash. On instalment, the deposit is RM${depositRM}, followed by ${months} months at RM${monthlyRM} per month. ${name} was asked for the extra cost compared to cash, but answered ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: formatRM(differenceRM * 100),
        context: { cashRM, depositRM, months, monthlyRM, creditTotalRM, differenceRM, wrongAnswer },
        generatorKey: "credit_vs_cash",
        difficulty: 3,
        options: shuffleOptions(formatRM(differenceRM * 100), [wrongAnswer]),
      };
      while (question.options!.length < 3) {
        const candidateRM = Math.max(1, differenceRM + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1));
        const candidate = formatRM(candidateRM * 100);
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  const item = pick(items);
  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah ${item} berharga RM${cashRM} secara tunai. Secara ansuran, bayaran pendahuluan ialah RM${depositRM}, diikuti ${months} bulan pada RM${monthlyRM} sebulan. Berapakah lebihan bayaran jika beli secara ansuran berbanding tunai?`,
      en: `A ${itemsEn[item]} costs RM${cashRM} in cash. On instalment, the deposit is RM${depositRM}, followed by ${months} months at RM${monthlyRM} per month. How much more does buying on instalment cost compared to cash?`,
    },
    type,
    correctAnswer: formatRM(differenceRM * 100),
    context: { cashRM, depositRM, months, monthlyRM, creditTotalRM, differenceRM },
    generatorKey: "credit_vs_cash",
    difficulty: 3,
  };

  if (type === "mcq" || type === "word_problem") {
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
