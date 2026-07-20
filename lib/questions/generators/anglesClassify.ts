import { randInt, shuffleOptions } from "../utils";
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

export function generateAnglesClassify(_params: GeneratorParams): GeneratedQuestion {
  const correctType = TYPES[randInt(0, TYPES.length - 1)];
  const degrees = randomAngleForType(correctType);

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
