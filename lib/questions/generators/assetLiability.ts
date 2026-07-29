import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Recognise Asset, Liability, Insurance, and Takaful" —
// simplified to the core asset-vs-liability classification, the most
// generator-friendly part of that topic. Word-based answer (canonical
// keys "asset"/"liability"), styled via OPTION_LABELS, same convention as
// likelihood/angles_classify. Retrofitted per the Round 19 content
// standard: added word_problem/errorSpotting/reverseProblem variants and
// a difficulty-pooled mcq — deliberately no "fill" variant, see note below.
// The classification itself doesn't have a numeric "reverse", so the
// word-problem and reverse variants count assets/liabilities in a list
// instead, which keeps the arithmetic genuinely KSSR Y6 level (simple
// addition/subtraction) while still testing the classification concept.
const ITEMS = [
  { ms: "rumah yang dimiliki", en: "a house you own", answer: "asset" },
  { ms: "wang simpanan di bank", en: "savings in the bank", answer: "asset" },
  { ms: "kereta yang telah dijelaskan sepenuhnya", en: "a car fully paid off", answer: "asset" },
  { ms: "saham syarikat", en: "company shares", answer: "asset" },
  { ms: "emas yang disimpan", en: "gold you're keeping", answer: "asset" },
  { ms: "tanah ladang", en: "farm land", answer: "asset" },
  { ms: "pinjaman kereta yang belum dijelaskan", en: "an unpaid car loan", answer: "liability" },
  { ms: "hutang kad kredit", en: "credit card debt", answer: "liability" },
  { ms: "pinjaman pendidikan", en: "an education loan", answer: "liability" },
  { ms: "bil yang belum dibayar", en: "an unpaid bill", answer: "liability" },
  { ms: "pinjaman peribadi daripada bank", en: "a personal loan from a bank", answer: "liability" },
  { ms: "baki pinjaman rumah yang belum dijelaskan", en: "an unpaid balance on a home loan", answer: "liability" },
] as const;

const NAMES = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal", "Priya"];

function pickDistinct(n: number): (typeof ITEMS)[number][] {
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function generateAssetLiability(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const listSize = Number(params.listSize ?? 4);
  const extraInfoChance = Number(params.extraInfoChance ?? 0);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const name = pick(NAMES);

  // ---- reverseProblem: given the total item count and how many are
  // assets, find how many are liabilities (or vice versa) — subtraction,
  // not a new concept, but forces understanding that every item is one
  // or the other.
  if (reverseProblem) {
    const total = randInt(5, 10);
    const assetCount = randInt(2, total - 2);
    const liabilityCount = total - assetCount;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} menyenaraikan ${total} item hartanya. ${assetCount} daripadanya ialah aset. Berapakah bilangan liabiliti dalam senarai itu?`,
        en: `${name} lists ${total} items in a financial record. ${assetCount} of them are assets. How many liabilities are in the list?`,
      },
      type: "word_problem",
      correctAnswer: String(liabilityCount),
      context: { total, assetCount, liabilityCount },
      generatorKey: "asset_liability",
      difficulty: 3,
    };
    const wrongOperation = String(total + assetCount); // added instead of subtracted
    const gaveTotal = String(total); // didn't realise a subtraction was needed
    const distractors = Array.from(new Set([wrongOperation, gaveTotal].filter((d) => d !== String(liabilityCount))));
    question.options = shuffleOptions(String(liabilityCount), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, liabilityCount + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: a documented boundary-case misconception — an
  // item with ongoing maintenance/storage cost gets wrongly reclassified
  // as a liability because of that cost, when the item itself is still
  // an asset.
  if (errorSpotting) {
    const item = pick(ITEMS.filter((i) => i.answer === "asset"));
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} berkata ${item.ms} ialah liabiliti kerana ia memerlukan kos penyelenggaraan. Apakah klasifikasi yang betul?`,
        en: `${name} says ${item.en} is a liability because it needs maintenance costs. What is the correct classification?`,
      },
      type: "mcq",
      correctAnswer: "asset",
      context: { itemEn: item.en },
      generatorKey: "asset_liability",
      difficulty: 3,
      options: ["asset", "liability"],
    };
    return question;
  }

  // ---- guided/independent mcq variants: same classification task, but
  // pooled by difficulty. NOTE: this generator never offers a "fill" type
  // — the canonical answer key is English ("asset"/"liability") but the
  // prompt can render in BM, and this app's grading (lib/questions/
  // grading.ts) only lowercases/trims, it never translates BM↔EN. A
  // free-text blank would mark a BM-speaking student wrong for correctly
  // typing "Aset". Every other word-answer generator in this codebase
  // (angles_classify, likelihood) has the same constraint — MCQ only.
  const pool = params.pool as "asset" | "liability" | "mixed" | undefined;
  if (pool && pool !== "mixed") {
    const item = pick(ITEMS.filter((i) => i.answer === pool));
    const wrongAnswer = item.answer === "asset" ? "liability" : "asset";
    return {
      prompt: { ms: `Adakah ${item.ms} merupakan aset atau liabiliti?`, en: `Is ${item.en} an asset or a liability?` },
      type: "mcq",
      correctAnswer: item.answer,
      context: { itemEn: item.en },
      generatorKey: "asset_liability",
      difficulty: 2,
      options: [item.answer, wrongAnswer].sort(() => Math.random() - 0.5),
    };
  }

  // ---- word_problem: a short list of items, count how many are assets
  // — a Malaysian scenario with an optional irrelevant-info decoy.
  if (type === "word_problem") {
    const items = pickDistinct(listSize);
    const assetCount = items.filter((i) => i.answer === "asset").length;
    const withDecoy = Math.random() < extraInfoChance;
    const decoyMs = withDecoy ? ` ${name} bekerja sebagai jurutera dan menyimpan rekod ini setiap bulan.` : "";
    const decoyEn = withDecoy ? ` ${name} works as an engineer and keeps this record every month.` : "";
    const listMs = items.map((i) => i.ms).join("; ");
    const listEn = items.map((i) => i.en).join("; ");
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} menyenaraikan hartanya: ${listMs}.${decoyMs} Berapakah bilangan ASET dalam senarai itu?`,
        en: `${name} lists these items: ${listEn}.${decoyEn} How many ASSETS are in the list?`,
      },
      type: "word_problem",
      correctAnswer: String(assetCount),
      context: { listSize: items.length, assetCount },
      generatorKey: "asset_liability",
      difficulty: 3,
    };
    const liabilityCount = items.length - assetCount;
    const distractors = Array.from(new Set([String(liabilityCount), String(items.length)].filter((d) => d !== String(assetCount))));
    question.options = shuffleOptions(String(assetCount), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, assetCount + randInt(1, 2) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- base mcq: single-item classification.
  const item = pick(ITEMS);
  const wrongAnswer = item.answer === "asset" ? "liability" : "asset";
  return {
    prompt: {
      ms: `Adakah ${item.ms} merupakan aset atau liabiliti?`,
      en: `Is ${item.en} an asset or a liability?`,
    },
    type: "mcq",
    correctAnswer: item.answer,
    context: { itemEn: item.en },
    generatorKey: "asset_liability",
    difficulty: 2,
    options: [item.answer, wrongAnswer].sort(() => Math.random() - 0.5),
  };
}
