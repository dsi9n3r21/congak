import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/**
 * KSSR Y6 "operasi bergabung" (combined operations, no brackets): the
 * student must do multiplication before addition. Pattern is fixed to
 * "a + b × c" so the mistake — doing the operations strictly left to
 * right — is unambiguous to detect and to explain.
 *
 * Retrofitted per the Round 19 content standard: added a real pocket-money
 * word_problem (matches this topic's explanation text), errorSpotting, and
 * reverseProblem.
 */
export function generateMixedOperations(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10);
  const max = Number(params.max ?? 80);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  const a = randInt(min, max);
  const b = randInt(2, 9);
  const c = randInt(min, max);
  const correct = a + b * c;

  // ---- reverseProblem: given the final total and b, c, find the starting
  // amount a — the student must still multiply b × c first, then subtract
  // that from the total.
  if (reverseProblem) {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} ada wang RM${correct} kesemuanya, selepas ibunya beri ${b} keping not RM${c}. Berapakah wang ${name} pada mulanya?`,
        en: `${name} has RM${correct} in total, after their mother gave them ${b} pieces of RM${c} notes. How much money did ${name} have at first?`,
      },
      type: "word_problem",
      correctAnswer: String(a),
      context: { a, b, c, correct },
      generatorKey: "mixed_operations",
      difficulty: 3,
    };
    // Classic mistake: subtracted only c (not b × c) from the total.
    const subtractedOnlyC = correct - c;
    // Classic mistake: divided the total by b instead of subtracting b × c.
    const divided = Math.round(correct / b);
    const distractors = Array.from(new Set([String(subtractedOnlyC), String(divided)])).filter(
      (d) => d !== String(a)
    );
    question.options = shuffleOptions(String(a), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, a + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic left-to-right mistake, must give
  // the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const leftToRight = (a + b) * c;
    const wrongStr = String(leftToRight);
    const correctStr = String(correct);
    if (wrongStr !== correctStr) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${a} + ${b} × ${c} dari kiri ke kanan dan mendapat ${wrongStr}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${a} + ${b} × ${c} strictly left to right and got ${wrongStr}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: correctStr,
        context: { a, b, c, correct, leftToRight },
        generatorKey: "mixed_operations",
        difficulty: 3,
        options: shuffleOptions(correctStr, [wrongStr]),
      };
      // Pad to at least 3 options — errorSpotting only naturally supplies one
      // distractor (the left-to-right mistake itself).
      while (question.options!.length < 3) {
        const candidate = String(Math.max(0, correct + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: pocket-money scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} ada RM${a}, kemudian ibunya beri ${b} keping not RM${c}. Berapakah jumlah wang ${name} sekarang?`,
        en: `${name} has RM${a}, then their mother gives them ${b} pieces of RM${c} notes. How much money does ${name} have now?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, c, correct },
      generatorKey: "mixed_operations",
      difficulty: 3,
    };
    const leftToRight = (a + b) * c;
    const distractors = Array.from(new Set([String(leftToRight)])).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
    return question;
  }

  const equation = `${a} + ${b} × ${c} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, c, correct },
    generatorKey: "mixed_operations",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: working strictly left to right, i.e. (a + b) × c,
    // instead of doing the multiplication first.
    const leftToRight = (a + b) * c;
    const distractors = Array.from(new Set([String(leftToRight)].filter((d) => d !== String(correct))));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate) && Number(candidate) >= 0) question.options.push(candidate);
    }
  }

  return question;
}
