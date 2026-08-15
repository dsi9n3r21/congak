import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

/**
 * KSSR Y6 "operasi bergabung" (combined operations, no brackets). The real
 * textbook topic ("Operasi Bergabung Tanpa Kurungan") covers SIX operand
 * pairs, not just one:
 *   - add_subtract       a − b + c   (equal precedence — strict left to right)
 *   - multiply_divide    a ÷ b × c   (equal precedence — strict left to right)
 *   - add_multiply       a + b × c   (× before +)          [original pattern]
 *   - subtract_multiply  a − b × c   (× before −)
 *   - add_divide         a + b ÷ c   (÷ before +)
 *   - subtract_divide    a − b ÷ c   (÷ before −)
 *
 * `params.pattern` selects which one; defaults to "add_multiply" to keep
 * existing content/config working unchanged.
 *
 * Every pattern computes both the correct (KSSR-rule) answer and the
 * classic wrong answer a student gets by mis-applying order of operations:
 *   - for the two equal-precedence patterns, the trap is WRONGLY grouping
 *     the last two operands as if one had higher precedence (kids
 *     over-applying the "do × ÷ first" rule where it doesn't belong)
 *   - for the four mixed-precedence patterns, the trap is doing it
 *     strictly left to right instead of × ÷ first
 * Both values are stored in `context` (`correct`, `wrong`) so
 * lib/mistakes/classify.ts can detect the mistake generically across all
 * six patterns instead of re-deriving the formula per pattern.
 */

type Pattern =
  | "add_subtract"
  | "multiply_divide"
  | "add_multiply"
  | "subtract_multiply"
  | "add_divide"
  | "subtract_divide";

interface Operands {
  a: number;
  b: number;
  c: number;
  correct: number;
  wrong: number;
}

const OP_SYMBOL: Record<Pattern, [string, string]> = {
  add_subtract: ["+", "\u2212"],
  multiply_divide: ["\u00f7", "\u00d7"],
  add_multiply: ["+", "\u00d7"],
  subtract_multiply: ["\u2212", "\u00d7"],
  add_divide: ["+", "\u00f7"],
  subtract_divide: ["\u2212", "\u00f7"],
};

function buildOperands(pattern: Pattern, min: number, max: number): Operands {
  switch (pattern) {
    case "add_subtract": {
      // a − b + c, done strictly left to right. Trap: grouping b+c first,
      // i.e. a − (b + c), as if + had to happen before −.
      const b = randInt(2, Math.max(3, Math.floor(max / 4)));
      const c = randInt(2, Math.max(3, Math.floor(max / 4)));
      const a = randInt(Math.max(min, b), max);
      const correct = a - b + c;
      const wrong = a - (b + c);
      return { a, b, c, correct, wrong };
    }
    case "multiply_divide": {
      // a ÷ b × c, done strictly left to right. Trap: grouping b×c first,
      // i.e. a ÷ (b × c), as if × had to happen before ÷.
      const b = randInt(2, 9);
      const c = randInt(2, 9);
      const n = randInt(2, 9);
      const a = b * c * n; // guarantees both a÷b and a÷(b×c) are exact
      const correct = (a / b) * c;
      const wrong = a / (b * c);
      return { a, b, c, correct, wrong };
    }
    case "add_multiply": {
      const a = randInt(min, max);
      const b = randInt(2, 9);
      const c = randInt(min, max);
      const correct = a + b * c;
      const wrong = (a + b) * c;
      return { a, b, c, correct, wrong };
    }
    case "subtract_multiply": {
      const b = randInt(2, 9);
      const c = randInt(2, 9);
      const bc = b * c;
      const a = randInt(bc + Math.max(2, Math.floor(min / 2)), bc + max);
      const correct = a - b * c;
      const wrong = (a - b) * c;
      return { a, b, c, correct, wrong };
    }
    case "add_divide": {
      const c = randInt(2, 9);
      const k = randInt(2, 9);
      const m = randInt(Math.max(2, Math.floor(min / c) || 2), Math.max(3, Math.floor(max / c)));
      const a = c * m;
      const b = c * k;
      const correct = a + k;
      const wrong = m + k;
      return { a, b, c, correct, wrong };
    }
    case "subtract_divide": {
      const c = randInt(2, 9);
      const k = randInt(2, 8);
      const m = randInt(k + 2, Math.max(k + 3, Math.floor(max / c)));
      const a = c * m;
      const b = c * k;
      const correct = a - k;
      const wrong = m - k;
      return { a, b, c, correct, wrong };
    }
  }
}

