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
//
// Retrofitted per the Round 19 content standard: added a real test-scores
// word_problem, errorSpotting (the documented "confused statistic type"
// mistake), and a reverseProblem variant that gives the mean and 4 of
// the 5 values, asking for the missing 5th value — the genuine reverse
// of computing a mean forward.
export function generateModeRangeMedianMean(params: GeneratorParams): GeneratedQuestion {
  const maxValue = Number(params.maxValue ?? 20);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the mean and 4 of the 5 values, find the
  // missing 5th value — the genuine reverse of computing a mean forward.
  if (reverseProblem) {
    const rDup = randInt(2, maxValue);
    const rOthers = new Set<number>([rDup]);
    while (rOthers.size < 4) rOthers.add(randInt(1, maxValue));
    const allValues = [rDup, ...Array.from(rOthers)].sort(() => Math.random() - 0.5);
    const missingIndex = randInt(0, 4);
    const missingValue = allValues[missingIndex];
    const knownValues = allValues.filter((_, i) => i !== missingIndex);
    const sum = allValues.reduce((a, b) => a + b, 0);
    const meanRaw = sum / 5;
    const meanLabel = Number.isInteger(meanRaw) ? String(meanRaw) : meanRaw.toFixed(1);
    const name = pick(names);

    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} ada 5 markah ujian. Empat daripadanya ialah ${knownValues.join(", ")}, dan min kelima-lima markah itu ialah ${meanLabel}. Berapakah markah kelima?`,
        en: `${name} has 5 test scores. Four of them are ${knownValues.join(", ")}, and the mean of all 5 scores is ${meanLabel}. What is the fifth score?`,
      },
      type: "word_problem",
      correctAnswer: String(missingValue),
      context: { knownValues: knownValues.join(","), meanLabel, missingValue },
      generatorKey: "mode_range_median_mean",
      difficulty: 3,
    };
    // Classic mistake: gave the mean itself as the missing value.
    const gaveMeanItself = Math.round(meanRaw);
    // Classic mistake: summed the 4 known values and divided by 4 instead of solving for the 5th.
    const usedFourNotFive = Math.round(knownValues.reduce((a, b) => a + b, 0) / 4);
    const distractors = Array.from(
      new Set([gaveMeanItself, usedFourNotFive].map(String).filter((d) => d !== String(missingValue)))
    );
    question.options = shuffleOptions(String(missingValue), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, missingValue + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

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
  const statType = pick(["mode", "range", "median", "mean"] as const);
  const correctAnswer = stats[statType];
  const label = STAT_LABELS[statType];

  // ---- errorSpotting: shown the documented "confused statistic type"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const otherStatType = pick((["mode", "range", "median", "mean"] as const).filter((s) => s !== statType));
    const wrongAnswer = stats[otherStatType];
    if (wrongAnswer !== correctAnswer) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Set data: ${values.join(", ")}. ${name} diminta cari ${label.ms}, tetapi tersilap kira ${STAT_LABELS[otherStatType].ms} dan menjawab ${wrongAnswer}. Apakah jawapan yang betul untuk ${label.ms}?`,
          en: `Data set: ${values.join(", ")}. ${name} was asked to find the ${label.en}, but mistakenly calculated the ${STAT_LABELS[otherStatType].en} instead and answered ${wrongAnswer}. What is the correct ${label.en}?`,
        },
        type: "mcq",
        correctAnswer,
        context: { values: values.join(","), mode, range, median, mean, statType, wrongAnswer },
        generatorKey: "mode_range_median_mean",
        difficulty: 3,
        options: shuffleOptions(correctAnswer, [wrongAnswer]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(0, Number(correctAnswer) + randInt(1, 5)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: test-scores scenario, contextualising the same
  // dataset-statistic skill.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mencatat markah ujian 5 orang rakan: ${values.join(", ")}. Cari ${label.ms} bagi markah-markah itu.`,
        en: `${name} records the test scores of 5 friends: ${values.join(", ")}. Find the ${label.en} of these scores.`,
      },
      type: "word_problem",
      correctAnswer,
      context: { values: values.join(","), mode, range, median, mean, statType },
      generatorKey: "mode_range_median_mean",
      difficulty: statType === "mean" ? 3 : 2,
    };
    const otherStats = Object.entries(stats)
      .filter(([k]) => k !== statType)
      .map(([, v]) => v);
    const distractors = Array.from(new Set(otherStats.filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, Number(correctAnswer) + randInt(1, 5)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

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
