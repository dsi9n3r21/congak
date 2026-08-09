import { randInt, shuffleOptions, pick } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const LABELS = ["A", "B", "C", "D"];
const BAR_NAMES = ["Aina", "Ali", "Siti", "Vijay", "Mei Ling", "Hakim"];

// Year 5 KSSR "Reading Bar Graphs". Retrofitted per the Round 19
// content standard: added word_problem type support, errorSpotting
// (forgetting one bar when summing), and a reverseProblem that finds a
// missing bar's value given the total and the other three bars.
export function generateBarGraph(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 5);
  const max = Number(params.max ?? 32);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const variant = pick(["total", "difference"]);

  const values = LABELS.map(() => randInt(min, max));
  const challenge = Boolean(params.challenge);

  // ---- challenge (TP6 / non-routine): a genuine two-hop question — find
  // the highest AND lowest bars (hop 1), then combine them with an extra
  // operation beyond a plain difference (hop 2: how much MORE than DOUBLE
  // the lowest bar is the highest one). Genuinely dependent — hop 2 needs
  // both bars identified in hop 1, and adds a real second step beyond the
  // existing "difference" variant above.
  if (challenge) {
    let iHigh = 0;
    let iLow = 0;
    values.forEach((v, i) => {
      if (v > values[iHigh]) iHigh = i;
      if (v < values[iLow]) iLow = i;
    });
    const doubleLow = values[iLow] * 2;
    const finalDiff = values[iHigh] - doubleLow;
    if (finalDiff > 0) {
      const name = pick(BAR_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengumpul data bagi 4 kumpulan: ${LABELS.map((l, i) => `${l}=${values[i]}`).join(", ")}. Berapakah lebihnya kumpulan yang PALING BANYAK berbanding DUA KALI kumpulan yang PALING SEDIKIT?`,
          en: `${name} collects data for 4 groups: ${LABELS.map((l, i) => `${l}=${values[i]}`).join(", ")}. How much more is the HIGHEST group than DOUBLE the LOWEST group?`,
        },
        type: "word_problem",
        correctAnswer: String(finalDiff),
        context: { v0: values[0], v1: values[1], v2: values[2], v3: values[3], iHigh, iLow, doubleLow, finalDiff },
        generatorKey: "bar_graph",
        difficulty: 3,
      };
      // Classic non-routine mistake: stops after finding the plain
      // difference (forgetting to double the lowest bar first).
      const stoppedAtPlainDifference = String(values[iHigh] - values[iLow]);
      // Classic mistake: doubled the lowest bar but forgot the final subtraction.
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
    // lowest bar already exceeds the highest one.
  }

  // ---- reverseProblem: given the total and three of the four bars,
  // find the missing bar's value.
  if (reverseProblem) {
    const missingIndex = randInt(0, 3);
    const total = values.reduce((sum, v) => sum + v, 0);
    const knownValues = values.filter((_, i) => i !== missingIndex);
    const missingValue = values[missingIndex];
    const name = pick(BAR_NAMES);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mengumpul data bagi 4 kumpulan. Kumpulan ${LABELS.filter((_, i) => i !== missingIndex).join(", ")} masing-masing ialah ${knownValues.join(", ")}. Jika jumlah keseluruhan 4 kumpulan ialah ${total}, berapakah nilai kumpulan ${LABELS[missingIndex]}?`,
        en: `${name} collects data for 4 groups. Groups ${LABELS.filter((_, i) => i !== missingIndex).join(", ")} are ${knownValues.join(", ")} respectively. If the total of all 4 groups is ${total}, what is group ${LABELS[missingIndex]}'s value?`,
      },
      type: "word_problem",
      correctAnswer: String(missingValue),
      context: { v0: values[0], v1: values[1], v2: values[2], v3: values[3], missingIndex, total, correct: missingValue },
      generatorKey: "bar_graph",
      difficulty: 3,
    };
    // Classic mistake: added the total to the known sum instead of subtracting.
    const addedInstead = total + knownValues.reduce((s, v) => s + v, 0);
    const distractors = [String(addedInstead)].filter((d) => d !== String(missingValue));
    question.options = shuffleOptions(String(missingValue), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, missingValue + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  let promptMs: string;
  let promptEn: string;
  let correct: number;
  let context: Record<string, number | string>;

  if (variant === "total") {
    correct = values.reduce((sum, v) => sum + v, 0);
    promptMs = "Graf palang di bawah menunjukkan data bagi 4 kumpulan. Cari JUMLAH KESELURUHAN bagi kesemua kumpulan.";
    promptEn = "The bar graph below shows data for 4 groups. Find the TOTAL of all the groups combined.";
    context = { variant, v0: values[0], v1: values[1], v2: values[2], v3: values[3], correct };
  } else {
    // Difference between the two labels with the largest gap, so the
    // question always has a clear, unambiguous answer.
    let iHigh = 0;
    let iLow = 0;
    values.forEach((v, i) => {
      if (v > values[iHigh]) iHigh = i;
      if (v < values[iLow]) iLow = i;
    });
    correct = values[iHigh] - values[iLow];
    promptMs = `Graf palang di bawah menunjukkan data bagi 4 kumpulan. Berapakah beza antara kumpulan ${LABELS[iHigh]} dan kumpulan ${LABELS[iLow]}?`;
    promptEn = `The bar graph below shows data for 4 groups. What is the difference between group ${LABELS[iHigh]} and group ${LABELS[iLow]}?`;
    context = { variant, v0: values[0], v1: values[1], v2: values[2], v3: values[3], iHigh, iLow, correct };
  }

  // ---- errorSpotting: shown the classic "forgot one bar" mistake (total
  // variant only, since it's the mistake with the clearest fixed formula).
  if (errorSpotting && variant === "total") {
    const forgottenIndex = randInt(0, 3);
    const wrongTotal = correct - values[forgottenIndex];
    if (wrongTotal !== correct) {
      const name = pick(BAR_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira jumlah keseluruhan graf palang (${values.join(", ")}) sebagai ${wrongTotal}. Apakah jawapan yang betul?`,
          en: `${name} calculated the bar graph's total (${values.join(", ")}) as ${wrongTotal}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context,
        generatorKey: "bar_graph",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongTotal)]),
        diagram: { kind: "bar_chart", labels: LABELS, values },
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
    generatorKey: "bar_graph",
    difficulty: 2,
    diagram: { kind: "bar_chart", labels: LABELS, values },
  };

  if (type === "mcq" || type === "word_problem") {
    let distractors: string[];
    if (variant === "total") {
      // Classic mistake: forgetting one of the four bars when summing.
      const forgotOne = correct - values[randInt(0, 3)];
      // Classic mistake: adding just two of the four bars.
      const addedTwoOnly = values[0] + values[1];
      distractors = [String(forgotOne), String(addedTwoOnly)];
    } else {
      // Classic mistake: adding instead of subtracting.
      const addedInstead = values.reduce((sum, v) => sum + v, 0) - correct; // sum of the other two — plausible wrong total
      const addedTwo = values[0] + values[1];
      distractors = [String(addedInstead), String(addedTwo)];
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
