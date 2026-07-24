import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Y6 KSSR "Likelihood" — certain/impossible, equally likely, and more/less
// likely, all via a simple "bag of coloured balls" scenario. Word-based
// answer (not numeric) — correctAnswer/options are canonical keys, styled
// through lib/questions/optionLabels.ts (OPTION_LABELS), same convention
// as angles_classify.
const COLORS = [
  { ms: "merah", en: "red" },
  { ms: "biru", en: "blue" },
  { ms: "kuning", en: "yellow" },
  { ms: "hijau", en: "green" },
] as const;

export function generateLikelihood(_params: GeneratorParams): GeneratedQuestion {
  const scenario = pick(["certain_impossible", "equally_likely", "more_less"] as const);

  if (scenario === "certain_impossible") {
    const color = pick(COLORS);
    const n = randInt(3, 10);
    const askCertain = Math.random() > 0.5;
    if (askCertain) {
      return {
        prompt: {
          ms: `Sebuah beg mengandungi ${n} biji guli, semuanya berwarna ${color.ms}. Apakah kemungkinan untuk mengeluarkan guli berwarna ${color.ms}?`,
          en: `A bag contains ${n} marbles, all coloured ${color.en}. What is the likelihood of picking out a ${color.en} marble?`,
        },
        type: "mcq",
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
        ms: `Sebuah beg mengandungi ${n} biji guli, semuanya berwarna ${color.ms}. Apakah kemungkinan untuk mengeluarkan guli berwarna ${otherColor.ms}?`,
        en: `A bag contains ${n} marbles, all coloured ${color.en}. What is the likelihood of picking out a ${otherColor.en} marble?`,
      },
      type: "mcq",
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
        ms: `Sebuah beg mengandungi ${n} biji guli ${colorA.ms} dan ${n} biji guli ${colorB.ms}. Apakah kemungkinan untuk mengeluarkan guli ${colorA.ms} berbanding ${colorB.ms}?`,
        en: `A bag contains ${n} ${colorA.en} marbles and ${n} ${colorB.en} marbles. What is the likelihood of picking a ${colorA.en} marble compared to a ${colorB.en} one?`,
      },
      type: "mcq",
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
      ms: `Sebuah beg mengandungi ${countA} biji guli ${colorA.ms} dan ${countB} biji guli ${colorB.ms}. Apakah kemungkinan untuk mengeluarkan guli ${askedColor.ms}?`,
      en: `A bag contains ${countA} ${colorA.en} marbles and ${countB} ${colorB.en} marbles. What is the likelihood of picking a ${askedColor.en} marble?`,
    },
    type: "mcq",
    correctAnswer,
    context: { countA, countB, colorA: colorA.en, colorB: colorB.en, scenario },
    generatorKey: "likelihood",
    difficulty: 3,
    options: shuffleOptions(correctAnswer, ["more_likely", "less_likely", "equally_likely"].filter((c) => c !== correctAnswer)),
  };
}
