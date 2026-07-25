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
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const shape = pick(POLYGONS);
  const variant = pick(["each_angle", "sum_angle"] as const);

  const sumAngles = (shape.sides - 2) * 180;
  const eachAngle = sumAngles / shape.sides;

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
    correctAnswer: String(variant === "each_angle" ? eachAngle : sumAngles),
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
