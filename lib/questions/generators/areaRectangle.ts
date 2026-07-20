import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateAreaRectangle(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 3);
  const max = Number(params.max ?? 15);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const isSquare = Math.random() > 0.6;
  const length = randInt(min, max);
  const width = isSquare ? length : randInt(min, max);
  const correct = length * width;

  const shapeLabel = isSquare
    ? { ms: `sebuah segi empat sama dengan sisi ${length} cm`, en: `a square with side ${length} cm` }
    : { ms: `sebuah segi empat tepat ${length} cm × ${width} cm`, en: `a rectangle ${length} cm × ${width} cm` };

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari luas ${shapeLabel.ms}.`,
      en: `Find the area of ${shapeLabel.en}.`,
    },
    type,
    correctAnswer: String(correct),
    context: { length, width, correct },
    generatorKey: "area_rectangle",
    difficulty: max > 10 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic confusion: computing perimeter instead of area.
    const perimeterConfusion = 2 * (length + width);
    // Classic slip: adding the sides instead of multiplying.
    const addedInstead = length + width;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(perimeterConfusion), String(addedInstead)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
