import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const PI = 3.142; // KSSR convention

// Year 6 KSSR "Circumference of a Circle". Retrofitted per the Round 19
// content standard: added a real running-track word_problem, errorSpotting
// (the documented "used radius as if it were the diameter" mistake), and
// a reverseProblem variant that finds the radius given the circumference
// (dividing back through 2πr).
export function generateCircumference(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 3);
  const max = Number(params.max ?? 20);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the circumference, find the radius —
  // dividing back through 2πr. Built from a known integer radius so the
  // "correct" answer is always exact, not derived via runtime division.
  if (reverseProblem) {
    const radius = randInt(min, max);
    const circumference = Math.round(2 * radius * PI * 100) / 100;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Lilitan sebuah bulatan ialah ${circumference.toFixed(2)} cm. (Guna π = 3.142) Berapakah jejarinya?`,
        en: `The circumference of a circle is ${circumference.toFixed(2)} cm. (Use π = 3.142) What is its radius?`,
      },
      type: "word_problem",
      correctAnswer: String(radius),
      context: { radius, circumference },
      generatorKey: "circumference",
      difficulty: 3,
    };
    // Classic mistake: treated the circumference as the diameter and halved it, forgetting π entirely.
    const forgotPi = Math.round(circumference / 2);
    // Classic mistake: divided by π only, forgetting to also divide by 2 (found the diameter, not the radius).
    const foundDiameterNotRadius = Math.round(circumference / PI);
    const distractors = Array.from(new Set([String(forgotPi), String(foundDiameterNotRadius)])).filter(
      (d) => d !== String(radius)
    );
    question.options = shuffleOptions(String(radius), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, radius + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const radius = randInt(min, max);
  const correct = Math.round(2 * radius * PI * 100) / 100;
  const correctStr = correct.toFixed(2);

  // ---- errorSpotting: shown the documented "used radius as the
  // diameter" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongValue = Math.round(radius * PI * 100) / 100;
    const wrongStr = wrongValue.toFixed(2);
    if (wrongStr !== correctStr) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira lilitan bulatan dengan jejari ${radius} cm dan mendapat ${wrongStr} cm. Apakah jawapan yang betul? (Guna π = 3.142)`,
          en: `${name} calculated the circumference of a circle with radius ${radius} cm and got ${wrongStr} cm. What is the correct answer? (Use π = 3.142)`,
        },
        type: "mcq",
        correctAnswer: correctStr,
        context: { radius, correct, wrongValue },
        generatorKey: "circumference",
        difficulty: 3,
        diagram: { kind: "circle", radius },
        options: shuffleOptions(correctStr, [wrongStr]),
      };
      while (question.options!.length < 3) {
        const candidate = (correct + randInt(1, 9)).toFixed(2);
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: running-track scenario, real-world framing for
  // circumference.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} berlari sekeliling sebuah trek berbentuk bulatan dengan jejari ${radius} m, sekali pusingan penuh. Berapakah jarak yang ${name} lari? (Guna π = 3.142)`,
        en: `${name} runs once around a circular track with a radius of ${radius} m. What distance does ${name} run? (Use π = 3.142)`,
      },
      type: "word_problem",
      correctAnswer: correctStr,
      context: { radius, correct },
      generatorKey: "circumference",
      difficulty: 3,
      diagram: { kind: "circle", radius },
    };
    const forgotToDouble = Math.round(radius * PI * 100) / 100;
    const confusedWithArea = Math.round(radius * radius * PI * 100) / 100;
    question.options = shuffleOptions(
      correctStr,
      Array.from(new Set([forgotToDouble.toFixed(2), confusedWithArea.toFixed(2)])).filter((d) => d !== correctStr)
    );
    while (question.options.length < 3) {
      const candidate = (correct + randInt(1, 9)).toFixed(2);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari lilitan bulatan dengan jejari ${radius} cm. (Guna π = 3.142)`,
      en: `Find the circumference of a circle with radius ${radius} cm. (Use π = 3.142)`,
    },
    type,
    correctAnswer: correctStr,
    context: { radius, correct },
    generatorKey: "circumference",
    difficulty: 3,
    diagram: { kind: "circle", radius },
  };

  if (type === "mcq") {
    // Classic mistake: using the radius as if it were the diameter —
    // forgetting to double it before multiplying by π.
    const forgotToDouble = Math.round(radius * PI * 100) / 100;
    // Classic mistake: using the area formula (π × r²) instead.
    const confusedWithArea = Math.round(radius * radius * PI * 100) / 100;
    question.options = shuffleOptions(
      correctStr,
      Array.from(new Set([forgotToDouble.toFixed(2), confusedWithArea.toFixed(2)])).filter((d) => d !== correctStr)
    );
    while (question.options.length < 3) {
      const candidate = (correct + randInt(1, 9)).toFixed(2);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
