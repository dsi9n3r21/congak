import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Ratio" — verified against the real Y4 textbook ToC
// (Coordinates, Ratio, and Proportion, p.218). This is the introductory
// skill: express a comparison between two quantities as a ratio a:b.
// Deliberately distinct from Y6's "Simple Ratio" (simplifying a ratio to
// its simplest form) — that's a separate, later skill. Numbers here are
// small enough that simplifying isn't really the point; recognising and
// writing the ratio correctly (in the right order) is.
const CONTEXTS = [
  { ms: ["epal", "oren"], en: ["apples", "oranges"] },
  { ms: ["kucing", "anjing"], en: ["cats", "dogs"] },
  { ms: ["bola merah", "bola biru"], en: ["red balls", "blue balls"] },
  { ms: ["buku", "pensel"], en: ["books", "pencils"] },
  { ms: ["budak lelaki", "budak perempuan"], en: ["boys", "girls"] },
];

export function generateWriteRatio(_params: GeneratorParams): GeneratedQuestion {
  const a = randInt(2, 9);
  let b = randInt(2, 9);
  if (b === a) b = a === 9 ? a - 1 : a + 1;
  const ctx = pick(CONTEXTS);
  const [itemAMs, itemBMs] = ctx.ms;
  const [itemAEn, itemBEn] = ctx.en;

  const correct = `${a}:${b}`;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Terdapat ${a} ${itemAMs} dan ${b} ${itemBMs}. Tuliskan nisbah bilangan ${itemAMs} kepada ${itemBMs}.`,
      en: `There are ${a} ${itemAEn} and ${b} ${itemBEn}. Write the ratio of ${itemAEn} to ${itemBEn}.`,
    },
    type: "mcq",
    correctAnswer: correct,
    context: { a, b, correct },
    generatorKey: "write_ratio",
    difficulty: 1,
  };

  // Classic mistake: writing the ratio in the wrong order (b:a instead of a:b).
  const reversed = `${b}:${a}`;
  // Classic mistake: adding instead of comparing (wrote the total, not a ratio).
  const addedTotal = `${a + b}:1`;
  const distractors = Array.from(new Set([reversed, addedTotal])).filter((d) => d !== correct);
  question.options = shuffleOptions(correct, distractors);
  while (question.options.length < 3) {
    const candidate = `${a + randInt(1, 2)}:${b}`;
    if (!question.options.includes(candidate)) question.options.push(candidate);
  }

  return question;
}
