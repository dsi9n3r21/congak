import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Reading Coordinates" — reads a single marked point off a
// coordinate grid diagram. No reverseProblem: the answer is read directly
// from the diagram (a fixed image), and this app's MCQ/text-option
// architecture has no way to offer several diagram images as answer
// choices — same reasoning as angles_classify.ts for why a categorical/
// diagram-read topic skips the numeric-reverse template.
//
// Retrofitted per the Round 19 content standard: added a real treasure-
// map word_problem framing (same diagram, contextualised prompt) and an
// errorSpotting variant targeting the documented "swapped x and y"
// misconception.
export function generateCoordinates(params: GeneratorParams): GeneratedQuestion {
  const gridSize = Number(params.gridSize ?? 10);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // Keep the point off the axes themselves (0 on either axis reads
  // ambiguously for a first exposure to the concept).
  const x = randInt(1, gridSize - 1);
  const y = randInt(1, gridSize - 1);
  const correct = `(${x}, ${y})`;

  // ---- errorSpotting: shown the documented "swapped x and y" mistake,
  // must give the correct coordinates.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = `(${y}, ${x})`;
    if (wrongAnswer !== correct) {
      return {
        prompt: {
          ms: `${name} membaca koordinat titik pada grid dan menulis ${wrongAnswer}. ${name} silap — dia baca nombor NAIK dahulu, kemudian ATAS PANJANG. Apakah koordinat yang betul?`,
          en: `${name} read the coordinates of the point on the grid and wrote ${wrongAnswer}. ${name} made a mistake — reading the UP number first, then ACROSS. What are the correct coordinates?`,
        },
        type: "mcq",
        correctAnswer: correct,
        context: { x, y, correct, wrongAnswer },
        generatorKey: "coordinates",
        difficulty: 3,
        diagram: { kind: "coordinate_grid", x, y, gridSize },
        options: (() => {
          const offByOneX = `(${x + 1}, ${y})`;
          const opts = Array.from(new Set([correct, wrongAnswer, offByOneX]));
          return shuffleOptions(correct, opts.filter((o) => o !== correct));
        })(),
      };
    }
  }

  // ---- word_problem: treasure-map framing, same diagram and skill,
  // contextualised.
  if (type === "word_problem") {
    const question: GeneratedQuestion = {
      prompt: {
        ms: "Sebuah harta karun ditandakan pada peta grid ini. Apakah koordinatnya?",
        en: "A treasure is marked on this grid map. What are its coordinates?",
      },
      type: "word_problem",
      correctAnswer: correct,
      context: { x, y, correct },
      generatorKey: "coordinates",
      difficulty: 2,
      diagram: { kind: "coordinate_grid", x, y, gridSize },
    };
    const swapped = `(${y}, ${x})`;
    const offByOneX = `(${x + 1}, ${y})`;
    const distractors = Array.from(new Set([swapped, offByOneX])).filter((d) => d !== correct);
    question.options = shuffleOptions(correct, distractors);
    while (question.options.length < 3) {
      const candidate = `(${Math.max(1, x + randInt(-2, 2))}, ${Math.max(1, y + randInt(-2, 2))})`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

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
