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

export function formatRM(sen: number): string {
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

// Year 4 KSSR "Adding & Subtracting Money" (RM/sen, 2 decimal places).
// Retrofitted per the Round 19 content standard: the "word_problem"
// config previously returned the same bare "RM8.50 + RM12.30 = ?" prompt
// regardless of type — same pattern bug as whole_numbers_addition_y6/
// decimal_add_subtract. Added a real Malaysian shopping scenario,
// errorSpotting, and reverseProblem (given the total and one price, find
// the other).
export function generateMoneyAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxRM = Number(params.maxRM ?? 20);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["sayur", "ikan", "beras", "buah-buahan", "roti"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    sayur: "vegetables",
    ikan: "fish",
    beras: "rice",
    "buah-buahan": "fruit",
    roti: "bread",
  };

  let aSen = randInt(100, maxRM * 100);
  let bSen = randInt(100, maxRM * 100);
  const op = pick(["add", "subtract"] as const);
  if (op === "subtract" && bSen > aSen) [aSen, bSen] = [bSen, aSen];
  const correctSen = op === "add" ? aSen + bSen : aSen - bSen;

  // ---- reverseProblem: given the total spent and one item's price, find
  // the other item's price (subtraction, framed as a missing price).
  if (reverseProblem) {
    const name = pick(names);
    const item1 = pick(items);
    const item2 = pick(items.filter((i) => i !== item1));
    const totalSen = aSen + bSen;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membeli ${item1} dan ${item2}, dan membayar sejumlah ${formatRM(totalSen)}. Jika ${item1} berharga ${formatRM(aSen)}, berapakah harga ${item2}?`,
        en: `${name} buys ${itemsEn[item1]} and ${itemsEn[item2]}, paying a total of ${formatRM(totalSen)}. If the ${itemsEn[item1]} costs ${formatRM(aSen)}, what does the ${itemsEn[item2]} cost?`,
      },
      type: "word_problem",
      correctAnswer: formatRM(bSen),
      context: { aSen, bSen, totalSen },
      generatorKey: "money_add_subtract",
      difficulty: 2,
    };
    const addedInstead = formatRM(totalSen + aSen);
    const gaveTotal = formatRM(totalSen);
    const distractors = Array.from(new Set([addedInstead, gaveTotal])).filter((d) => d !== formatRM(bSen));
    question.options = shuffleOptions(formatRM(bSen), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, bSen + randInt(10, 200) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "no carry across RM/sen" mistake.
  // Only meaningful when a genuine carry/borrow actually occurs — resample
  // until one does, the same fix applied to time_duration's errorSpotting
  // (a "mistake" that produces the same value as the correct answer isn't
  // a mistake to spot).
  if (errorSpotting) {
    const name = pick(names);
    let esA = aSen;
    let esB = bSen;
    let esCorrect = correctSen;
    let esWrong = "";
    let esCorrectStr = "";
    for (let guard = 0; guard < 30; guard++) {
      const noCarrySen =
        op === "add"
          ? (Math.floor(esA / 100) + Math.floor(esB / 100)) * 100 + ((esA % 100) + (esB % 100)) % 100
          : Math.abs(Math.floor(esA / 100) - Math.floor(esB / 100)) * 100 + Math.abs((esA % 100) - (esB % 100));
      esWrong = formatRM(noCarrySen);
      esCorrectStr = formatRM(esCorrect);
      if (esWrong !== esCorrectStr) break;
      esA = randInt(100, maxRM * 100);
      esB = randInt(100, maxRM * 100);
      if (op === "subtract" && esB > esA) [esA, esB] = [esB, esA];
      esCorrect = op === "add" ? esA + esB : esA - esB;
    }
    const symbol = op === "add" ? "+" : "−";
    return {
      prompt: {
        ms: `${name} mengira ${formatRM(esA)} ${symbol} ${formatRM(esB)} dan mendapat ${esWrong}. Apakah jawapan yang betul?`,
        en: `${name} calculated ${formatRM(esA)} ${symbol} ${formatRM(esB)} and got ${esWrong}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: esCorrectStr,
      context: { aSen: esA, bSen: esB, correctSen: esCorrect, wrongAnswer: esWrong },
      generatorKey: "money_add_subtract",
      difficulty: 3,
      options: shuffleOptions(esCorrectStr, [esWrong].filter((d) => d !== esCorrectStr)),
    };
  }

  // ---- word_problem: real Malaysian shopping scenario.
  if (type === "word_problem") {
    const name = pick(names);
    const item1 = pick(items);
    const item2 = pick(items.filter((i) => i !== item1));
    const question: GeneratedQuestion = {
      prompt:
        op === "add"
          ? {
              ms: `${name} membeli ${item1} berharga ${formatRM(aSen)} dan ${item2} berharga ${formatRM(bSen)}. Berapakah jumlah perbelanjaan ${name}?`,
              en: `${name} buys ${itemsEn[item1]} for ${formatRM(aSen)} and ${itemsEn[item2]} for ${formatRM(bSen)}. How much did ${name} spend in total?`,
            }
          : {
              ms: `${name} ada wang ${formatRM(aSen)}. ${name} membeli ${item1} berharga ${formatRM(bSen)}. Berapakah baki wang ${name}?`,
              en: `${name} has ${formatRM(aSen)}. ${name} buys ${itemsEn[item1]} for ${formatRM(bSen)}. How much money does ${name} have left?`,
            },
      type: "word_problem",
      correctAnswer: formatRM(correctSen),
      context: { aSen, bSen, correctSen, op },
      generatorKey: "money_add_subtract",
      difficulty: 2,
    };
    // Classic mistake: for addition, dropping the carry when cents overflow
    // 100 instead of regrouping it into the ringgit column (writing just
    // the last two digits of the cents sum). For subtraction, subtracting
    // each column's absolute difference instead of borrowing.
    const noCarrySen =
      op === "add"
        ? (Math.floor(aSen / 100) + Math.floor(bSen / 100)) * 100 + ((aSen % 100) + (bSen % 100)) % 100
        : Math.abs(Math.floor(aSen / 100) - Math.floor(bSen / 100)) * 100 + Math.abs((aSen % 100) - (bSen % 100));
    const distractors = Array.from(new Set([formatRM(noCarrySen)].filter((d) => d !== formatRM(correctSen))));
    question.options = shuffleOptions(formatRM(correctSen), distractors);
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, correctSen + randInt(10, 200) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

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
    const noCarrySen =
      op === "add"
        ? (Math.floor(aSen / 100) + Math.floor(bSen / 100)) * 100 + ((aSen % 100) + (bSen % 100)) % 100
        : Math.abs(Math.floor(aSen / 100) - Math.floor(bSen / 100)) * 100 + Math.abs((aSen % 100) - (bSen % 100));
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

// Year 5 KSSR "Financial Literacy" — compound interest, computed the way
// the real primary curriculum presents it (year-by-year compounding on
// the running total), not the closed-form P(1+r)^t exponential formula,
// which is beyond this level. Kept to 2-3 years so the manual
// year-by-year calculation stays reasonable for a quiz answer.
export function generateCompoundInterest(params: GeneratorParams): GeneratedQuestion {
  const maxPrincipalRM = Number(params.maxPrincipalRM ?? 20);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const principalRM = randInt(2, maxPrincipalRM) * 100; // clean hundreds, e.g. RM200-RM2000
  const rate = pick([2, 4, 5, 8, 10]);
  const years = randInt(2, 3);

  let amountSen = principalRM * 100;
  for (let y = 0; y < years; y++) {
    amountSen += Math.round((amountSen * rate) / 100);
  }
  const compoundInterestSen = amountSen - principalRM * 100;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Siti melabur RM${principalRM} pada kadar faedah kompaun ${rate}% setahun selama ${years} tahun. Setiap tahun, faedah dikira daripada jumlah TERKINI (termasuk faedah tahun sebelumnya). Berapakah jumlah faedah kompaun yang diperoleh Siti selepas ${years} tahun?`,
      en: `Siti invests RM${principalRM} at a compound interest rate of ${rate}% per year for ${years} years. Each year, interest is calculated on the CURRENT total (including previous years' interest). How much total compound interest does Siti earn after ${years} years?`,
    },
    type,
    correctAnswer: formatRM(compoundInterestSen),
    context: { principalRM, rate, years, compoundInterestSen },
    generatorKey: "compound_interest",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: calculated it as SIMPLE interest instead (rate ×
    // years applied only to the original principal, never compounding).
    const simpleInterestSen = Math.round(((principalRM * 100) * rate * years) / 100);
    // Classic mistake: only compounded for 1 year, forgetting the rest.
    const oneYearOnlySen = Math.round((principalRM * 100 * rate) / 100);
    const distractors = Array.from(
      new Set([formatRM(simpleInterestSen), formatRM(oneYearOnlySen)].filter((d) => d !== formatRM(compoundInterestSen)))
    );
    question.options = shuffleOptions(formatRM(compoundInterestSen), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, compoundInterestSen + randInt(50, 500) * (Math.random() > 0.5 ? 1 : -1));
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
// Year 6 KSSR "Dividend" — total dividend = number of shares × dividend
// per share. Retrofitted per the Round 19 content standard: was always
// "Ali", always the same sentence, one weak distractor. Now varies names,
// adds an irrelevant-info decoy, and distractors map to documented
// misconceptions (wrong_operation, unit_confusion between sen and RM).
export function generateDividend(params: GeneratorParams): GeneratedQuestion {
  const maxShares = Number(params.maxShares ?? 500);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const extraInfoChance = Number(params.extraInfoChance ?? 0);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const shares = randInt(5, maxShares / 10) * 10; // round lot sizes
  const dividendPerShareSen = pick([5, 10, 15, 20, 25]); // sen per share
  const totalSen = shares * dividendPerShareSen;
  const name = pick(["Ali", "Siti", "Hakim", "Mei Ling", "Priya", "Faisal", "Nurul"]);
  const company = pick(["Syarikat ABC", "Syarikat Maju Jaya", "Syarikat Sinar Bistari"]);

  // ---- reverseProblem: given the total dividend and number of shares,
  // find the dividend per share (division, not multiplication).
  if (reverseProblem) {
    const perShareCorrect = dividendPerShareSen;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} memiliki ${shares} unit saham dalam ${company} dan menerima jumlah dividen ${formatRM(totalSen)}. Berapakah dividen bagi setiap saham?`,
        en: `${name} owns ${shares} shares in ${company} and receives a total dividend of ${formatRM(totalSen)}. What is the dividend per share?`,
      },
      type: "word_problem",
      correctAnswer: formatRM(perShareCorrect),
      context: { shares, totalSen, perShareCorrect },
      generatorKey: "dividend",
      difficulty: 3,
    };
    // Classic mistake: multiplied instead of dividing.
    const multipliedInstead = formatRM(shares * totalSen);
    const distractors = [multipliedInstead].filter((d) => d !== formatRM(perShareCorrect));
    question.options = shuffleOptions(formatRM(perShareCorrect), distractors);
    while (question.options.length < 3) {
      const candidateSen = Math.max(1, perShareCorrect + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown a documented wrong working, must give the
  // correct total.
  if (errorSpotting) {
    const wrongTotal = shares + dividendPerShareSen; // added instead of multiplied
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mengira dividen ${shares} unit saham pada ${formatRM(dividendPerShareSen)} setiap saham dan mendapat RM${wrongTotal}.00. Apakah jawapan yang betul?`,
        en: `${name} calculated the dividend for ${shares} shares at ${formatRM(dividendPerShareSen)} per share and got RM${wrongTotal}.00. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: formatRM(totalSen),
      context: { shares, dividendPerShareSen, totalSen, wrongTotal },
      generatorKey: "dividend",
      difficulty: 3,
    };
    const distractors = [`RM${wrongTotal}.00`].filter((d) => d !== formatRM(totalSen));
    question.options = shuffleOptions(formatRM(totalSen), distractors);
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, totalSen + randInt(50, 500) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- base case: direct calculation, optionally with an
  // irrelevant-info decoy (e.g. the share purchase price, which isn't
  // needed to find the dividend).
  const withDecoy = Math.random() < extraInfoChance;
  const purchasePriceSen = pick([80, 100, 150, 200]) * 100; // RM0.80-RM2.00 per share, in sen
  const decoyMs = withDecoy ? ` ${name} membeli saham itu pada harga ${formatRM(purchasePriceSen)} bagi setiap saham.` : "";
  const decoyEn = withDecoy ? ` ${name} bought the shares at ${formatRM(purchasePriceSen)} per share.` : "";

  const question: GeneratedQuestion = {
    prompt: {
      ms: `${name} memiliki ${shares} unit saham dalam ${company}.${decoyMs} Syarikat itu mengisytiharkan dividen ${formatRM(dividendPerShareSen)} bagi setiap saham. Berapakah jumlah dividen yang ${name} terima?`,
      en: `${name} owns ${shares} shares in ${company}.${decoyEn} The company declares a dividend of ${formatRM(dividendPerShareSen)} per share. How much total dividend does ${name} receive?`,
    },
    type: withDecoy ? "word_problem" : type,
    correctAnswer: formatRM(totalSen),
    context: { shares, dividendPerShareSen, totalSen },
    generatorKey: "dividend",
    difficulty: 3,
  };

  if (question.type === "mcq" || question.type === "word_problem") {
    // wrong_operation: added instead of multiplied.
    const addedInstead = `RM${shares + dividendPerShareSen}.00`;
    // unit_confusion: multiplied using the sen value as if it were RM
    // (e.g. treated 15 sen as RM15), so the answer is 100x too large.
    const senAsRM = formatRM(totalSen * 100);
    const distractors = Array.from(new Set([addedInstead, senAsRM].filter((d) => d !== formatRM(totalSen))));
    question.options = shuffleOptions(formatRM(totalSen), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateSen = Math.max(0, totalSen + randInt(50, 500) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatRM(candidateSen);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
