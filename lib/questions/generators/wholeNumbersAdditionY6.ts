import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Adding Three Whole Numbers". Retrofitted per the Round 19
// content standard: the original "word_problem" config just returned the
// bare equation with no scenario — type was wired correctly by the
// runner (lib/questions/index.ts merges questionTemplate.type into
// params), but the generator itself never branched on it. Now builds a
// real Malaysian scenario for word_problem, plus errorSpotting and
// reverseProblem (missing addend) variants.
export function generateWholeNumbersAdditionY6(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 10000);
  const max = Number(params.max ?? 99999);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const a = randInt(min, max);
  const b = randInt(min, max);
  const c = randInt(min, max);
  const correct = a + b + c;
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the total and two of three addends, find
  // the missing one (subtraction).
  if (reverseProblem) {
    const name = pick(names);
    const missing = c;
    const total = a + b + c;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} menjumlahkan tiga bilangan jualan bulanan sebuah kedai: ${a.toLocaleString("en-US")}, ${b.toLocaleString("en-US")}, dan satu bulan lagi yang tidak dicatat. Jumlah keseluruhan ialah ${total.toLocaleString("en-US")}. Berapakah jualan bulan yang tidak dicatat itu?`,
        en: `${name} adds up three months of a shop's sales: ${a.toLocaleString("en-US")}, ${b.toLocaleString("en-US")}, and one more month that wasn't recorded. The grand total is ${total.toLocaleString("en-US")}. What were the sales for the unrecorded month?`,
      },
      type: "word_problem",
      correctAnswer: String(missing),
      context: { a, b, missing, total },
      generatorKey: "whole_numbers_addition_y6",
      difficulty: 3,
    };
    const addedAllThree = total + a + b; // wrong_operation: added instead of subtracted
    const gaveTotal = total; // gave the grand total instead of solving for the missing part
    const distractors = Array.from(new Set([addedAllThree, gaveTotal])).filter((d) => d !== missing).map(String);
    question.options = shuffleOptions(String(missing), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, missing + randInt(100, 999) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot the third number"
  // mistake, must give the correct total.
  if (errorSpotting) {
    const name = pick(names);
    const wrongTotal = a + b; // forgot to add c
    return {
      prompt: {
        ms: `${name} menambah ${a.toLocaleString("en-US")}, ${b.toLocaleString("en-US")}, dan ${c.toLocaleString("en-US")}, tetapi mendapat jawapan ${wrongTotal.toLocaleString("en-US")}. Apakah jawapan yang betul?`,
        en: `${name} adds ${a.toLocaleString("en-US")}, ${b.toLocaleString("en-US")}, and ${c.toLocaleString("en-US")}, but got ${wrongTotal.toLocaleString("en-US")}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: String(correct),
      context: { a, b, c, correct, wrongTotal },
      generatorKey: "whole_numbers_addition_y6",
      difficulty: 3,
      options: shuffleOptions(String(correct), [String(wrongTotal)]),
    };
  }

  // ---- word_problem: a real Malaysian scenario, not a bare equation.
  if (type === "word_problem") {
    const name = pick(names);
    const context = pick(["bookstore", "canteen", "durian_farm"] as const);
    const scenario = {
      bookstore: {
        ms: `Sebuah kedai buku menjual ${a.toLocaleString("en-US")} buku pada Januari, ${b.toLocaleString("en-US")} buku pada Februari, dan ${c.toLocaleString("en-US")} buku pada Mac. Berapakah jumlah buku yang dijual dalam tiga bulan itu?`,
        en: `A bookstore sold ${a.toLocaleString("en-US")} books in January, ${b.toLocaleString("en-US")} in February, and ${c.toLocaleString("en-US")} in March. How many books were sold across those three months?`,
      },
      canteen: {
        ms: `Kantin sekolah menjual ${a.toLocaleString("en-US")} paket nasi pada minggu pertama, ${b.toLocaleString("en-US")} paket pada minggu kedua, dan ${c.toLocaleString("en-US")} paket pada minggu ketiga. Berapakah jumlah paket nasi yang dijual dalam tiga minggu itu?`,
        en: `The school canteen sold ${a.toLocaleString("en-US")} rice packets in week one, ${b.toLocaleString("en-US")} in week two, and ${c.toLocaleString("en-US")} in week three. How many rice packets were sold across those three weeks?`,
      },
      durian_farm: {
        ms: `Sebuah kebun durian menuai ${a.toLocaleString("en-US")} biji durian musim lepas, ${b.toLocaleString("en-US")} biji musim ini, dan ${c.toLocaleString("en-US")} biji pada jualan pasar malam. Berapakah jumlah durian keseluruhan?`,
        en: `A durian orchard harvested ${a.toLocaleString("en-US")} durians last season, ${b.toLocaleString("en-US")} this season, and ${c.toLocaleString("en-US")} for a night-market sale. What is the total number of durians?`,
      },
    }[context];
    const question: GeneratedQuestion = {
      prompt: scenario,
      type: "word_problem",
      correctAnswer: String(correct),
      context: { a, b, c, correct },
      generatorKey: "whole_numbers_addition_y6",
      difficulty: 3,
    };
    const forgotThirdNumber = a + b;
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 100 : -100) * randInt(1, 9);
    const distractors = Array.from(new Set([String(forgotThirdNumber), String(misalignedDistractor)].filter((d) => d !== String(correct))));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const equation = `${a.toLocaleString("en-US")} + ${b.toLocaleString("en-US")} + ${c.toLocaleString("en-US")} = ?`;
  const question: GeneratedQuestion = {
    prompt: { ms: equation, en: equation },
    type,
    correctAnswer: String(correct),
    context: { a, b, c, correct },
    generatorKey: "whole_numbers_addition_y6",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: forgetting to add the third number entirely.
    const forgotThirdNumber = a + b;
    const misalignedDistractor = correct + (Math.random() > 0.5 ? 100 : -100) * randInt(1, 9);
    const distractors = Array.from(
      new Set([String(forgotThirdNumber), String(misalignedDistractor)].filter((d) => d !== String(correct)))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 999) * (Math.random() > 0.5 ? 1 : -1));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
