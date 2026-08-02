import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";
import { formatLength } from "./length";

function formatMass(totalG: number): string {
  const kg = Math.floor(totalG / 1000);
  const g = totalG % 1000;
  if (kg === 0) return `${g}g`;
  if (g === 0) return `${kg}kg`;
  return `${kg}kg ${g}g`;
}

function formatVolume(totalMl: number): string {
  const l = Math.floor(totalMl / 1000);
  const ml = totalMl % 1000;
  if (l === 0) return `${ml}ml`;
  if (ml === 0) return `${l}L`;
  return `${l}L ${ml}ml`;
}

// Year 6 KSSR shifts from single-unit arithmetic (Y4/Y5) to "combined"
// measurement problems mixing two units in one real-world scenario — here,
// a rope's length and a parcel's mass are both divided by the same number
// of equal pieces in one question, asking for just one of the two results
// (keeps a single correctAnswer, same as every other generator).
//
// Retrofitted per the Round 19 content standard: added errorSpotting (the
// documented "mixed up which quantity was asked" mistake, shown as a
// worked wrong answer) and a reverseProblem variant that goes the other
// direction — given the per-piece values, find the total before cutting
// (multiplying back, the genuine reverse of the base division).
export function generateCombinedLengthMass(params: GeneratorParams): GeneratedQuestion {
  const maxPieces = Number(params.maxPieces ?? 6);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the per-piece length and weight, find the
  // TOTAL before cutting — multiplying back, the reverse of the base
  // division.
  if (reverseProblem) {
    const pieces = randInt(2, maxPieces);
    const lengthPerPieceCm = randInt(20, 150);
    const massPerPieceG = randInt(100, 800);
    const totalLengthCm = lengthPerPieceCm * pieces;
    const totalMassG = massPerPieceG * pieces;
    const askLength = Math.random() > 0.5;
    const correctAnswer = askLength ? formatLength(totalLengthCm) : formatMass(totalMassG);
    const name = pick(names);

    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} memotong seutas tali kepada ${pieces} bahagian sama. Setiap bahagian panjangnya ${formatLength(lengthPerPieceCm)} dan beratnya ${formatMass(massPerPieceG)}. Berapakah ${askLength ? "panjang" : "berat"} tali itu sebelum dipotong?`,
        en: `${name} cuts a rope into ${pieces} equal pieces. Each piece is ${formatLength(lengthPerPieceCm)} long and weighs ${formatMass(massPerPieceG)}. What was the ${askLength ? "length" : "weight"} of the rope before it was cut?`,
      },
      type: "word_problem",
      correctAnswer,
      context: { totalLengthCm, totalMassG, pieces, lengthPerPieceCm, massPerPieceG, askLength: askLength ? "yes" : "no" },
      generatorKey: "combined_length_mass",
      difficulty: 3,
    };
    // Classic mistake: gave the per-piece value again, forgetting to multiply back.
    const gavePerPiece = askLength ? formatLength(lengthPerPieceCm) : formatMass(massPerPieceG);
    // Classic mistake: answered with the other quantity's total.
    const mixedUpQuantity = askLength ? formatMass(totalMassG) : formatLength(totalLengthCm);
    const distractors = Array.from(new Set([gavePerPiece, mixedUpQuantity].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askLength ? formatLength(totalLengthCm + bump) : formatMass(totalMassG + bump);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const pieces = randInt(2, maxPieces);
  const lengthPerPieceCm = randInt(20, 150);
  const totalLengthCm = lengthPerPieceCm * pieces;
  const massPerPieceG = randInt(100, 800);
  const totalMassG = massPerPieceG * pieces;

  const askLength = Math.random() > 0.5;
  const correctAnswer = askLength ? formatLength(lengthPerPieceCm) : formatMass(massPerPieceG);

  // ---- errorSpotting: shown the documented "mixed up which quantity was
  // asked" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = askLength ? formatMass(massPerPieceG) : formatLength(lengthPerPieceCm);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Seutas tali panjangnya ${formatLength(totalLengthCm)} dan beratnya ${formatMass(totalMassG)}. Ia dipotong kepada ${pieces} bahagian yang sama. ${name} ditanya ${askLength ? "panjang" : "berat"} setiap bahagian, tetapi menjawab ${wrongAnswer}. Apakah jawapan yang betul?`,
        en: `A rope is ${formatLength(totalLengthCm)} long and weighs ${formatMass(totalMassG)}. It is cut into ${pieces} equal pieces. ${name} was asked for the ${askLength ? "length" : "weight"} of each piece, but answered ${wrongAnswer}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer,
      context: { totalLengthCm, totalMassG, pieces, lengthPerPieceCm, massPerPieceG, askLength: askLength ? "yes" : "no", wrongAnswer },
      generatorKey: "combined_length_mass",
      difficulty: 3,
      options: shuffleOptions(correctAnswer, [wrongAnswer]),
    };
    // Pad to at least 3 options — errorSpotting only naturally supplies
    // one distractor (the other quantity's per-piece value).
    while (question.options!.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askLength ? formatLength(lengthPerPieceCm + bump) : formatMass(massPerPieceG + bump);
      if (!question.options!.includes(candidate)) question.options!.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Seutas tali panjangnya ${formatLength(totalLengthCm)} dan beratnya ${formatMass(totalMassG)}. Ia dipotong kepada ${pieces} bahagian yang sama. Berapakah ${askLength ? "panjang" : "berat"} setiap bahagian?`,
      en: `A rope is ${formatLength(totalLengthCm)} long and weighs ${formatMass(totalMassG)}. It is cut into ${pieces} equal pieces. What is the ${askLength ? "length" : "weight"} of each piece?`,
    },
    type,
    correctAnswer,
    context: { totalLengthCm, totalMassG, pieces, lengthPerPieceCm, massPerPieceG, askLength: askLength ? "yes" : "no" },
    generatorKey: "combined_length_mass",
    difficulty: 3,
  };

  if (type === "mcq" || type === "word_problem") {
    // Classic mistake: answering with the OTHER quantity's per-piece value
    // (mixing up which measurement the question actually asked about).
    const mixedUpQuantity = askLength ? formatMass(massPerPieceG) : formatLength(lengthPerPieceCm);
    // Classic mistake: gave the total instead of dividing by the pieces.
    const gaveTotal = askLength ? formatLength(totalLengthCm) : formatMass(totalMassG);
    const distractors = Array.from(new Set([mixedUpQuantity, gaveTotal].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askLength ? formatLength(lengthPerPieceCm + bump) : formatMass(massPerPieceG + bump);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Second Y6 "combined measurement" pairing: a garden hose's length and a
// bottle of fertiliser's volume, both divided among the same number of
// equal garden sections. Same single-correctAnswer constraint as
// combined_length_mass — ask for just one of the two per-section values.
//
// Retrofitted per the Round 19 content standard: same treatment as
// combined_length_mass — errorSpotting (documented "mixed up which
// quantity was asked" mistake) and a reverseProblem variant that finds
// the total before dividing (multiplying back).
export function generateCombinedLengthVolume(params: GeneratorParams): GeneratedQuestion {
  const maxSections = Number(params.maxSections ?? 6);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the per-section length and volume, find the
  // TOTAL before dividing — multiplying back, the reverse of the base
  // division.
  if (reverseProblem) {
    const sections = randInt(2, maxSections);
    const lengthPerSectionCm = randInt(20, 150);
    const volumePerSectionMl = randInt(1, 8) * 100;
    const totalLengthCm = lengthPerSectionCm * sections;
    const totalVolumeMl = volumePerSectionMl * sections;
    const askLength = Math.random() > 0.5;
    const correctAnswer = askLength ? formatLength(totalLengthCm) : formatVolume(totalVolumeMl);
    const name = pick(names);

    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membahagikan hos taman dan baja cecair sama rata kepada ${sections} bahagian. Setiap bahagian mendapat hos sepanjang ${formatLength(lengthPerSectionCm)} dan baja seisipadu ${formatVolume(volumePerSectionMl)}. Berapakah ${askLength ? "panjang" : "isipadu"} keseluruhan sebelum dibahagikan?`,
        en: `${name} divides a garden hose and liquid fertiliser equally among ${sections} sections. Each section gets ${formatLength(lengthPerSectionCm)} of hose and ${formatVolume(volumePerSectionMl)} of fertiliser. What was the total ${askLength ? "length" : "volume"} before it was divided?`,
      },
      type: "word_problem",
      correctAnswer,
      context: { totalLengthCm, totalVolumeMl, sections, lengthPerSectionCm, volumePerSectionMl, askLength: askLength ? "yes" : "no" },
      generatorKey: "combined_length_volume",
      difficulty: 3,
    };
    // Classic mistake: gave the per-section value again, forgetting to multiply back.
    const gavePerSection = askLength ? formatLength(lengthPerSectionCm) : formatVolume(volumePerSectionMl);
    // Classic mistake: answered with the other quantity's total.
    const mixedUpQuantity = askLength ? formatVolume(totalVolumeMl) : formatLength(totalLengthCm);
    const distractors = Array.from(new Set([gavePerSection, mixedUpQuantity].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askLength ? formatLength(totalLengthCm + bump) : formatVolume(totalVolumeMl + bump);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const sections = randInt(2, maxSections);
  const lengthPerSectionCm = randInt(20, 150);
  const totalLengthCm = lengthPerSectionCm * sections;
  const volumePerSectionMl = randInt(1, 8) * 100;
  const totalVolumeMl = volumePerSectionMl * sections;

  const askLength = Math.random() > 0.5;
  const correctAnswer = askLength ? formatLength(lengthPerSectionCm) : formatVolume(volumePerSectionMl);

  // ---- errorSpotting: shown the documented "mixed up which quantity was
  // asked" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = askLength ? formatVolume(volumePerSectionMl) : formatLength(lengthPerSectionCm);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebatang hos taman panjangnya ${formatLength(totalLengthCm)} dan sebotol baja cecair berisi ${formatVolume(totalVolumeMl)}. Kedua-duanya dibahagikan sama rata kepada ${sections} bahagian taman. ${name} ditanya ${askLength ? "panjang" : "isipadu"} bagi setiap bahagian, tetapi menjawab ${wrongAnswer}. Apakah jawapan yang betul?`,
        en: `A garden hose is ${formatLength(totalLengthCm)} long and a bottle of liquid fertiliser holds ${formatVolume(totalVolumeMl)}. Both are divided equally among ${sections} garden sections. ${name} was asked for the ${askLength ? "length" : "volume"} for each section, but answered ${wrongAnswer}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer,
      context: { totalLengthCm, totalVolumeMl, sections, lengthPerSectionCm, volumePerSectionMl, askLength: askLength ? "yes" : "no", wrongAnswer },
      generatorKey: "combined_length_volume",
      difficulty: 3,
      options: shuffleOptions(correctAnswer, [wrongAnswer]),
    };
    // Pad to at least 3 options — errorSpotting only naturally supplies
    // one distractor (the other quantity's per-section value).
    while (question.options!.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askLength ? formatLength(lengthPerSectionCm + bump) : formatVolume(volumePerSectionMl + bump);
      if (!question.options!.includes(candidate)) question.options!.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Sebatang hos taman panjangnya ${formatLength(totalLengthCm)} dan sebotol baja cecair berisi ${formatVolume(totalVolumeMl)}. Kedua-duanya dibahagikan sama rata kepada ${sections} bahagian taman. Berapakah ${askLength ? "panjang" : "isipadu"} bagi setiap bahagian?`,
      en: `A garden hose is ${formatLength(totalLengthCm)} long and a bottle of liquid fertiliser holds ${formatVolume(totalVolumeMl)}. Both are divided equally among ${sections} garden sections. What is the ${askLength ? "length" : "volume"} for each section?`,
    },
    type,
    correctAnswer,
    context: { totalLengthCm, totalVolumeMl, sections, lengthPerSectionCm, volumePerSectionMl, askLength: askLength ? "yes" : "no" },
    generatorKey: "combined_length_volume",
    difficulty: 3,
  };

  if (type === "mcq" || type === "word_problem") {
    // Classic mistake: answering with the OTHER quantity's per-section value.
    const mixedUpQuantity = askLength ? formatVolume(volumePerSectionMl) : formatLength(lengthPerSectionCm);
    // Classic mistake: gave the total instead of dividing by the sections.
    const gaveTotal = askLength ? formatLength(totalLengthCm) : formatVolume(totalVolumeMl);
    const distractors = Array.from(new Set([mixedUpQuantity, gaveTotal].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askLength ? formatLength(lengthPerSectionCm + bump) : formatVolume(volumePerSectionMl + bump);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Third Y6 "combined measurement" pairing: a recipe's flour (mass) and
// milk (volume), both scaled down to one batch out of several equal
// batches. Same single-correctAnswer constraint as the other two.
//
// Retrofitted per the Round 19 content standard: same treatment as the
// other two combined-measurement generators — errorSpotting (documented
// "mixed up which quantity was asked" mistake) and a reverseProblem
// variant that finds the total recipe amount before splitting into
// batches (multiplying back).
export function generateCombinedMassVolume(params: GeneratorParams): GeneratedQuestion {
  const maxBatches = Number(params.maxBatches ?? 6);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- reverseProblem: given the per-batch mass and volume, find the
  // TOTAL recipe amount before splitting — multiplying back, the reverse
  // of the base division.
  if (reverseProblem) {
    const batches = randInt(2, maxBatches);
    const massPerBatchG = randInt(50, 400);
    const volumePerBatchMl = randInt(1, 8) * 100;
    const totalMassG = massPerBatchG * batches;
    const totalVolumeMl = volumePerBatchMl * batches;
    const askMass = Math.random() > 0.5;
    const correctAnswer = askMass ? formatMass(totalMassG) : formatVolume(totalVolumeMl);
    const name = pick(names);

    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} membahagikan adunan kepada ${batches} bahagian sama banyak. Setiap bahagian menggunakan ${formatMass(massPerBatchG)} tepung dan ${formatVolume(volumePerBatchMl)} susu. Berapakah jumlah ${askMass ? "tepung" : "susu"} yang digunakan sebelum dibahagikan?`,
        en: `${name} divides a batter into ${batches} equal batches. Each batch uses ${formatMass(massPerBatchG)} of flour and ${formatVolume(volumePerBatchMl)} of milk. What was the total amount of ${askMass ? "flour" : "milk"} used before it was divided?`,
      },
      type: "word_problem",
      correctAnswer,
      context: { totalMassG, totalVolumeMl, batches, massPerBatchG, volumePerBatchMl, askMass: askMass ? "yes" : "no" },
      generatorKey: "combined_mass_volume",
      difficulty: 3,
    };
    // Classic mistake: gave the per-batch value again, forgetting to multiply back.
    const gavePerBatch = askMass ? formatMass(massPerBatchG) : formatVolume(volumePerBatchMl);
    // Classic mistake: answered with the other quantity's total.
    const mixedUpQuantity = askMass ? formatVolume(totalVolumeMl) : formatMass(totalMassG);
    const distractors = Array.from(new Set([gavePerBatch, mixedUpQuantity].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askMass ? formatMass(totalMassG + bump) : formatVolume(totalVolumeMl + bump);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const batches = randInt(2, maxBatches);
  const massPerBatchG = randInt(50, 400);
  const totalMassG = massPerBatchG * batches;
  const volumePerBatchMl = randInt(1, 8) * 100;
  const totalVolumeMl = volumePerBatchMl * batches;

  const askMass = Math.random() > 0.5;
  const correctAnswer = askMass ? formatMass(massPerBatchG) : formatVolume(volumePerBatchMl);

  // ---- errorSpotting: shown the documented "mixed up which quantity was
  // asked" mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = askMass ? formatVolume(volumePerBatchMl) : formatMass(massPerBatchG);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Satu resipi menggunakan ${formatMass(totalMassG)} tepung dan ${formatVolume(totalVolumeMl)} susu untuk membuat ${batches} bahagian yang sama banyak. ${name} ditanya ${askMass ? "berat tepung" : "isipadu susu"} bagi setiap bahagian, tetapi menjawab ${wrongAnswer}. Apakah jawapan yang betul?`,
        en: `A recipe uses ${formatMass(totalMassG)} of flour and ${formatVolume(totalVolumeMl)} of milk to make ${batches} equal batches. ${name} was asked for the ${askMass ? "mass of flour" : "volume of milk"} for each batch, but answered ${wrongAnswer}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer,
      context: { totalMassG, totalVolumeMl, batches, massPerBatchG, volumePerBatchMl, askMass: askMass ? "yes" : "no", wrongAnswer },
      generatorKey: "combined_mass_volume",
      difficulty: 3,
      options: shuffleOptions(correctAnswer, [wrongAnswer]),
    };
    // Pad to at least 3 options — errorSpotting only naturally supplies
    // one distractor (the other quantity's per-batch value).
    while (question.options!.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askMass ? formatMass(massPerBatchG + bump) : formatVolume(volumePerBatchMl + bump);
      if (!question.options!.includes(candidate)) question.options!.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Satu resipi menggunakan ${formatMass(totalMassG)} tepung dan ${formatVolume(totalVolumeMl)} susu untuk membuat ${batches} bahagian yang sama banyak. Berapakah ${askMass ? "berat tepung" : "isipadu susu"} bagi setiap bahagian?`,
      en: `A recipe uses ${formatMass(totalMassG)} of flour and ${formatVolume(totalVolumeMl)} of milk to make ${batches} equal batches. What is the ${askMass ? "mass of flour" : "volume of milk"} for each batch?`,
    },
    type,
    correctAnswer,
    context: { totalMassG, totalVolumeMl, batches, massPerBatchG, volumePerBatchMl, askMass: askMass ? "yes" : "no" },
    generatorKey: "combined_mass_volume",
    difficulty: 3,
  };

  if (type === "mcq" || type === "word_problem") {
    // Classic mistake: answering with the OTHER quantity's per-batch value.
    const mixedUpQuantity = askMass ? formatVolume(volumePerBatchMl) : formatMass(massPerBatchG);
    // Classic mistake: gave the total instead of dividing by the batches.
    const gaveTotal = askMass ? formatMass(totalMassG) : formatVolume(totalVolumeMl);
    const distractors = Array.from(new Set([mixedUpQuantity, gaveTotal].filter((d) => d !== correctAnswer)));
    question.options = shuffleOptions(correctAnswer, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(5, 30);
      const candidate = askMass ? formatMass(massPerBatchG + bump) : formatVolume(volumePerBatchMl + bump);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
