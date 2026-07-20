import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateAnglesAtPoint(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";

  // Three angles meeting at a point add up to 360°. Keep the third sector
  // (the unknown) comfortably away from 0° and 360° so it always reads as
  // a sensible angle in the diagram.
  let angleA: number, angleB: number, correct: number;
  do {
    angleA = randInt(40, 150);
    angleB = randInt(40, 150);
    correct = 360 - angleA - angleB;
  } while (correct < 30 || correct > 280);

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Tiga sudut bertemu pada satu titik. Dua sudut ialah ${angleA}° dan ${angleB}°. Cari sudut ketiga.`,
      en: `Three angles meet at a point. Two of the angles are ${angleA}° and ${angleB}°. Find the third angle.`,
    },
    type,
    correctAnswer: String(correct),
    context: { angleA, angleB, correct },
    generatorKey: "angles_at_point",
    difficulty: 2,
    diagram: { kind: "point3", angleA, angleB },
  };

  if (type === "mcq") {
    // Classic mistake: confusing "angles at a point" (360°) with the
    // "angles in a triangle" or "on a straight line" rule (180°).
    const confusedWith180 = Math.abs(180 - angleA - angleB);
    // Classic mistake: only subtracting one of the two given angles.
    const onlySubtractedOne = 360 - angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(confusedWith180), String(onlySubtractedOne)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
