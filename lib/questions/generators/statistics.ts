import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const STAT_LABELS: Record<string, { ms: string; en: string }> = {
  mode: { ms: "mod", en: "mode" },
  range: { ms: "julat", en: "range" },
  median: { ms: "median", en: "median" },
  mean: { ms: "min", en: "mean" },
};

// Year 5 KSSR "Mode, Range, Median, and Mean" — a small 5-value dataset
// (built with exactly one intentional duplicate, so mode is always
// well-defined) supports all four questions from one generator. The three
// OTHER computed stats double as natural distractors — a student who
// mixes up "median" and "mean" is a very real, specific mistake this
// naturally tests for, not an arbitrary wrong number.
export function generateModeRangeMedianMean(params: GeneratorParams): GeneratedQuestion {
  const maxValue = Number(params.maxValue ?? 20);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const statType = pick(["mode", "range", "median", "mean"] as const);

  const dup = randInt(2, maxValue);
  const others = new Set<number>([dup]);
  while (others.size < 4) others.add(randInt(1, maxValue));
  const values = [dup, ...Array.from(others)].sort(() => Math.random() - 0.5);

  const sorted = [...values].sort((a, b) => a - b);
  const mode = dup;
  const range = sorted[4] - sorted[0];
  const median = sorted[2];
  const sum = values.reduce((a, b) => a + b, 0);
  const meanRaw = sum / 5;
  const mean = Number.isInteger(meanRaw) ? String(meanRaw) : meanRaw.toFixed(1);

  const stats: Record<string, string> = { mode: String(mode), range: String(range), median: String(median), mean };
  const correctAnswer = stats[statType];
  const label = STAT_LABELS[statType];

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari ${label.ms} bagi set data ini: ${values.join(", ")}.`,
      en: `Find the ${label.en} of this data set: ${values.join(", ")}.`,
    },
    type,
    correctAnswer,
    context: { values: values.join(","), mode, range, median, mean, statType },
    generatorKey: "mode_range_median_mean",
    difficulty: statType === "mean" ? 3 : 2,
  };

  if (type === "mcq") {
    const otherStats = Object.entries(stats)
      .filter(([k]) => k !== statType)
      .map(([, v]) => v);
    const distractors = Array.from(new Set(otherStats.filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, Number(correctAnswer) + randInt(1, 5)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
