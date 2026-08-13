import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Sum of Angles in a Triangle" — the three angles in any
// triangle always add up to 180°.
//
// Retrofitted per the Round 19 content standard: the `word_problem` type
// was already declared in the type union but the prompt never actually
// branched on it AND options were only ever built `if (type === "mcq")`
// — so any word_problem template configured for this topic had been
// rendering with no scenario and no answer choices, same bug family
// caught repeatedly this round. Fixed with a real triangular-card
// word_problem (matches this topic's explanation text), errorSpotting,
// and a reverseProblem that reframes which value is unknown — given the
// third angle and one of the other two, find the missing one.
export function generateAnglesTriangleSum(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): an isosceles triangle — given only
  // the apex angle, find EACH of the two equal base angles. A genuine
  // second hop past reverseProblem: (1) subtract the apex from 180° to
  // get the combined base-angle total, THEN (2) divide that total by 2
  // since the base angles are equal — reverseProblem only ever needed
  // step (1) alone.
  if (challenge) {
    const baseAngle = randInt(10, 79);
    const apex = 180 - 2 * baseAngle;
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah segi tiga sama kaki mempunyai sudut puncak ${apex}°. Kedua-dua sudut tapaknya adalah sama besar. ${name} ingin tahu saiz SETIAP sudut tapak. Berapakah saiz setiap satu?`,
        en: `An isosceles triangle has an apex angle of ${apex}°. Its two base angles are equal in size. ${name} wants to know the size of EACH base angle. What is the size of each one?`,
      },
      type: "word_problem",
      correctAnswer: String(baseAngle),
      context: { apex, baseAngle, combinedBase: 180 - apex },
      generatorKey: "angles_triangle_sum",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after the first hop and gives
    // the combined base-angle total instead of dividing it by 2.
    const stoppedAtCombined = String(180 - apex);
    // Classic mistake: confuses the triangle sum with angles at a point
    // (360°) before halving.
    const confusedWith360 = String(Math.round((360 - apex) / 2));
    const distractors = Array.from(new Set([stoppedAtCombined, confusedWith360])).filter(
      (d) => d !== String(baseAngle)
    );
    question.options = shuffleOptions(String(baseAngle), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, baseAngle + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the third angle and one of the other two,
  // find the missing angle — same computation, different unknown.
  if (reverseProblem) {
    const angleA = randInt(20, 90);
    const angleB = randInt(20, 90);
    const angleC = 180 - angleA - angleB;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Dalam sebuah segi tiga, satu sudut ialah ${angleA}° dan sudut ketiga ialah ${angleC}°. Cari sudut yang tinggal.`,
        en: `In a triangle, one angle is ${angleA}° and the third angle is ${angleC}°. Find the remaining angle.`,
      },
      type: "word_problem",
      correctAnswer: String(angleB),
      context: { angleA, angleB, angleC },
      generatorKey: "angles_triangle_sum",
      difficulty: 3,
    };
    // Classic mistake: only subtracted one of the two given angles.
    const onlySubtractedOne = 180 - angleC;
    // Classic mistake: confused with angles at a point (360°).
    const confusedWith360 = 360 - angleA - angleC;
    const distractors = Array.from(new Set([String(onlySubtractedOne), String(confusedWith360)])).filter(
      (d) => d !== String(angleB)
    );
    question.options = shuffleOptions(String(angleB), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, angleB + randInt(1, 9) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // Angles in a triangle always sum to 180°. Keep both given angles small
  // enough that the third angle is always a sensible positive value.
  const angleA = randInt(20, 90);
  const angleB = randInt(20, 90);
  const correct = 180 - angleA - angleB;

  // ---- errorSpotting: shown the documented "confused with angles at a
  // point" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = 360 - angleA - angleB;
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Dalam sebuah segi tiga, dua daripada sudutnya ialah ${angleA}° dan ${angleB}°. ${name} mengira sudut ketiga dan mendapat ${wrongAnswer}°. Apakah jawapan yang betul?`,
          en: `In a triangle, two of the angles are ${angleA}° and ${angleB}°. ${name} calculated the third angle and got ${wrongAnswer}°. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { angleA, angleB, correct, wrongAnswer },
        generatorKey: "angles_triangle_sum",
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

  // ---- word_problem: triangular-card scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mempunyai sekeping kad berbentuk segi tiga dengan dua sudut ${angleA}° dan ${angleB}°. Berapakah sudut ketiga?`,
        en: `${name} has a triangular card with two angles of ${angleA}° and ${angleB}°. What is the third angle?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { angleA, angleB, correct },
      generatorKey: "angles_triangle_sum",
      difficulty: 2,
    };
    const confusedWith360 = 360 - angleA - angleB;
    const onlySubtractedOne = 180 - angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(confusedWith360), String(onlySubtractedOne)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Dalam sebuah segi tiga, dua daripada sudutnya ialah ${angleA}° dan ${angleB}°. Cari sudut ketiga.`,
      en: `In a triangle, two of the angles are ${angleA}° and ${angleB}°. Find the third angle.`,
    },
    type,
    correctAnswer: String(correct),
    context: { angleA, angleB, correct },
    generatorKey: "angles_triangle_sum",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: confusing the triangle angle sum (180°) with angles
    // at a point (360°).
    const confusedWith360 = 360 - angleA - angleB;
    // Classic mistake: only subtracting one of the two given angles.
    const onlySubtractedOne = 180 - angleA;
    question.options = shuffleOptions(
      String(correct),
      Array.from(new Set([String(confusedWith360), String(onlySubtractedOne)])).filter((d) => d !== String(correct))
    );
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 9));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