function equationStr(pattern: Pattern, o: Operands): string {
  const [sym1, sym2] = OP_SYMBOL[pattern];
  return `${o.a} ${sym1} ${o.b} ${sym2} ${o.c} = ?`;
}

function wordProblem(pattern: Pattern, name: string, o: Operands): { ms: string; en: string } {
  const { a, b, c } = o;
  switch (pattern) {
    case "add_subtract":
      return {
        ms: `${name} ada RM${a}. ${name} membeli snek dengan RM${b}, kemudian bapanya beri RM${c}. Berapakah wang ${name} sekarang?`,
        en: `${name} has RM${a}. ${name} spends RM${b} on snacks, then their father gives them RM${c}. How much money does ${name} have now?`,
      };
    case "multiply_divide":
      return {
        ms: `${a} biskut diagih sama rata ke dalam ${b} pinggan. ${name} mengambil ${c} pinggan biskut itu. Berapakah jumlah biskut yang ${name} ada?`,
        en: `${a} biscuits are shared equally among ${b} plates. ${name} takes ${c} of those plates. How many biscuits does ${name} have in total?`,
      };
    case "add_multiply":
      return {
        ms: `${name} ada RM${a}, kemudian ibunya beri ${b} keping not RM${c}. Berapakah jumlah wang ${name} sekarang?`,
        en: `${name} has RM${a}, then their mother gives them ${b} pieces of RM${c} notes. How much money does ${name} have now?`,
      };
    case "subtract_multiply":
      return {
        ms: `${name} ada RM${a}. ${name} membeli ${b} buku tulis pada harga RM${c} sebuah. Berapakah baki wang ${name}?`,
        en: `${name} has RM${a}. ${name} buys ${b} notebooks at RM${c} each. How much money does ${name} have left?`,
      };
    case "add_divide":
      return {
        ms: `${name} ada RM${a}. ${name} turut menerima RM${b} wang angpau yang diagih sama rata antara ${c} sepupu (termasuk ${name}). Berapakah jumlah wang ${name} sekarang?`,
        en: `${name} has RM${a}. ${name} also receives RM${b} in angpau money, shared equally among ${c} cousins (including ${name}). How much money does ${name} have in total?`,
      };
    case "subtract_divide":
      return {
        ms: `${name} ada RM${a}. ${name} dan ${c} orang rakan berkongsi bayaran sebanyak RM${b} sama rata, dan ${name} membayar bahagiannya. Berapakah baki wang ${name}?`,
        en: `${name} has RM${a}. ${name} and ${c} friends split a RM${b} bill equally, and ${name} pays their share. How much money does ${name} have left?`,
      };
  }
}

