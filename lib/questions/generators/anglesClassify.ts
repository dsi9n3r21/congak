import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const TYPES = ["acute", "right", "obtuse", "reflex"] as const;
type AngleType = (typeof TYPES)[number];

function randomAngleForType(t: AngleType): number {
  switch (t) {
    case "acute":
      return randInt(10, 80);
    case "right":
      return 90;
    case "obtuse":
      return randInt(100, 170);
    case "reflex":
      return randInt(190, 350);
  }
}

const REAL_OBJECTS: Partial<Record<AngleType, { ms: string; en: string }[]>> = {
  acute: [
    { ms: "jarum jam menunjukkan pukul 2:00", en: "a clock's hands at 2:00" },
    { ms: "bucu segi tiga sama sisi", en: "the corner of an equilateral triangle" },
  ],
  right: [
    { ms: "sudut sehelai kertas", en: "the corner of a sheet of paper" },
    { ms: "sudut dinding dan lantai bilik", en: "where a wall meets the floor" },
  ],
  obtuse: [
    { ms: "jarum jam menunjukkan pukul 4:00", en: "a clock's hands at 4:00" },
    { ms: "penutup buku yang dibuka separuh luas", en: "a book cover opened wider than halfway" },
  ],
  reflex: [
    { ms: "pintu yang dibuka sepenuhnya melepasi dinding", en: "a door swung fully open, past the wall" },
    { ms: "jarum jam menunjukkan pukul 4:50", en: "a clock's hands at 4:50" },
  ],
};

function classifyDegrees(d: number): AngleType {
  if (d === 90) return "right";
  if (d < 90) return "acute";
  if (d < 180) return "obtuse";
  return "reflex";
}

// Year 4 KSSR "Types of Angles" — classify a diagrammed angle as acute,
// right, obtuse, or reflex. Retrofitted per the Round 19 content standard:
// added a real-object word_problem framing (same diagram, Malaysian-
// relevant context) and an errorSpotting variant targeting the most
// common documented mistake (mistaking a near-90° obtuse angle for a
// right angle). No reverseProblem — there's no numeric reverse for pure
// visual classification without introducing Y5/6 angle-arithmetic
// content, same reasoning as line_pair_classify.ts.
export function generateAnglesClassify(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): two angles lie on a straight
  // line — given the FIRST angle's exact degree, classify the TYPE of
  // the SECOND angle. Text-based, no diagram needed (same approach as
  // coordinate_distance/coordinates). Genuine second hop past the base
  // skill and errorSpotting (both only ever classify a directly-shown
  // angle): (1) subtract the given angle from 180° to find the second
  // angle's degree, THEN (2) classify THAT result's type.
  if (challenge) {
    const angleA = randInt(10, 170);
    const angleB = 180 - angleA;
    const correctType = classifyDegrees(angleB);
    const typeOfA = classifyDegrees(angleA);
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Dua sudut berada pada satu garis lurus. Sudut pertama ialah ${angleA}°. ${name} ingin tahu APAKAH JENIS sudut kedua itu (bukan saiznya). Apakah jenis sudut kedua?`,
        en: `Two angles lie on a straight line. The first angle is ${angleA}°. ${name} wants to know the TYPE of the second angle (not its size). What type is the second angle?`,
      },
      type: "word_problem",
      correctAnswer: correctType,
      context: { angleA, angleB, correctType, typeOfA },
      generatorKey: "angles_classify",
      difficulty: 3,
    };
    // Classic non-routine mistake: classifies the FIRST angle (the one
    // given) instead of subtracting first to find the second angle.
    const distractors = Array.from(new Set([typeOfA, ...TYPES.filter((t) => t !== "reflex")])).filter(
      (d) => d !== correctType
    );
    question.options = shuffleOptions(correctType, distractors.slice(0, 2));
    return question;
  }

  // ---- errorSpotting: an obtuse angle close to 90° is shown alongside a
  // claim that it's a right angle — the single most common angle-
  // classification mistake — must give the correct type.
  if (errorSpotting) {
    const degrees = randInt(95, 110);
    const otherTypes = TYPES.filter((t) => t !== "obtuse" && t !== "right");
    return {
      prompt: {
        ms: `Ali berkata rajah ini menunjukkan sudut tegak. Apakah jenis sudut yang betul?`,
        en: `Ali says this diagram shows a right angle. What is the correct angle type?`,
      },
      type: "mcq",
      correctAnswer: "obtuse",
      context: { degrees, correctType: "obtuse" },
      generatorKey: "angles_classify",
      difficulty: 3,
      diagram: { kind: "angle", degrees },
      options: shuffleOptions("obtuse", ["right", pick(otherTypes)]),
    };
  }

  const correctType = TYPES[randInt(0, TYPES.length - 1)];
  const degrees = randomAngleForType(correctType);

  // ---- word_problem: same diagram, framed around a real object.
  if (type === "word_problem") {
    const objects = REAL_OBJECTS[correctType]!;
    const object = pick(objects);
    return {
      prompt: {
        ms: `Rajah di bawah mewakili ${object.ms}. Apakah jenis sudut ini?`,
        en: `The diagram below represents ${object.en}. What type of angle is this?`,
      },
      type: "word_problem",
      correctAnswer: correctType,
      context: { degrees, correctType },
      generatorKey: "angles_classify",
      difficulty: 2,
      diagram: { kind: "angle", degrees },
      options: shuffleOptions(correctType, TYPES.filter((t) => t !== correctType)),
    };
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: "Apakah jenis sudut yang ditunjukkan dalam rajah?",
      en: "What type of angle is shown in the diagram?",
    },
    type: "mcq",
    correctAnswer: correctType,
    context: { degrees, correctType },
    generatorKey: "angles_classify",
    difficulty: 1,
    diagram: { kind: "angle", degrees },
  };

  // All four category names are always the option set — there's no
  // numeric distractor logic here, the "wrong answer" IS one of the other
  // three real categories, which is exactly what tests understanding.
  question.options = shuffleOptions(correctType, TYPES.filter((t) => t !== correctType));

  return question;
}
