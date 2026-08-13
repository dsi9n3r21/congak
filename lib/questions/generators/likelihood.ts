import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Y6 KSSR "Likelihood" — certain/impossible, equally likely, and more/less
// likely, all via a simple "container of coloured items" scenario. Word-based
// answer (not numeric) — correctAnswer/options are canonical keys, styled
// through lib/questions/optionLabels.ts (OPTION_LABELS), same convention
// as angles_classify.
//
// Retrofitted per the Round 19 content standard: added a sweets-jar
// word_problem variant (re-skinned scenario for variety, not just the
// bag-of-marbles framing) and an errorSpotting variant targeting the
// documented misconception (assuming "equally likely" without checking
// the counts). No reverseProblem — there's no numeric reverse for a
// categorical likelihood judgement, same reasoning as angles_classify.ts.
const COLORS = [
  { ms: "merah", en: "red" },
  { ms: "biru", en: "blue" },
  { ms: "kuning", en: "yellow" },
  { ms: "hijau", en: "green" },
] as const;

const CONTAINERS = {
  marbles: { ms: "beg", en: "bag", item: { ms: "biji guli", en: "marbles" } },
  sweets: { ms: "balang", en: "jar", item: { ms: "biji gula-gula", en: "sweets" } },
} as const;

export function generateLikelihood(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  function classify(a: number, b: number): "impossible" | "equally_likely" | "more_likely" | "less_likely" {
    if (a === 0) return "impossible";
    if (a === b) return "equally_likely";
    return a > b ? "more_likely" : "less_likely";
  }

  // ---- challenge (TP6 / non-routine): WITHOUT REPLACEMENT — a marble is
  // already picked and NOT put back, THEN ask about the likelihood of
  // picking that same colour again. Genuine second hop past the base
  // skill and errorSpotting (both only ever classify from a STATIC,
  // unchanging count): (1) update the count after the first pick is
  // removed, THEN (2) classify the likelihood using the NEW counts, not
  // the original ones.
  if (challenge) {
    const colorA = pick(COLORS);
    const colorB = pick(COLORS.filter((c) => c.en !== colorA.en));
    const countA = randInt(3, 8);
    const countB = randInt(3, 8);
    const newCountA = countA - 1;
    const correctAnswer = classify(newCountA, countB);
    const beforeAnswer = classify(countA, countB);
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah beg mengandungi ${countA} biji guli ${colorA.ms} dan ${countB} biji guli ${colorB.ms}. ${name} mengeluarkan SATU guli ${colorA.ms} dan TIDAK memasukkannya semula. Apakah kemungkinan untuk mengeluarkan guli ${colorA.ms} SEKALI LAGI sekarang?`,
        en: `A bag contains ${countA} ${colorA.en} marbles and ${countB} ${colorB.en} marbles. ${name} takes out ONE ${colorA.en} marble and does NOT put it back. What is the likelihood of picking a ${colorA.en} marble AGAIN now?`,
      },
      type: "word_problem",
      correctAnswer,
      context: { countA, countB, newCountA, correctAnswer, beforeAnswer },
      generatorKey: "likelihood",
      difficulty: 3,
    };
    // Classic non-routine mistake: uses the ORIGINAL counts, forgetting
    // that the first marble taken out changes the count.
    const allCategories = ["impossible", "equally_likely", "more_likely", "less_likely"] as const;
    const distractors = Array.from(new Set([beforeAnswer, ...allCategories])).filter((d) => d !== correctAnswer);
    question.options = shuffleOptions(correctAnswer, distractors.slice(0, 2));
    return question;
  }

  // ---- errorSpotting: shown the classic "assumed equally likely without
  // checking the counts" mistake, must give the correct answer.
  if (errorSpotting) {
    const colorA = pick(COLORS);
    const colorB = pick(COLORS.filter((c) => c.en !== colorA.en));
    const countA = randInt(5, 9);
    const countB = randInt(1, 4);
    const name = pick(names);
    const correctAnswer = "more_likely";
    return {
      prompt: {
        ms: `Sebuah beg mengandungi ${countA} biji guli ${colorA.ms} dan ${countB} biji guli ${colorB.ms}. ${name} berkata kemungkinan mengeluarkan guli ${colorA.ms} dan guli ${colorB.ms} adalah SAMA. ${name} silap. Apakah kemungkinan yang betul untuk mengeluarkan guli ${colorA.ms}?`,
        en: `A bag contains ${countA} ${colorA.en} marbles and ${countB} ${colorB.en} marbles. ${name} says the likelihood of picking a ${colorA.en} marble and a ${colorB.en} marble is the SAME. ${name} is wrong. What is the correct likelihood of picking a ${colorA.en} marble?`,
      },
      type: "mcq",
      correctAnswer,
      context: { countA, countB, colorA: colorA.en, colorB: colorB.en },
      generatorKey: "likelihood",
      difficulty: 3,
      options: shuffleOptions(correctAnswer, ["equally_likely", "less_likely"]),
    };
  }

  const container = type === "word_problem" ? CONTAINERS.sweets : CONTAINERS.marbles;
  const scenario = pick(["certain_impossible", "equally_likely", "more_less"] as const);

  if (scenario === "certain_impossible") {
    const color = pick(COLORS);
    const n = randInt(3, 10);
    const askCertain = Math.random() > 0.5;
    if (askCertain) {
      return {
        prompt: {
          ms: `Sebuah ${container.ms} mengandungi ${n} ${container.item.ms}, semuanya berwarna ${color.ms}. Apakah kemungkinan untuk mengeluarkan ${container.item.ms} berwarna ${color.ms}?`,
          en: `A ${container.en} contains ${n} ${container.item.en}, all coloured ${color.en}. What is the likelihood of picking out a ${color.en} one?`,
        },
        type,
        correctAnswer: "certain",
        context: { n, color: color.en, scenario },
        generatorKey: "likelihood",
        difficulty: 3,
        options: shuffleOptions("certain", ["impossible", "equally_likely"]),
      };
    }
    const otherColor = pick(COLORS.filter((c) => c.en !== color.en));
    return {
      prompt: {
        ms: `Sebuah ${container.ms} mengandungi ${n} ${container.item.ms}, semuanya berwarna ${color.ms}. Apakah kemungkinan untuk mengeluarkan ${container.item.ms} berwarna ${otherColor.ms}?`,
        en: `A ${container.en} contains ${n} ${container.item.en}, all coloured ${color.en}. What is the likelihood of picking out a ${otherColor.en} one?`,
      },
      type,
      correctAnswer: "impossible",
      context: { n, color: color.en, otherColor: otherColor.en, scenario },
      generatorKey: "likelihood",
      difficulty: 3,
      options: shuffleOptions("impossible", ["certain", "equally_likely"]),
    };
  }

  if (scenario === "equally_likely") {
    const [colorA, colorB] = [COLORS[0], COLORS[1]].sort(() => Math.random() - 0.5);
    const n = randInt(2, 6);
    return {
      prompt: {
        ms: `Sebuah ${container.ms} mengandungi ${n} ${container.item.ms} ${colorA.ms} dan ${n} ${container.item.ms} ${colorB.ms}. Apakah kemungkinan untuk mengeluarkan yang ${colorA.ms} berbanding ${colorB.ms}?`,
        en: `A ${container.en} contains ${n} ${colorA.en} ${container.item.en} and ${n} ${colorB.en} ${container.item.en}. What is the likelihood of picking a ${colorA.en} one compared to a ${colorB.en} one?`,
      },
      type,
      correctAnswer: "equally_likely",
      context: { n, colorA: colorA.en, colorB: colorB.en, scenario },
      generatorKey: "likelihood",
      difficulty: 3,
      options: shuffleOptions("equally_likely", ["more_likely", "less_likely"]),
    };
  }

  // more_less
  const colorA = pick(COLORS);
  const colorB = pick(COLORS.filter((c) => c.en !== colorA.en));
  const countA = randInt(5, 9);
  const countB = randInt(1, 4);
  const askMore = Math.random() > 0.5;
  const correctAnswer = askMore ? "more_likely" : "less_likely";
  const askedColor = askMore ? colorA : colorB;

  return {
    prompt: {
      ms: `Sebuah ${container.ms} mengandungi ${countA} ${container.item.ms} ${colorA.ms} dan ${countB} ${container.item.ms} ${colorB.ms}. Apakah kemungkinan untuk mengeluarkan yang ${askedColor.ms}?`,
      en: `A ${container.en} contains ${countA} ${colorA.en} ${container.item.en} and ${countB} ${colorB.en} ${container.item.en}. What is the likelihood of picking a ${askedColor.en} one?`,
    },
    type,
    correctAnswer,
    context: { countA, countB, colorA: colorA.en, colorB: colorB.en, scenario },
    generatorKey: "likelihood",
    difficulty: 3,
    options: shuffleOptions(correctAnswer, ["more_likely", "less_likely", "equally_likely"].filter((c) => c !== correctAnswer)),
  };
}
