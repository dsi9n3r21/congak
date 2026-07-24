import { randInt, shuffleOptions } from "../utils";
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
export function generateCombinedLengthMass(params: GeneratorParams): GeneratedQuestion {
  const maxPieces = Number(params.maxPieces ?? 6);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const pieces = randInt(2, maxPieces);
  const lengthPerPieceCm = randInt(20, 150);
  const totalLengthCm = lengthPerPieceCm * pieces;
  const massPerPieceG = randInt(100, 800);
  const totalMassG = massPerPieceG * pieces;

  const askLength = Math.random() > 0.5;
  const correctAnswer = askLength ? formatLength(lengthPerPieceCm) : formatMass(massPerPieceG);

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

  if (type === "mcq") {
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
export function generateCombinedLengthVolume(params: GeneratorParams): GeneratedQuestion {
  const maxSections = Number(params.maxSections ?? 6);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const sections = randInt(2, maxSections);
  const lengthPerSectionCm = randInt(20, 150);
  const totalLengthCm = lengthPerSectionCm * sections;
  const volumePerSectionMl = randInt(1, 8) * 100;
  const totalVolumeMl = volumePerSectionMl * sections;

  const askLength = Math.random() > 0.5;
  const correctAnswer = askLength ? formatLength(lengthPerSectionCm) : formatVolume(volumePerSectionMl);

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

  if (type === "mcq") {
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
export function generateCombinedMassVolume(params: GeneratorParams): GeneratedQuestion {
  const maxBatches = Number(params.maxBatches ?? 6);
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const batches = randInt(2, maxBatches);
  const massPerBatchG = randInt(50, 400);
  const totalMassG = massPerBatchG * batches;
  const volumePerBatchMl = randInt(1, 8) * 100;
  const totalVolumeMl = volumePerBatchMl * batches;

  const askMass = Math.random() > 0.5;
  const correctAnswer = askMass ? formatMass(massPerBatchG) : formatVolume(volumePerBatchMl);

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

  if (type === "mcq") {
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
