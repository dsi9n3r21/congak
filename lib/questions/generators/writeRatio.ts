import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Ratio" — CORRECTED per Round 19's DSKP verification pass.
// The real Y4 standard (7.2.1) is: "Mewakilkan hubungan antara dua
// kuantiti dalam nisbah 1:1 hingga 1:10, 1:100 dan 1:1000" — i.e.
// UNITARY ratios only (1:n), framed as "for every 1 A, there are n B".
// General a:b comparison (both sides free, e.g. 6:3) is Y5 content
// (7.2.1 there explicitly adds part-to-part/part-to-whole/whole-to-part)
// — that's correctly covered by topic ...058. Simplifying a ratio to
// its lowest terms is Y6 (topic ...009, "Nisbah Mudah"). The original
// version of this generator produced arbitrary a:b (e.g. "6:3"), which
// is Y5-level content mislabeled as Y4 — fixed here to stay unitary.
const CONTEXTS = [
  { ms: ["guru", "murid"], en: ["teacher", "students"] },
  { ms: ["kotak pensel", "pensel"], en: ["pencil box", "pencils"] },
  { ms: ["bekas", "biskut"], en: ["container", "biscuits"] },
  { ms: ["baris", "kerusi"], en: ["row", "chairs"] },
  { ms: ["beg", "guli"], en: ["bag", "marbles"] },
];

const SCALE_CONTEXTS = [
  { ms: ["1 cm pada peta", "cm jarak sebenar"], en: ["1 cm on the map", "cm of real distance"] },
  { ms: ["1 cm pada model kereta", "cm panjang kereta sebenar"], en: ["1 cm on the model car", "cm of the real car's length"] },
];

export function generateWriteRatio(params: GeneratorParams): GeneratedQuestion {
  const scale = Boolean(params.scale); // true → uses the 1:100/1:1000 scale-model framing
  const errorSpotting = Boolean(params.errorSpotting);
  const wordProblem = Boolean(params.wordProblem);
  const n = scale ? pick([100, 1000]) : randInt(1, 10);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah"];

  // ---- errorSpotting: shown the classic order-reversal mistake, must
  // give the correct ratio. Excludes n=1 — a 1:1 ratio is symmetric, so
  // "reversed" would equal the correct answer and there'd be no mistake
  // to spot.
  if (errorSpotting) {
    const ctx = pick(CONTEXTS);
    const [itemAMs, itemBMs] = ctx.ms;
    const [itemAEn, itemBEn] = ctx.en;
    const name = pick(names);
    const errN = randInt(2, 10);
    const correct = `1:${errN}`;
    const wrong = `${errN}:1`;
    return {
      prompt: {
        ms: `Bagi setiap 1 ${itemAMs}, terdapat ${errN} ${itemBMs}. ${name} menulis nisbah ${itemAMs} kepada ${itemBMs} sebagai ${wrong}. Apakah jawapan yang betul?`,
        en: `For every 1 ${itemAEn}, there are ${errN} ${itemBEn}. ${name} writes the ratio of ${itemAEn} to ${itemBEn} as ${wrong}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: correct,
      context: { n: errN, correct, wrong },
      generatorKey: "write_ratio",
      difficulty: 3,
      options: shuffleOptions(correct, [wrong]),
    };
  }

  if (scale) {
    const ctx = pick(SCALE_CONTEXTS);
    const [unitMs, targetMs] = ctx.ms;
    const [unitEn, targetEn] = ctx.en;
    const correct = `1:${n}`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Skala sebuah pelan menunjukkan ${unitMs} mewakili ${n} ${targetMs}. Tuliskan nisbah ini.`,
        en: `A plan's scale shows ${unitEn} represents ${n} ${targetEn}. Write this ratio.`,
      },
      type: "mcq",
      correctAnswer: correct,
      context: { n, correct },
      generatorKey: "write_ratio",
      difficulty: 3,
    };
    const reversed = `${n}:1`; // classic mistake: wrong order
    const droppedZero = `1:${String(n).slice(0, -1)}`; // classic mistake: dropped a trailing zero (1:100 → 1:10)
    const distractors = Array.from(new Set([reversed, droppedZero])).filter((d) => d !== correct);
    question.options = shuffleOptions(correct, distractors);
    while (question.options.length < 3) {
      const bump = pick([10, -10, 100, -100]);
      const candidateN = n + bump;
      if (candidateN <= 0) continue;
      const candidate = `1:${candidateN}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const ctx = pick(CONTEXTS);
  const [itemAMs, itemBMs] = ctx.ms;
  const [itemAEn, itemBEn] = ctx.en;
  const correct = `1:${n}`;

  // ---- wordProblem: same unitary-ratio task, framed as a short
  // Malaysian classroom scenario with an irrelevant-info decoy.
  if (wordProblem) {
    const name = pick(names);
    const decoyMs = ` ${name} mencatat ini semasa aktiviti kelas pada hari Isnin.`;
    const decoyEn = ` ${name} recorded this during a class activity on Monday.`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Dalam bilik darjah, bagi setiap 1 ${itemAMs}, terdapat ${n} ${itemBMs}.${decoyMs} Tuliskan nisbah ${itemAMs} kepada ${itemBMs}.`,
        en: `In the classroom, for every 1 ${itemAEn}, there are ${n} ${itemBEn}.${decoyEn} Write the ratio of ${itemAEn} to ${itemBEn}.`,
      },
      type: "word_problem",
      correctAnswer: correct,
      context: { n, correct },
      generatorKey: "write_ratio",
      difficulty: 2,
    };
    const reversedWP = `${n}:1`;
    const addedTotalWP = `${1 + n}:1`;
    const distractorsWP = Array.from(new Set([reversedWP, addedTotalWP])).filter((d) => d !== correct);
    question.options = shuffleOptions(correct, distractorsWP);
    while (question.options.length < 3) {
      const candidate = `1:${Math.max(1, n + randInt(1, 2))}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Bagi setiap 1 ${itemAMs}, terdapat ${n} ${itemBMs}. Tuliskan nisbah ${itemAMs} kepada ${itemBMs}.`,
      en: `For every 1 ${itemAEn}, there are ${n} ${itemBEn}. Write the ratio of ${itemAEn} to ${itemBEn}.`,
    },
    type: "mcq",
    correctAnswer: correct,
    context: { n, correct },
    generatorKey: "write_ratio",
    difficulty: 1,
  };

  // Classic mistake: writing the ratio in the wrong order (n:1 instead of 1:n).
  const reversed = `${n}:1`;
  // Classic mistake: adding instead of comparing (wrote the total, not a ratio).
  const addedTotal = `${1 + n}:1`;
  const distractors = Array.from(new Set([reversed, addedTotal])).filter((d) => d !== correct);
  question.options = shuffleOptions(correct, distractors);
  while (question.options.length < 3) {
    const candidate = `1:${Math.max(1, n + randInt(1, 2))}`;
    if (!question.options.includes(candidate)) question.options.push(candidate);
  }

  return question;
}
