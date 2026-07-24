import { pick } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Recognise Asset, Liability, Insurance, and Takaful" —
// simplified to the core asset-vs-liability classification, the most
// generator-friendly part of that topic. Word-based answer (canonical
// keys "asset"/"liability"), styled via OPTION_LABELS, same convention as
// likelihood/angles_classify.
const ITEMS = [
  { ms: "rumah yang dimiliki", en: "a house you own", answer: "asset" },
  { ms: "wang simpanan di bank", en: "savings in the bank", answer: "asset" },
  { ms: "kereta yang dimiliki", en: "a car you own", answer: "asset" },
  { ms: "saham syarikat", en: "company shares", answer: "asset" },
  { ms: "emas yang disimpan", en: "gold you're keeping", answer: "asset" },
  { ms: "pinjaman kereta yang belum dijelaskan", en: "an unpaid car loan", answer: "liability" },
  { ms: "hutang kad kredit", en: "credit card debt", answer: "liability" },
  { ms: "pinjaman pendidikan", en: "an education loan", answer: "liability" },
  { ms: "bil yang belum dibayar", en: "an unpaid bill", answer: "liability" },
  { ms: "pinjaman peribadi daripada bank", en: "a personal loan from a bank", answer: "liability" },
] as const;

export function generateAssetLiability(_params: GeneratorParams): GeneratedQuestion {
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
