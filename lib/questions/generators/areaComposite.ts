import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const AREA_NAMES = ["Aiman", "Siti", "Hakim", "Mei Ling", "Farah", "Vijay"];

// Year 5 KSSR "Area of Composite Shapes". Retrofitted per the Round 19
// content standard: added a garden word_problem framing, errorSpotting
// (the classic "forgot the second rectangle" mistake), and a
// reverseProblem that finds a missing side length given the total area.
export function generateAreaComposite(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const min = Number(params.min ?? 2);
  const max = Number(params.max ?? 10);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);

  // Composite shape = two rectangles joined together (an L-shape), the
  // KSSR-standard way composite area is introduced before circles/triangles.
  const l1 = randInt(min, max);
  const w1 = randInt(min, max);
  const l2 = randInt(min, max);
  const w2 = randInt(min, max);

  const area1 = l1 * w1;
  const area2 = l2 * w2;
  const correct = area1 + area2;
  const context = { l1, w1, l2, w2, area1, area2, correct };

  // ---- challenge (TP6 / non-routine): a genuinely different composite
  // shape from every other branch here — SUBTRACTION instead of addition.
  // A rectangular pond sits inside a rectangular garden; find the
  // remaining (non-pond) area. Every other branch of this generator
  // teaches "split into rectangles and ADD" — this is the "cut a shape
  // OUT and SUBTRACT" variant, a real non-routine skill KSSR expects
  // alongside the addition case, not a repeat of reverseProblem's
  // missing-side algebra.
  if (challenge) {
    const outerL = randInt(min + 4, max + 6);
    const outerW = randInt(min + 3, max + 5);
    const innerL = randInt(min, Math.max(min, outerL - 2));
    const innerW = randInt(min, Math.max(min, outerW - 2));
    const outerArea = outerL * outerW;
    const innerArea = innerL * innerW;
    const chCorrect = outerArea - innerArea;
    const name = pick(AREA_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mempunyai sebuah taman berbentuk segi empat tepat berukuran ${outerL} m × ${outerW} m. Di tengah taman itu terdapat sebuah kolam ikan segi empat tepat berukuran ${innerL} m × ${innerW} m. Cari luas rumput (bahagian taman yang bukan kolam).`,
        en: `${name} has a rectangular garden measuring ${outerL} m × ${outerW} m. In the middle of the garden is a rectangular fish pond measuring ${innerL} m × ${innerW} m. Find the area of grass (the part of the garden that is not the pond).`,
      },
      type: "word_problem",
      correctAnswer: String(chCorrect),
      context: { outerL, outerW, innerL, innerW, outerArea, innerArea, correct: chCorrect },
      generatorKey: "area_composite",
      difficulty: 3,
    };
    // Classic non-routine mistake: forgets to subtract the pond, gives
    // the whole garden's area.
    const forgotSubtract = String(outerArea);
    // Classic mistake: adds the pond's area instead of subtracting it.
    const addedInstead = String(outerArea + innerArea);
    const distractors = Array.from(new Set([forgotSubtract, addedInstead])).filter((d) => d !== String(chCorrect));
    question.options = shuffleOptions(String(chCorrect), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, chCorrect + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the total area and every dimension except
  // one side of the second rectangle, find that missing side.
  if (reverseProblem) {
    const name = pick(AREA_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membina bentuk gubahan daripada dua segi empat tepat. Segi Empat Tepat A ialah ${l1} cm × ${w1} cm. Segi Empat Tepat B mempunyai panjang ${l2} cm. Jika jumlah luas keseluruhan ialah ${correct} cm², berapakah lebar Segi Empat Tepat B?`,
        en: `${name} builds a composite shape from two rectangles. Rectangle A is ${l1} cm × ${w1} cm. Rectangle B has a length of ${l2} cm. If the total area is ${correct} cm², what is the width of Rectangle B?`,
      },
      type: "word_problem",
      correctAnswer: String(w2),
      context,
      generatorKey: "area_composite",
      difficulty: 3,
    };
    // Classic mistake: subtracted area1 from the total, but forgot to
    // divide by l2 to isolate the missing side.
    const forgotDivide = correct - area1;
    const distractors = [String(forgotDivide)].filter((d) => d !== String(w2));
    question.options = shuffleOptions(String(w2), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, w2 + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot the second rectangle"
  // mistake, must give the correct total area.
  if (errorSpotting && area1 !== correct) {
    const name = pick(AREA_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mengira jumlah luas bentuk gubahan (Segi Empat Tepat A: ${l1} cm × ${w1} cm, Segi Empat Tepat B: ${l2} cm × ${w2} cm) sebagai ${area1} cm². Apakah jawapan yang betul?`,
        en: `${name} calculated the total area of a composite shape (Rectangle A: ${l1} cm × ${w1} cm, Rectangle B: ${l2} cm × ${w2} cm) as ${area1} cm². What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: String(correct),
      context,
      generatorKey: "area_composite",
      difficulty: 3,
      options: shuffleOptions(String(correct), [String(area1)]),
    };
    while (question.options!.length < 3) {
      const candidate = String(correct + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options!.includes(candidate) && Number(candidate) > 0) question.options!.push(candidate);
    }
    return question;
  }

  // ---- word_problem: garden-plot framing.
  if (type === "word_problem") {
    const name = pick(AREA_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mempunyai sebidang tanah berbentuk gubahan, terdiri daripada dua kawasan segi empat tepat: Kawasan A (${l1} m × ${w1} m) dan Kawasan B (${l2} m × ${w2} m). Cari jumlah luas tanah itu.`,
        en: `${name} has an L-shaped plot of land made of two rectangular sections: Section A (${l1} m × ${w1} m) and Section B (${l2} m × ${w2} m). Find the total area of the plot.`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context,
      generatorKey: "area_composite",
      difficulty: 2,
    };
    const onlyFirstRectangle = area1;
    const addedSidesInstead = l1 + w1 + l2 + w2;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(onlyFirstRectangle), String(addedSidesInstead)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah bentuk gubahan terdiri daripada dua segi empat tepat: Segi Empat Tepat A (${l1} cm × ${w1} cm) dan Segi Empat Tepat B (${l2} cm × ${w2} cm). Cari jumlah luas bentuk itu.`,
      en: `A composite shape is made of two rectangles: Rectangle A (${l1} cm × ${w1} cm) and Rectangle B (${l2} cm × ${w2} cm). Find the total area of the shape.`,
    },
    type,
    correctAnswer: String(correct),
    context,
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
