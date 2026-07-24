import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Convert Fractions and Percentages" — restricted to
// denominators that divide evenly into 100, so the percentage is always a
// clean whole number (matches how this is introduced at Y4 level).
export function generateFractionsPercentageConvert(params: GeneratorParams): GeneratedQuestion {
  const denominators = (params.denominators as number[]) ?? [2, 4, 5, 10, 20, 25, 50];
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const denom = pick(denominators);
  const num = randInt(1, denom - 1);
  const pct = (num / denom) * 100;
  const fractionToPct = Math.random() > 0.5;

  const question: GeneratedQuestion = {
    prompt: fractionToPct
      ? { ms: `${num}/${denom} = ?%`, en: `${num}/${denom} = ?%` }
      : { ms: `${pct}% = ?/${denom}`, en: `${pct}% = ?/${denom}` },
    type,
    correctAnswer: fractionToPct ? String(pct) : String(num),
    context: { num, denom, pct, fractionToPct: fractionToPct ? "yes" : "no" },
    generatorKey: "fractions_percentage_convert",
    difficulty: 2,
  };

  if (type === "mcq") {
    const correct = fractionToPct ? pct : num;
    // Classic mistake: treating the numerator as the percentage directly,
    // ignoring the denominator entirely.
    const usedNumeratorDirectly = fractionToPct ? num : Math.round((pct / 100) * denom);
    // Classic mistake: using the wrong scale factor (100/denom).
    const wrongScale = fractionToPct ? num * 10 : Math.round(pct / 10);
    const distractors = Array.from(
      new Set([usedNumeratorDirectly, wrongScale].map(String).filter((d) => d !== String(correct) && Number(d) >= 0))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 10) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
