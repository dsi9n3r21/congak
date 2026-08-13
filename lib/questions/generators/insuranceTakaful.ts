import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Recognise Asset, Liability, Insurance, and Takaful" — the
// insurance/takaful half. The two are distinguished by their operating
// principle (conventional premium-based vs. Shariah-compliant mutual
// contribution/mudharabah, no riba) — each scenario states that principle
// explicitly, since that's the actual distinguishing fact being taught,
// not something guessable from context alone. Retrofitted per the Round
// 19 content standard: added a difficulty-pooled mcq, a list-counting
// word_problem, an errorSpotting variant, and a reverseProblem variant.
// Deliberately no "fill" type — same bilingual-grading constraint as
// asset_liability.ts (canonical keys are English, grading never
// translates BM↔EN, so free text would mark a BM-typing student wrong).
const SCENARIOS = [
  {
    ms: "Sebuah pelan perlindungan yang dikendalikan berdasarkan prinsip Syariah, di mana peserta saling membantu melalui sumbangan (tabarru') tanpa unsur riba",
    en: "A protection plan run on Shariah principles, where participants mutually help each other through contributions (tabarru') with no interest (riba) involved",
    answer: "takaful",
  },
  {
    ms: "Sebuah pelan perlindungan konvensional yang mengenakan premium tetap, dikendalikan sepenuhnya oleh syarikat insurans untuk keuntungan syarikat",
    en: "A conventional protection plan that charges a fixed premium, run entirely by the insurance company for the company's profit",
    answer: "insurance",
  },
  {
    ms: "Sebuah pelan yang mengagihkan lebihan dana kepada peserta mengikut prinsip perkongsian keuntungan (mudharabah)",
    en: "A plan that distributes surplus funds to participants based on profit-sharing (mudharabah) principles",
    answer: "takaful",
  },
  {
    ms: "Sebuah polisi yang dibeli daripada syarikat insurans, dengan bayaran premium bulanan yang tetap dan tiada perkongsian keuntungan dengan pelanggan",
    en: "A policy bought from an insurance company, with a fixed monthly premium and no profit-sharing with customers",
    answer: "insurance",
  },
] as const;

const NAMES = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal", "Priya"];

function pickDistinctScenarios(n: number): (typeof SCENARIOS)[number][] {
  const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, SCENARIOS.length));
}

