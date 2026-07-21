import { randInt, shuffleOptions, pick } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const LABELS = ["A", "B", "C", "D"];

export function generateBarGraph(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 5);
  const max = Number(params.max ?? 32);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const variant = pick(["total", "difference"]);

  const values = LABELS.map(() => randInt(min, max));

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

  const question: GeneratedQuestion = {
    prompt: { ms: promptMs, en: promptEn },
    type,
    correctAnswer: String(correct),
    context,
    generatorKey: "bar_graph",
    difficulty: 2,
    diagram: { kind: "bar_chart", labels: LABELS, values },
  };

  if (type === "mcq") {
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
