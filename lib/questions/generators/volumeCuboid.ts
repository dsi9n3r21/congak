import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Volume" (Space, real ToC p.209) — basic solid volume via
// length × width × height. This didn't exist anywhere in Congak before
// (only liquid volume in ml/L existed) despite being a prerequisite for
// the Y5 "Volume of Composite Shapes" sub-topic.
export function generateVolumeCuboid(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 2);
  const max = Number(params.max ?? 10);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const length = randInt(min, max);
  const width = randInt(min, max);
  const height = randInt(min, max);
  const correct = length * width * height;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah kubus berbentuk kuboid mempunyai panjang ${length} cm, lebar ${width} cm, dan tinggi ${height} cm. Berapakah isi padu kuboid itu?`,
      en: `A cuboid has a length of ${length} cm, a width of ${width} cm, and a height of ${height} cm. What is the volume of the cuboid?`,
    },
    type,
    correctAnswer: String(correct),
    context: { length, width, height, correct },
    generatorKey: "volume_cuboid",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: only multiplied two of the three dimensions (treated it like area).
    const onlyTwoDims = length * width;
    // Classic mistake: added the three dimensions instead of multiplying.
    const addedInstead = length + width + height;
    const distractors = Array.from(new Set([String(onlyTwoDims), String(addedInstead)])).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 20));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
