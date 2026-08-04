import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Area of a Triangle". Retrofitted per the Round 19 content
// standard: the `word_problem` type was already declared in the type
// union but the prompt never actually branched on it (same bare
// instruction either way) AND options were only ever built `if (type
// === "mcq")` — so any word_problem template configured for this topic
// had been rendering with no scenario and no answer choices. Fixed with
// a real cloth-cutting word_problem (matches this topic's explanation
// text), errorSpotting, and a reverseProblem that finds the base given
// the area and the height (dividing back).
export function generateAreaTriangle(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 4);
  const max = Number(params.max ?? 16);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the area and the height, find the base —
  // dividing back through the area formula.
  if (reverseProblem) {
    let height = randInt(3, 12);
    let base = randInt(min, max);
    if ((base * height) % 2 !== 0) height += 1;
    const area = (base * height) / 2;
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sekeping kain segi tiga mempunyai luas ${area} cm² dan tinggi ${height} cm. Berapakah panjang tapaknya?`,
        en: `A triangular piece of cloth has an area of ${area} cm² and a height of ${height} cm. What is the length of its base?`,
      },
      type: "word_problem",
      correctAnswer: String(base),
      context: { base, height, area },
      generatorKey: "area_triangle",
      difficulty: 3,
    };
    // Classic mistake: forgot to double the area back before dividing by the height.
    const forgotToDoubleBack = Math.round(area / height);
    // Classic mistake: gave the height again instead of solving for the base.
    const gaveHeight = height;
    const distractors = Array.from(new Set([String(forgotToDoubleBack), String(gaveHeight)])).filter(
      (d) => d !== String(base)
    );
    question.options = shuffleOptions(String(base), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, base + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const base = randInt(min, max);
  let height = randInt(3, 12);
  // Keep the answer a whole number — base*height must be even.
  if ((base * height) % 2 !== 0) height += 1;
  const correct = (base * height) / 2;

  // ---- errorSpotting: shown the classic "forgot to halve" mistake, must
  // give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = base * height;
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira luas segi tiga dengan tapak ${base} cm dan tinggi ${height} cm, lalu mendapat ${wrongAnswer} cm². Apakah jawapan yang betul?`,
          en: `${name} calculated the area of a triangle with base ${base} cm and height ${height} cm, and got ${wrongAnswer} cm². What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { base, height, correct, wrongAnswer },
        generatorKey: "area_triangle",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
        diagram: { kind: "triangle", base, height },
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 9));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: cloth-cutting scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} hendak memotong sekeping kain berbentuk segi tiga dengan tapak ${base} cm dan tinggi ${height} cm. Berapakah luas kain itu?`,
        en: `${name} wants to cut a triangular piece of cloth with base ${base} cm and height ${height} cm. What is the area of the cloth?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { base, height, correct },
      generatorKey: "area_triangle",
      difficulty: 2,
      diagram: { kind: "triangle", base, height },
    };
    const forgotToHalve = base * height;
    const halvedBothDimensions = Math.round((base / 2) * (height / 2));
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(forgotToHalve), String(halvedBothDimensions)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari luas segi tiga dengan tapak ${base} cm dan tinggi ${height} cm.`,
      en: `Find the area of a triangle with base ${base} cm and height ${height} cm.`,
    },
    type,
    correctAnswer: String(correct),
    context: { base, height, correct },
    generatorKey: "area_triangle",
    difficulty: 2,
    diagram: { kind: "triangle", base, height },
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to halve — treating it like a rectangle.
    const forgotToHalve = base * height;
    // Classic mistake: halving both the base and height (÷4 total) instead
    // of halving the product once.
    const halvedBothDimensions = Math.round((base / 2) * (height / 2));
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(forgotToHalve), String(halvedBothDimensions)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
