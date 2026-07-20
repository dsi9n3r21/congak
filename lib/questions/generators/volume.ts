import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateVolume(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";

  // Work entirely in ml internally, mixing L and ml in the prompt — this is
  // exactly the conversion skill the topic is testing.
  const literA = randInt(1, 3);
  const mlA = randInt(1, 9) * 100; // e.g. 250, 500, 750
  const mlB = randInt(1, 9) * 100;

  const totalMlA = literA * 1000 + mlA;
  const correctMl = totalMlA + mlB;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah botol mengandungi ${literA} L ${mlA} ml air. ${mlB} ml air lagi ditambah. Berapakah jumlah isipadu air, dalam ml?`,
      en: `A bottle contains ${literA} L ${mlA} ml of water. Another ${mlB} ml is added. What is the total volume, in ml?`,
    },
    type,
    correctAnswer: String(correctMl),
    context: { totalMlA, mlB, correctMl },
    generatorKey: "volume",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to convert the litre part to ml before adding.
    const forgotConversion = literA + mlA + mlB;
    // Classic mistake: only adding the ml parts, ignoring the litres entirely.
    const ignoredLiters = mlA + mlB;
    question.options = shuffleOptions(
      String(correctMl),
      [String(forgotConversion), String(ignoredLiters)].filter((d) => d !== String(correctMl))
    );
    while (question.options.length < 3) {
      question.options.push(String(correctMl + randInt(10, 90)));
    }
  }

  return question;
}
