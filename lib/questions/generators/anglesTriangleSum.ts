import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateAnglesTriangleSum(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";

  // Angles in a triangle always sum to 180°. Keep both given angles small
  // enough that the third angle is always a sensible positive value.
  const angleA = randInt(20, 90);
  const angleB = randInt(20, 90);
  const correct = 180 - angleA - angleB;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Dalam sebuah segi tiga, dua daripada sudutnya ialah ${angleA}° dan ${angleB}°. Cari sudut ketiga.`,
      en: `In a triangle, two of the angles are ${angleA}° and ${angleB}°. Find the third angle.`,
    },
    type,
    correctAnswer: String(correct),
    context: { angleA, angleB, correct },
    generatorKey: "angles_triangle_sum",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: confusing the triangle angle sum (180°) with angles
    // at a point (360°).
    const confusedWith360 = 360 - angleA - angleB;
    // Classic mistake: only subtracting one of the two given angles.
    const onlySubtractedOne = 180 - angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(confusedWith360), String(onlySubtractedOne)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
