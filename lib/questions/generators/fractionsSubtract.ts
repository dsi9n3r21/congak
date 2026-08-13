import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const SUBTRACT_NAMES = ["Aisyah", "Ali", "Vijay", "Mei Ling", "Hakim", "Nurul", "Faisal"];

// Year 4 KSSR "Subtracting Fractions with the Same Denominator".
// Retrofitted per the Round 19 content standard: added a pizza-slice
// word_problem, errorSpotting, a reverseProblem finding the starting
// amount given what's left and what was eaten, and — a real bug fix —
// the missing uniqueness-guaranteed options fallback that every other
// retrofitted generator already has (this one never had it).
export function generateFractionsSubtractSameDenominator(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [4, 5, 6, 8, 10];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);

  const denom = pick(denominators);
  // numA is the larger fraction we start from; numB is what's taken away —
  // keep numB < numA so the result stays positive, matching Year 4 level.
  const numA = randInt(2, denom - 1);
  const numB = randInt(1, numA - 1);
  const correctNum = numA - numB;
  const correctAnswer = `${correctNum}/${denom}`;
  const context = { numA, numB, denom, correctNum };

  // ---- challenge (TP6 / non-routine): same "three portions, don't stop
  // after two" shape as fractions_same_denominator (002), ported to
  // subtraction — a SECOND slice is eaten after the first, asking what's
  // left after BOTH.
  if (challenge) {
    if (correctNum >= 1) {
      const numC = randInt(1, correctNum);
      const finalNum = correctNum - numC;
      const name = pick(SUBTRACT_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mempunyai ${numA}/${denom} bahagian pizza. Dia makan ${numB}/${denom} bahagian pada waktu tengah hari, kemudian makan ${numC}/${denom} bahagian lagi pada waktu petang. Berapakah baki pizza yang ada selepas itu?`,
          en: `${name} has ${numA}/${denom} of a pizza. They eat ${numB}/${denom} at lunch, then eat another ${numC}/${denom} in the evening. How much pizza is left after that?`,
        },
        type: "word_problem",
        correctAnswer: `${finalNum}/${denom}`,
        context: { numA, numB, numC, denom, correctNum, finalNum },
        generatorKey: "fractions_subtract_same_denominator",
        difficulty: 2,
      };
      // Classic non-routine mistake: stops after the first (lunch)
      // subtraction, forgetting the evening portion.
      const stoppedAtFirst = `${correctNum}/${denom}`;
      const distractors = [stoppedAtFirst].filter((d) => d !== `${finalNum}/${denom}`);
      question.options = shuffleOptions(`${finalNum}/${denom}`, distractors);
      while (question.options.length < 3) {
        const candidate = `${Math.max(0, finalNum + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1))}/${denom}`;
        if (!question.options.includes(candidate)) question.options.push(candidate);
      }
      return question;
    }
    // Fall through to the base case on the rare draw where there's nothing
    // left after the first bite for a second one to be taken from.
  }

  // ---- reverseProblem: given what's left and what was eaten, find the
  // starting amount (addition, the inverse of subtraction).
  if (reverseProblem) {
    const name = pick(SUBTRACT_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} makan ${numB}/${denom} daripada sebuah pizza, dan baki ${correctNum}/${denom} pizza masih ada. Berapakah pecahan pizza yang ada pada mulanya?`,
        en: `${name} eats ${numB}/${denom} of a pizza, and ${correctNum}/${denom} of the pizza is left. What fraction of the pizza was there at the start?`,
      },
      type: "word_problem",
      correctAnswer: `${numA}/${denom}`,
      context,
      generatorKey: "fractions_subtract_same_denominator",
      difficulty: 2,
    };
    // Classic mistake: subtracted instead of adding to find the start.
    const subtractedInstead = `${Math.max(0, correctNum - numB)}/${denom}`;
    const distractors = [subtractedInstead].filter((d) => d !== `${numA}/${denom}`);
    question.options = shuffleOptions(`${numA}/${denom}`, distractors);
    while (question.options.length < 3) {
      const candidate = `${Math.max(1, numA + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1))}/${denom}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "added instead of subtracted"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const addedInstead = `${numA + numB}/${denom}`;
    if (addedInstead !== correctAnswer) {
      const name = pick(SUBTRACT_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${numA}/${denom} − ${numB}/${denom} dan mendapat ${addedInstead}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${numA}/${denom} − ${numB}/${denom} and got ${addedInstead}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context,
        generatorKey: "fractions_subtract_same_denominator",
        difficulty: 2,
        options: shuffleOptions(correctAnswer, [addedInstead]),
      };
      while (question.options!.length < 3) {
        const candidate = `${Math.max(0, correctNum + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1))}/${denom}`;
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: pizza-slice framing, matching the topic's own explanation.
  if (type === "word_problem") {
    const name = pick(SUBTRACT_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mempunyai ${numA}/${denom} bahagian pizza. Dia makan ${numB}/${denom} bahagian. Berapakah baki pizza yang ada?`,
        en: `${name} has ${numA}/${denom} of a pizza. They eat ${numB}/${denom} of it. How much pizza is left?`,
      },
      type: "word_problem",
      correctAnswer,
      context,
      generatorKey: "fractions_subtract_same_denominator",
      difficulty: 1,
    };
    const addedInstead = `${numA + numB}/${denom}`;
    const subtractedDenomToo = `${correctNum}/${Math.max(denom - numB, 1)}`;
    const distractors = [addedInstead, subtractedDenomToo].filter((d) => d !== correctAnswer);
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${Math.max(0, correctNum + randInt(1, 3))}/${denom}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const equation = `${numA}/${denom} − ${numB}/${denom} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer,
    context,
    generatorKey: "fractions_subtract_same_denominator",
    difficulty: denom > 8 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: added instead of subtracted.
    const addedInstead = `${numA + numB}/${denom}`;
    // Classic mistake: subtracted the denominators too, instead of keeping
    // it fixed.
    const subtractedDenomToo = `${correctNum}/${Math.max(denom - numB, 1)}`;
    const distractors = [addedInstead, subtractedDenomToo].filter((d) => d !== question.correctAnswer);
    question.options = shuffleOptions(question.correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${Math.max(0, correctNum + randInt(1, 3))}/${denom}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
