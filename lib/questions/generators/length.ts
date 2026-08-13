import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Addition/Subtraction of Length" — metres and centimetres,
// regrouping at 100 cm = 1 m (same base-100 carry pattern as money's RM/sen
// — see money.ts generateMoneyAddSubtract). "m"/"cm" abbreviations are
// identical in Malay and English, so unlike time's duration format, no
// separate neutral-vs-worded formatting is needed here.
// Retrofitted per the Round 19 content standard: added a real ribbon
// word_problem (matches this topic's explanation text), errorSpotting, and
// reverseProblem.
export function formatLength(totalCm: number): string {
  const m = Math.floor(totalCm / 100);
  const cm = totalCm % 100;
  if (m === 0) return `${cm}cm`;
  if (cm === 0) return `${m}m`;
  return `${m}m ${cm}cm`;
}

export function generateLengthAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxMetres = Number(params.maxMetres ?? 10);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const items = ["reben", "tali", "wayar", "kain"] as const;
  const itemsEn: Record<(typeof items)[number], string> = {
    reben: "ribbon",
    tali: "rope",
    wayar: "wire",
    kain: "cloth",
  };

  const op = pick(["add", "subtract"] as const);
  let aCm = randInt(1, maxMetres) * 100 + randInt(0, 99);
  let bCm = randInt(1, maxMetres) * 100 + randInt(0, 99);
  if (op === "subtract" && bCm > aCm) [aCm, bCm] = [bCm, aCm];

  const correctCm = op === "add" ? aCm + bCm : aCm - bCm;
  const symbol = op === "add" ? "+" : "−";

  // ---- challenge (TP6 / non-routine): same "third piece, keep going"
  // shape as time_add_subtract, ported to length — a THIRD piece is
  // joined after the first two, matching the topic's own explanation
  // text (two ribbons joined) extended by one more.
  if (challenge) {
    const name = pick(names);
    const item = pick(items);
    const cCm = randInt(1, maxMetres) * 100 + randInt(0, 99);
    const subtotal = aCm + bCm;
    const finalTotal = subtotal + cCm;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Seutas ${item} panjangnya ${formatLength(aCm)}. Seutas lagi ${item} panjangnya ${formatLength(bCm)}. ${name} menyambungkan kedua-duanya, kemudian menyambungkan seutas ${item} lagi sepanjang ${formatLength(cCm)}. Berapakah jumlah panjang ${item} itu kesemuanya?`,
        en: `One piece of ${itemsEn[item]} is ${formatLength(aCm)} long. Another piece is ${formatLength(bCm)} long. ${name} joins both together, then joins on another piece of ${itemsEn[item]} that is ${formatLength(cCm)} long. What is the total length of the ${itemsEn[item]} altogether?`,
      },
      type: "word_problem",
      correctAnswer: formatLength(finalTotal),
      context: { aCm, bCm, cCm, subtotal, finalTotal },
      generatorKey: "length_add_subtract",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after joining the first two pieces.
    const stoppedAtTwo = formatLength(subtotal);
    const distractors = [stoppedAtTwo].filter((d) => d !== formatLength(finalTotal));
    question.options = shuffleOptions(formatLength(finalTotal), distractors);
    while (question.options.length < 3) {
      const candidateCm = Math.max(0, finalTotal + randInt(5, 80) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatLength(candidateCm);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the total length and one piece's length,
  // find the other piece's length (subtraction).
  if (reverseProblem) {
    const name = pick(names);
    const item = pick(items);
    const total = aCm + bCm;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mempunyai dua keping ${item} dengan jumlah panjang ${formatLength(total)}. Sekeping ${item} panjangnya ${formatLength(aCm)}. Berapakah panjang ${item} yang satu lagi?`,
        en: `${name} has two pieces of ${itemsEn[item]} with a total length of ${formatLength(total)}. One piece is ${formatLength(aCm)} long. How long is the other piece?`,
      },
      type: "word_problem",
      correctAnswer: formatLength(bCm),
      context: { aCm, bCm, total },
      generatorKey: "length_add_subtract",
      difficulty: 3,
    };
    // Classic mistake: added the total and the given piece instead of subtracting.
    const addedInstead = formatLength(total + aCm);
    // Classic mistake: gave the total again instead of the difference.
    const gaveTotal = formatLength(total);
    const distractors = Array.from(new Set([addedInstead, gaveTotal])).filter((d) => d !== formatLength(bCm));
    question.options = shuffleOptions(formatLength(bCm), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateCm = Math.max(0, bCm + randInt(5, 80) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatLength(candidateCm);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "treated cm as base-10" mistake,
  // must give the correct answer. Only meaningful when a genuine carry/
  // borrow actually occurs — resample until one does.
  if (errorSpotting) {
    const name = pick(names);
    let esA = aCm;
    let esB = bCm;
    let guard = 0;
    while (guard < 20) {
      const aRem = esA % 100, bRem = esB % 100;
      const genuineCarry = op === "add" ? aRem + bRem >= 100 : aRem < bRem;
      if (genuineCarry) break;
      esA = randInt(1, maxMetres) * 100 + randInt(0, 99);
      esB = randInt(1, maxMetres) * 100 + randInt(0, 99);
      if (op === "subtract" && esB > esA) [esA, esB] = [esB, esA];
      guard++;
    }
    const esCorrectCm = op === "add" ? esA + esB : esA - esB;
    const esAM = Math.floor(esA / 100), esARem = esA % 100;
    const esBM = Math.floor(esB / 100), esBRem = esB % 100;
    const wrongM = op === "add" ? esAM + esBM : Math.abs(esAM - esBM);
    const wrongRem = op === "add" ? esARem + esBRem : Math.abs(esARem - esBRem);
    const wrongAnswer = `${wrongM}m ${wrongRem}cm`;
    const correctAnswer = formatLength(esCorrectCm);
    if (wrongAnswer !== correctAnswer) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${formatLength(esA)} ${op === "add" ? "+" : "−"} ${formatLength(esB)} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${formatLength(esA)} ${op === "add" ? "+" : "−"} ${formatLength(esB)} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context: { aCm: esA, bCm: esB, correctCm: esCorrectCm, op, wrongAnswer },
        generatorKey: "length_add_subtract",
        difficulty: 3,
        options: shuffleOptions(correctAnswer, [wrongAnswer]),
      };
      // Pad to at least 3 options — errorSpotting only naturally supplies
      // one distractor (the no-carry mistake itself).
      while (question.options!.length < 3) {
        const candidateCm = Math.max(0, esCorrectCm + randInt(5, 80) * (Math.random() > 0.5 ? 1 : -1));
        const candidate = formatLength(candidateCm);
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: ribbon/rope scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const item = pick(items);
    const prompt =
      op === "add"
        ? {
            ms: `Seutas ${item} panjangnya ${formatLength(aCm)}. Seutas lagi ${item} panjangnya ${formatLength(bCm)}. Berapakah jumlah panjang kedua-dua ${item} itu?`,
            en: `One ${itemsEn[item]} is ${formatLength(aCm)} long. Another ${itemsEn[item]} is ${formatLength(bCm)} long. What is the total length of both pieces of ${itemsEn[item]}?`,
          }
        : {
            ms: `${name} mempunyai seutas ${item} sepanjang ${formatLength(aCm)}. ${name} memotong ${formatLength(bCm)} daripadanya. Berapakah panjang ${item} yang tinggal?`,
            en: `${name} has a piece of ${itemsEn[item]} that is ${formatLength(aCm)} long. ${name} cuts off ${formatLength(bCm)}. How much ${itemsEn[item]} is left?`,
          };
    const question: GeneratedQuestion = {
      prompt,
      type: "word_problem",
      correctAnswer: formatLength(correctCm),
      context: { aCm, bCm, correctCm, op },
      generatorKey: "length_add_subtract",
      difficulty: 2,
    };
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
    return question;
  }

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
