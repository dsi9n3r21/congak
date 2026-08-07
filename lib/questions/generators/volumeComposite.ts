import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const VOLUME_NAMES = ["Razak", "Fatimah", "Kumar", "Chong", "Halim", "Zainab"];

// Year 5 KSSR "Volume of Composite Shapes" (Space, real ToC p.217-224).
// Same "two rectangular solids joined together, sum the volumes" pattern
// as area_composite — just one dimension deeper. Retrofitted per the
// Round 19 content standard: added a storage-tank word_problem framing,
// errorSpotting (the classic "treated as area" mistake), and a
// reverseProblem that finds a missing dimension given the total volume.
export function generateVolumeComposite(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const min = Number(params.min ?? 2);
  const max = Number(params.max ?? 8);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const l1 = randInt(min, max);
  const w1 = randInt(min, max);
  const h1 = randInt(min, max);
  const l2 = randInt(min, max);
  const w2 = randInt(min, max);
  const h2 = randInt(min, max);

  const volume1 = l1 * w1 * h1;
  const volume2 = l2 * w2 * h2;
  const correct = volume1 + volume2;
  const context = { l1, w1, h1, l2, w2, h2, volume1, volume2, correct };

  // ---- reverseProblem: given the total volume and every dimension
  // except one side of the second cuboid, find that missing side.
  if (reverseProblem) {
    const name = pick(VOLUME_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membina bentuk gubahan daripada dua kuboid. Kuboid A ialah ${l1} cm × ${w1} cm × ${h1} cm. Kuboid B mempunyai panjang ${l2} cm dan lebar ${w2} cm. Jika jumlah isi padu keseluruhan ialah ${correct} cm³, berapakah tinggi Kuboid B?`,
        en: `${name} builds a composite shape from two cuboids. Cuboid A is ${l1} cm × ${w1} cm × ${h1} cm. Cuboid B has a length of ${l2} cm and width of ${w2} cm. If the total volume is ${correct} cm³, what is the height of Cuboid B?`,
      },
      type: "word_problem",
      correctAnswer: String(h2),
      context,
      generatorKey: "volume_composite",
      difficulty: 3,
    };
    // Classic mistake: subtracted volume1 from the total, but forgot to
    // divide by (l2 × w2) to isolate the missing height.
    const forgotDivide = correct - volume1;
    const distractors = [String(forgotDivide)].filter((d) => d !== String(h2));
    question.options = shuffleOptions(String(h2), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, h2 + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "treated it like area" mistake
  // (only two dimensions per cuboid), must give the correct total volume.
  if (errorSpotting) {
    const treatedAsArea = l1 * w1 + l2 * w2;
    if (treatedAsArea !== correct) {
      const name = pick(VOLUME_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira jumlah isi padu bentuk gubahan (Kuboid A: ${l1}×${w1}×${h1} cm, Kuboid B: ${l2}×${w2}×${h2} cm) sebagai ${treatedAsArea} cm³ (guna hanya dua dimensi setiap kuboid). Apakah jawapan yang betul?`,
          en: `${name} calculated the total volume of a composite shape (Cuboid A: ${l1}×${w1}×${h1} cm, Cuboid B: ${l2}×${w2}×${h2} cm) as ${treatedAsArea} cm³ (using only two dimensions per cuboid). What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context,
        generatorKey: "volume_composite",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(treatedAsArea)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) > 0) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: storage-tank framing.
  if (type === "word_problem") {
    const name = pick(VOLUME_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membina sebuah tangki simpanan berbentuk gubahan daripada dua kuboid: Kuboid A (${l1} cm × ${w1} cm × ${h1} cm) dan Kuboid B (${l2} cm × ${w2} cm × ${h2} cm). Cari jumlah isi padu tangki itu.`,
        en: `${name} builds a storage tank shaped from two cuboids: Cuboid A (${l1} cm × ${w1} cm × ${h1} cm) and Cuboid B (${l2} cm × ${w2} cm × ${h2} cm). Find the total volume of the tank.`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context,
      generatorKey: "volume_composite",
      difficulty: 3,
    };
    const onlyFirstCuboid = volume1;
    const treatedAsArea = l1 * w1 + l2 * w2;
    const distractors = Array.from(
      new Set([String(onlyFirstCuboid), String(treatedAsArea)])
    ).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(5, 40));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah bentuk gubahan terdiri daripada dua kuboid: Kuboid A (${l1} cm × ${w1} cm × ${h1} cm) dan Kuboid B (${l2} cm × ${w2} cm × ${h2} cm). Cari jumlah isi padu bentuk itu.`,
      en: `A composite shape is made of two cuboids: Cuboid A (${l1} cm × ${w1} cm × ${h1} cm) and Cuboid B (${l2} cm × ${w2} cm × ${h2} cm). Find the total volume of the shape.`,
    },
    type,
    correctAnswer: String(correct),
    context,
    generatorKey: "volume_composite",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: only calculated one of the two cuboids.
    const onlyFirstCuboid = volume1;
    // Classic mistake: multiplied only two dimensions per cuboid (treated it like area) then added.
    const treatedAsArea = l1 * w1 + l2 * w2;
    const distractors = Array.from(
      new Set([String(onlyFirstCuboid), String(treatedAsArea)])
    ).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(5, 40));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
