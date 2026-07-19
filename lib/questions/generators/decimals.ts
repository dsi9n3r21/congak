import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

function randomDecimal(maxWhole: number): number {
  const whole = randInt(0, maxWhole);
  const cents = randInt(0, 99);
  return Math.round((whole + cents / 100) * 100) / 100;
}

export function generateDecimalAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxWhole = Number(params.maxWhole ?? 20);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const op = pick(["add", "subtract"] as const);

  let a = randomDecimal(maxWhole);
  let b = randomDecimal(maxWhole);
  if (op === "subtract" && b > a) [a, b] = [b, a]; // keep it non-negative for this level

  const correct = op === "add" ? Math.round((a + b) * 100) / 100 : Math.round((a - b) * 100) / 100;
  const symbol = op === "add" ? "+" : "−";

  const question: GeneratedQuestion = {
    prompt: { ms: `${a} ${symbol} ${b} = ?`, en: `${a} ${symbol} ${b} = ?` },
    type,
    correctAnswer: correct.toFixed(2),
    context: { a, b, correct, op },
    generatorKey: "decimal_add_subtract",
    difficulty: maxWhole > 10 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: misaligning the decimal point, effectively treating
    // the numbers as if the shorter one were shifted by a factor of 10.
    const misaligned = Math.round((correct + (Math.random() > 0.5 ? 0.9 : -0.9)) * 100) / 100;
    // Classic mistake: adding/subtracting the whole and decimal parts separately
    // without carrying/borrowing across the decimal point.
    const noCarryAcrossPoint = Math.round((correct + (op === "add" ? -0.1 : 0.1)) * 100) / 100;
    question.options = shuffleOptions(
      correct.toFixed(2),
      [misaligned.toFixed(2), noCarryAcrossPoint.toFixed(2)].filter((d) => d !== correct.toFixed(2))
    );
  }

  return question;
}
