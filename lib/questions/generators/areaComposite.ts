import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateAreaComposite(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const min = Number(params.min ?? 2);
  const max = Number(params.max ?? 10);

  // Composite shape = two rectangles joined together (an L-shape), the
  // KSSR-standard way composite area is introduced before circles/triangles.
  const l1 = randInt(min, max);
  const w1 = randInt(min, max);
  const l2 = randInt(min, max);
  const w2 = randInt(min, max);

  const area1 = l1 * w1;
  const area2 = l2 * w2;
  const correct = area1 + area2;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah bentuk gubahan terdiri daripada dua segi empat tepat: Segi Empat Tepat A (${l1} cm × ${w1} cm) dan Segi Empat Tepat B (${l2} cm × ${w2} cm). Cari jumlah luas bentuk itu.`,
      en: `A composite shape is made of two rectangles: Rectangle A (${l1} cm × ${w1} cm) and Rectangle B (${l2} cm × ${w2} cm). Find the total area of the shape.`,
    },
    type,
    correctAnswer: String(correct),
    context: { l1, w1, l2, w2, area1, area2, correct },
    generatorKey: "area_composite",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: only calculating one of the two rectangles.
    const onlyFirstRectangle = area1;
    // Classic mistake: adding all four side lengths together instead of
    // multiplying each pair then adding the two areas (confusing this with
    // a perimeter-style calculation).
    const addedSidesInstead = l1 + w1 + l2 + w2;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(onlyFirstRectangle), String(addedSidesInstead)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
