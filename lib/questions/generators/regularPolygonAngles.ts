import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Draw and Measure Interior Angles of Regular Polygons" —
// verified against the real textbook ToC (Space, p.168-177: Equilateral
// Triangle, Square, Regular Pentagon, Regular Hexagon, Regular Heptagon,
// Regular Octagon). Regular Heptagon is deliberately left out here: its
// interior angle is 900/7 ≈ 128.57°, a non-terminating decimal that
// doesn't make a clean quiz answer, unlike the other five (all whole
// degrees) — the real book covers it as a hands-on measuring exercise,
// which isn't something this format can test anyway.
const POLYGONS = [
  { ms: "Segi Tiga Sama Sisi", en: "Equilateral Triangle", sides: 3 },
  { ms: "Segi Empat Sama", en: "Square", sides: 4 },
  { ms: "Pentagon Sekata", en: "Regular Pentagon", sides: 5 },
  { ms: "Heksagon Sekata", en: "Regular Hexagon", sides: 6 },
  { ms: "Oktagon Sekata", en: "Regular Octagon", sides: 8 },
];

export function generateRegularPolygonAngles(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): a classic tiling problem — TWO
  // different regular polygons are placed together so their edges meet
  // at a common point. Find the remaining GAP angle needed to complete a
  // full turn (360°) around that point. Genuine second hop past the base
  // skill and reverseProblem (both only ever involve ONE polygon): (1)
  // find EACH polygon's interior angle using the formula, THEN (2)
  // subtract both from 360° to find the gap.
  if (challenge) {
    const [shapeA, shapeB] = [...POLYGONS].sort(() => Math.random() - 0.5).slice(0, 2);
    const eachAngleA = ((shapeA.sides - 2) * 180) / shapeA.sides;
    const eachAngleB = ((shapeB.sides - 2) * 180) / shapeB.sides;
    const combinedAngle = eachAngleA + eachAngleB;
    const gapAngle = 360 - combinedAngle;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah ${shapeA.ms} dan sebuah ${shapeB.ms} diletakkan bersebelahan supaya tepi kedua-duanya bertemu pada satu titik yang sama. Berapakah saiz sudut jurang yang tinggal untuk melengkapkan satu pusingan penuh (360°) di sekeliling titik itu?`,
        en: `A ${shapeA.en} and a ${shapeB.en} are placed side by side so their edges meet at the same point. What is the size of the remaining gap angle needed to complete a full turn (360°) around that point?`,
      },
      type: "word_problem",
      correctAnswer: String(gapAngle),
      context: { eachAngleA, eachAngleB, combinedAngle, gapAngle },
      generatorKey: "regular_polygon_angles",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after adding both angles,
    // forgets to subtract from 360° to find the gap.
    const stoppedAtSum = combinedAngle;
    // Classic non-routine mistake: only accounts for ONE of the two
    // polygons, forgetting the second shape entirely.
    const usedOnlyOneShape = 360 - eachAngleA;
    const distractors = Array.from(
      new Set([stoppedAtSum, usedOnlyOneShape].map(String).filter((d) => d !== String(gapAngle)))
    );
    question.options = shuffleOptions(String(gapAngle), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, gapAngle + randInt(5, 20) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the size of each interior angle, find how
  // many sides the polygon has — the genuine reverse of the base skill.
  if (reverseProblem) {
    const shape = pick(POLYGONS);
    const sumAngles = (shape.sides - 2) * 180;
    const eachAngle = sumAngles / shape.sides;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Setiap sudut pedalaman sebuah poligon sekata ialah ${eachAngle}°. Berapakah bilangan sisi poligon itu?`,
        en: `Each interior angle of a regular polygon is ${eachAngle}°. How many sides does the polygon have?`,
      },
      type: "word_problem",
      correctAnswer: String(shape.sides),
      context: { sides: shape.sides, sumAngles, eachAngle },
      generatorKey: "regular_polygon_angles",
      difficulty: 3,
    };
    // Classic mistake: divided 180 by the angle instead of using the full formula.
    const divided180 = Math.round(180 / eachAngle);
    const otherSideCounts = POLYGONS.map((p) => p.sides).filter((s) => s !== shape.sides);
    const distractors = Array.from(new Set([String(divided180), String(pick(otherSideCounts))])).filter(
      (d) => d !== String(shape.sides)
    );
    question.options = shuffleOptions(String(shape.sides), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(3, shape.sides + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const shape = pick(POLYGONS);
  const variant = pick(["each_angle", "sum_angle"] as const);

  const sumAngles = (shape.sides - 2) * 180;
  const eachAngle = sumAngles / shape.sides;
  const correctAnswer = String(variant === "each_angle" ? eachAngle : sumAngles);

  // ---- errorSpotting: shown the documented "forgot to subtract 2"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = variant === "each_angle" ? "180" : String(shape.sides * 180);
    if (wrongAnswer !== correctAnswer) {
      const question: GeneratedQuestion = {
        prompt: {
          ms:
            variant === "each_angle"
              ? `${name} mengira saiz setiap sudut pedalaman bagi ${shape.ms} dan mendapat ${wrongAnswer}°. Apakah jawapan yang betul?`
              : `${name} mengira jumlah sudut pedalaman bagi ${shape.ms} dan mendapat ${wrongAnswer}°. Apakah jawapan yang betul?`,
          en:
            variant === "each_angle"
              ? `${name} calculated the size of each interior angle of a ${shape.en} and got ${wrongAnswer}°. What is the correct answer?`
              : `${name} calculated the sum of interior angles of a ${shape.en} and got ${wrongAnswer}°. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context: { sides: shape.sides, sumAngles, eachAngle, variant, wrongAnswer },
        generatorKey: "regular_polygon_angles",
        difficulty: 3,
        options: shuffleOptions(correctAnswer, [wrongAnswer]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Number(correctAnswer) + randInt(5, 30));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: floor-tile scenario, real-world framing for
  // regular-polygon interior angles.
  if (type === "word_problem") {
    const question: GeneratedQuestion = {
      prompt:
        variant === "each_angle"
          ? {
              ms: `Sebuah jubin lantai berbentuk ${shape.ms}. Berapakah saiz setiap sudut pedalaman jubin itu?`,
              en: `A floor tile is shaped like a ${shape.en}. What is the size of each interior angle of the tile?`,
            }
          : {
              ms: `Sebuah jubin lantai berbentuk ${shape.ms}. Berapakah jumlah semua sudut pedalaman jubin itu?`,
              en: `A floor tile is shaped like a ${shape.en}. What is the sum of all interior angles of the tile?`,
            },
      type: "word_problem",
      correctAnswer,
      context: { sides: shape.sides, sumAngles, eachAngle, variant },
      generatorKey: "regular_polygon_angles",
      difficulty: 3,
    };
    const gaveOther = variant === "each_angle" ? String(sumAngles) : String(eachAngle);
    const forgotMinusTwo = variant === "each_angle" ? "180" : String(shape.sides * 180);
    const unique = Array.from(new Set([gaveOther, forgotMinusTwo])).filter((d) => d !== correctAnswer);
    question.options = shuffleOptions(correctAnswer, unique);
    while (question.options.length < 3) {
      const candidate = String(Number(correctAnswer) + randInt(5, 30));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt:
      variant === "each_angle"
        ? {
            ms: `Berapakah saiz setiap sudut pedalaman bagi ${shape.ms}?`,
            en: `What is the size of each interior angle of a ${shape.en}?`,
          }
        : {
            ms: `Berapakah jumlah semua sudut pedalaman bagi ${shape.ms}?`,
            en: `What is the sum of all interior angles of a ${shape.en}?`,
          },
    type,
    correctAnswer,
    context: { sides: shape.sides, sumAngles, eachAngle, variant },
    generatorKey: "regular_polygon_angles",
    difficulty: 3,
  };

  if (type === "mcq") {
    let distractors: string[];
    if (variant === "each_angle") {
      // Classic mistake: gave the sum instead of dividing by the number of sides.
      const gaveSum = String(sumAngles);
      // Classic mistake: forgot to subtract 2 from the sides count (n × 180 ÷ n = 180 always).
      const forgotMinusTwo = "180";
      distractors = [gaveSum, forgotMinusTwo];
    } else {
      // Classic mistake: gave one angle instead of the sum of all of them.
      const gaveOneAngle = String(eachAngle);
      // Classic mistake: forgot to subtract 2 from the sides count.
      const forgotMinusTwo = String(shape.sides * 180);
      distractors = [gaveOneAngle, forgotMinusTwo];
    }
    const unique = Array.from(new Set(distractors)).filter((d) => d !== question.correctAnswer);
    question.options = shuffleOptions(question.correctAnswer, unique);
    while (question.options.length < 3) {
      const candidate = String(Number(question.correctAnswer) + randInt(5, 30));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
