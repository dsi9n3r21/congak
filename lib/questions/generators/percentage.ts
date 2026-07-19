import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generatePercentageOfQuantity(params: GeneratorParams): GeneratedQuestion {
  const percentages = (params.percentages as number[]) ?? [10, 20, 25, 50, 75];
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";

  const percent = pick(percentages);
  // Keep the quantity a clean multiple so the answer is a whole number —
  // matches how this is actually taught at Year 6 basic level.
  const multiple = 100 / gcdOf(percent, 100);
  const quantity = multiple * randInt(1, 5);
  const correct = (percent / 100) * quantity;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari ${percent}% daripada ${quantity}.`,
      en: `Find ${percent}% of ${quantity}.`,
    },
    type,
    correctAnswer: String(correct),
    context: { percent, quantity, correct },
    generatorKey: "percentage_of_quantity",
    difficulty: percent === 50 || percent === 25 ? 1 : 2,
  };

  if (type === "mcq") {
    // Classic mistake: using the percent number directly as a multiplier
    // instead of dividing by 100 first (e.g. "25% of 40" answered as 25×40).
    const forgotDivide = percent * quantity;
    // Classic mistake: dividing the quantity by the percent number instead
    // of multiplying by percent/100.
    const invertedOperation = Math.round(quantity / percent);
    question.options = shuffleOptions(
      String(correct),
      [String(forgotDivide), String(invertedOperation)].filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      question.options.push(String(correct + randInt(1, 9)));
    }
  }

  return question;
}

function gcdOf(a: number, b: number): number {
  return b === 0 ? a : gcdOf(b, a % b);
}
