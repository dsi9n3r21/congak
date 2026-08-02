import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Distance Between Two Coordinates" — restricted to
// horizontal or vertical distance (two points sharing an x or y
// coordinate), matching the real book's own "Horizontal Distance and
// Vertical Distance" sub-topics. Pure arithmetic (absolute difference) —
// doesn't need the CoordinateGridDiagram, unlike the Y5 "reading
// coordinates" topic which is about plotting/reading a single point.
//
// Retrofitted per the Round 19 content standard: added a real streetlamp
// word_problem, errorSpotting (the documented "added instead of
// subtracted" mistake), and a reverseProblem variant that finds point B's
// coordinates given point A, the shared axis, and the distance between
// them (constrained so B is further from the origin, keeping the answer
// unambiguous).
export function generateCoordinateDistance(params: GeneratorParams): GeneratedQuestion {
  const maxCoord = Number(params.maxCoord ?? 12);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given point A, the shared axis, and the distance
  // to point B, find B's coordinates (B constrained to be further from
  // the origin, so the answer is unambiguous).
  if (reverseProblem) {
    const horizontal = Math.random() > 0.5;
    const fixed = randInt(0, maxCoord);
    const coord1 = randInt(0, Math.max(0, maxCoord - 3));
    const distance = randInt(1, Math.max(1, maxCoord - coord1));
    const coord2 = coord1 + distance;
    const pointA = horizontal ? `(${coord1}, ${fixed})` : `(${fixed}, ${coord1})`;
    const correctPointB = horizontal ? `(${coord2}, ${fixed})` : `(${fixed}, ${coord2})`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Titik A ialah ${pointA}. Titik B berkongsi nilai ${horizontal ? "y" : "x"} yang sama dengan A, dan jaraknya daripada A ialah ${distance}. Titik B lebih jauh daripada asalan (0, 0) berbanding A. Apakah koordinat titik B?`,
        en: `Point A is at ${pointA}. Point B shares the same ${horizontal ? "y" : "x"}-value as A, and is a distance of ${distance} from A. Point B is further from the origin (0, 0) than A. What are point B's coordinates?`,
      },
      type: "word_problem",
      correctAnswer: correctPointB,
      context: { coord1, coord2, fixed, distance, horizontal: horizontal ? "yes" : "no" },
      generatorKey: "coordinate_distance",
      difficulty: 3,
    };
    // Classic mistake: subtracted instead of added, placing B closer to the origin.
    const closerToOrigin = horizontal
      ? `(${Math.max(0, coord1 - distance)}, ${fixed})`
      : `(${fixed}, ${Math.max(0, coord1 - distance)})`;
    // Classic mistake: put the distance on the wrong axis.
    const wrongAxis = horizontal ? `(${coord1}, ${fixed + distance})` : `(${fixed + distance}, ${coord1})`;
    const distractors = Array.from(new Set([closerToOrigin, wrongAxis].filter((d) => d !== correctPointB)));
    question.options = shuffleOptions(correctPointB, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(1, 4);
      const candidate = horizontal ? `(${coord2 + bump}, ${fixed})` : `(${fixed}, ${coord2 + bump})`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const horizontal = Math.random() > 0.5;
  const fixed = randInt(0, maxCoord);
  let coord1 = randInt(0, maxCoord);
  let coord2 = randInt(0, maxCoord);
  while (coord2 === coord1) coord2 = randInt(0, maxCoord);

  const pointA = horizontal ? `(${coord1}, ${fixed})` : `(${fixed}, ${coord1})`;
  const pointB = horizontal ? `(${coord2}, ${fixed})` : `(${fixed}, ${coord2})`;
  const correct = Math.abs(coord1 - coord2);

  // ---- errorSpotting: shown the documented "added instead of subtracted"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = coord1 + coord2;
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Titik A ialah ${pointA} dan titik B ialah ${pointB}. ${name} mengira jarak antara A dan B dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `Point A is at ${pointA} and point B is at ${pointB}. ${name} calculated the distance between A and B and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { coord1, coord2, fixed, correct, horizontal: horizontal ? "yes" : "no", wrongAnswer },
        generatorKey: "coordinate_distance",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(0, correct + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: streetlamps-on-the-same-street scenario, real-world
  // framing for horizontal/vertical coordinate distance.
  if (type === "word_problem") {
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Dua tiang lampu terletak pada ${horizontal ? "jalan" : "lorong"} yang sama. Tiang lampu A ialah ${pointA} dan tiang lampu B ialah ${pointB}. Berapakah jarak antara kedua-dua tiang lampu itu?`,
        en: `Two streetlamps are on the same ${horizontal ? "street" : "lane"}. Streetlamp A is at ${pointA} and streetlamp B is at ${pointB}. What is the distance between the two streetlamps?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { coord1, coord2, fixed, correct, horizontal: horizontal ? "yes" : "no" },
      generatorKey: "coordinate_distance",
      difficulty: 2,
    };
    const addedInstead = coord1 + coord2;
    const distractors = Array.from(new Set([String(addedInstead)].filter((d) => d !== String(correct))));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Titik A ialah ${pointA} dan titik B ialah ${pointB}. Berapakah jarak antara A dan B?`,
      en: `Point A is at ${pointA} and point B is at ${pointB}. What is the distance between A and B?`,
    },
    type,
    correctAnswer: String(correct),
    context: { coord1, coord2, fixed, correct, horizontal: horizontal ? "yes" : "no" },
    generatorKey: "coordinate_distance",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: added the two coordinates instead of finding the
    // difference.
    const addedInstead = coord1 + coord2;
    const distractors = Array.from(new Set([String(addedInstead)].filter((d) => d !== String(correct))));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
