import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const PERIMETER_NAMES = ["Aina", "Ali", "Siti", "Vijay", "Mei Ling", "Hakim"];

// Year 5 KSSR "Perimeters of Composite Shapes" (Space, real ToC p.217).
// Uses the standard L-shape construction: a rectangle with a smaller
// rectangular notch cut from one corner. The key insight this topic
// tests: the perimeter of that L-shape always equals the perimeter of
// the ORIGINAL bounding rectangle — 2 × (overall length + overall
// width) — regardless of the notch's size, because whatever length is
// removed from the two outer sides reappears as the two new inner
// (notch) sides. The notch dimensions are given so the shape reads as
// genuinely composite, but they're a deliberate red herring for the
// calculation itself. Retrofitted per the Round 19 content standard:
// added fill/errorSpotting support and a reverseProblem that finds a
// missing bounding-rectangle dimension given the perimeter.
export function generatePerimeterComposite(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const min = Number(params.min ?? 6);
  const max = Number(params.max ?? 20);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);

  const overallLength = randInt(min, max);
  const overallWidth = randInt(min, max);
  // Notch must fit strictly inside the bounding rectangle.
  const notchLength = randInt(1, Math.max(1, overallLength - 2));
  const notchWidth = randInt(1, Math.max(1, overallWidth - 2));

  const correct = 2 * (overallLength + overallWidth);
  const context = { overallLength, overallWidth, notchLength, notchWidth, correct };

  // ---- challenge (TP6 / non-routine): a rectangular NOTCH cut into the
  // MIDDLE of one side (not a corner) — genuinely DIFFERENT from the
  // base skill's corner-notch case. A corner notch never changes the
  // perimeter, but a middle-of-side notch ADDS 2× its depth (the two new
  // "walls" of the gap). Genuine second hop past the base insight: (1)
  // find the bounding rectangle's perimeter as usual, THEN (2) add on
  // 2× the notch depth — you can't just apply the "notch doesn't matter"
  // rule here, because this notch isn't at a corner.
  if (challenge) {
    const smallerSide = Math.min(overallLength, overallWidth);
    const notchDepth = randInt(1, Math.max(1, Math.floor(smallerSide / 2) - 1));
    const gapWidth = randInt(1, Math.max(1, smallerSide - 2));
    const chCorrect = correct + 2 * notchDepth;
    const name = pick(PERIMETER_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah taman berbentuk segi empat tepat (${overallLength} m × ${overallWidth} m) mempunyai sebuah lorong masuk dipotong ke dalam TENGAH satu sisi — sedalam ${notchDepth} m dan selebar ${gapWidth} m. ${name} ingin mengira perimeter keseluruhan pagar taman itu (termasuk dinding lorong masuk). Berapakah perimeternya?`,
        en: `A rectangular garden (${overallLength} m × ${overallWidth} m) has a walkway gap cut into the MIDDLE of one side — going ${notchDepth} m deep and ${gapWidth} m wide. ${name} wants to find the total perimeter of the garden's fence (including the walkway's walls). What is the perimeter?`,
      },
      type: "word_problem",
      correctAnswer: String(chCorrect),
      context: { overallLength, overallWidth, notchDepth, gapWidth, correct, chCorrect },
      generatorKey: "perimeter_composite",
      difficulty: 3,
    };
    // Classic non-routine mistake: over-applies the "corner notch doesn't
    // change the perimeter" rule to this middle-of-side case, where it
    // doesn't hold.
    const assumedNoChange = correct;
    // Classic mistake: adds the notch's WIDTH instead of its DEPTH.
    const addedWidthInstead = correct + 2 * gapWidth;
    const distractors = Array.from(
      new Set([assumedNoChange, addedWidthInstead].map(String).filter((d) => d !== String(chCorrect)))
    );
    question.options = shuffleOptions(String(chCorrect), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, chCorrect + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the perimeter and one bounding-rectangle
  // dimension (plus the notch, as a red herring), find the other
  // bounding-rectangle dimension.
  if (reverseProblem) {
    const name = pick(PERIMETER_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah taman berbentuk huruf L dibentuk daripada segi empat tepat dengan panjang ${overallLength} m, dengan sebuah petak kecil (${notchLength} m × ${notchWidth} m) dipotong daripada satu penjuru. Jika perimeter taman ${name} ialah ${correct} m, berapakah lebar segi empat tepat asal?`,
        en: `${name}'s L-shaped garden is formed from a rectangle with length ${overallLength} m, with a small rectangle (${notchLength} m × ${notchWidth} m) cut out of one corner. If the garden's perimeter is ${correct} m, what is the width of the original rectangle?`,
      },
      type: "word_problem",
      correctAnswer: String(overallWidth),
      context,
      generatorKey: "perimeter_composite",
      difficulty: 3,
    };
    // Classic mistake: subtracted the notch's own perimeter contribution
    // before solving, throwing off the missing width.
    const notchThrownOff = Math.max(0, overallWidth - notchWidth);
    const distractors = [String(notchThrownOff)].filter((d) => d !== String(overallWidth));
    question.options = shuffleOptions(String(overallWidth), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, overallWidth + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "notch reduces the perimeter"
  // mistake, must give the correct perimeter.
  if (errorSpotting) {
    const subtractedNotch = Math.max(0, correct - 2 * (notchLength + notchWidth));
    if (subtractedNotch !== correct) {
      const name = pick(PERIMETER_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira perimeter taman berbentuk L (segi empat tepat ${overallLength} m × ${overallWidth} m dengan petak ${notchLength} m × ${notchWidth} m dipotong) sebagai ${subtractedNotch} m, kerana dia tolak perimeter petak yang dipotong. Apakah jawapan yang betul?`,
          en: `${name} calculated the L-shaped garden's perimeter (rectangle ${overallLength} m × ${overallWidth} m with a ${notchLength} m × ${notchWidth} m notch cut out) as ${subtractedNotch} m, because they subtracted the notch's own perimeter. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context,
        generatorKey: "perimeter_composite",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(subtractedNotch)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 10) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) > 0) question.options!.push(candidate);
      }
      return question;
    }
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah taman berbentuk huruf L dibentuk daripada segi empat tepat (${overallLength} m × ${overallWidth} m) dengan sebuah petak kecil (${notchLength} m × ${notchWidth} m) dipotong daripada satu penjuru. Cari perimeter taman berbentuk L itu.`,
      en: `An L-shaped garden is formed from a rectangle (${overallLength} m × ${overallWidth} m) with a small rectangle (${notchLength} m × ${notchWidth} m) cut out of one corner. Find the perimeter of the L-shaped garden.`,
    },
    type,
    correctAnswer: String(correct),
    context,
    generatorKey: "perimeter_composite",
    difficulty: 3,
  };

  if (type === "mcq" || type === "word_problem") {
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
