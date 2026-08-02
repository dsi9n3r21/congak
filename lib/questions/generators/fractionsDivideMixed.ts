import { pick, randInt, shuffleOptions, gcd } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Dividing Mixed Numbers with Whole Numbers" — second of four
// fraction-division sub-topics (see fractionsDivide.ts for the first,
// proper-fraction version). Convert the mixed number to an improper
// fraction first, then apply the same (a/b)÷c = a/(b×c) rule.
//
// Retrofitted per the Round 19 content standard: added a real flour-bag
// word_problem, errorSpotting (the documented "ignored whole part"
// mistake), and a reverseProblem variant that finds the original total
// given the per-container amount (multiplying back).
export function generateFractionsDivideMixedByWhole(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 3, 4, 5, 6, 8];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["tepung", "beras", "gula"] as const;
  const itemsEn: Record<(typeof items)[number], string> = { tepung: "flour", beras: "rice", gula: "sugar" };

  const denom = pick(denominators);
  const wholePart = randInt(1, 4);
  const fracNum = randInt(1, denom - 1);
  const improperNum = wholePart * denom + fracNum;
  const divisor = randInt(2, 5);

  const rawDenom = denom * divisor;
  const g = gcd(improperNum, rawDenom);
  const correctNum = improperNum / g;
  const correctDenom = rawDenom / g;
  const correctAnswer = `${correctNum}/${correctDenom}`;

  // ---- reverseProblem: given the per-container amount and how many
  // containers, find the original total — multiplying back.
  if (reverseProblem) {
    const name = pick(names);
    const item = pick(items);
    const gTotal = gcd(improperNum, denom);
    const totalAnswer = gTotal === denom ? `${improperNum / gTotal}` : `${improperNum / gTotal}/${denom / gTotal}`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membahagikan ${item} sama rata kepada ${divisor} bekas. Setiap bekas mendapat ${correctAnswer} kg. Berapa kg ${item} kesemuanya pada mulanya?`,
        en: `${name} divides ${itemsEn[item]} equally into ${divisor} containers. Each container gets ${correctAnswer} kg. How many kg of ${itemsEn[item]} were there in total at first?`,
      },
      type: "word_problem",
      correctAnswer: totalAnswer,
      context: { wholePart, fracNum, denom, divisor, improperNum, correctNum, correctDenom },
      generatorKey: "fractions_divide_mixed_by_whole",
      difficulty: 3,
    };
    // Classic mistake: gave the per-container amount again, forgetting to multiply back.
    const gavePerContainer = correctAnswer;
    // Classic mistake: added the divisor to the per-container fraction's numerator instead of multiplying.
    const addedInstead = `${correctNum + divisor}/${correctDenom}`;
    const distractors = Array.from(new Set([gavePerContainer, addedInstead].filter((d) => d !== totalAnswer)));
    question.options = shuffleOptions(totalAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = `${wholePart} ${Math.max(1, fracNum + randInt(1, 3))}/${denom}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the documented "ignored the whole part"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = `${fracNum}/${denom * divisor}`;
    if (wrongAnswer !== correctAnswer) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${wholePart} ${fracNum}/${denom} ÷ ${divisor} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${wholePart} ${fracNum}/${denom} ÷ ${divisor} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context: { wholePart, fracNum, denom, divisor, improperNum, correctNum, correctDenom, wrongAnswer },
        generatorKey: "fractions_divide_mixed_by_whole",
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

  // ---- word_problem: flour-bag scenario, everyday sharing/portioning
  // framing for fraction division.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mempunyai ${wholePart} ${fracNum}/${denom} kg ${item}. ${item[0].toUpperCase() + item.slice(1)} itu dibahagikan sama rata kepada ${divisor} bekas. Berapa kg ${item} dalam setiap bekas?`,
        en: `${name} has ${wholePart} ${fracNum}/${denom} kg of ${itemsEn[item]}. It is divided equally into ${divisor} containers. How many kg of ${itemsEn[item]} is in each container?`,
      },
      type: "word_problem",
      correctAnswer,
      context: { wholePart, fracNum, denom, divisor, improperNum, correctNum, correctDenom },
      generatorKey: "fractions_divide_mixed_by_whole",
      difficulty: 3,
    };
    const ignoredWholePart = `${fracNum}/${denom * divisor}`;
    const multipliedInstead = `${improperNum * divisor}/${denom}`;
    const distractors = Array.from(new Set([ignoredWholePart, multipliedInstead].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `${wholePart} ${fracNum}/${denom} ÷ ${divisor} = ?`,
      en: `${wholePart} ${fracNum}/${denom} ÷ ${divisor} = ?`,
    },
    type,
    correctAnswer,
    context: { wholePart, fracNum, denom, divisor, improperNum, correctNum, correctDenom },
    generatorKey: "fractions_divide_mixed_by_whole",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to convert to an improper fraction first
    // — dividing only the fractional part's denominator, ignoring the
    // whole-number part entirely.
    const ignoredWholePart = `${fracNum}/${denom * divisor}`;
    // Classic mistake: multiplying instead of dividing.
    const multipliedInstead = `${improperNum * divisor}/${denom}`;
    const distractors = Array.from(
      new Set([ignoredWholePart, multipliedInstead].filter((d) => d !== correctAnswer))
    );
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = `${correctNum}/${correctDenom + randInt(1, 4)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
