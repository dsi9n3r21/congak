import { pick, randInt, shuffleOptions, gcd } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const MULTIPLY_NAMES = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

// Year 5 KSSR "Multiplication of Fractions" — proper fraction × whole
// number: (a/b) × c = (a×c)/b, then simplify. Retrofitted per the
// Round 19 content standard: added a baking word_problem (matching this
// topic's own "flour per batch" explanation), errorSpotting, and a
// reverseProblem finding the per-batch fraction given the total and
// number of batches (dividing back through the product).
export function generateFractionsMultiply(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6, 8];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);

  const denom = pick(denominators);
  const num = randInt(1, denom - 1);
  const whole = randInt(2, 6);

  const rawNum = num * whole;
  const g = gcd(rawNum, denom);
  const correctNum = rawNum / g;
  const correctDenom = denom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;
  const context = { num, denom, whole, correctNum, correctDenom };

  // ---- challenge (TP6 / non-routine): same "rate, then project to a
  // DIFFERENT quantity" shape as whole_numbers_multiplication/money_
  // multiply_divide/decimal_multiply — the per-loaf flour amount is
  // known, but the question asks about a DIFFERENT number of loaves
  // than the one first mentioned.
  if (challenge) {
    const name = pick(MULTIPLY_NAMES);
    let whole2 = randInt(2, 6);
    while (whole2 === whole) whole2 = randInt(2, 6);
    const rawNum1 = num * whole;
    const g1 = gcd(rawNum1, denom);
    const firstTotal = `${rawNum1 / g1}/${denom / g1}`;
    const rawNum2 = num * whole2;
    const g2 = gcd(rawNum2, denom);
    const finalNum = rawNum2 / g2;
    const finalDenom = denom / g2;
    const finalTotal = `${finalNum}/${finalDenom}`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${whole} paun kek memerlukan ${firstTotal} cawan tepung kesemuanya (setiap paun memerlukan jumlah yang sama). Jika ${name} hendak membuat ${whole2} paun kek pula (mengikut resipi yang sama), berapa cawan tepung diperlukan kesemuanya?`,
        en: `${whole} cake loaves need ${firstTotal} cups of flour in total (each loaf needs the same amount). If ${name} wants to bake ${whole2} loaves instead (using the same recipe), how many cups of flour are needed in total?`,
      },
      type: "word_problem",
      correctAnswer: finalTotal,
      context: { num, denom, whole, whole2, firstTotal, finalNum, finalDenom, finalTotal },
      generatorKey: "fractions_multiply",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after finding the per-loaf
    // amount, or reuses the ORIGINAL total instead of recalculating.
    const stoppedAtPerLoaf = `${num}/${denom}`;
    const reusedOriginalTotal = firstTotal;
    const distractors = Array.from(new Set([stoppedAtPerLoaf, reusedOriginalTotal].filter((d) => d !== finalTotal)));
    question.options = shuffleOptions(finalTotal, distractors);
    while (question.options.length < 3) {
      const candidate = `${Math.max(1, finalNum + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1))}/${finalDenom}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the total used and the number of batches,
  // find the per-batch fraction — dividing back through the product.
  if (reverseProblem) {
    const name = pick(MULTIPLY_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membuat ${whole} paun kek, dan setiap paun memerlukan jumlah tepung yang sama. Jumlah tepung yang digunakan ialah ${correctAnswer} cawan. Berapa cawan tepung diperlukan untuk SATU paun?`,
        en: `${name} bakes ${whole} loaves of cake, each needing the same amount of flour. The total flour used is ${correctAnswer} cups. How many cups of flour does ONE loaf need?`,
      },
      type: "word_problem",
      correctAnswer: `${num}/${denom}`,
      context,
      generatorKey: "fractions_multiply",
      difficulty: 3,
    };
    // Classic mistake: multiplied again instead of dividing back.
    const multipliedAgain = `${correctNum * whole}/${correctDenom}`;
    const distractors = [multipliedAgain].filter((d) => d !== `${num}/${denom}`);
    question.options = shuffleOptions(`${num}/${denom}`, distractors);
    while (question.options.length < 3) {
      const candidate = `${Math.max(1, num + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1))}/${denom}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "multiplied the denominator
  // too" mistake, must give the correct answer.
  if (errorSpotting) {
    const multipliedDenomToo = `${num}/${denom * whole}`;
    if (multipliedDenomToo !== correctAnswer) {
      const name = pick(MULTIPLY_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${num}/${denom} × ${whole} dan mendapat ${multipliedDenomToo}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${num}/${denom} × ${whole} and got ${multipliedDenomToo}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context,
        generatorKey: "fractions_multiply",
        difficulty: 3,
        options: shuffleOptions(correctAnswer, [multipliedDenomToo]),
      };
      while (question.options!.length < 3) {
        const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: baking framing, matching the topic's own explanation.
  if (type === "word_problem") {
    const name = pick(MULTIPLY_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Setiap paun kek yang dibuat ${name} memerlukan ${num}/${denom} cawan tepung. Berapa cawan tepung diperlukan untuk ${whole} paun?`,
        en: `Each cake loaf ${name} makes needs ${num}/${denom} cup of flour. How many cups of flour are needed for ${whole} loaves?`,
      },
      type: "word_problem",
      correctAnswer,
      context,
      generatorKey: "fractions_multiply",
      difficulty: 2,
    };
    const multipliedDenomToo = `${num}/${denom * whole}`;
    const unsimplified = `${rawNum}/${denom}`;
    const distractors = Array.from(new Set([multipliedDenomToo, unsimplified].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: { ms: `${num}/${denom} × ${whole} = ?`, en: `${num}/${denom} × ${whole} = ?` },
    type,
    correctAnswer,
    context,
    generatorKey: "fractions_multiply",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: multiplying the denominator too (dividing by the
    // whole number, the fractions_divide_by_whole rule, applied backwards).
    const multipliedDenomToo = `${num}/${denom * whole}`;
    // Classic mistake: the unsimplified answer.
    const unsimplified = `${rawNum}/${denom}`;
    const distractors = Array.from(new Set([multipliedDenomToo, unsimplified].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
