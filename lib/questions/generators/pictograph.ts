import { randInt, shuffleOptions, pick } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const LABELS = ["A", "B", "C", "D"];
const UNITS_PER_ICON_OPTIONS = [2, 5, 10];

// Year 4 KSSR "Construct Pictographs and Bar Charts" / "Interpret
// Pictographs and Bar Charts" — verified against the real Y4 textbook ToC
// (Data Handling, p.233-236). Distinct from bar_graph: the real
// pedagogical point here is applying the KEY (each icon = N units), not
// just reading a value straight off — so unlike bar_graph, the actual
// unit count is never shown directly, only icon counts + the key.
export function generatePictograph(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const variant = pick(["count", "difference"]);

  const unitsPerIcon = pick(UNITS_PER_ICON_OPTIONS);
  const numCategories = randInt(3, 4);
  const labels = LABELS.slice(0, numCategories);
  const iconCounts = labels.map(() => randInt(1, 8));
  const totals = iconCounts.map((c) => c * unitsPerIcon);

  let promptMs: string;
  let promptEn: string;
  let correct: number;
  let context: Record<string, number | string>;

  if (variant === "count") {
    const targetIndex = randInt(0, labels.length - 1);
    correct = totals[targetIndex];
    promptMs = `Piktograf di bawah menunjukkan buah-buahan yang dijual oleh ${labels.length} orang peniaga. Setiap ikon mewakili ${unitsPerIcon} biji buah. Berapakah bilangan buah yang dijual oleh peniaga ${labels[targetIndex]}?`;
    promptEn = `The pictograph below shows fruit sold by ${labels.length} different sellers. Each icon represents ${unitsPerIcon} fruits. How many fruits did seller ${labels[targetIndex]} sell?`;
    context = { variant, unitsPerIcon, targetIndex, correct };
  } else {
    let iHigh = 0;
    let iLow = 0;
    totals.forEach((t, i) => {
      if (t > totals[iHigh]) iHigh = i;
      if (t < totals[iLow]) iLow = i;
    });
    correct = totals[iHigh] - totals[iLow];
    promptMs = `Piktograf di bawah menunjukkan buah-buahan yang dijual oleh ${labels.length} orang peniaga. Setiap ikon mewakili ${unitsPerIcon} biji buah. Berapakah beza bilangan buah antara peniaga ${labels[iHigh]} dan peniaga ${labels[iLow]}?`;
    promptEn = `The pictograph below shows fruit sold by ${labels.length} different sellers. Each icon represents ${unitsPerIcon} fruits. What is the difference in fruits sold between seller ${labels[iHigh]} and seller ${labels[iLow]}?`;
    context = { variant, unitsPerIcon, iHigh, iLow, correct };
  }

  const question: GeneratedQuestion = {
    prompt: { ms: promptMs, en: promptEn },
    type,
    correctAnswer: String(correct),
    context,
    generatorKey: "pictograph",
    difficulty: 2,
    diagram: {
      kind: "pictograph",
      segments: labels.map((label, i) => ({ label, iconCount: iconCounts[i] })),
      unitsPerIcon,
    },
  };

  if (type === "mcq") {
    let distractors: string[];
    if (variant === "count") {
      const targetIndex = Number(context.targetIndex);
      // Classic mistake: gave the ICON COUNT itself, forgetting to apply the key.
      const iconCountOnly = iconCounts[targetIndex];
      // Classic mistake: read a different seller's icon row by accident.
      const otherIndex = (targetIndex + 1) % labels.length;
      const mixedUpRow = totals[otherIndex];
      distractors = [String(iconCountOnly), String(mixedUpRow)];
    } else {
      // Classic mistake: gave the larger seller's total only, forgetting to subtract.
      const gaveHighOnly = totals[Number(context.iHigh)];
      // Classic mistake: subtracted ICON COUNTS instead of applying the key first.
      const iconDiffOnly = iconCounts[Number(context.iHigh)] - iconCounts[Number(context.iLow)];
      distractors = [String(gaveHighOnly), String(iconDiffOnly)];
    }
    const unique = Array.from(new Set(distractors)).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), unique);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(unitsPerIcon, unitsPerIcon * 3));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
