import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 5 KSSR "Volume of Composite Shapes" (Space, real ToC p.217-224).
// Same "two rectangular solids joined together, sum the volumes" pattern
// as the existing area_composite generator — just one dimension deeper.
export function generateVolumeComposite(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const min = Number(params.min ?? 2);
  const max = Number(params.max ?? 8);

  const l1 = randInt(min, max);
  const w1 = randInt(min, max);
  const h1 = randInt(min, max);
  const l2 = randInt(min, max);
  const w2 = randInt(min, max);
  const h2 = randInt(min, max);

  const volume1 = l1 * w1 * h1;
  const volume2 = l2 * w2 * h2;
  const correct = volume1 + volume2;

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah bentuk gubahan terdiri daripada dua kuboid: Kuboid A (${l1} cm × ${w1} cm × ${h1} cm) dan Kuboid B (${l2} cm × ${w2} cm × ${h2} cm). Cari jumlah isi padu bentuk itu.`,
      en: `A composite shape is made of two cuboids: Cuboid A (${l1} cm × ${w1} cm × ${h1} cm) and Cuboid B (${l2} cm × ${w2} cm × ${h2} cm). Find the total volume of the shape.`,
    },
    type,
    correctAnswer: String(correct),
    context: { l1, w1, h1, l2, w2, h2, volume1, volume2, correct },
    generatorKey: "volume_composite",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: only calculated one of the two cuboids.
    const onlyFirstCuboid = volume1;
    // Classic mistake: multiplied only two dimensions per cuboid (treated it like area) then added.
    const treatedAsArea = l1 * w1 + l2 * w2;
    const distractors = Array.from(
      new Set([String(onlyFirstCuboid), String(treatedAsArea)])
    ).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(5, 40));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
