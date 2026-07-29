import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Adding Fractions with the Same Denominator". Retrofitted
// per the Round 19 content standard: added word_problem/errorSpotting/
// reverseProblem variants. Deliberately keeps every sum a proper fraction
// (numerator < denominator) and never simplifies the answer — matching
// exactly what grading.ts does (exact string match, no fraction-
// equivalence check), so "simplify your answer" is never asked of the
// student since it would risk a correctly-simplified answer being marked
// wrong. Mixed numbers/improper fractions aren't introduced here for the
// same reason — this app has no existing mixed-number input/grading
// convention anywhere, and this Y4 topic's DSKP standard is same-
// denominator addition, not conversion to mixed numbers.
export function generateFractionsSameDenominator(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [4, 5, 6, 8, 10];
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  const denom = pick(denominators);
  // Keep each addend, and their sum, below the denominator so the result
  // stays a proper fraction — matches what Year 4 KSSR expects at this stage.
  const numA = randInt(1, denom - 2);
  const numB = randInt(1, denom - numA - 1 > 0 ? denom - numA - 1 : 1);
  const correctNum = numA + numB;

  // ---- reverseProblem: given the total and one addend, find the
  // missing addend (fraction subtraction, same denominator).
  if (reverseProblem) {
    const name = pick(names);
    const missing = `${numB}/${denom}`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mendapati ${numA}/${denom} + ? = ${correctNum}/${denom}. Apakah pecahan yang hilang?`,
        en: `${name} finds that ${numA}/${denom} + ? = ${correctNum}/${denom}. What is the missing fraction?`,
      },
      type: "word_problem",
      correctAnswer: missing,
      context: { numA, numB, denom, correctNum },
      generatorKey: "fractions_same_denominator",
      difficulty: 3,
    };
    // Classic mistake: added instead of subtracted (gave numA+correctNum).
    const addedInstead = `${numA + correctNum}/${denom}`;
    // Classic mistake: subtracted denominators too, giving a fraction over 0 avoided — instead gave the total itself.
    const gaveTotal = `${correctNum}/${denom}`;
    const distractors = Array.from(new Set([addedInstead, gaveTotal])).filter((d) => d !== missing);
    question.options = shuffleOptions(missing, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateNum = Math.max(1, numB + pick([-1, 1]));
      const candidate = `${candidateNum}/${denom}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "added denominators too"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const correct = `${correctNum}/${denom}`;
    const wrong = `${correctNum}/${denom * 2}`;
    return {
      prompt: {
        ms: `${name} mengira ${numA}/${denom} + ${numB}/${denom} dan mendapat ${wrong}. Apakah jawapan yang betul?`,
        en: `${name} calculated ${numA}/${denom} + ${numB}/${denom} and got ${wrong}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: correct,
      context: { numA, numB, denom, correctNum },
      generatorKey: "fractions_same_denominator",
      difficulty: 3,
      options: shuffleOptions(correct, [wrong, `${numA}/${denom}`].filter((d) => d !== correct)),
    };
  }

  // ---- word_problem: Malaysian context with the same underlying sum.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(["kuih raya", "roti canai", "air dalam jag"]);
    const itemEn = { "kuih raya": "Raya cookies", "roti canai": "roti canai", "air dalam jag": "water in a jug" }[item];
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} makan ${numA}/${denom} bahagian ${item} pada waktu pagi, dan ${numB}/${denom} bahagian lagi pada waktu petang. Berapakah jumlah bahagian ${item} yang dimakan?`,
        en: `${name} eats ${numA}/${denom} of the ${itemEn} in the morning, and another ${numB}/${denom} in the evening. What fraction of the ${itemEn} was eaten in total?`,
      },
      type: "word_problem",
      correctAnswer: `${correctNum}/${denom}`,
      context: { numA, numB, denom, correctNum },
      generatorKey: "fractions_same_denominator",
      difficulty: 2,
    };
    const denominatorAdditionError = `${correctNum}/${denom * 2}`;
    const partialDistractor = `${numA}/${denom}`;
    question.options = shuffleOptions(question.correctAnswer, [denominatorAdditionError, partialDistractor].filter((d) => d !== question.correctAnswer));
    return question;
  }

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
