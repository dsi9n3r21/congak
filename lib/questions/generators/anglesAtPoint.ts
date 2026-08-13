import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 5 KSSR "Angles at a Point" — angles meeting at a single point
// always sum to 360°.
//
// Retrofitted per the Round 19 content standard: added a real windmill-
// blades word_problem, errorSpotting (the documented "confused with
// triangle/straight-line angle sum" mistake), and a reverseProblem that
// reframes which value is unknown — given the third angle and one of
// the other two, find the missing one (same computation as the base
// skill, different unknown, same shape as the triangle-sum reverse).
export function generateAnglesAtPoint(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): a genuine second hop past
  // reverseProblem — the base skill (and reverseProblem) always give TWO
  // of the three angles directly. Here only ONE angle is given directly;
  // the other two share a "times as many" ratio, so the student must
  // (1) subtract the given angle from 360° to get the combined
  // remainder, THEN (2) split that remainder by the ratio to isolate the
  // smallest angle — same two-hop shape as the straight-line challenge,
  // ported to the 360° point-total case.
  if (challenge) {
    const multiple = randInt(2, 3);
    const smallest = randInt(20, 60);
    const middle = multiple * smallest;
    const angleA = 360 - middle - smallest;
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Tiga sudut bertemu pada satu titik. Sudut pertama ialah ${angleA}°. Sudut kedua ialah ${multiple} kali ganda sudut ketiga. ${name} ingin cari sudut ketiga (yang paling kecil). Berapakah sudut itu?`,
        en: `Three angles meet at a point. The first angle is ${angleA}°. The second angle is ${multiple} times the third angle. ${name} wants to find the third (smallest) angle. What is that angle?`,
      },
      type: "word_problem",
      correctAnswer: String(smallest),
      context: { angleA, multiple, smallest, middle, remaining: middle + smallest },
      generatorKey: "angles_at_point",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after the first hop and gives
    // the combined remaining total instead of splitting it by the ratio.
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

  function threeAngles(): [number, number, number] {
    let angleA: number, angleB: number, correct: number;
    do {
      angleA = randInt(40, 150);
      angleB = randInt(40, 150);
      correct = 360 - angleA - angleB;
    } while (correct < 30 || correct > 280);
    return [angleA, angleB, correct];
  }

  // ---- reverseProblem: given the third angle and one of the other two,
  // find the missing angle — same computation, different unknown.
  if (reverseProblem) {
    const [angleA, angleB, angleC] = threeAngles();
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Tiga sudut bertemu pada satu titik. Satu sudut ialah ${angleA}° dan sudut ketiga ialah ${angleC}°. Cari sudut yang tinggal.`,
        en: `Three angles meet at a point. One angle is ${angleA}° and the third angle is ${angleC}°. Find the remaining angle.`,
      },
      type: "word_problem",
      correctAnswer: String(angleB),
      context: { angleA, angleB, angleC },
      generatorKey: "angles_at_point",
      difficulty: 3,
    };
    // Classic mistake: only subtracted one of the two given angles.
    const onlySubtractedOne = 360 - angleC;
    // Classic mistake: confused with the 180° angle-sum rule.
    const confusedWith180 = Math.abs(180 - angleA - angleC);
    const distractors = Array.from(new Set([String(onlySubtractedOne), String(confusedWith180)])).filter(
      (d) => d !== String(angleB)
    );
    question.options = shuffleOptions(String(angleB), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, angleB + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const [angleA, angleB, correct] = threeAngles();

  // ---- errorSpotting: shown the documented "confused with the 180°
  // rule" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = Math.abs(180 - angleA - angleB);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Tiga sudut bertemu pada satu titik. Dua sudut ialah ${angleA}° dan ${angleB}°. ${name} mengira sudut ketiga dan mendapat ${wrongAnswer}°. Apakah jawapan yang betul?`,
          en: `Three angles meet at a point. Two of the angles are ${angleA}° and ${angleB}°. ${name} calculated the third angle and got ${wrongAnswer}°. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { angleA, angleB, correct, wrongAnswer },
        generatorKey: "angles_at_point",
        difficulty: 2,
        diagram: { kind: "point3", angleA, angleB },
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 9));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: windmill-blades scenario, three sections meeting
  // at the centre.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membuat kincir angin mainan dengan 3 bilah yang bertemu pada satu titik di tengah. Dua sudut antara bilah ialah ${angleA}° dan ${angleB}°. Berapakah sudut bilah ketiga?`,
        en: `${name} builds a toy windmill with 3 blades meeting at a single point in the centre. Two of the angles between blades are ${angleA}° and ${angleB}°. What is the angle of the third blade?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { angleA, angleB, correct },
      generatorKey: "angles_at_point",
      difficulty: 2,
      diagram: { kind: "point3", angleA, angleB },
    };
    const confusedWith180 = Math.abs(180 - angleA - angleB);
    const onlySubtractedOne = 360 - angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(confusedWith180), String(onlySubtractedOne)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Tiga sudut bertemu pada satu titik. Dua sudut ialah ${angleA}° dan ${angleB}°. Cari sudut ketiga.`,
      en: `Three angles meet at a point. Two of the angles are ${angleA}° and ${angleB}°. Find the third angle.`,
    },
    type,
    correctAnswer: String(correct),
    context: { angleA, angleB, correct },
    generatorKey: "angles_at_point",
    difficulty: 2,
    diagram: { kind: "point3", angleA, angleB },
  };

  if (type === "mcq") {
    // Classic mistake: confusing "angles at a point" (360°) with the
    // "angles in a triangle" or "on a straight line" rule (180°).
    const confusedWith180 = Math.abs(180 - angleA - angleB);
    // Classic mistake: only subtracting one of the two given angles.
    const onlySubtractedOne = 360 - angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(confusedWith180), String(onlySubtractedOne)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
