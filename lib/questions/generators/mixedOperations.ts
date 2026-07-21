import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/**
 * KSSR Y6 "operasi bergabung" (combined operations, no brackets): the
 * student must do multiplication before addition. Pattern is fixed to
 * "a + b × c" so the mistake — doing the operations strictly left to
 * right — is unambiguous to detect and to explain.
 */
export function generateMixedOperations(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10);
  const max = Number(params.max ?? 80);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const a = randInt(min, max);
  const b = randInt(2, 9);
  const c = randInt(min, max);
  const correct = a + b * c;

  const equation = `${a} + ${b} × ${c} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, c, correct },
    generatorKey: "mixed_operations",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: working strictly left to right, i.e. (a + b) × c,
    // instead of doing the multiplication first.
    const leftToRight = (a + b) * c;
    const distractors = Array.from(new Set([String(leftToRight)].filter((d) => d !== String(correct))));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
