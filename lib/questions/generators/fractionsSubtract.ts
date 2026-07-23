import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateFractionsSubtractSameDenominator(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [4, 5, 6, 8, 10];
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const denom = pick(denominators);
  // numA is the larger fraction we start from; numB is what's taken away —
  // keep numB < numA so the result stays positive, matching Year 4 level.
  const numA = randInt(2, denom - 1);
  const numB = randInt(1, numA - 1);
  const correctNum = numA - numB;

  const equation = `${numA}/${denom} − ${numB}/${denom} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: `${correctNum}/${denom}`,
    context: { numA, numB, denom, correctNum },
    generatorKey: "fractions_subtract_same_denominator",
    difficulty: denom > 8 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: added instead of subtracted.
    const addedInstead = `${numA + numB}/${denom}`;
    // Classic mistake: subtracted the denominators too, instead of keeping
    // it fixed.
    const subtractedDenomToo = `${correctNum}/${Math.max(denom - numB, 1)}`;
    const distractors = [addedInstead, subtractedDenomToo].filter((d) => d !== question.correctAnswer);
    question.options = shuffleOptions(question.correctAnswer, distractors);
  }

  return question;
}
