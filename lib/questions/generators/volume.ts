import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Volume of Liquid" — L/ml conversion and addition/subtraction.
// Retrofitted per the Round 19 content standard: was addition-only, one
// context (water bottle), no errorSpotting/reverseProblem, and
// word_problem-typed questions never got MCQ-style options at all. Added
// a subtraction op, context variety (water bottle, jus, science beaker),
// errorSpotting, and reverseProblem (given the final total and one part,
// find the missing part).
const CONTEXTS = [
  { container: "botol", liquid: "air", containerEn: "bottle", liquidEn: "water" },
  { container: "balang", liquid: "jus", containerEn: "jug", liquidEn: "juice" },
  { container: "bikar", liquid: "cecair", containerEn: "beaker", liquidEn: "liquid" },
] as const;

const NAMES = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

export function generateVolume(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const op = pick(["add", "subtract"] as const);
  const ctx = pick(CONTEXTS);
  const name = pick(NAMES);

  const literA = randInt(1, 3);
  const mlA = randInt(1, 9) * 100;
  const mlB = randInt(1, 9) * 100;
  const totalMlA = literA * 1000 + mlA;
  const correctMl = op === "add" ? totalMlA + mlB : totalMlA - mlB;

  // ---- challenge (TP6 / non-routine): a SECOND event happens after the
  // first — some is poured out after more was poured in (or vice versa) —
  // asking for the final volume after BOTH events, not just the first.
  if (challenge) {
    const afterFirst = totalMlA + mlB; // always pour IN first, so it's always a valid subtract afterward
    const mlC = randInt(1, Math.min(9, Math.floor(afterFirst / 100) - 1)) * 100;
    const finalMl = afterFirst - mlC;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah ${ctx.container} mengandungi ${literA} L ${mlA} ml ${ctx.liquid}. ${mlB} ml ${ctx.liquid} lagi ditambah. Kemudian, ${mlC} ml ${ctx.liquid} dituang keluar. Berapakah baki isipadu ${ctx.liquid} sekarang, dalam ml?`,
        en: `A ${ctx.containerEn} contains ${literA} L ${mlA} ml of ${ctx.liquidEn}. Another ${mlB} ml is added. Then, ${mlC} ml is poured out. What is the remaining volume of ${ctx.liquidEn} now, in ml?`,
      },
      type: "word_problem",
      correctAnswer: String(finalMl),
      context: { totalMlA, mlB, mlC, afterFirst, finalMl },
      generatorKey: "volume",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after the pour-in, forgetting the
    // subsequent pour-out.
    const stoppedAfterPourIn = String(afterFirst);
    const distractors = [stoppedAfterPourIn].filter((d) => d !== String(finalMl));
    question.options = shuffleOptions(String(finalMl), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, finalMl + randInt(10, 90) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the final total and one part, find the
  // missing part (subtraction, framed as a missing volume).
  if (reverseProblem) {
    const finalMl = totalMlA + mlB;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${ctx.container} ${name} mengandungi ${literA} L ${mlA} ml ${ctx.liquid}. Selepas menambah lagi sedikit ${ctx.liquid}, jumlahnya menjadi ${finalMl} ml. Berapakah isipadu ${ctx.liquid} yang ditambah?`,
        en: `${name}'s ${ctx.containerEn} contains ${literA} L ${mlA} ml of ${ctx.liquidEn}. After adding more ${ctx.liquidEn}, the total becomes ${finalMl} ml. How much ${ctx.liquidEn} was added?`,
      },
      type: "word_problem",
      correctAnswer: String(mlB),
      context: { totalMlA, mlB, finalMl },
      generatorKey: "volume",
      difficulty: 3,
    };
    const addedInstead = finalMl + totalMlA;
    const gaveTotal = finalMl;
    const distractors = Array.from(new Set([addedInstead, gaveTotal])).filter((d) => d !== mlB).map(String);
    question.options = shuffleOptions(String(mlB), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, mlB + randInt(10, 90) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot to convert litres"
  // mistake, must give the correct total.
  if (errorSpotting) {
    const wrongAnswer = literA + mlA + mlB;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mengira isipadu ${ctx.container} yang mengandungi ${literA} L ${mlA} ml ${ctx.liquid} ditambah ${mlB} ml lagi, dan mendapat ${wrongAnswer} ml. Apakah jawapan yang betul?`,
        en: `${name} calculated the volume of a ${ctx.containerEn} with ${literA} L ${mlA} ml of ${ctx.liquidEn} plus another ${mlB} ml, and got ${wrongAnswer} ml. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: String(totalMlA + mlB),
      context: { totalMlA, mlB, correctMl: totalMlA + mlB, wrongAnswer },
      generatorKey: "volume",
      difficulty: 3,
      options: shuffleOptions(String(totalMlA + mlB), [String(wrongAnswer)].filter((d) => d !== String(totalMlA + mlB))),
    };
    while (question.options!.length < 3) {
      const candidate = String(Math.max(0, totalMlA + mlB + randInt(10, 90) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options!.includes(candidate)) question.options!.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt:
      op === "add"
        ? {
            ms: `Sebuah ${ctx.container} mengandungi ${literA} L ${mlA} ml ${ctx.liquid}. ${mlB} ml ${ctx.liquid} lagi ditambah. Berapakah jumlah isipadu ${ctx.liquid}, dalam ml?`,
            en: `A ${ctx.containerEn} contains ${literA} L ${mlA} ml of ${ctx.liquidEn}. Another ${mlB} ml is added. What is the total volume, in ml?`,
          }
        : {
            ms: `Sebuah ${ctx.container} mengandungi ${literA} L ${mlA} ml ${ctx.liquid}. ${mlB} ml ${ctx.liquid} dituang keluar. Berapakah baki isipadu ${ctx.liquid}, dalam ml?`,
            en: `A ${ctx.containerEn} contains ${literA} L ${mlA} ml of ${ctx.liquidEn}. ${mlB} ml is poured out. What is the remaining volume, in ml?`,
          },
    type,
    correctAnswer: String(correctMl),
    context: { totalMlA, mlB, correctMl, op },
    generatorKey: "volume",
    difficulty: 2,
  };

  if (question.type === "mcq" || question.type === "word_problem") {
    // Classic mistake: forgetting to convert the litre part to ml before adding.
    const forgotConversion = op === "add" ? literA + mlA + mlB : Math.abs(literA + mlA - mlB);
    // Classic mistake: only adding/subtracting the ml parts, ignoring the litres entirely.
    const ignoredLiters = op === "add" ? mlA + mlB : Math.abs(mlA - mlB);
    const distractors = Array.from(
      new Set([String(forgotConversion), String(ignoredLiters)].filter((d) => d !== String(correctMl)))
    );
    question.options = shuffleOptions(String(correctMl), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correctMl + randInt(10, 90) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
