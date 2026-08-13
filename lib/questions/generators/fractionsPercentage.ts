import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Convert Fractions and Percentages" — restricted to
// denominators that divide evenly into 100, so the percentage is always a
// clean whole number (matches how this is introduced at Y4 level).
// Retrofitted per the Round 19 content standard: added a real cookies-
// eaten word_problem (matches this topic's explanation text), errorSpotting,
// and a reverseProblem variant that asks for the scale factor itself
// (the number the denominator was multiplied by to reach 100) — the
// natural "reverse" of applying the scale is recalling/deriving it,
// same idea as unit_convert's reverseProblem.
export function generateFractionsPercentageConvert(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 4, 5, 10, 20, 25, 50];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["kuih", "biskut", "epal", "pensel"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    kuih: "cookies",
    biskut: "biscuits",
    epal: "apples",
    pensel: "pencils",
  };

  function gcdOf(a: number, b: number): number {
    return b === 0 ? a : gcdOf(b, a % b);
  }

  // ---- challenge (TP6 / non-routine): the fraction is given UNSIMPLIFIED
  // (e.g. 6/24 instead of 1/4), with a denominator that does NOT divide
  // evenly into 100 — so the taught "scale the denominator to 100" method
  // can't be applied directly. Genuine second hop past the base skill:
  // (1) simplify the fraction to lowest terms first, THEN (2) apply the
  // usual scale-to-100 method on the simplified fraction.
  if (challenge) {
    const d = pick(denominators);
    let n = randInt(1, d - 1);
    while (gcdOf(n, d) !== 1) n = randInt(1, d - 1);
    const k = pick([2, 3]);
    const bigNum = n * k;
    const bigDenom = d * k;
    const pct = (n / d) * 100;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Tukar ${bigNum}/${bigDenom} kepada peratus. (Petua: permudahkan pecahan itu dahulu.)`,
        en: `Convert ${bigNum}/${bigDenom} to a percentage. (Hint: simplify the fraction first.)`,
      },
      type: "word_problem",
      correctAnswer: String(pct),
      context: { bigNum, bigDenom, n, denom: d, pct, k },
      generatorKey: "fractions_percentage_convert",
      difficulty: 3,
    };
    // Classic non-routine mistake: doesn't simplify first, tries to scale
    // the unsimplified denominator to 100 using a rounded (wrong) factor.
    const roundedScale = Math.round(100 / bigDenom) || 1;
    const wrongScaleUnsimplified = bigNum * roundedScale;
    // Classic mistake: uses the unsimplified numerator directly as the
    // percentage, ignoring the denominator entirely.
    const usedNumeratorDirectly = bigNum;
    const distractors = Array.from(
      new Set([wrongScaleUnsimplified, usedNumeratorDirectly].map(String).filter((dd) => dd !== String(pct) && Number(dd) >= 0))
    );
    question.options = shuffleOptions(String(pct), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, pct + randInt(1, 10) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const denom = pick(denominators);
  const num = randInt(1, denom - 1);
  const pct = (num / denom) * 100;
  const fractionToPct = Math.random() > 0.5;

  // ---- reverseProblem: given a worked fraction-to-percent example, find
  // the scale factor itself (the number the denominator was multiplied
  // by to reach 100).
  if (reverseProblem) {
    const rDenom = pick(denominators);
    const rNum = randInt(1, rDenom - 1);
    const rPct = (rNum / rDenom) * 100;
    const scaleFactor = 100 / rDenom;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${rNum}/${rDenom} = ${rPct}%. Berapakah faktor yang digunakan untuk menukar penyebut ${rDenom} kepada 100?`,
        en: `${rNum}/${rDenom} = ${rPct}%. What number was the denominator ${rDenom} multiplied by to reach 100?`,
      },
      type: "word_problem",
      correctAnswer: String(scaleFactor),
      context: { num: rNum, denom: rDenom, pct: rPct, scaleFactor },
      generatorKey: "fractions_percentage_convert",
      difficulty: 3,
    };
    // Classic mistake: gave the numerator instead of the scale factor.
    const gaveNumerator = rNum;
    // Classic mistake: gave the percentage itself instead of the scale factor.
    const gavePercentage = rPct;
    const distractors = Array.from(
      new Set([String(gaveNumerator), String(gavePercentage)].filter((d) => d !== String(scaleFactor)))
    );
    question.options = shuffleOptions(String(scaleFactor), distractors.slice(0, 2));
    while (question.options!.length < 3) {
      const candidate = String(Math.max(1, scaleFactor + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options!.includes(candidate)) question.options!.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "used the numerator directly as
  // the percentage" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = num;
    const correctStr = String(pct);
    if (String(wrongAnswer) !== correctStr) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} menukar ${num}/${denom} kepada peratus dan mendapat ${wrongAnswer}%. Apakah jawapan yang betul?`,
          en: `${name} converted ${num}/${denom} to a percentage and got ${wrongAnswer}%. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: correctStr,
        context: { num, denom, pct, wrongAnswer },
        generatorKey: "fractions_percentage_convert",
        difficulty: 3,
        options: shuffleOptions(correctStr, [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(0, pct + randInt(1, 10) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: items-eaten scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${num} daripada ${denom} biji ${item} dalam bekas ${name} telah dimakan. Berapa peratus ${item} yang telah dimakan?`,
        en: `${num} out of ${denom} ${itemsEn[item]} in ${name}'s container have been eaten. What percentage of the ${itemsEn[item]} have been eaten?`,
      },
      type: "word_problem",
      correctAnswer: String(pct),
      context: { num, denom, pct },
      generatorKey: "fractions_percentage_convert",
      difficulty: 2,
    };
    const usedNumeratorDirectly = num;
    const wrongScale = num * 10;
    const distractors = Array.from(
      new Set([usedNumeratorDirectly, wrongScale].map(String).filter((d) => d !== String(pct) && Number(d) >= 0))
    );
    question.options = shuffleOptions(String(pct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, pct + randInt(1, 10) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: fractionToPct
      ? { ms: `${num}/${denom} = ?%`, en: `${num}/${denom} = ?%` }
      : { ms: `${pct}% = ?/${denom}`, en: `${pct}% = ?/${denom}` },
    type,
    correctAnswer: fractionToPct ? String(pct) : String(num),
    context: { num, denom, pct, fractionToPct: fractionToPct ? "yes" : "no" },
    generatorKey: "fractions_percentage_convert",
    difficulty: 2,
  };

  if (type === "mcq") {
    const correct = fractionToPct ? pct : num;
    // Classic mistake: treating the numerator as the percentage directly,
    // ignoring the denominator entirely.
    const usedNumeratorDirectly = fractionToPct ? num : Math.round((pct / 100) * denom);
    // Classic mistake: using the wrong scale factor (100/denom).
    const wrongScale = fractionToPct ? num * 10 : Math.round(pct / 10);
    const distractors = Array.from(
      new Set([usedNumeratorDirectly, wrongScale].map(String).filter((d) => d !== String(correct) && Number(d) >= 0))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 10) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
