import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateAreaTriangle(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 4);
  const max = Number(params.max ?? 16);
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";

  const base = randInt(min, max);
  let height = randInt(3, 12);
  // Keep the answer a whole number — base*height must be even.
  if ((base * height) % 2 !== 0) height += 1;
  const correct = (base * height) / 2;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari luas segi tiga dengan tapak ${base} cm dan tinggi ${height} cm.`,
      en: `Find the area of a triangle with base ${base} cm and height ${height} cm.`,
    },
    type,
    correctAnswer: String(correct),
    context: { base, height, correct },
    generatorKey: "area_triangle",
    difficulty: 2,
    diagram: { kind: "triangle", base, height },
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to halve — treating it like a rectangle.
    const forgotToHalve = base * height;
    // Classic mistake: halving both the base and height (÷4 total) instead
    // of halving the product once.
    const halvedBothDimensions = Math.round((base / 2) * (height / 2));
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(forgotToHalve), String(halvedBothDimensions)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
