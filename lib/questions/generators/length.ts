import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Addition/Subtraction of Length" — metres and centimetres,
// regrouping at 100 cm = 1 m (same base-100 carry pattern as money's RM/sen
// — see money.ts generateMoneyAddSubtract). "m"/"cm" abbreviations are
// identical in Malay and English, so unlike time's duration format, no
// separate neutral-vs-worded formatting is needed here.
function formatLength(totalCm: number): string {
  const m = Math.floor(totalCm / 100);
  const cm = totalCm % 100;
  if (m === 0) return `${cm}cm`;
  if (cm === 0) return `${m}m`;
  return `${m}m ${cm}cm`;
}

export function generateLengthAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxMetres = Number(params.maxMetres ?? 10);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const op = pick(["add", "subtract"] as const);

  let aCm = randInt(1, maxMetres) * 100 + randInt(0, 99);
  let bCm = randInt(1, maxMetres) * 100 + randInt(0, 99);
  if (op === "subtract" && bCm > aCm) [aCm, bCm] = [bCm, aCm];

  const correctCm = op === "add" ? aCm + bCm : aCm - bCm;
  const symbol = op === "add" ? "+" : "−";

  const question: GeneratedQuestion = {
    prompt: { ms: `${formatLength(aCm)} ${symbol} ${formatLength(bCm)} = ?`, en: `${formatLength(aCm)} ${symbol} ${formatLength(bCm)} = ?` },
    type,
    correctAnswer: formatLength(correctCm),
    context: { aCm, bCm, correctCm, op },
    generatorKey: "length_add_subtract",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: treating cm as base-10 instead of regrouping at 100
    // (adding/subtracting metres and centimetres as independent columns
    // without carrying/borrowing across the 100 cm = 1 m boundary).
    const aM = Math.floor(aCm / 100), aRemCm = aCm % 100;
    const bM = Math.floor(bCm / 100), bRemCm = bCm % 100;
    const noCarryM = op === "add" ? aM + bM : Math.abs(aM - bM);
    const noCarryCm = op === "add" ? aRemCm + bRemCm : Math.abs(aRemCm - bRemCm);
    const noCarryLabel = `${noCarryM}m ${noCarryCm}cm`;
    const distractors = Array.from(new Set([noCarryLabel].filter((d) => d !== question.correctAnswer)));
    question.options = shuffleOptions(question.correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidateCm = Math.max(0, correctCm + randInt(5, 80) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatLength(candidateCm);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
