import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Area of Rectangles & Squares". Retrofitted per the Round 19
// content standard: added a real land-planting word_problem (matches this
// topic's explanation text), errorSpotting, and a reverseProblem variant
// that finds one side of a rectangle given the area and the other side
// (dividing back) — always a genuine rectangle, since a square's two
// "sides" are identical and wouldn't make a meaningful reverse question.
export function generateAreaRectangle(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 3);
  const max = Number(params.max ?? 15);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): the area feeds into a real cost
  // calculation — find the grass-planting area (this topic's own skill),
  // then multiply by a cost-per-square-metre rate. Natural distractor:
  // stops at the area itself, forgetting to price it.
  if (challenge) {
    const isSquareC = Math.random() > 0.6;
    const lengthC = randInt(min, max);
    const widthC = isSquareC ? lengthC : randInt(min, max);
    const areaC = lengthC * widthC;
    const ratePerSqm = randInt(2, 10);
    const totalCost = areaC * ratePerSqm;
    const name = pick(names);
    const shapeLabelC = isSquareC
      ? { ms: `sebuah segi empat sama dengan sisi ${lengthC} m`, en: `a square with side ${lengthC} m` }
      : { ms: `sebuah segi empat tepat ${lengthC} m × ${widthC} m`, en: `a rectangle ${lengthC} m × ${widthC} m` };
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} ingin menanam rumput pada sebidang tanah berbentuk ${shapeLabelC.ms}. Kos rumput ialah RM${ratePerSqm} setiap meter persegi. Berapakah jumlah kos rumput itu?`,
        en: `${name} wants to plant grass on a plot of land shaped like ${shapeLabelC.en}. Grass costs RM${ratePerSqm} per square metre. What is the total cost of the grass?`,
      },
      type: "word_problem",
      correctAnswer: `RM${totalCost}`,
      context: { length: lengthC, width: widthC, area: areaC, ratePerSqm, totalCost },
      generatorKey: "area_rectangle",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after finding the area,
    // forgetting to multiply by the cost rate.
    const stoppedAtArea = `RM${areaC}`;
    const distractors = [stoppedAtArea].filter((d) => d !== `RM${totalCost}`);
    question.options = shuffleOptions(`RM${totalCost}`, distractors);
    while (question.options.length < 3) {
      const candidate = `RM${Math.max(1, totalCost + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1))}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the area and one side of a rectangle, find
  // the other side — dividing back through the area formula.
  if (reverseProblem) {
    const length = randInt(min, max);
    let width = randInt(min, max);
    if (width === length) width = width === max ? width - 1 : width + 1;
    const area = length * width;
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebidang tanah berbentuk segi empat tepat mempunyai luas ${area} cm². Panjangnya ialah ${length} cm. Berapakah lebarnya?`,
        en: `A rectangular plot of land has an area of ${area} cm². Its length is ${length} cm. What is its width?`,
      },
      type: "word_problem",
      correctAnswer: String(width),
      context: { length, width, area },
      generatorKey: "area_rectangle",
      difficulty: 3,
    };
    // Classic mistake: subtracted the length from the area instead of dividing.
    const subtractedInstead = Math.max(1, area - length);
    // Classic mistake: gave the length again instead of solving for the width.
    const gaveLength = length;
    const distractors = Array.from(new Set([String(subtractedInstead), String(gaveLength)])).filter(
      (d) => d !== String(width)
    );
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
  const correct = length * width;

  const shapeLabel = isSquare
    ? { ms: `sebuah segi empat sama dengan sisi ${length} cm`, en: `a square with side ${length} cm` }
    : { ms: `sebuah segi empat tepat ${length} cm × ${width} cm`, en: `a rectangle ${length} cm × ${width} cm` };

  // ---- errorSpotting: shown the classic "computed perimeter instead of
  // area" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = 2 * (length + width);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira luas ${shapeLabel.ms} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated the area of ${shapeLabel.en} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { length, width, correct, wrongAnswer },
        generatorKey: "area_rectangle",
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

  // ---- word_problem: land-planting scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} ingin menanam rumput pada sebidang tanah berbentuk ${shapeLabel.ms}. Berapakah luas tanah itu?`,
        en: `${name} wants to plant grass on a plot of land shaped like ${shapeLabel.en}. What is the area of the land?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { length, width, correct },
      generatorKey: "area_rectangle",
      difficulty: max > 10 ? 2 : 1,
    };
    const perimeterConfusion = 2 * (length + width);
    const addedInstead = length + width;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(perimeterConfusion), String(addedInstead)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari luas ${shapeLabel.ms}.`,
      en: `Find the area of ${shapeLabel.en}.`,
    },
    type,
    correctAnswer: String(correct),
    context: { length, width, correct },
    generatorKey: "area_rectangle",
    difficulty: max > 10 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic confusion: computing perimeter instead of area.
    const perimeterConfusion = 2 * (length + width);
    // Classic slip: adding the sides instead of multiplying.
    const addedInstead = length + width;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(perimeterConfusion), String(addedInstead)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
