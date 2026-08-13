import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 5 KSSR "Angles on a Straight Line" — two angles along one straight
// line always sum to 180°.
//
// Retrofitted per the Round 19 content standard: added a real leaning-
// stick word_problem (matches this topic's explanation text),
// errorSpotting (the documented "confused with complementary angles"
// mistake), and a reverseProblem that's a genuinely different skill —
// given the DIFFERENCE between the two angles (not either angle
// directly), find both. That's a small simultaneous-equation step
// (a+b=180, a−b=diff), appropriately harder than the base skill rather
// than just relabelling the same subtraction.
export function generateAnglesStraightLine(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): a genuine second hop past
  // reverseProblem — THREE angles on a straight line instead of two. The
  // first angle is given directly; the second is a multiple of the third.
  // Solving requires (1) subtracting the given angle from 180° to get the
  // combined remaining total, THEN (2) splitting that total by the ratio
  // to isolate the smaller angle — reverseProblem only ever required step
  // (1) with a difference, never a ratio split on top of it.
  if (challenge) {
    const multiple = randInt(2, 3);
    const smallest = randInt(10, 30);
    const middle = multiple * smallest;
    const angleA = 180 - middle - smallest;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Tiga sudut berada pada satu garis lurus. Sudut pertama ialah ${angleA}°. Sudut kedua ialah ${multiple} kali ganda sudut ketiga. Cari sudut ketiga (yang paling kecil).`,
        en: `Three angles lie on one straight line. The first angle is ${angleA}°. The second angle is ${multiple} times the third angle. Find the third (smallest) angle.`,
      },
      type: "word_problem",
      correctAnswer: String(smallest),
      context: { angleA, multiple, smallest, middle, remaining: middle + smallest },
      generatorKey: "angles_straight_line",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after the first hop and gives
    // the combined remaining total (middle + smallest) instead of
    // splitting it by the ratio.
    const stoppedAtRemaining = String(middle + smallest);
    // Classic non-routine mistake: splits the remaining total evenly,
    // ignoring the "times as many" relationship.
    const splitEvenly = String(Math.round((middle + smallest) / 2));
    const distractors = Array.from(new Set([stoppedAtRemaining, splitEvenly])).filter((d) => d !== String(smallest));
    question.options = shuffleOptions(String(smallest), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, smallest + randInt(1, 9)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the difference between the two angles,
  // find the smaller one — a small simultaneous-equation step.
  if (reverseProblem) {
    const smaller = randInt(20, 70);
    const larger = 180 - smaller;
    const diff = larger - smaller; // always >= 40 given the 20-70 range, never degenerate
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Dua sudut berada pada garis lurus. Beza antara kedua-dua sudut itu ialah ${diff}°. Cari sudut yang LEBIH KECIL.`,
        en: `Two angles lie on a straight line. The difference between the two angles is ${diff}°. Find the SMALLER angle.`,
      },
      type: "word_problem",
      correctAnswer: String(smaller),
      context: { smaller, larger, diff },
      generatorKey: "angles_straight_line",
      difficulty: 3,
    };
    // Classic mistake: gave the difference itself as the answer.
    const gaveDifference = diff;
    // Classic mistake: halved 180 without accounting for the difference (assumed both angles equal).
    const halvedWithoutDiff = 90;
    const distractors = Array.from(new Set([String(gaveDifference), String(halvedWithoutDiff)])).filter(
      (d) => d !== String(smaller)
    );
    question.options = shuffleOptions(String(smaller), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, smaller + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // Keep the given angle away from the extremes so the answer is never
  // trivially 0 or 180.
  const angleA = randInt(20, 160);
  const correct = 180 - angleA;

  // ---- errorSpotting: shown the documented "confused with complementary
  // angles" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = Math.abs(90 - angleA);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Dua sudut berada pada garis lurus. Satu sudut ialah ${angleA}°. ${name} mengira sudut satu lagi dan mendapat ${wrongAnswer}°. Apakah jawapan yang betul?`,
          en: `Two angles lie on a straight line. One angle is ${angleA}°. ${name} calculated the other angle and got ${wrongAnswer}°. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { angleA, correct, wrongAnswer },
        generatorKey: "angles_straight_line",
        difficulty: 2,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 9));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: leaning-stick scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} menyandarkan sebatang kayu pada dinding, membentuk dua sudut pada garis lurus lantai. Satu sudut ialah ${angleA}°. Berapakah sudut satu lagi?`,
        en: `${name} leans a stick against a wall, forming two angles along the straight line of the floor. One angle is ${angleA}°. What is the other angle?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { angleA, correct },
      generatorKey: "angles_straight_line",
      difficulty: 2,
    };
    const complementaryConfusion = Math.abs(90 - angleA);
    const noOperation = angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(complementaryConfusion), String(noOperation)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Dua sudut berada pada garis lurus. Satu sudut ialah ${angleA}°. Cari sudut satu lagi.`,
      en: `Two angles lie on a straight line. One angle is ${angleA}°. Find the other angle.`,
    },
    type,
    correctAnswer: String(correct),
    context: { angleA, correct },
    generatorKey: "angles_straight_line",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: confusing "angles on a straight line" (180°) with
    // complementary angles (90°) and subtracting from 90 instead.
    const complementaryConfusion = Math.abs(90 - angleA);
    // Classic mistake: no operation performed — just restating the given angle.
    const noOperation = angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(complementaryConfusion), String(noOperation)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
