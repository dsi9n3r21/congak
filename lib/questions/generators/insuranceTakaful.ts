import { pick } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Recognise Asset, Liability, Insurance, and Takaful" — the
// insurance/takaful half. The two are distinguished by their operating
// principle (conventional premium-based vs. Shariah-compliant mutual
// contribution/mudharabah, no riba) — each scenario states that principle
// explicitly, since that's the actual distinguishing fact being taught,
// not something guessable from context alone.
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

export function generateInsuranceTakaful(_params: GeneratorParams): GeneratedQuestion {
  const scenario = pick(SCENARIOS);
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
