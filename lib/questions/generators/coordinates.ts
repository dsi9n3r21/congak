import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateCoordinates(params: GeneratorParams): GeneratedQuestion {
  const gridSize = Number(params.gridSize ?? 10);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  // Keep the point off the axes themselves (0 on either axis reads
  // ambiguously for a first exposure to the concept).
  const x = randInt(1, gridSize - 1);
  const y = randInt(1, gridSize - 1);
  const correct = `(${x}, ${y})`;

  const question: GeneratedQuestion = {
    prompt: {
      ms: "Apakah koordinat titik yang ditunjukkan pada grid?",
      en: "What are the coordinates of the point shown on the grid?",
    },
    type,
    correctAnswer: correct,
    context: { x, y, correct },
    generatorKey: "coordinates",
    difficulty: 2,
    diagram: { kind: "coordinate_grid", x, y, gridSize },
  };

  if (type === "mcq") {
    // Classic mistake: swapping x and y — reading "up-then-across"
    // instead of "across-then-up".
    const swapped = `(${y}, ${x})`;
    // Classic mistake: off by one on the x-value (miscounting grid lines).
    const offByOneX = `(${x + 1}, ${y})`;
    const distractors = Array.from(new Set([swapped, offByOneX])).filter((d) => d !== correct);
    question.options = shuffleOptions(correct, distractors);
    while (question.options.length < 3) {
      const candidate = `(${Math.max(1, x + randInt(-2, 2))}, ${Math.max(1, y + randInt(-2, 2))})`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
