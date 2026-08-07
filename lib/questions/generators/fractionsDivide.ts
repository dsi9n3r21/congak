import { pick, randInt, shuffleOptions, gcd } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const DIVIDE_BY_WHOLE_NAMES = ["Aina", "Haris", "Wei Ling", "Kavitha", "Zulkifli", "Amirah", "Ravi"];

// KSSR Y6 rule: (a/b) ÷ c = a/(b×c) — multiply the denominator by the
// whole number, then simplify. First of four fraction-division sub-topics
// in the real textbook (proper÷whole, mixed÷whole, proper÷proper,
// mixed÷proper) — starting with the simplest, most foundational one.
//
// Retrofitted per the Round 19 content standard: added a real chocolate-
// bar-sharing word_problem (matching this topic's own explanation),
// errorSpotting (the documented "multiplied instead of divided"
// mistake), and a reverseProblem finding the original amount given the
// share size and number of shares (multiplying back).
export function generateFractionsDivideByWhole(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6, 8];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const denom = pick(denominators);
  const num = randInt(1, denom - 1); // proper fraction
  const whole = randInt(2, 6);

  const rawDenom = denom * whole;
  const g = gcd(num, rawDenom);
  const correctNum = num / g;
  const correctDenom = rawDenom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;
  const context = { num, denom, whole, correctNum, correctDenom };

  // ---- reverseProblem: given the share size and the number of shares,
  // find the original amount — multiplying back through the division.
  if (reverseProblem) {
    const name = pick(DIVIDE_BY_WHOLE_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebatang coklat dikongsi sama rata antara ${whole} orang kawan ${name}. Setiap orang mendapat ${correctAnswer} bar. Berapakah pecahan coklat yang ada pada mulanya?`,
        en: `A chocolate bar is shared equally among ${whole} of ${name}'s friends. Each person gets ${correctAnswer} of a bar. What fraction of a bar was there at the start?`,
      },
      type: "word_problem",
      correctAnswer: `${num}/${denom}`,
      context,
      generatorKey: "fractions_divide_by_whole",
      difficulty: 3,
    };
    // Classic mistake: divided again instead of multiplying back.
    const dividedAgain = `${correctNum}/${correctDenom * whole}`;
    const distractors = [dividedAgain].filter((d) => d !== `${num}/${denom}`);
    question.options = shuffleOptions(`${num}/${denom}`, distractors);
    while (question.options.length < 3) {
      const candidate = `${Math.max(1, num + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1))}/${denom}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "multiplied instead of
  // divided" mistake, must give the correct answer.
  if (errorSpotting) {
    const multipliedInstead = `${num * whole}/${denom}`;
    if (multipliedInstead !== correctAnswer) {
      const name = pick(DIVIDE_BY_WHOLE_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${num}/${denom} ÷ ${whole} dan mendapat ${multipliedInstead}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${num}/${denom} ÷ ${whole} and got ${multipliedInstead}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context,
        generatorKey: "fractions_divide_by_whole",
        difficulty: 3,
        options: shuffleOptions(correctAnswer, [multipliedInstead]),
      };
      while (question.options!.length < 3) {
        const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: chocolate-bar-sharing framing, matching the
  // topic's own explanation.
  if (type === "word_problem") {
    const name = pick(DIVIDE_BY_WHOLE_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${num}/${denom} bar coklat milik ${name} hendak dikongsi sama rata antara ${whole} orang kawan. Berapa bahagian setiap orang dapat?`,
        en: `${name} has ${num}/${denom} of a chocolate bar to share equally among ${whole} friends. How much does each person get?`,
      },
      type: "word_problem",
      correctAnswer,
      context,
      generatorKey: "fractions_divide_by_whole",
      difficulty: 3,
    };
    const multipliedInstead = `${num * whole}/${denom}`;
    const unsimplified = `${num}/${rawDenom}`;
    const distractors = Array.from(new Set([multipliedInstead, unsimplified].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: { ms: `${num}/${denom} ÷ ${whole} = ?`, en: `${num}/${denom} ÷ ${whole} = ?` },
    type,
    correctAnswer,
    context,
    generatorKey: "fractions_divide_by_whole",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying instead of dividing (multiplies the
    // numerator by the whole number rather than the denominator).
    const multipliedInstead = `${num * whole}/${denom}`;
    // Classic mistake: the unsimplified answer, when it differs from the
    // simplified one — tests whether the student remembers to simplify.
    const unsimplified = `${num}/${rawDenom}`;
    const distractors = Array.from(new Set([multipliedInstead, unsimplified].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Dividing Proper Fractions with Proper Fractions" — third of
// four fraction-division sub-topics. Rule: (a/b) ÷ (c/d) = (a/b) × (d/c) =
// (a×d)/(b×c), then simplify — "flip and multiply".
//
// Retrofitted per the Round 19 content standard: added a real paint-jar
// "how many bottles can be filled" word_problem, errorSpotting (the
// documented "forgot to flip" mistake), and a reverseProblem variant that
// finds the original jar amount given the bottle size and bottle count
// (multiplying back).
export function generateFractionsDivideByFraction(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const liquids = ["cat", "jus", "minyak"] as const;
  const liquidsEn: Record<(typeof liquids)[number], string> = { cat: "paint", jus: "juice", minyak: "oil" };

  const denomA = pick(denominators);
  const numA = randInt(1, denomA - 1);
  const denomB = pick(denominators.filter((d) => d !== denomA)) ?? denomA;
  const numB = randInt(1, denomB - 1);

  const rawNum = numA * denomB;
  const rawDenom = denomA * numB;
  const g = gcd(rawNum, rawDenom);
  const correctNum = rawNum / g;
  const correctDenom = rawDenom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;

  // ---- reverseProblem: given the bottle size and how many bottles were
  // filled, find the original jar amount — multiplying back.
  if (reverseProblem) {
    const liquid = pick(liquids);
    const rGa = gcd(numA, denomA);
    const jarAnswer = `${numA / rGa}/${denomA / rGa}`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Setiap botol memerlukan ${numB}/${denomB} liter ${liquid}. Sebuah balang cukup untuk mengisi tepat ${correctAnswer} botol. Berapa liter ${liquid} dalam balang itu?`,
        en: `Each bottle needs ${numB}/${denomB} litres of ${liquidsEn[liquid]}. A jar is exactly enough to fill ${correctAnswer} bottles. How many litres of ${liquidsEn[liquid]} are in the jar?`,
      },
      type: "word_problem",
      correctAnswer: jarAnswer,
      context: { numA, denomA, numB, denomB, correctNum, correctDenom },
      generatorKey: "fractions_divide_by_fraction",
      difficulty: 3,
    };
    // Classic mistake: gave the bottle size again, forgetting to multiply back.
    const gaveBottleSize = `${numB}/${denomB}`;
    // Classic mistake: gave the bottle count again instead of the jar amount.
    const gaveBottleCount = correctAnswer;
    const distractors = Array.from(new Set([gaveBottleSize, gaveBottleCount].filter((d) => d !== jarAnswer)));
    question.options = shuffleOptions(jarAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = `${numA}/${denomA + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the documented "forgot to flip" mistake,
  // must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const forgotToFlipAnswer = (() => {
      const n = numA * numB, d = denomA * denomB;
      const g2 = gcd(n, d);
      return `${n / g2}/${d / g2}`;
    })();
    if (forgotToFlipAnswer !== correctAnswer) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${numA}/${denomA} ÷ ${numB}/${denomB} dan mendapat ${forgotToFlipAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${numA}/${denomA} ÷ ${numB}/${denomB} and got ${forgotToFlipAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context: { numA, denomA, numB, denomB, correctNum, correctDenom, wrongAnswer: forgotToFlipAnswer },
        generatorKey: "fractions_divide_by_fraction",
        difficulty: 3,
        options: shuffleOptions(correctAnswer, [forgotToFlipAnswer]),
      };
      while (question.options!.length < 3) {
        const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: paint-jar "how many bottles" scenario, the natural
  // real-world meaning of fraction ÷ fraction.
  if (type === "word_problem") {
    const liquid = pick(liquids);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah balang mengandungi ${numA}/${denomA} liter ${liquid}. Setiap botol kecil memerlukan ${numB}/${denomB} liter. Berapa botol boleh diisi?`,
        en: `A jar contains ${numA}/${denomA} litres of ${liquidsEn[liquid]}. Each small bottle needs ${numB}/${denomB} litres. How many bottles can be filled?`,
      },
      type: "word_problem",
      correctAnswer,
      context: { numA, denomA, numB, denomB, correctNum, correctDenom },
      generatorKey: "fractions_divide_by_fraction",
      difficulty: 3,
    };
    const forgotToFlip = (() => {
      const n = numA * numB, d = denomA * denomB;
      const g2 = gcd(n, d);
      return `${n / g2}/${d / g2}`;
    })();
    const distractors = Array.from(new Set([forgotToFlip].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: { ms: `${numA}/${denomA} ÷ ${numB}/${denomB} = ?`, en: `${numA}/${denomA} ÷ ${numB}/${denomB} = ?` },
    type,
    correctAnswer,
    context: { numA, denomA, numB, denomB, correctNum, correctDenom },
    generatorKey: "fractions_divide_by_fraction",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying straight across without flipping the
    // second fraction first.
    const forgotToFlip = (() => {
      const n = numA * numB, d = denomA * denomB;
      const g2 = gcd(n, d);
      return `${n / g2}/${d / g2}`;
    })();
    const distractors = Array.from(new Set([forgotToFlip].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Dividing Mixed Numbers with Proper Fractions" — fourth and
// final fraction-division sub-topic. Convert the mixed number to an
// improper fraction first, then apply the same "flip and multiply" rule.
//
// Retrofitted per the Round 19 content standard: added a real ribbon-
// cutting word_problem, errorSpotting (the documented "ignored whole
// part" mistake), and a reverseProblem variant that finds the original
// ribbon length given the piece size and piece count (multiplying back).
export function generateFractionsDivideMixedByFraction(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const materials = ["reben", "tali", "wayar"] as const;
  const materialsEn: Record<(typeof materials)[number], string> = { reben: "ribbon", tali: "rope", wayar: "wire" };

  const denomA = pick(denominators);
  const wholePart = randInt(1, 3);
  const fracNum = randInt(1, denomA - 1);
  const improperNum = wholePart * denomA + fracNum;

  const denomB = pick(denominators.filter((d) => d !== denomA)) ?? denomA;
  const numB = randInt(1, denomB - 1);

  const rawNum = improperNum * denomB;
  const rawDenom = denomA * numB;
  const g = gcd(rawNum, rawDenom);
  const correctNum = rawNum / g;
  const correctDenom = rawDenom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;

  // ---- reverseProblem: given the piece size and how many pieces, find
  // the original total length — multiplying back.
  if (reverseProblem) {
    const material = pick(materials);
    const totalAnswer = fracNum === 0 ? `${wholePart}` : `${wholePart} ${fracNum}/${denomA}`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${material[0].toUpperCase() + material.slice(1)} dipotong kepada beberapa bahagian, setiap satu sepanjang ${numB}/${denomB} meter. Terdapat tepat ${correctAnswer} bahagian. Berapakah panjang ${material} itu sebelum dipotong?`,
        en: `A piece of ${materialsEn[material]} is cut into several pieces, each ${numB}/${denomB} metres long. There are exactly ${correctAnswer} pieces. What was the length of the ${materialsEn[material]} before it was cut?`,
      },
      type: "word_problem",
      correctAnswer: totalAnswer,
      context: { wholePart, fracNum, denomA, numB, denomB, improperNum, correctNum, correctDenom },
      generatorKey: "fractions_divide_mixed_by_fraction",
      difficulty: 3,
    };
    // Classic mistake: gave the piece size again, forgetting to multiply back.
    const gavePieceSize = `${numB}/${denomB}`;
    // Classic mistake: gave the piece count again instead of the total length.
    const gavePieceCount = correctAnswer;
    const distractors = Array.from(new Set([gavePieceSize, gavePieceCount].filter((d) => d !== totalAnswer)));
    question.options = shuffleOptions(totalAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = `${wholePart} ${Math.max(1, fracNum + randInt(1, 3))}/${denomA}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the documented "ignored the whole part"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = (() => {
      const n = fracNum * denomB, d = denomA * numB;
      const g2 = gcd(n, d);
      return `${n / g2}/${d / g2}`;
    })();
    if (wrongAnswer !== correctAnswer) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${wholePart} ${fracNum}/${denomA} ÷ ${numB}/${denomB} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${wholePart} ${fracNum}/${denomA} ÷ ${numB}/${denomB} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context: { wholePart, fracNum, denomA, numB, denomB, improperNum, correctNum, correctDenom, wrongAnswer },
        generatorKey: "fractions_divide_mixed_by_fraction",
        difficulty: 3,
        options: shuffleOptions(correctAnswer, [wrongAnswer]),
      };
      while (question.options!.length < 3) {
        const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: ribbon-cutting scenario, matches this topic's
  // sharing/portioning story shape.
  if (type === "word_problem") {
    const material = pick(materials);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Seutas ${material} sepanjang ${wholePart} ${fracNum}/${denomA} meter dipotong kepada bahagian, setiap satu sepanjang ${numB}/${denomB} meter. Berapa bahagian yang boleh dipotong?`,
        en: `A piece of ${materialsEn[material]} that is ${wholePart} ${fracNum}/${denomA} metres long is cut into pieces, each ${numB}/${denomB} metres long. How many pieces can be cut?`,
      },
      type: "word_problem",
      correctAnswer,
      context: { wholePart, fracNum, denomA, numB, denomB, improperNum, correctNum, correctDenom },
      generatorKey: "fractions_divide_mixed_by_fraction",
      difficulty: 3,
    };
    const ignoredWholePart = (() => {
      const n = fracNum * denomB, d = denomA * numB;
      const g2 = gcd(n, d);
      return `${n / g2}/${d / g2}`;
    })();
    const distractors = Array.from(new Set([ignoredWholePart].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `${wholePart} ${fracNum}/${denomA} ÷ ${numB}/${denomB} = ?`,
      en: `${wholePart} ${fracNum}/${denomA} ÷ ${numB}/${denomB} = ?`,
    },
    type,
    correctAnswer,
    context: { wholePart, fracNum, denomA, numB, denomB, improperNum, correctNum, correctDenom },
    generatorKey: "fractions_divide_mixed_by_fraction",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to convert to an improper fraction first.
    const ignoredWholePart = (() => {
      const n = fracNum * denomB, d = denomA * numB;
      const g2 = gcd(n, d);
      return `${n / g2}/${d / g2}`;
    })();
    const distractors = Array.from(new Set([ignoredWholePart].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
