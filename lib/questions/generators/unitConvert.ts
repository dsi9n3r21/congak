import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

interface UnitPair {
  big: string; // symbol/abbreviation for the larger unit, e.g. "m", "kg", "yr"
  small: string; // symbol/abbreviation for the smaller unit, e.g. "cm", "g", "mth"
  factor: number; // how many `small` units make 1 `big` unit
}

/**
 * One generic "convert between two units" generator, reused across many
 * KSSR topics that are all structurally identical — Length (mm/cm/m/km),
 * Mass (g/kg), Volume of Liquid (ml/L), and Time (minutes/hours/days/
 * weeks/months/years/decades/centuries). Rather than one near-duplicate
 * generator file per unit pair, a topic just supplies a `pairs` array and
 * this picks one pair per question. Keeps every conversion always exact
 * (no remainders) — appropriate for the introductory conversion topics
 * this powers; arithmetic ON converted units (add/subtract/etc.) stays in
 * dedicated generators like `length_add_subtract`.
 */
export function generateUnitConvert(params: GeneratorParams): GeneratedQuestion {
  const pairs = (params.pairs as UnitPair[]) ?? [{ big: "m", small: "cm", factor: 100 }];
  const maxBig = Number(params.maxBig ?? 10);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const { big, small, factor } = pick(pairs);
  const bigVal = randInt(1, maxBig);
  const smallVal = bigVal * factor;
  const bigToSmall = Math.random() > 0.5;

  const question: GeneratedQuestion = {
    prompt: bigToSmall
      ? { ms: `${bigVal} ${big} = ? ${small}`, en: `${bigVal} ${big} = ? ${small}` }
      : { ms: `${smallVal} ${small} = ? ${big}`, en: `${smallVal} ${small} = ? ${big}` },
    type,
    correctAnswer: bigToSmall ? String(smallVal) : String(bigVal),
    context: { big, small, factor, bigVal, smallVal, bigToSmall: bigToSmall ? "yes" : "no" },
    generatorKey: "unit_convert",
    difficulty: factor >= 1000 ? 2 : 1,
  };

  if (type === "mcq") {
    const correct = bigToSmall ? smallVal : bigVal;
    // Classic mistake: using the wrong conversion factor — the most common
    // confusions are ×10 vs ×100 vs ×1000, or dividing when you should
    // multiply (and vice versa).
    const wrongFactorGuess = pick([10, 100, 1000].filter((f) => f !== factor));
    const usedWrongFactor = bigToSmall ? bigVal * wrongFactorGuess : Math.round(smallVal / wrongFactorGuess);
    // Classic mistake: applied the conversion in the wrong direction
    // (multiplied when converting big→small should have divided, or
    // vice versa).
    const wrongDirection = bigToSmall ? Math.round(bigVal / factor) : bigVal * factor;
    const distractors = Array.from(
      new Set([usedWrongFactor, wrongDirection].map(String).filter((d) => d !== String(correct) && Number(d) > 0))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, Math.max(2, Math.round(correct * 0.2)))));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
