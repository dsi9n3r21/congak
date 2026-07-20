import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateAnglesStraightLine(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  // Angles on a straight line add up to 180°. Keep the given angle away
  // from the extremes so the answer is never trivially 0 or 180.
  const angleA = randInt(20, 160);
  const correct = 180 - angleA;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Dua sudut berada pada garis lurus. Satu sudut ialah ${angleA}°. Cari sudut satu lagi.`,
      en: `Two angles lie on a straight line. One angle is ${angleA}°. Find the other angle.`,
    },
    type,
    correctAnswer: String(correct),
    context: { angleA, correct },
    generatorKey: "angles_straight_line",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: confusing "angles on a straight line" (180°) with
    // complementary angles (90°) and subtracting from 90 instead.
    const complementaryConfusion = Math.abs(90 - angleA);
    // Classic mistake: no operation performed — just restating the given angle.
    const noOperation = angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(complementaryConfusion), String(noOperation)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
