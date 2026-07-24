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

export function generateMoneyAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxRM = Number(params.maxRM ?? 20);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const op = pick(["add", "subtract"] as const);

  let aSen = randInt(100, maxRM * 100);
  let bSen = randInt(100, maxRM * 100);
  if (op === "subtract" && bSen > aSen) [aSen, bSen] = [bSen, aSen]; // keep non-negative

  const correctSen = op === "add" ? aSen + bSen : aSen - bSen;
  const symbol = op === "add" ? "+" : "−";

  const question: GeneratedQuestion = {
    prompt: { ms: `${formatRM(aSen)} ${symbol} ${formatRM(bSen)} = ?`, en: `${formatRM(aSen)} ${symbol} ${formatRM(bSen)} = ?` },
    type,
    correctAnswer: formatRM(correctSen),
    context: { aSen, bSen, correctSen, op },
    generatorKey: "money_add_subtract",
    difficulty: 1,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to carry/borrow across the RM/sen
    // boundary (100 sen = RM1) — treats ringgit and sen as independent
    // base-10 columns instead of regrouping at 100.
    const ringgitPart = op === "add" ? Math.floor(aSen / 100) + Math.floor(bSen / 100) : Math.abs(Math.floor(aSen / 100) - Math.floor(bSen / 100));
    const senPart = op === "add" ? (aSen % 100) + (bSen % 100) : Math.abs((aSen % 100) - (bSen % 100));
    const noCarrySen = ringgitPart * 100 + senPart;
    const distractors = Array.from(new Set([formatRM(noCarrySen)].filter((d) => d !== formatRM(correctSen))));
    question.options = shuffleOptions(formatRM(correctSen), distractors);
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, correctSen + randInt(10, 200) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

export function generateMoneyMultiplyDivide(params: GeneratorParams): GeneratedQuestion {
  const maxRM = Number(params.maxRM ?? 10);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const op = pick(["multiply", "divide"] as const);

  if (op === "multiply") {
    const priceSen = randInt(100, maxRM * 100);
    const qty = randInt(2, 9);
    const correctSen = priceSen * qty;
    const question: GeneratedQuestion = {
      prompt: { ms: `${formatRM(priceSen)} × ${qty} = ?`, en: `${formatRM(priceSen)} × ${qty} = ?` },
      type,
      correctAnswer: formatRM(correctSen),
      context: { priceSen, qty, correctSen, op },
      generatorKey: "money_multiply_divide",
      difficulty: 2,
    };
    if (type === "mcq") {
      const addedInstead = formatRM(priceSen + qty * 100);
      const distractors = Array.from(new Set([addedInstead].filter((d) => d !== formatRM(correctSen))));
      question.options = shuffleOptions(formatRM(correctSen), distractors);
      while (question.options.length < 3) {
        const candidateSen = Math.max(0, correctSen + randInt(10, 300) * (Math.random() > 0.5 ? 1 : -1));
        const candidate = formatRM(candidateSen);
        if (!question.options.includes(candidate)) question.options.push(candidate);
      }
    }
    return question;
  }

  // Divide: build from the quotient backwards so the division is exact.
  const quotientSen = randInt(100, maxRM * 100);
  const divisor = randInt(2, 9);
  const totalSen = quotientSen * divisor;
  const question: GeneratedQuestion = {
    prompt: { ms: `${formatRM(totalSen)} ÷ ${divisor} = ?`, en: `${formatRM(totalSen)} ÷ ${divisor} = ?` },
    type,
    correctAnswer: formatRM(quotientSen),
    context: { totalSen, divisor, quotientSen, op },
    generatorKey: "money_multiply_divide",
    difficulty: 2,
  };
  if (type === "mcq") {
    const subtractedInstead = formatRM(Math.max(0, totalSen - divisor * 100));
    const distractors = Array.from(new Set([subtractedInstead].filter((d) => d !== formatRM(quotientSen))));
    question.options = shuffleOptions(formatRM(quotientSen), distractors);
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, quotientSen + randInt(10, 200) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }
  return question;
}

// Year 5 KSSR "Financial Literacy" — simple interest: I = P × R × T / 100.
export function generateSimpleInterest(params: GeneratorParams): GeneratedQuestion {
  const maxPrincipalRM = Number(params.maxPrincipalRM ?? 20);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const principalRM = randInt(2, maxPrincipalRM) * 100; // clean hundreds, e.g. RM200-RM2000
  const rate = pick([2, 4, 5, 8, 10]);
  const years = randInt(1, 4);
  const interestSen = Math.round(((principalRM * 100) * rate * years) / 100);

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Ali melabur RM${principalRM} pada kadar faedah ${rate}% setahun selama ${years} tahun. Berapakah faedah yang diperoleh Ali?`,
      en: `Ali invests RM${principalRM} at an interest rate of ${rate}% per year for ${years} years. How much interest does Ali earn?`,
    },
    type,
    correctAnswer: formatRM(interestSen),
    context: { principalRM, rate, years, interestSen },
    generatorKey: "simple_interest",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to multiply by the number of years
    // (computing as if it were only a single year).
    const forgotYears = formatRM(Math.round(((principalRM * 100) * rate) / 100));
    // Classic mistake: forgetting to divide by 100 (treating rate as a
    // whole-number multiplier instead of a percentage).
    const forgotDivideBy100 = formatRM(Math.round(principalRM * 100 * rate * years));
    const distractors = Array.from(
      new Set([forgotYears, forgotDivideBy100].filter((d) => d !== formatRM(interestSen)))
    );
    question.options = shuffleOptions(formatRM(interestSen), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, interestSen + randInt(50, 500) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Recognise Cost Price, Selling Price, Profit, and Loss".
export function generateProfitLoss(params: GeneratorParams): GeneratedQuestion {
  const maxRM = Number(params.maxRM ?? 100);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const costSen = randInt(500, maxRM * 100);
  const isProfit = Math.random() > 0.5;
  const diffSen = randInt(50, Math.max(costSen - 100, 100)); // stay well clear of RM0 selling price
  const sellingSen = isProfit ? costSen + diffSen : Math.max(costSen - diffSen, 50);
  const resultSen = Math.abs(sellingSen - costSen);

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Harga kos sebuah basikal ialah ${formatRM(costSen)}. Harga jualannya ialah ${formatRM(sellingSen)}. Berapakah ${isProfit ? "untung" : "rugi"}?`,
      en: `A bicycle's cost price is ${formatRM(costSen)}. Its selling price is ${formatRM(sellingSen)}. What is the ${isProfit ? "profit" : "loss"}?`,
    },
    type,
    correctAnswer: formatRM(resultSen),
    context: { costSen, sellingSen, resultSen, isProfit: isProfit ? "profit" : "loss" },
    generatorKey: "profit_loss",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: added cost and selling price instead of finding the difference.
    const addedInstead = formatRM(costSen + sellingSen);
    const distractors = Array.from(new Set([addedInstead].filter((d) => d !== formatRM(resultSen))));
    question.options = shuffleOptions(formatRM(resultSen), distractors);
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, resultSen + randInt(50, 300) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Discount" — original price minus a percentage discount.
export function generateDiscount(params: GeneratorParams): GeneratedQuestion {
  const maxRM = Number(params.maxRM ?? 100);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const priceRM = randInt(2, maxRM / 2) * 2; // even RM value keeps percentages clean
  const discountPct = pick([10, 20, 25, 50]);
  const discountSen = Math.round((priceRM * 100 * discountPct) / 100);
  const finalSen = priceRM * 100 - discountSen;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah baju berharga RM${priceRM}. Kedai memberi diskaun ${discountPct}%. Berapakah harga selepas diskaun?`,
      en: `A shirt costs RM${priceRM}. The shop gives a ${discountPct}% discount. What is the price after the discount?`,
    },
    type,
    correctAnswer: formatRM(finalSen),
    context: { priceRM, discountPct, discountSen, finalSen },
    generatorKey: "discount",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: gives the discount AMOUNT instead of the final
    // price after the discount.
    const gaveDiscountAmount = formatRM(discountSen);
    // Classic mistake: added the discount instead of subtracting it.
    const addedInstead = formatRM(priceRM * 100 + discountSen);
    const distractors = Array.from(
      new Set([gaveDiscountAmount, addedInstead].filter((d) => d !== formatRM(finalSen)))
    );
    question.options = shuffleOptions(formatRM(finalSen), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, finalSen + randInt(50, 500) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Receipt and Service Tax" — total payable = amount + tax.
export function generateServiceTax(params: GeneratorParams): GeneratedQuestion {
  const maxRM = Number(params.maxRM ?? 200);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const amountRM = randInt(10, maxRM);
  const taxRate = pick([6, 8, 10]); // common Malaysian SST-style rates
  const taxSen = Math.round((amountRM * 100 * taxRate) / 100);
  const totalSen = amountRM * 100 + taxSen;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah invois berjumlah RM${amountRM}. Cukai perkhidmatan ${taxRate}% dikenakan. Berapakah jumlah yang perlu dibayar?`,
      en: `An invoice totals RM${amountRM}. A ${taxRate}% service tax is charged. What is the total amount payable?`,
    },
    type,
    correctAnswer: formatRM(totalSen),
    context: { amountRM, taxRate, taxSen, totalSen },
    generatorKey: "service_tax",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: gives just the tax amount, not the total payable.
    const gaveTaxOnly = formatRM(taxSen);
    // Classic mistake: subtracted the tax instead of adding it.
    const subtractedInstead = formatRM(amountRM * 100 - taxSen);
    const distractors = Array.from(
      new Set([gaveTaxOnly, subtractedInstead].filter((d) => d !== formatRM(totalSen)))
    );
    question.options = shuffleOptions(formatRM(totalSen), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, totalSen + randInt(50, 500) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Interest and Dividend" — dividend = number of shares ×
// dividend rate per share.
export function generateDividend(params: GeneratorParams): GeneratedQuestion {
  const maxShares = Number(params.maxShares ?? 500);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const shares = randInt(5, maxShares / 10) * 10; // round lot sizes
  const dividendPerShareSen = pick([5, 10, 15, 20, 25]); // sen per share
  const totalSen = shares * dividendPerShareSen;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Ali memiliki ${shares} unit saham. Syarikat itu mengisytiharkan dividen ${formatRM(dividendPerShareSen)} bagi setiap saham. Berapakah jumlah dividen yang Ali terima?`,
      en: `Ali owns ${shares} shares. The company declares a dividend of ${formatRM(dividendPerShareSen)} per share. How much total dividend does Ali receive?`,
    },
    type,
    correctAnswer: formatRM(totalSen),
    context: { shares, dividendPerShareSen, totalSen },
    generatorKey: "dividend",
    difficulty: 3,
  };

  if (type === "mcq") {
    const addedInstead = formatRM(shares * 100 + dividendPerShareSen);
    const distractors = Array.from(new Set([addedInstead].filter((d) => d !== formatRM(totalSen))));
    question.options = shuffleOptions(formatRM(totalSen), distractors);
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, totalSen + randInt(50, 500) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
