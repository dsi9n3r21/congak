import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

const PI = 3.142; // KSSR convention — same as circumference, for consistency

// Year 6 KSSR "Area of a Circle". Retrofitted per the Round 19 content
// standard: added a real garden word_problem, errorSpotting (the
// documented "used the circumference formula instead" mistake), and a
// reverseProblem variant that gives the area and asks for the radius —
// built from a known integer radius so the "correct" answer is always
// exact, avoiding a messy runtime square root.
export function generateAreaCircle(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 3);
  const max = Number(params.max ?? 15);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): same "measurement feeds into a
  // real cost calculation" shape as perimeter/area_rectangle/circumference
  // /area_triangle — find the tabletop's area (this topic's own skill),
  // then multiply by a cost-per-square-centimetre rate. Natural
  // distractor: stops at the area itself, forgetting to price it.
  if (challenge) {
    const radiusC = randInt(min, max);
    const areaC = Math.round(radiusC * radiusC * PI * 100) / 100;
    const ratePerSqCm = randInt(2, 8);
    const totalCost = Math.round(areaC * ratePerSqCm * 100) / 100;
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sekeping meja bulat mempunyai jejari ${radiusC} cm. ${name} ingin melitupi permukaan meja itu dengan kanvas berharga RM${ratePerSqCm} setiap sentimeter persegi. (Guna π = 3.142) Berapakah jumlah kos kanvas itu?`,
        en: `A round table has a radius of ${radiusC} cm. ${name} wants to cover the tabletop with canvas costing RM${ratePerSqCm} per square centimetre. (Use π = 3.142) What is the total cost of the canvas?`,
      },
      type: "word_problem",
      correctAnswer: `RM${totalCost.toFixed(2)}`,
      context: { radius: radiusC, area: areaC, ratePerSqCm, totalCost },
      generatorKey: "area_circle",
      difficulty: 3,
      diagram: { kind: "circle", radius: radiusC },
    };
    // Classic non-routine mistake: stops after finding the area,
    // forgetting to multiply by the cost rate.
    const stoppedAtArea = `RM${areaC.toFixed(2)}`;
    const distractors = [stoppedAtArea].filter((d) => d !== `RM${totalCost.toFixed(2)}`);
    question.options = shuffleOptions(`RM${totalCost.toFixed(2)}`, distractors);
    while (question.options.length < 3) {
      const candidate = `RM${Math.max(1, totalCost + randInt(1, 20) * (Math.random() > 0.5 ? 1 : -1)).toFixed(2)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the area, find the radius — built from a
  // known integer radius so the answer is always exact.
  if (reverseProblem) {
    const radius = randInt(min, max);
    const area = Math.round(radius * radius * PI * 100) / 100;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Luas sebuah bulatan ialah ${area.toFixed(2)} cm². (Guna π = 3.142) Berapakah jejarinya?`,
        en: `The area of a circle is ${area.toFixed(2)} cm². (Use π = 3.142) What is its radius?`,
      },
      type: "word_problem",
      correctAnswer: String(radius),
      context: { radius, area },
      generatorKey: "area_circle",
      difficulty: 3,
    };
    // Classic mistake: divided the area by π and by 2 instead of taking the square root (used the circumference-reverse method).
    const usedCircumferenceMethod = Math.round(area / PI / 2);
    // Classic mistake: divided the area by π only, forgetting the square root entirely.
    const forgotSquareRoot = Math.round(area / PI);
    const distractors = Array.from(new Set([String(usedCircumferenceMethod), String(forgotSquareRoot)])).filter(
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
  const correct = Math.round(radius * radius * PI * 100) / 100;
  const correctStr = correct.toFixed(2);

  // ---- errorSpotting: shown the documented "used the circumference
  // formula instead" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongValue = Math.round(2 * radius * PI * 100) / 100;
    const wrongStr = wrongValue.toFixed(2);
    if (wrongStr !== correctStr) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira luas bulatan dengan jejari ${radius} cm dan mendapat ${wrongStr} cm². Apakah jawapan yang betul? (Guna π = 3.142)`,
          en: `${name} calculated the area of a circle with radius ${radius} cm and got ${wrongStr} cm². What is the correct answer? (Use π = 3.142)`,
        },
        type: "mcq",
        correctAnswer: correctStr,
        context: { radius, correct, wrongValue },
        generatorKey: "area_circle",
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

  // ---- word_problem: circular garden scenario, real-world framing for
  // area of a circle.
  if (type === "word_problem") {
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} mempunyai sebuah taman berbentuk bulatan dengan jejari ${radius} m. Berapakah luas taman itu? (Guna π = 3.142)`,
        en: `${name} has a circular garden with a radius of ${radius} m. What is the area of the garden? (Use π = 3.142)`,
      },
      type: "word_problem",
      correctAnswer: correctStr,
      context: { radius, correct },
      generatorKey: "area_circle",
      difficulty: 3,
      diagram: { kind: "circle", radius },
    };
    const confusedWithCircumference = Math.round(2 * radius * PI * 100) / 100;
    const squaredDiameterInstead = Math.round(2 * radius * (2 * radius) * PI * 100) / 100;
    question.options = shuffleOptions(
      correctStr,
      Array.from(new Set([confusedWithCircumference.toFixed(2), squaredDiameterInstead.toFixed(2)])).filter(
        (d) => d !== correctStr
      )
    );
    while (question.options.length < 3) {
      const candidate = (correct + randInt(1, 9)).toFixed(2);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Cari luas bulatan dengan jejari ${radius} cm. (Guna π = 3.142)`,
      en: `Find the area of a circle with radius ${radius} cm. (Use π = 3.142)`,
    },
    type,
    correctAnswer: correctStr,
    context: { radius, correct },
    generatorKey: "area_circle",
    difficulty: 3,
    diagram: { kind: "circle", radius },
  };

  if (type === "mcq") {
    // Classic mistake: using the circumference formula (2 × π × r) instead.
    const confusedWithCircumference = Math.round(2 * radius * PI * 100) / 100;
    // Classic mistake: squaring the diameter instead of the radius —
    // π × (2r)² instead of π × r².
    const squaredDiameterInstead = Math.round(2 * radius * (2 * radius) * PI * 100) / 100;
    question.options = shuffleOptions(
      correctStr,
      Array.from(new Set([confusedWithCircumference.toFixed(2), squaredDiameterInstead.toFixed(2)])).filter((d) => d !== correctStr)
    );
    while (question.options.length < 3) {
      const candidate = (correct + randInt(1, 9)).toFixed(2);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
