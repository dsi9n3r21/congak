import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

export function generateFractionsSameDenominator(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [4, 5, 6, 8, 10];
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const denom = pick(denominators);
  // Keep each addend, and their sum, below the denominator so the result
  // stays a proper fraction — matches what Year 4 KSSR expects at this stage.
  const numA = randInt(1, denom - 2);
  const numB = randInt(1, denom - numA - 1 > 0 ? denom - numA - 1 : 1);
  const correctNum = numA + numB;

  const equation = `${numA}/${denom} + ${numB}/${denom} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: `${correctNum}/${denom}`,
    context: { numA, numB, denom, correctNum },
    generatorKey: "fractions_same_denominator",
    difficulty: denom > 8 ? 2 : 1,
  };

  if (type === "mcq") {
    // The classic mistake: adding denominators too.
    const denominatorAdditionError = `${correctNum}/${denom * 2}`;
    // Second distractor: correct numerator, but denominator left as one addend's original.
    const partialDistractor = `${numA}/${denom}`;
    question.options = shuffleOptions(
      question.correctAnswer,
      [denominatorAdditionError, partialDistractor].filter((d) => d !== question.correctAnswer)
    );
  }

  return question;
}
