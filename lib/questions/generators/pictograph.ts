import { randInt, shuffleOptions, pick } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const LABELS = ["A", "B", "C", "D"];
const UNITS_PER_ICON_OPTIONS = [2, 5, 10];
const PICTOGRAPH_NAMES = ["Aiman", "Iman", "Danish", "Sofea", "Adam", "Farah"];

// Year 4 KSSR "Construct Pictographs and Bar Charts" / "Interpret
// Pictographs and Bar Charts" — verified against the real Y4 textbook ToC
// (Data Handling, p.233-236). Distinct from bar_graph: the real
// pedagogical point here is applying the KEY (each icon = N units), not
// just reading a value straight off — so unlike bar_graph, the actual
// unit count is never shown directly, only icon counts + the key.
//
// Retrofitted per the Round 19 content standard: added word_problem type
// support, errorSpotting (giving the icon count instead of applying the
// key), and a reverseProblem finding how many icons should be drawn
// given the actual total and the key (dividing instead of multiplying).
export function generatePictograph(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const variant = pick(["count", "difference"]);

  const unitsPerIcon = pick(UNITS_PER_ICON_OPTIONS);
  const numCategories = randInt(3, 4);
  const labels = LABELS.slice(0, numCategories);
  const iconCounts = labels.map(() => randInt(1, 8));
  const totals = iconCounts.map((c) => c * unitsPerIcon);

  // ---- challenge (TP6 / non-routine): find the COMBINED total for TWO
  // different sellers. Genuine second hop past the base "count" variant
  // (one seller) and the "difference" variant (subtract, don't add):
  // (1) apply the key to convert EACH seller's icon count to an actual
  // total, THEN (2) add both totals together.
  if (challenge) {
    const [i, j] = [...labels.keys()].sort(() => Math.random() - 0.5).slice(0, 2);
    const combined = totals[i] + totals[j];
    const name = pick(PICTOGRAPH_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Piktograf di bawah menunjukkan buah-buahan yang dijual oleh ${labels.length} orang peniaga. Setiap ikon mewakili ${unitsPerIcon} biji buah. ${name} ingin tahu jumlah buah yang dijual oleh peniaga ${labels[i]} DAN peniaga ${labels[j]} secara bersama-sama. Berapakah jumlahnya?`,
        en: `The pictograph below shows fruit sold by ${labels.length} different sellers. Each icon represents ${unitsPerIcon} fruits. ${name} wants to know the COMBINED total fruit sold by seller ${labels[i]} AND seller ${labels[j]} together. What is that total?`,
      },
      type: "word_problem",
      correctAnswer: String(combined),
      context: { variant: "challenge", unitsPerIcon, i, j, iconCountI: iconCounts[i], iconCountJ: iconCounts[j], totalI: totals[i], totalJ: totals[j], combined },
      generatorKey: "pictograph",
      difficulty: 3,
      diagram: {
        kind: "pictograph",
        segments: labels.map((label, idx) => ({ label, iconCount: iconCounts[idx] })),
        unitsPerIcon,
      },
    };
    // Classic non-routine mistake: sums the ICON COUNTS directly, forgetting
    // to apply the key at all.
    const summedIconsOnly = iconCounts[i] + iconCounts[j];
    // Classic non-routine mistake: stops after converting the first
    // seller, forgets to add the second seller's total.
    const gaveOneSellerOnly = totals[i];
    const distractors = Array.from(
      new Set([summedIconsOnly, gaveOneSellerOnly].map(String).filter((d) => d !== String(combined)))
    );
    question.options = shuffleOptions(String(combined), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, combined + randInt(unitsPerIcon, unitsPerIcon * 3) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the actual total and the key, find how
  // many icons should be drawn — dividing instead of multiplying.
  if (reverseProblem) {
    const targetIndex = randInt(0, labels.length - 1);
    const total = totals[targetIndex];
    const name = pick(PICTOGRAPH_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} menjual ${total} biji buah. Jika setiap ikon dalam piktograf mewakili ${unitsPerIcon} biji buah, berapa banyak ikon yang perlu dilukis untuk ${name}?`,
        en: `${name} sold ${total} fruits. If each icon in the pictograph represents ${unitsPerIcon} fruits, how many icons should be drawn for ${name}?`,
      },
      type: "word_problem",
      correctAnswer: String(iconCounts[targetIndex]),
      context: { variant: "reverse", unitsPerIcon, targetIndex, correct: iconCounts[targetIndex], total },
      generatorKey: "pictograph",
      difficulty: 3,
    };
    // Classic mistake: multiplied instead of dividing (used the total as the icon count's key again).
    const multipliedInstead = total * unitsPerIcon;
    const distractors = [String(multipliedInstead)].filter((d) => d !== String(iconCounts[targetIndex]));
    question.options = shuffleOptions(String(iconCounts[targetIndex]), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, iconCounts[targetIndex] + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)));
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

  // ---- errorSpotting: shown the classic "gave the icon count, forgot
  // the key" mistake (count variant only), must give the correct total.
  if (errorSpotting && variant === "count") {
    const targetIndex = Number(context.targetIndex);
    const iconCountOnly = iconCounts[targetIndex];
    if (iconCountOnly !== correct) {
      const name = pick(PICTOGRAPH_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} kira bilangan buah yang dijual peniaga ${labels[targetIndex]} sebagai ${iconCountOnly} (bilangan ikon sahaja, tanpa guna kunci). Apakah jawapan yang betul?`,
          en: `${name} counted seller ${labels[targetIndex]}'s fruit as ${iconCountOnly} (just the icon count, without applying the key). What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context,
        generatorKey: "pictograph",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(iconCountOnly)]),
        diagram: {
          kind: "pictograph",
          segments: labels.map((label, i) => ({ label, iconCount: iconCounts[i] })),
          unitsPerIcon,
        },
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(unitsPerIcon, unitsPerIcon * 3) * (Math.random() > 0.5 ? 1 : -1));
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
    generatorKey: "pictograph",
    difficulty: 2,
    diagram: {
      kind: "pictograph",
      segments: labels.map((label, i) => ({ label, iconCount: iconCounts[i] })),
      unitsPerIcon,
    },
  };

  if (type === "mcq" || type === "word_problem") {
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
