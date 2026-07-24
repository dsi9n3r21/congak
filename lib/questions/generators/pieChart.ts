import { randInt, shuffleOptions, pick } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const LABELS = ["A", "B", "C", "D"];

// Each set of numerators is out of `denom` and always sums to `denom`,
// so every pie chart drawn is a complete, valid whole. `denom` is also
// chosen so a total pupil count divisible by it always gives whole-number
// answers per sector.
const FRACTION_SETS: { denom: number; nums: number[] }[] = [
  { denom: 8, nums: [4, 2, 1, 1] }, // 1/2, 1/4, 1/8, 1/8
  { denom: 6, nums: [2, 2, 1, 1] }, // 1/3, 1/3, 1/6, 1/6
  { denom: 8, nums: [3, 2, 2, 1] }, // 3/8, 1/4, 1/4, 1/8
  { denom: 12, nums: [5, 4, 3] }, // 5/12, 1/3, 1/4
  { denom: 6, nums: [3, 2, 1] }, // 1/2, 1/3, 1/6
];

export function generatePieChart(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const variant = pick(["count", "difference"]);

  const set = pick(FRACTION_SETS);
  const multiplier = randInt(2, set.denom === 12 ? 4 : 6);
  const total = set.denom * multiplier;
  const labels = LABELS.slice(0, set.nums.length);
  const counts = set.nums.map((n) => (total * n) / set.denom);

  let promptMs: string;
  let promptEn: string;
  let correct: number;
  let context: Record<string, number | string>;

  if (variant === "count") {
    const targetIndex = randInt(0, labels.length - 1);
    correct = counts[targetIndex];
    promptMs = `Carta pai di bawah menunjukkan pecahan murid yang menggemari ${labels.length} kegiatan berbeza daripada ${total} orang murid yang disoal siasat. Berapakah bilangan murid yang menggemari kumpulan ${labels[targetIndex]}?`;
    promptEn = `The pie chart below shows the fraction of pupils who like ${labels.length} different activities, out of ${total} pupils surveyed. How many pupils like group ${labels[targetIndex]}?`;
    context = { variant, total, targetIndex, correct, denom: set.denom };
  } else {
    let iHigh = 0;
    let iLow = 0;
    counts.forEach((c, i) => {
      if (c > counts[iHigh]) iHigh = i;
      if (c < counts[iLow]) iLow = i;
    });
    correct = counts[iHigh] - counts[iLow];
    promptMs = `Carta pai di bawah menunjukkan pecahan murid yang menggemari ${labels.length} kegiatan berbeza daripada ${total} orang murid yang disoal siasat. Berapakah beza bilangan murid antara kumpulan ${labels[iHigh]} dan kumpulan ${labels[iLow]}?`;
    promptEn = `The pie chart below shows the fraction of pupils who like ${labels.length} different activities, out of ${total} pupils surveyed. What is the difference in the number of pupils between group ${labels[iHigh]} and group ${labels[iLow]}?`;
    context = { variant, total, iHigh, iLow, correct, denom: set.denom };
  }

  const question: GeneratedQuestion = {
    prompt: { ms: promptMs, en: promptEn },
    type,
    correctAnswer: String(correct),
    context,
    generatorKey: "pie_chart",
    difficulty: 3,
    diagram: {
      kind: "pie_chart",
      segments: labels.map((label, i) => ({ label, numerator: set.nums[i], denominator: set.denom })),
    },
  };

  if (type === "mcq") {
    let distractors: string[];
    if (variant === "count") {
      const targetIndex = Number(context.targetIndex);
      // Classic mistake: read a different sector's fraction by accident.
      const otherIndex = (targetIndex + 1) % labels.length;
      const mixedUpSector = counts[otherIndex];
      // Classic mistake: treated the fraction as a unit fraction (1/denom)
      // regardless of its numerator — a common fraction-of-a-quantity error.
      const unitFractionOnly = total / set.denom;
      distractors = [String(mixedUpSector), String(unitFractionOnly)];
    } else {
      // Classic mistake: gave the count of the larger group only, forgetting to subtract.
      const gaveHighOnly = counts[Number(context.iHigh)];
      // Classic mistake: added the two counts instead of subtracting.
      const addedInstead = counts[Number(context.iHigh)] + counts[Number(context.iLow)];
      distractors = [String(gaveHighOnly), String(addedInstead)];
    }
    const unique = Array.from(new Set(distractors)).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), unique);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
