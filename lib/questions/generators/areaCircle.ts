import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const PI = 3.142; // KSSR convention — same as circumference, for consistency

export function generateAreaCircle(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 3);
  const max = Number(params.max ?? 15);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const radius = randInt(min, max);
  const correct = Math.round(radius * radius * PI * 100) / 100;
  const correctStr = correct.toFixed(2);

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari luas bulatan dengan jejari ${radius} cm. (Guna π = 3.142)`,
      en: `Find the area of a circle with radius ${radius} cm. (Use π = 3.142)`,
    },
    type,
    correctAnswer: correctStr,
    context: { radius, correct },
    generatorKey: "area_circle",
    difficulty: 3,
    diagram: { kind: "circle", radius },
  };

  if (type === "mcq") {
    // Classic mistake: using the circumference formula (2 × π × r) instead.
    const confusedWithCircumference = Math.round(2 * radius * PI * 100) / 100;
    // Classic mistake: squaring the diameter instead of the radius —
    // π × (2r)² instead of π × r².
    const squaredDiameterInstead = Math.round(2 * radius * (2 * radius) * PI * 100) / 100;
    question.options = shuffleOptions(
      correctStr,
      Array.from(new Set([confusedWithCircumference.toFixed(2), squaredDiameterInstead.toFixed(2)])).filter((d) => d !== correctStr)
    );
    while (question.options.length < 3) {
      const candidate = (correct + randInt(1, 9)).toFixed(2);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