export function generateInsuranceTakaful(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const listSize = Number(params.listSize ?? 3);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const name = pick(NAMES);

  // ---- challenge (TP6 / non-routine): a short list of plans, each with
  // a coverage VALUE — find the TOTAL coverage of the TAKAFUL plans only.
  // Genuine second hop past the base skill, reverseProblem, and
  // word_problem (all three only ever COUNT plans, never use a value):
  // (1) classify EACH plan, THEN (2) sum only the values of the ones
  // classified as takaful, ignoring the insurance ones.
  if (challenge) {
    const takafulScenarios = SCENARIOS.filter((s) => s.answer === "takaful");
    const insuranceScenarios = SCENARIOS.filter((s) => s.answer === "insurance");
    const takafulValues = takafulScenarios.map(() => randInt(20, 80) * 100);
    const insuranceValues = insuranceScenarios.map(() => randInt(20, 80) * 100);
    const totalTakaful = takafulValues.reduce((a, b) => a + b, 0);
    const totalInsurance = insuranceValues.reduce((a, b) => a + b, 0);
    const items = [
      ...takafulScenarios.map((s, i) => ({ s, value: takafulValues[i] })),
      ...insuranceScenarios.map((s, i) => ({ s, value: insuranceValues[i] })),
    ].sort(() => Math.random() - 0.5);
    const listMs = items.map((x, i) => `(${i + 1}) ${x.s.ms}, dengan perlindungan RM${x.value}`).join("; ");
    const listEn = items.map((x, i) => `(${i + 1}) ${x.s.en}, with RM${x.value} coverage`).join("; ");
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membandingkan pelan berikut: ${listMs}. Berapakah JUMLAH perlindungan bagi pelan TAKAFUL sahaja?`,
        en: `${name} compares the following plans: ${listEn}. What is the TOTAL coverage for the TAKAFUL plans only?`,
      },
      type: "word_problem",
      correctAnswer: `RM${totalTakaful}`,
      context: { totalTakaful, totalInsurance },
      generatorKey: "insurance_takaful",
      difficulty: 3,
    };
    // Classic non-routine mistake: sums every plan's value, forgetting to
    // filter to takaful plans only.
    const summedEverything = `RM${totalTakaful + totalInsurance}`;
    // Classic non-routine mistake: classifies backward and sums the
    // insurance plans' values instead.
    const summedWrongGroup = `RM${totalInsurance}`;
    const distractors = Array.from(
      new Set([summedEverything, summedWrongGroup].filter((d) => d !== `RM${totalTakaful}`))
    );
    question.options = shuffleOptions(`RM${totalTakaful}`, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = `RM${Math.max(0, totalTakaful + randInt(1, 8) * 100 * (Math.random() > 0.5 ? 1 : -1))}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given a total plan count and how many are
  // takaful, find how many are conventional insurance (subtraction).
  if (reverseProblem) {
    const total = randInt(5, 9);
    const takafulCount = randInt(2, total - 2);
    const insuranceCount = total - takafulCount;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membandingkan ${total} pelan perlindungan. ${takafulCount} daripadanya berasaskan prinsip Takaful. Berapakah bilangan pelan Insurans konvensional?`,
        en: `${name} compares ${total} protection plans. ${takafulCount} of them are based on Takaful principles. How many are conventional Insurance plans?`,
      },
      type: "word_problem",
      correctAnswer: String(insuranceCount),
      context: { total, takafulCount, insuranceCount },
      generatorKey: "insurance_takaful",
      difficulty: 3,
    };
    const wrongOperation = String(total + takafulCount);
    const gaveTotal = String(total);
    const distractors = Array.from(new Set([wrongOperation, gaveTotal].filter((d) => d !== String(insuranceCount))));
    question.options = shuffleOptions(String(insuranceCount), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, insuranceCount + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: a documented misconception — students latch onto
  // "there's a regular payment" as the distinguishing feature, when BOTH
  // insurance premiums and takaful contributions are paid regularly. The
  // real distinguishing feature is the Shariah/mutual-vs-conventional
  // principle, not the presence of a payment.
  if (errorSpotting) {
    const scenario = pick(SCENARIOS.filter((s) => s.answer === "takaful"));
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} berkata "${scenario.ms}" ialah insurans kerana ada bayaran secara berkala. Apakah klasifikasi yang betul?`,
        en: `${name} says "${scenario.en}" is insurance because there's a regular payment. What is the correct classification?`,
      },
      type: "mcq",
      correctAnswer: "takaful",
      context: { descriptionEn: scenario.en },
      generatorKey: "insurance_takaful",
      difficulty: 3,
      options: ["takaful", "insurance"],
    };
    return question;
  }

  // ---- word_problem: a short list of plan descriptions, count how many
  // are Takaful.
  if (type === "word_problem") {
    const scenarios = pickDistinctScenarios(listSize);
    const takafulCount = scenarios.filter((s) => s.answer === "takaful").length;
    const listMs = scenarios.map((s, i) => `(${i + 1}) ${s.ms}`).join("; ");
    const listEn = scenarios.map((s, i) => `(${i + 1}) ${s.en}`).join("; ");
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membandingkan pelan berikut: ${listMs}. Berapakah bilangan pelan TAKAFUL dalam senarai itu?`,
        en: `${name} compares the following plans: ${listEn}. How many TAKAFUL plans are in the list?`,
      },
      type: "word_problem",
      correctAnswer: String(takafulCount),
      context: { listSize: scenarios.length, takafulCount },
      generatorKey: "insurance_takaful",
      difficulty: 3,
    };
    const insuranceCount = scenarios.length - takafulCount;
    const distractors = Array.from(new Set([String(insuranceCount), String(scenarios.length)].filter((d) => d !== String(takafulCount))));
    question.options = shuffleOptions(String(takafulCount), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, takafulCount + randInt(1, 2) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- guided/independent mcq: same classification task, pooled by
  // difficulty (single-answer pool = more guided; mixed = independent).
  const pool = params.pool as "takaful" | "insurance" | "mixed" | undefined;
  const scenarioPool = pool && pool !== "mixed" ? SCENARIOS.filter((s) => s.answer === pool) : SCENARIOS;
  const scenario = pick(scenarioPool);
  const wrongAnswer = scenario.answer === "insurance" ? "takaful" : "insurance";

  return {
    prompt: {
      ms: `${scenario.ms}. Adakah ini insurans atau takaful?`,
      en: `${scenario.en}. Is this insurance or takaful?`,
    },
    type: "mcq",
    correctAnswer: scenario.answer,
    context: { descriptionEn: scenario.en },
    generatorKey: "insurance_takaful",
    difficulty: 3,
    options: [scenario.answer, wrongAnswer].sort(() => Math.random() - 0.5),
  };
}
