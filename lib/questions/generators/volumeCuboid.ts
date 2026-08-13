import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Volume" (Space, real ToC p.209) — basic solid volume via
// length × width × height. This didn't exist anywhere in Congak before
// (only liquid volume in ml/L existed) despite being a prerequisite for
// the Y5 "Volume of Composite Shapes" sub-topic.
export function generateVolumeCuboid(params: GeneratorParams): GeneratedQuestion {
  const min = Number(params.min ?? 2);
  const max = Number(params.max ?? 10);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): how many SMALL cuboid boxes fit
  // exactly into a LARGE cuboid box? Genuine second hop past the base
  // skill and reverseProblem (both only ever involve ONE cuboid): (1)
  // find the small box's volume, (2) find the large box's volume, THEN
  // (3) divide the large volume by the small volume.
  if (challenge) {
    const smallL = randInt(1, 4);
    const smallW = randInt(1, 4);
    const smallH = randInt(1, 4);
    const smallVolume = smallL * smallW * smallH;
    let a = randInt(1, 3), b = randInt(1, 3), c = randInt(1, 3);
    while (a * b * c < 2) { a = randInt(1, 3); b = randInt(1, 3); c = randInt(1, 3); }
    const bigL = smallL * a;
    const bigW = smallW * b;
    const bigH = smallH * c;
    const bigVolume = bigL * bigW * bigH;
    const boxesCount = a * b * c;
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kotak simpanan besar berbentuk kuboid berukuran ${bigL} cm × ${bigW} cm × ${bigH} cm. ${name} ingin mengisinya dengan kotak kecil berbentuk kuboid berukuran ${smallL} cm × ${smallW} cm × ${smallH} cm setiap satu. Berapa banyak kotak kecil boleh muat TEPAT di dalam kotak besar itu?`,
        en: `A large storage box shaped like a cuboid measures ${bigL} cm × ${bigW} cm × ${bigH} cm. ${name} wants to fill it with small cuboid boxes measuring ${smallL} cm × ${smallW} cm × ${smallH} cm each. How many small boxes fit EXACTLY inside the large box?`,
      },
      type: "word_problem",
      correctAnswer: String(boxesCount),
      context: { smallVolume, bigVolume, boxesCount, a },
      generatorKey: "volume_cuboid",
      difficulty: 3,
    };
    // Classic non-routine mistake: gives the big box's volume directly,
    // forgetting to divide by the small box's volume.
    const gaveBigVolume = bigVolume;
    // Classic non-routine mistake: only scales by ONE dimension's ratio,
    // forgetting the other two dimensions also scaled up.
    const usedOneDimensionOnly = a;
    const distractors = Array.from(
      new Set([gaveBigVolume, usedOneDimensionOnly].map(String).filter((d) => d !== String(boxesCount)))
    );
    question.options = shuffleOptions(String(boxesCount), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, boxesCount + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given the volume and two of the three
  // dimensions, find the missing dimension — dividing back.
  if (reverseProblem) {
    const length = randInt(min, max);
    const width = randInt(min, max);
    const height = randInt(min, max);
    const volume = length * width * height;
    const missingDim = pick(["length", "width", "height"] as const);
    const known = { length, width, height };
    const correct = known[missingDim];
    const knownEntries = (["length", "width", "height"] as const).filter((d) => d !== missingDim);
    const dimLabel = { length: { ms: "panjang", en: "length" }, width: { ms: "lebar", en: "width" }, height: { ms: "tinggi", en: "height" } };

    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kuboid mempunyai isi padu ${volume} cm³, ${dimLabel[knownEntries[0]].ms} ${known[knownEntries[0]]} cm, dan ${dimLabel[knownEntries[1]].ms} ${known[knownEntries[1]]} cm. Berapakah ${dimLabel[missingDim].ms} kuboid itu?`,
        en: `A cuboid has a volume of ${volume} cm³, a ${dimLabel[knownEntries[0]].en} of ${known[knownEntries[0]]} cm, and a ${dimLabel[knownEntries[1]].en} of ${known[knownEntries[1]]} cm. What is the ${dimLabel[missingDim].en} of the cuboid?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { length, width, height, volume, missingDim },
      generatorKey: "volume_cuboid",
      difficulty: 3,
    };
    // Classic mistake: divided the volume by only one known dimension instead of both.
    const dividedByOneOnly = Math.round(volume / known[knownEntries[0]]);
    // Classic mistake: gave one of the known dimensions again instead of solving for the missing one.
    const gaveKnownDim = known[knownEntries[0]];
    const distractors = Array.from(new Set([dividedByOneOnly, gaveKnownDim].map(String))).filter(
      (d) => d !== String(correct)
    );
    question.options = shuffleOptions(String(correct), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const length = randInt(min, max);
  const width = randInt(min, max);
  const height = randInt(min, max);
  const correct = length * width * height;

  // ---- errorSpotting: shown the documented "treated it like area"
  // mistake, must give the correct volume.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = length * width;
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Sebuah kuboid mempunyai panjang ${length} cm, lebar ${width} cm, dan tinggi ${height} cm. ${name} mengira isi padunya dan mendapat ${wrongAnswer} cm³. Apakah jawapan yang betul?`,
          en: `A cuboid has a length of ${length} cm, a width of ${width} cm, and a height of ${height} cm. ${name} calculated its volume and got ${wrongAnswer} cm³. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { length, width, height, correct, wrongAnswer },
        generatorKey: "volume_cuboid",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(correct + randInt(1, 20));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: storage-box scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah kotak simpanan berbentuk kuboid mempunyai panjang ${length} cm, lebar ${width} cm, dan tinggi ${height} cm. Berapakah isi padu kotak itu?`,
        en: `A storage box shaped like a cuboid has a length of ${length} cm, a width of ${width} cm, and a height of ${height} cm. What is the volume of the box?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { length, width, height, correct },
      generatorKey: "volume_cuboid",
      difficulty: 2,
    };
    const onlyTwoDims = length * width;
    const addedInstead = length + width + height;
    const distractors = Array.from(new Set([String(onlyTwoDims), String(addedInstead)])).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 20));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebuah kubus berbentuk kuboid mempunyai panjang ${length} cm, lebar ${width} cm, dan tinggi ${height} cm. Berapakah isi padu kuboid itu?`,
      en: `A cuboid has a length of ${length} cm, a width of ${width} cm, and a height of ${height} cm. What is the volume of the cuboid?`,
    },
    type,
    correctAnswer: String(correct),
    context: { length, width, height, correct },
    generatorKey: "volume_cuboid",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: only multiplied two of the three dimensions (treated it like area).
    const onlyTwoDims = length * width;
    // Classic mistake: added the three dimensions instead of multiplying.
    const addedInstead = length + width + height;
    const distractors = Array.from(new Set([String(onlyTwoDims), String(addedInstead)])).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(correct + randInt(1, 20));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
