import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 5 KSSR "Proportion to Find a Value" — given a ratio (e.g. cats to
// dogs = 2:3) and one known quantity, scale it up to find the other.
// Ratio-based — deliberately distinct from Y4's "Proportion"
// (unitary_proportion.ts), which starts from a price-per-item rate, not
// a stated a:b ratio.
//
// Retrofitted per the Round 19 content standard: the base prompt was
// already a real scenario for every `type`, but its options were only
// ever built `if (type === "mcq")` — so the `word_problem` template
// already configured for this topic in topics.ts had been silently
// rendering with zero answer choices (same bug family caught in batch
// 14: prompt/output not actually branching on `type` the way the
// template expected). Fixed by widening that guard, and added
// errorSpotting plus a reverseProblem variant that asks for the SCALE
// FACTOR itself given a worked example, matching unit_convert's
// reverseProblem idea (recalling/deriving a scale factor is the natural
// reverse of applying one).
export function generateProportion(params: GeneratorParams): GeneratedQuestion {
  const maxScale = Number(params.maxScale ?? 6);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): a THREE-way ratio (cats:dogs:
  // rabbits), given only the TOTAL number of animals — find one specific
  // animal's count. Genuine second hop past the base skill and
  // reverseProblem (both only ever work with a TWO-part ratio and a
  // directly-known part): (1) add all three ratio numbers to get the
  // total ratio units, THEN (2) divide the total by that to get the
  // scale factor, THEN (3) multiply the target's ratio number by it.
  if (challenge) {
    const cA = randInt(1, 4);
    const cB = randInt(1, 4);
    const cC = randInt(1, 4);
    const scale = randInt(2, maxScale);
    const totalRatio = cA + cB + cC;
    const total = totalRatio * scale;
    const animals = [
      { ms: "kucing", en: "cats", ratio: cA },
      { ms: "anjing", en: "dogs", ratio: cB },
      { ms: "arnab", en: "rabbits", ratio: cC },
    ];
    const targetIdx = randInt(0, 2);
    const target = animals[targetIdx];
    const correct = target.ratio * scale;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Nisbah kucing, anjing, dan arnab di sebuah kedai haiwan ialah ${cA}:${cB}:${cC}. Terdapat ${total} ekor haiwan kesemuanya. Berapa ekor ${target.ms}?`,
        en: `The ratio of cats, dogs, and rabbits in a pet shop is ${cA}:${cB}:${cC}. There are ${total} animals in total. How many ${target.en} are there?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { cA, cB, cC, scale, total, totalRatio, targetRatio: target.ratio, correct },
      generatorKey: "proportion",
      difficulty: 3,
    };
    // Classic non-routine mistake: divides the total evenly across the 3
    // species, ignoring the ratio entirely.
    const dividedEvenly = Math.round(total / 3);
    // Classic non-routine mistake: gives the whole total as the answer,
    // forgetting to scale down to just the target animal.
    const gaveTotal = total;
    const distractors = Array.from(
      new Set([dividedEvenly, gaveTotal].map(String).filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given a worked ratio example, find the scale
  // factor itself.
  if (reverseProblem) {
    const rA = randInt(2, 5);
    let rB = randInt(2, 8);
    if (rB === rA) rB += 1;
    const rScale = randInt(2, maxScale);
    const rKnownIsA = Math.random() > 0.5;
    const rKnownVal = (rKnownIsA ? rA : rB) * rScale;
    const rCorrect = (rKnownIsA ? rB : rA) * rScale;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Nisbah kucing kepada anjing di sebuah kedai haiwan ialah ${rA}:${rB}. Terdapat ${rKnownVal} ekor ${rKnownIsA ? "kucing" : "anjing"} dan ${rCorrect} ekor ${rKnownIsA ? "anjing" : "kucing"}. Berapakah faktor skala yang digunakan?`,
        en: `The ratio of cats to dogs in a pet shop is ${rA}:${rB}. There are ${rKnownVal} ${rKnownIsA ? "cats" : "dogs"} and ${rCorrect} ${rKnownIsA ? "dogs" : "cats"}. What scale factor was used?`,
      },
      type: "word_problem",
      correctAnswer: String(rScale),
      context: { a: rA, b: rB, scale: rScale, knownVal: rKnownVal, correct: rCorrect },
      generatorKey: "proportion",
      difficulty: 3,
    };
    // Classic mistake: gave the known quantity itself instead of the scale factor.
    const gaveKnownVal = rKnownVal;
    // Classic mistake: gave the other ratio number instead of the scale factor.
    const gaveRatioNumber = rKnownIsA ? rB : rA;
    const distractors = Array.from(
      new Set([gaveKnownVal, gaveRatioNumber].map(String).filter((d) => d !== String(rScale)))
    );
    question.options = shuffleOptions(String(rScale), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, rScale + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const a = randInt(2, 5);
  let b = randInt(2, 8);
  if (b === a) b += 1;
  const scale = randInt(2, maxScale);
  const knownIsA = Math.random() > 0.5;

  const knownVal = (knownIsA ? a : b) * scale;
  const correct = (knownIsA ? b : a) * scale;

  // ---- errorSpotting: shown the documented "added the difference"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = knownVal + Math.abs(a - b);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Nisbah kucing kepada anjing di sebuah kedai haiwan ialah ${a}:${b}. Terdapat ${knownVal} ekor ${knownIsA ? "kucing" : "anjing"}. ${name} mengira bilangan ${knownIsA ? "anjing" : "kucing"} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `The ratio of cats to dogs in a pet shop is ${a}:${b}. There are ${knownVal} ${knownIsA ? "cats" : "dogs"}. ${name} calculated the number of ${knownIsA ? "dogs" : "cats"} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { a, b, scale, knownVal, correct, wrongAnswer },
        generatorKey: "proportion",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(1, correct + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Nisbah kucing kepada anjing di sebuah kedai haiwan ialah ${a}:${b}. Jika terdapat ${knownVal} ekor ${knownIsA ? "kucing" : "anjing"}, berapa ekor ${knownIsA ? "anjing" : "kucing"}?`,
      en: `The ratio of cats to dogs in a pet shop is ${a}:${b}. If there are ${knownVal} ${knownIsA ? "cats" : "dogs"}, how many ${knownIsA ? "dogs" : "cats"} are there?`,
    },
    type,
    correctAnswer: String(correct),
    context: { a, b, scale, knownVal, correct },
    generatorKey: "proportion",
    difficulty: 3,
  };

  if (type === "mcq" || type === "word_problem") {
    // Classic mistake: added the difference between a and b instead of
    // scaling proportionally.
    const addedDifference = knownVal + Math.abs(a - b);
    // Classic mistake: used the wrong ratio side's number as the scale factor.
    const wrongRatioSide = knownIsA ? knownVal * b : knownVal * a;
    const distractors = Array.from(
      new Set([addedDifference, wrongRatioSide].map(String).filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
