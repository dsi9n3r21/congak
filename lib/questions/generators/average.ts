import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const SUBJECTS = [
  { ms: "markah ujian matematik", en: "maths test scores" },
  { ms: "bilangan gol dijaringkan setiap perlawanan", en: "goals scored per match" },
  { ms: "bilangan buku dibaca setiap bulan", en: "books read each month" },
  { ms: "wang saku (RM) diterima setiap minggu", en: "pocket money (RM) received each week" },
];
const NAMES = ["Aina", "Ali", "Siti", "Vijay", "Mei Ling", "Hakim", "Nurul", "Faisal"];

// Retrofitted per the Round 19 content standard: added a real-world
// context to word_problem prompts (previously identical bare "find the
// average of X, Y, Z" for every type), plus errorSpotting and
// reverseProblem branches with uniqueness-guaranteed option fallbacks,
// matching the money_add_subtract/dividend pattern.
export function generateAverage(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const count = Number(params.count ?? 4);
  const maxValue = Number(params.maxValue ?? 20);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const subject = pick(SUBJECTS);
  const name = pick(NAMES);

  // Build values that divide evenly by count, matching the whole-number
  // answers expected at Year 5 level rather than forcing rounding.
  const average = randInt(3, maxValue);
  const values: number[] = [];
  let remaining = average * count;
  for (let i = 0; i < count - 1; i++) {
    const spread = randInt(-Math.min(average - 1, 5), Math.min(average, 5));
    const value = average + spread;
    values.push(value);
    remaining -= value;
  }
  values.push(remaining);

  const sum = values.reduce((a, b) => a + b, 0);
  const correct = sum / count;
  const context = { values: values.join(","), sum, count, correct };

  // ---- reverseProblem: given the average and all-but-one value, find
  // the missing value (multiply average by count, subtract known values).
  if (reverseProblem) {
    const known = values.slice(0, count - 1);
    const missing = values[count - 1];
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Purata ${subject.ms} ${name} untuk ${count} kali ialah ${correct}. ${count - 1} daripadanya ialah ${known.join(", ")}. Berapakah nilai yang selebihnya?`,
        en: `${name}'s average ${subject.en} over ${count} times is ${correct}. ${count - 1} of them are ${known.join(", ")}. What is the remaining value?`,
      },
      type: "word_problem",
      correctAnswer: String(missing),
      context,
      generatorKey: "average",
      difficulty: 3,
    };
    // Classic mistake: used average × count directly, forgetting to
    // subtract the known values first.
    const forgotSubtract = String(correct * count);
    const distractors = [forgotSubtract].filter((d) => d !== String(missing));
    question.options = shuffleOptions(String(missing), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, missing + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot to divide" mistake,
  // must give the correct average.
  if (errorSpotting) {
    const wrongAverage = sum;
    if (String(wrongAverage) !== String(correct)) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira purata bagi ${values.join(", ")} dan mendapat jawapan ${wrongAverage}. Apakah jawapan yang betul?`,
          en: `${name} calculated the average of ${values.join(", ")} and got ${wrongAverage}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context,
        generatorKey: "average",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAverage)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  const prompt =
    type === "word_problem"
      ? {
          ms: `${subject.ms} ${name} untuk ${count} kali ialah ${values.join(", ")}. Berapakah puratanya?`,
          en: `${name}'s ${subject.en} over ${count} times were ${values.join(", ")}. What is the average?`,
        }
      : {
          ms: `Cari purata bagi ${values.join(", ")}.`,
          en: `Find the average of ${values.join(", ")}.`,
        };

  const question: GeneratedQuestion = {
    prompt,
    type,
    correctAnswer: String(correct),
    context,
    generatorKey: "average",
    difficulty: count > 4 ? 2 : 1,
  };

  if (type === "mcq" || type === "word_problem") {
    // Classic mistake: giving the sum instead of dividing by count.
    const forgotDivide = sum;
    // Classic mistake: dividing by the wrong count (off by one item).
    const wrongCount = Math.round(sum / (count - 1));
    question.options = shuffleOptions(
      String(correct),
      [String(forgotDivide), String(wrongCount)].filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 5));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
