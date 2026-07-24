import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 5 KSSR "Proportion to Find a Value" — given a ratio (e.g. cats to
// dogs = 2:3) and one known quantity, scale it up to find the other.
export function generateProportion(params: GeneratorParams): GeneratedQuestion {
  const maxScale = Number(params.maxScale ?? 6);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const a = randInt(2, 5);
  let b = randInt(2, 8);
  if (b === a) b += 1;
  const scale = randInt(2, maxScale);
  const knownIsA = Math.random() > 0.5;

  const knownVal = (knownIsA ? a : b) * scale;
  const correct = (knownIsA ? b : a) * scale;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Nisbah kucing kepada anjing di sebuah kedai haiwan ialah ${a}:${b}. Jika terdapat ${knownVal} ekor ${knownIsA ? "kucing" : "anjing"}, berapa ekor ${knownIsA ? "anjing" : "kucing"}?`,
      en: `The ratio of cats to dogs in a pet shop is ${a}:${b}. If there are ${knownVal} ${knownIsA ? "cats" : "dogs"}, how many ${knownIsA ? "dogs" : "cats"} are there?`,
    },
    type,
    correctAnswer: String(correct),
    context: { a, b, scale, knownVal, correct },
    generatorKey: "proportion",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: added the difference between a and b instead of
    // scaling proportionally.
    const addedDifference = knownVal + Math.abs(a - b);
    // Classic mistake: used the wrong ratio side's number as the scale factor.
    const wrongRatioSide = knownIsA ? knownVal * b : knownVal * a;
    const distractors = Array.from(
      new Set([addedDifference, wrongRatioSide].map(String).filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
