import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 5 KSSR "Perimeters of Composite Shapes" (Space, real ToC p.217).
// Uses the standard L-shape construction: a rectangle with a smaller
// rectangular notch cut from one corner. The key insight this topic
// tests: the perimeter of that L-shape always equals the perimeter of
// the ORIGINAL bounding rectangle — 2 × (overall length + overall
// width) — regardless of the notch's size, because whatever length is
// removed from the two outer sides reappears as the two new inner
// (notch) sides. The notch dimensions are given so the shape reads as
// genuinely composite, but they're a deliberate red herring for the
// calculation itself.
export function generatePerimeterComposite(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const min = Number(params.min ?? 6);
  const max = Number(params.max ?? 20);

  const overallLength = randInt(min, max);
  const overallWidth = randInt(min, max);
  // Notch must fit strictly inside the bounding rectangle.
  const notchLength = randInt(1, Math.max(1, overallLength - 2));
  const notchWidth = randInt(1, Math.max(1, overallWidth - 2));

  const correct = 2 * (overallLength + overallWidth);

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah taman berbentuk huruf L dibentuk daripada segi empat tepat (${overallLength} m × ${overallWidth} m) dengan sebuah petak kecil (${notchLength} m × ${notchWidth} m) dipotong daripada satu penjuru. Cari perimeter taman berbentuk L itu.`,
      en: `An L-shaped garden is formed from a rectangle (${overallLength} m × ${overallWidth} m) with a small rectangle (${notchLength} m × ${notchWidth} m) cut out of one corner. Find the perimeter of the L-shaped garden.`,
    },
    type,
    correctAnswer: String(correct),
    context: { overallLength, overallWidth, notchLength, notchWidth, correct },
    generatorKey: "perimeter_composite",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: assumed the notch changes the perimeter and
    // subtracted its perimeter from the bounding rectangle's.
    const subtractedNotch = correct - 2 * (notchLength + notchWidth);
    // Classic mistake: found the AREA of the L-shape instead of the perimeter.
    const foundAreaInstead = overallLength * overallWidth - notchLength * notchWidth;
    const distractors = Array.from(
      new Set([String(Math.max(0, subtractedNotch)), String(foundAreaInstead)])
    ).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 10));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
