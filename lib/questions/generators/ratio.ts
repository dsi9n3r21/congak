import { pick, randInt, shuffleOptions, gcd } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const RATIO_CONTEXTS = [
  { partA: { ms: "murid lelaki", en: "boys" }, partB: { ms: "murid perempuan", en: "girls" }, group: { ms: "kelas", en: "class" } },
  { partA: { ms: "gula", en: "sugar" }, partB: { ms: "tepung", en: "flour" }, group: { ms: "resipi (dalam cawan)", en: "recipe (in cups)" } },
  { partA: { ms: "buku cerita", en: "storybooks" }, partB: { ms: "buku rujukan", en: "reference books" }, group: { ms: "rak buku", en: "bookshelf" } },
  { partA: { ms: "gula-gula merah", en: "red sweets" }, partB: { ms: "gula-gula kuning", en: "yellow sweets" }, group: { ms: "balang", en: "jar" } },
];
const RATIO_NAMES = ["Ali", "Siti", "Hakim", "Mei Ling", "Faisal", "Priya"];

// Retrofitted per the Round 19 content standard: added errorSpotting and
// reverseProblem (share-in-a-ratio word problems) branches, plus
// uniqueness-guaranteed option fallbacks on every options array, matching
// the money_add_subtract/dividend pattern.
export function generateSimplifyRatio(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const maxMultiplier = Number(params.maxMultiplier ?? 6);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  // Build a ratio that isn't already in simplest form, by scaling a small
  // simple ratio up by a random factor — guarantees genuine simplification
  // work rather than a trivial already-reduced ratio.
  const baseA = randInt(1, 6);
  const baseB = randInt(1, 6);
  const factor = randInt(2, maxMultiplier);
  const a = baseA * factor;
  const b = baseB * factor;

  const divisor = gcd(a, b);
  const simplifiedA = a / divisor;
  const simplifiedB = b / divisor;
  const correct = `${simplifiedA}:${simplifiedB}`;
  const context = { a, b, simplifiedA, simplifiedB };

  // ---- reverseProblem: given the simplified ratio and a total quantity,
  // find one part's real amount (a genuine "share in a ratio" problem).
  if (reverseProblem) {
    const ctx = pick(RATIO_CONTEXTS);
    const scale = randInt(2, 8);
    const partAValue = simplifiedA * scale;
    const partBValue = simplifiedB * scale;
    const total = partAValue + partBValue;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Dalam sebuah ${ctx.group.ms}, nisbah ${ctx.partA.ms} kepada ${ctx.partB.ms} ialah ${correct}. Jika jumlah keseluruhan ialah ${total}, berapakah bilangan ${ctx.partA.ms}?`,
        en: `In a ${ctx.group.en}, the ratio of ${ctx.partA.en} to ${ctx.partB.en} is ${correct}. If the total is ${total}, how many ${ctx.partA.en} are there?`,
      },
      type: "word_problem",
      correctAnswer: String(partAValue),
      context: { a, b, simplifiedA, simplifiedB, total, partAValue, partBValue },
      generatorKey: "simplify_ratio",
      difficulty: 3,
    };
    // Classic mistake: divides the total equally instead of by ratio parts.
    const dividedEqually = String(Math.round(total / 2));
    // Classic mistake: gives the other part's value instead of the one asked for.
    const gaveOtherPart = String(partBValue);
    const distractors = Array.from(new Set([dividedEqually, gaveOtherPart].filter((d) => d !== String(partAValue))));
    question.options = shuffleOptions(String(partAValue), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, partAValue + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown a ratio only partially simplified (divided
  // by 2 but not the full GCD), must give the true simplest form. Only
  // meaningful when a and b are both even and dividing by 2 alone doesn't
  // already reach the simplest form.
  if (errorSpotting && a % 2 === 0 && b % 2 === 0) {
    const partialSimplify = `${a / 2}:${b / 2}`;
    if (partialSimplify !== correct) {
      const name = pick(RATIO_NAMES);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} permudahkan nisbah ${a}:${b} kepada ${partialSimplify}. Adakah ini bentuk paling ringkas? Jika tidak, apakah bentuk paling ringkas sebenar?`,
          en: `${name} simplified the ratio ${a}:${b} to ${partialSimplify}. Is this the simplest form? If not, what is the actual simplest form?`,
        },
        type: "mcq",
        correctAnswer: correct,
        context,
        generatorKey: "simplify_ratio",
        difficulty: 3,
        options: shuffleOptions(correct, [partialSimplify]),
      };
      while (question.options!.length < 3) {
        const candidate = `${simplifiedA + randInt(1, 3)}:${simplifiedB + randInt(1, 3)}`;
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Permudahkan nisbah ${a}:${b} kepada bentuk paling ringkas.`,
      en: `Simplify the ratio ${a}:${b} to its simplest form.`,
    },
    type,
    correctAnswer: correct,
    context,
    generatorKey: "simplify_ratio",
    difficulty: factor > 4 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: dividing only one side, leaving it partially simplified.
    const partialSimplify = `${a / 2}:${b}`;
    // Classic mistake: reversing the ratio order.
    const reversed = `${simplifiedB}:${simplifiedA}`;
    question.options = shuffleOptions(
      correct,
      Array.from(new Set([partialSimplify, reversed].filter((d) => d !== correct && d !== `${a}:${b}`)))
    );
    while (question.options.length < 3) {
      const candidate = `${simplifiedA + randInt(1, 3)}:${simplifiedB + randInt(1, 3)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