export function generateMixedOperations(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10);
  const max = Number(params.max ?? 80);
  const pattern = (params.pattern as Pattern) ?? "add_multiply";
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): only generalized for the
  // mixed-precedence money patterns, where a genuine second hop (two
  // ×/÷ terms to resolve before combining) makes sense the same way the
  // original add_multiply challenge did. The two equal-precedence
  // patterns don't have a natural "second hop" shape, so they fall back
  // to the base question below even when challenge:true is requested.
  if (challenge && pattern === "add_multiply") {
    const a = randInt(min, max);
    const b = randInt(2, 9);
    const c = randInt(min, max);
    const d = randInt(2, 9);
    const e = randInt(min, max);
    const firstHop = a + b * c;
    const correct = firstHop + d * e;
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} ada RM${a}. Ibunya beri ${b} keping not RM${c}, dan bapanya beri ${d} keping not RM${e}. Berapakah jumlah wang ${name} sekarang?`,
        en: `${name} has RM${a}. Their mother gives them ${b} pieces of RM${c} notes, and their father gives them ${d} pieces of RM${e} notes. How much money does ${name} have now?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, c, d, e, firstHop, correct, pattern: 0 },
      generatorKey: "mixed_operations",
      difficulty: 3,
    };
    const stoppedAtFirstHop = String(firstHop);
    const forgotSecondMultiply = String(firstHop + d);
    const distractors = Array.from(new Set([stoppedAtFirstHop, forgotSecondMultiply])).filter(
      (dd) => dd !== String(correct)
    );
    question.options = shuffleOptions(String(correct), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const o = buildOperands(pattern, min, max);
  const { a, b, c, correct, wrong } = o;

  // ---- reverseProblem: given the final total (correct) plus b and c,
  // find the starting amount a. Only offered for the four mixed-precedence
  // patterns, where solving for `a` is a single clean algebraic step
  // (the equal-precedence patterns would need re-deriving b or c instead,
  // a different — and currently unsupported — question shape).
  if (reverseProblem && pattern !== "add_subtract" && pattern !== "multiply_divide") {
    const name = pick(names);
    const secondaryTerm =
      pattern === "add_multiply" || pattern === "subtract_multiply" ? b * c : b / c;
    const reverseWrongA =
      pattern === "add_multiply" || pattern === "add_divide" ? correct - secondaryTerm - 1 : correct + secondaryTerm + 1;
    const question: GeneratedQuestion = {
      prompt:
        pattern === "add_multiply"
          ? {
              ms: `${name} ada wang RM${correct} kesemuanya, selepas ibunya beri ${b} keping not RM${c}. Berapakah wang ${name} pada mulanya?`,
              en: `${name} has RM${correct} in total, after their mother gave them ${b} pieces of RM${c} notes. How much money did ${name} have at first?`,
            }
          : pattern === "subtract_multiply"
          ? {
              ms: `Baki wang ${name} ialah RM${correct}, selepas membeli ${b} buku tulis pada harga RM${c} sebuah. Berapakah wang ${name} pada mulanya?`,
              en: `${name}'s money left is RM${correct}, after buying ${b} notebooks at RM${c} each. How much money did ${name} have at first?`,
            }
          : pattern === "add_divide"
          ? {
              ms: `${name} ada wang RM${correct} kesemuanya, selepas menerima RM${b} wang angpau yang diagih sama rata antara ${c} sepupu (termasuk ${name}). Berapakah wang ${name} pada mulanya?`,
              en: `${name} has RM${correct} in total, after receiving a share of RM${b} in angpau money split equally among ${c} cousins (including ${name}). How much money did ${name} have at first?`,
            }
          : {
              ms: `Baki wang ${name} ialah RM${correct}, selepas membayar bahagiannya daripada bil RM${b} yang dikongsi sama rata antara ${name} dan ${c} rakan. Berapakah wang ${name} pada mulanya?`,
              en: `${name}'s money left is RM${correct}, after paying their share of a RM${b} bill split equally between ${name} and ${c} friends. How much money did ${name} have at first?`,
            },
      type: "word_problem",
      correctAnswer: String(a),
      context: { a, b, c, correct, wrong, pattern: patternIndex(pattern) },
      generatorKey: "mixed_operations",
      difficulty: 3,
    };
    const distractors = Array.from(new Set([String(Math.max(0, reverseWrongA))])).filter(
      (d) => d !== String(a)
    );
    question.options = shuffleOptions(String(a), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, a + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic wrong-order mistake, must give
  // the correct answer. Works the same way across all six patterns since
  // it only needs the pre-computed `wrong` value.
  if (errorSpotting) {
    const name = pick(names);
    const wrongStr = String(wrong);
    const correctStr = String(correct);
    if (wrongStr !== correctStr) {
      const eq = equationStr(pattern, o);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${eq.replace(" = ?", "")} dari kiri ke kanan tanpa mengikut susunan operasi dan mendapat ${wrongStr}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${eq.replace(" = ?", "")} without following the correct order of operations and got ${wrongStr}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: correctStr,
        context: { a, b, c, correct, wrong, pattern: patternIndex(pattern) },
        generatorKey: "mixed_operations",
        difficulty: 3,
        options: shuffleOptions(correctStr, [wrongStr]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(0, correct + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: wordProblem(pattern, name, o),
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, c, correct, wrong, pattern: patternIndex(pattern) },
      generatorKey: "mixed_operations",
      difficulty: 3,
    };
    const distractors = Array.from(new Set([String(wrong)])).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- mcq / fill
  const equation = equationStr(pattern, o);
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, c, correct, wrong, pattern: patternIndex(pattern) },
    generatorKey: "mixed_operations",
    difficulty: 3,
  };

  if (type === "mcq") {
    const distractors = Array.from(new Set([String(wrong)])).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Patterns are stored in `context` as a small integer (context values must
// be number | string) so lib/mistakes/classify.ts can tell which pattern
// produced a question without a separate lookup table.
function patternIndex(pattern: Pattern): number {
  const order: Pattern[] = [
    "add_multiply",
    "add_subtract",
    "multiply_divide",
    "subtract_multiply",
    "add_divide",
    "subtract_divide",
  ];
  return order.indexOf(pattern);
}
