import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generatePerimeter(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 3);
  const max = Number(params.max ?? 20);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const isSquare = Math.random() > 0.6;
  const length = randInt(min, max);
  const width = isSquare ? length : randInt(min, max);
  const correct = 2 * (length + width);

  const shapeLabel = isSquare
    ? { ms: `sebuah segi empat sama dengan sisi ${length} cm`, en: `a square with side ${length} cm` }
    : { ms: `sebuah segi empat tepat ${length} cm × ${width} cm`, en: `a rectangle ${length} cm × ${width} cm` };

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari perimeter ${shapeLabel.ms}.`,
      en: `Find the perimeter of ${shapeLabel.en}.`,
    },
    type,
    correctAnswer: String(correct),
    context: { length, width, correct },
    generatorKey: "perimeter",
    difficulty: max > 12 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic confusion: computing area instead of perimeter.
    const areaConfusion = length * width;
    // Classic slip: forgetting to double (l + w) instead of 2(l + w).
    const forgotDouble = length + width;
    question.options = shuffleOptions(
      String(correct),
      [String(areaConfusion), String(forgotDouble)].filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      question.options.push(String(correct + randInt(1, 9)));
    }
  }

  return question;
}
