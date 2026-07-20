import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateAverage(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const count = Number(params.count ?? 4);
  const maxValue = Number(params.maxValue ?? 20);

  // Build values that divide evenly by count, matching the whole-number
  // answers expected at Year 5 level rather than forcing rounding.
  const average = randInt(3, maxValue);
  const values: number[] = [];
  let remaining = average * count;
  for (let i = 0; i < count - 1; i++) {
    const spread = randInt(-Math.min(average - 1, 5), Math.min(average, 5));
    const value = average + spread;
    values.push(value);
    remaining -= value;
  }
  values.push(remaining);

  const sum = values.reduce((a, b) => a + b, 0);
  const correct = sum / count;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari purata bagi ${values.join(", ")}.`,
      en: `Find the average of ${values.join(", ")}.`,
    },
    type,
    correctAnswer: String(correct),
    context: { values: values.join(","), sum, count, correct },
    generatorKey: "average",
    difficulty: count > 4 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: giving the sum instead of dividing by count.
    const forgotDivide = sum;
    // Classic mistake: dividing by the wrong count (off by one item).
    const wrongCount = Math.round(sum / (count - 1));
    question.options = shuffleOptions(
      String(correct),
      [String(forgotDivide), String(wrongCount)].filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      question.options.push(String(correct + randInt(1, 5)));
    }
  }

  return question;
}
