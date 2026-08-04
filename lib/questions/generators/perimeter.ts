import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Perimeter of Simple Shapes". Retrofitted per the Round 19
// content standard: added a real land-fencing word_problem (matches this
// topic's explanation text), errorSpotting, and a reverseProblem variant
// that finds one side of a rectangle given the perimeter and the other
// side (dividing back) — always a genuine rectangle, since a square's
// two "sides" are identical and wouldn't make a meaningful reverse
// question.
export function generatePerimeter(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 3);
  const max = Number(params.max ?? 20);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the perimeter and one side of a rectangle,
  // find the other side — dividing back through the perimeter formula.
  if (reverseProblem) {
    const length = randInt(min, max);
    let width = randInt(min, max);
    if (width === length) width = width === max ? width - 1 : width + 1;
    const perimeter = 2 * (length + width);
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebidang tanah berbentuk segi empat tepat mempunyai perimeter ${perimeter} m. Panjangnya ialah ${length} m. Berapakah lebarnya?`,
        en: `A rectangular plot of land has a perimeter of ${perimeter} m. Its length is ${length} m. What is its width?`,
      },
      type: "word_problem",
      correctAnswer: String(width),
      context: { length, width, perimeter },
      generatorKey: "perimeter",
      difficulty: 3,
    };
    // Classic mistake: halved the perimeter and subtracted the length only partway (forgot to halve first).
    const forgotHalve = perimeter - length;
    // Classic mistake: gave the length again instead of solving for the width.
    const gaveLength = length;
    const distractors = Array.from(new Set([String(forgotHalve), String(gaveLength)])).filter((d) => d !== String(width));
    question.options = shuffleOptions(String(width), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, width + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const isSquare = Math.random() > 0.6;
  const length = randInt(min, max);
  const width = isSquare ? length : randInt(min, max);
  const correct = 2 * (length + width);

  const shapeLabel = isSquare
    ? { ms: `sebuah segi empat sama dengan sisi ${length} cm`, en: `a square with side ${length} cm` }
    : { ms: `sebuah segi empat tepat ${length} cm × ${width} cm`, en: `a rectangle ${length} cm × ${width} cm` };

  // ---- errorSpotting: shown the classic "computed area instead of
  // perimeter" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = length * width;
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira perimeter ${shapeLabel.ms} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated the perimeter of ${shapeLabel.en} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { length, width, correct, wrongAnswer },
        generatorKey: "perimeter",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 9));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: land-fencing scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} ingin memagar sebidang tanah berbentuk ${shapeLabel.ms}. Berapa panjang pagar yang diperlukan?`,
        en: `${name} wants to fence a plot of land shaped like ${shapeLabel.en}. How much fencing is needed?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { length, width, correct },
      generatorKey: "perimeter",
      difficulty: max > 12 ? 2 : 1,
    };
    const areaConfusion = length * width;
    const forgotDouble = length + width;
    question.options = shuffleOptions(
      String(correct),
      [String(areaConfusion), String(forgotDouble)].filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari perimeter ${shapeLabel.ms}.`,
      en: `Find the perimeter of ${shapeLabel.en}.`,
    },
    type,
    correctAnswer: String(correct),
    context: { length, width, correct },
    generatorKey: "perimeter",
    difficulty: max > 12 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic confusion: computing area instead of perimeter.
    const areaConfusion = length * width;
    // Classic slip: forgetting to double (l + w) instead of 2(l + w).
    const forgotDouble = length + width;
    question.options = shuffleOptions(
      String(correct),
      [String(areaConfusion), String(forgotDouble)].filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
