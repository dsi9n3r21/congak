import { randInt, shuffleOptions, pick } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const LABELS = ["A", "B", "C", "D"];
const PIE_NAMES = ["Aina", "Ali", "Siti", "Vijay", "Mei Ling", "Hakim"];

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

// Year 6 KSSR "Reading Pie Charts". Retrofitted per the Round 19 content
// standard: added word_problem type support, errorSpotting (treating
// every sector as a unit fraction), and a reverseProblem that finds the
// total surveyed given one sector's actual count and its fraction
// (dividing back through the multiplication).
export function generatePieChart(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const variant = pick(["count", "difference"]);

  const set = pick(FRACTION_SETS);
  const multiplier = randInt(2, set.denom === 12 ? 4 : 6);
  const total = set.denom * multiplier;
  const labels = LABELS.slice(0, set.nums.length);
  const counts = set.nums.map((n) => (total * n) / set.denom);
  const challenge = Boolean(params.challenge);

  // ---- challenge (TP6 / non-routine): a genuine two-hop question —
  // find the highest AND lowest sector counts (hop 1), then combine them
  // with an extra operation beyond a plain difference (hop 2: how much
  // MORE than DOUBLE the lowest sector is the highest one) — same shape
  // as bar_graph's challenge, kept consistent across the two categorical-
  // data topics.
  if (challenge) {
    let iHigh = 0;
    let iLow = 0;
    counts.forEach((c, i) => {
      if (c > counts[iHigh]) iHigh = i;
      if (c < counts[iLow]) iLow = i;
    });
    const doubleLow = counts[iLow] * 2;
    const finalDiff = counts[iHigh] - doubleLow;
    if (finalDiff > 0 && iHigh !== iLow) {
      const name = pick(PIE_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Carta pai di bawah menunjukkan pecahan murid yang menggemari ${labels.length} kegiatan berbeza daripada ${total} orang murid yang disoal siasat oleh ${name}. Berapakah lebihnya kumpulan yang PALING RAMAI berbanding DUA KALI kumpulan yang PALING SEDIKIT?`,
          en: `The pie chart below shows the fraction of pupils who like ${labels.length} different activities, out of ${total} pupils ${name} surveyed. How much more is the group with the MOST pupils than DOUBLE the group with the FEWEST?`,
        },
        type: "word_problem",
        correctAnswer: String(finalDiff),
        context: { total, denom: set.denom, iHigh, iLow, highCount: counts[iHigh], lowCount: counts[iLow], doubleLow, finalDiff },
        generatorKey: "pie_chart",
        difficulty: 3,
        diagram: {
          kind: "pie_chart",
          segments: labels.map((label, i) => ({ label, numerator: set.nums[i], denominator: set.denom })),
        },
      };
      // Classic non-routine mistake: stops at the plain difference,
      // forgetting to double the lowest sector first.
      const stoppedAtPlainDifference = String(counts[iHigh] - counts[iLow]);
      // Classic mistake: doubled the lowest sector but forgot the final subtraction.
      const forgotFinalSubtraction = String(doubleLow);
      const distractors = Array.from(
        new Set([stoppedAtPlainDifference, forgotFinalSubtraction].filter((d) => d !== String(finalDiff)))
      );
      question.options = shuffleOptions(String(finalDiff), distractors);
      while (question.options.length < 3) {
        const candidate = String(Math.max(1, finalDiff + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options.includes(candidate)) question.options.push(candidate);
      }
      return question;
    }
    // Fall through to the base case on the rare draw where doubling the
    // lowest sector already exceeds the highest one.
  }

  // ---- reverseProblem: given one sector's actual count and its
  // fraction, find the total surveyed — dividing back.
  if (reverseProblem) {
    const targetIndex = randInt(0, labels.length - 1);
    const sectorCount = counts[targetIndex];
    const name = pick(PIE_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Dalam satu carta pai, kumpulan ${labels[targetIndex]} mewakili ${set.nums[targetIndex]}/${set.denom} daripada jumlah murid yang disoal siasat oleh ${name}. Kumpulan ${labels[targetIndex]} mempunyai ${sectorCount} orang murid. Berapakah jumlah keseluruhan murid yang disoal siasat?`,
        en: `In a pie chart, group ${labels[targetIndex]} represents ${set.nums[targetIndex]}/${set.denom} of the total pupils ${name} surveyed. Group ${labels[targetIndex]} has ${sectorCount} pupils. What is the total number of pupils surveyed?`,
      },
      type: "word_problem",
      correctAnswer: String(total),
      context: { variant: "reverse", total, targetIndex, correct: total, denom: set.denom, sectorCount },
      generatorKey: "pie_chart",
      difficulty: 3,
    };
    // Classic mistake: multiplied instead of dividing back through the fraction.
    const multipliedInstead = sectorCount * set.nums[targetIndex];
    const distractors = [String(multipliedInstead)].filter((d) => d !== String(total));
    question.options = shuffleOptions(String(total), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, total + randInt(1, 5) * set.denom * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

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

  // ---- errorSpotting: shown the classic "treated every sector as a
  // unit fraction" mistake (count variant only), must give the correct count.
  if (errorSpotting && variant === "count") {
    const targetIndex = Number(context.targetIndex);
    const unitFractionOnly = total / set.denom;
    if (unitFractionOnly !== correct) {
      const name = pick(PIE_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira bilangan murid dalam kumpulan ${labels[targetIndex]} (${set.nums[targetIndex]}/${set.denom} daripada ${total} murid) sebagai ${unitFractionOnly} (anggap setiap petak = 1/${set.denom}). Apakah jawapan yang betul?`,
          en: `${name} calculated the number of pupils in group ${labels[targetIndex]} (${set.nums[targetIndex]}/${set.denom} of ${total} pupils) as ${unitFractionOnly} (assuming every slice = 1/${set.denom}). What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context,
        generatorKey: "pie_chart",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(unitFractionOnly)]),
        diagram: {
          kind: "pie_chart",
          segments: labels.map((label, i) => ({ label, numerator: set.nums[i], denominator: set.denom })),
        },
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate) && Number(candidate) > 0) question.options!.push(candidate);
      }
      return question;
    }
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

  if (type === "mcq" || type === "word_problem") {
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
