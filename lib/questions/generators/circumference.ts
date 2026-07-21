import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const PI = 3.142; // KSSR convention

export function generateCircumference(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 3);
  const max = Number(params.max ?? 20);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const radius = randInt(min, max);
  const correct = Math.round(2 * radius * PI * 100) / 100;
  const correctStr = correct.toFixed(2);

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari lilitan bulatan dengan jejari ${radius} cm. (Guna π = 3.142)`,
      en: `Find the circumference of a circle with radius ${radius} cm. (Use π = 3.142)`,
    },
    type,
    correctAnswer: correctStr,
    context: { radius, correct },
    generatorKey: "circumference",
    difficulty: 3,
    diagram: { kind: "circle", radius },
  };

  if (type === "mcq") {
    // Classic mistake: using the radius as if it were the diameter —
    // forgetting to double it before multiplying by π.
    const forgotToDouble = Math.round(radius * PI * 100) / 100;
    // Classic mistake: using the area formula (π × r²) instead.
    const confusedWithArea = Math.round(radius * radius * PI * 100) / 100;
    question.options = shuffleOptions(
      correctStr,
      Array.from(new Set([forgotToDouble.toFixed(2), confusedWithArea.toFixed(2)])).filter((d) => d !== correctStr)
    );
    while (question.options.length < 3) {
      const candidate = (correct + randInt(1, 9)).toFixed(2);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
