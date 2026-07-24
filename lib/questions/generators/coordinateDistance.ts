import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Distance Between Two Coordinates" — restricted to
// horizontal or vertical distance (two points sharing an x or y
// coordinate), matching the real book's own "Horizontal Distance and
// Vertical Distance" sub-topics. Pure arithmetic (absolute difference) —
// doesn't need the CoordinateGridDiagram, unlike the Y5 "reading
// coordinates" topic which is about plotting/reading a single point.
export function generateCoordinateDistance(params: GeneratorParams): GeneratedQuestion {
  const maxCoord = Number(params.maxCoord ?? 12);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const horizontal = Math.random() > 0.5;

  const fixed = randInt(0, maxCoord);
  let coord1 = randInt(0, maxCoord);
  let coord2 = randInt(0, maxCoord);
  while (coord2 === coord1) coord2 = randInt(0, maxCoord);

  const pointA = horizontal ? `(${coord1}, ${fixed})` : `(${fixed}, ${coord1})`;
  const pointB = horizontal ? `(${coord2}, ${fixed})` : `(${fixed}, ${coord2})`;
  const correct = Math.abs(coord1 - coord2);

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
