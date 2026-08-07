import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

function formatTime(hour: number, minute: number): string {
  const h = ((hour - 1) % 12) + 1;
  return `${h}:${String(minute).padStart(2, "0")}`;
}

// Year 5 KSSR "Time & Duration" — start time + duration = end time.
// Retrofitted per the Round 19 content standard: added real Malaysian
// word_problem scenarios (was previously a generic "A class starts at…"
// regardless of type), an errorSpotting variant, and a reverseProblem
// variant (given the end time and duration, find the start time —
// subtraction, the natural reverse of this topic's addition skill).
export function generateTimeDuration(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  const startHour = randInt(1, 12);
  const startMinute = pick([0, 15, 30, 45]);
  const durationMinutes = pick([15, 30, 45, 60, 75, 90, 105, 120]);

  const totalMinutes = startHour * 60 + startMinute + durationMinutes;
  const endHour = Math.floor(totalMinutes / 60) % 12 || 12;
  const endMinute = totalMinutes % 60;
  const correct = formatTime(endHour, endMinute);

  // ---- reverseProblem: given the end time and duration, find the start
  // time (subtracting the duration back off the end time).
  if (reverseProblem) {
    const name = pick(names);
    const startMinutesTotal = startHour * 60 + startMinute;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Kelas tuisyen ${name} tamat pada pukul ${correct} selepas berlangsung selama ${durationMinutes} minit. Pukul berapakah kelas itu bermula?`,
        en: `${name}'s tuition class ends at ${correct} after lasting ${durationMinutes} minutes. What time did the class start?`,
      },
      type: "word_problem",
      correctAnswer: formatTime(startHour, startMinute),
      context: { startHour, startMinute, durationMinutes, correct },
      generatorKey: "time_duration",
      difficulty: 3,
    };
    // Classic mistake: added the duration to the end time instead of subtracting.
    const addedInstead = totalMinutes + durationMinutes;
    const addedHour = Math.floor(addedInstead / 60) % 12 || 12;
    const addedMinute = addedInstead % 60;
    const distractor1 = formatTime(addedHour, addedMinute);
    question.options = shuffleOptions(formatTime(startHour, startMinute), [distractor1].filter((d) => d !== formatTime(startHour, startMinute)));
    while (question.options.length < 3) {
      const offsetMinutes = startMinutesTotal + randInt(5, 50) * (Math.random() > 0.5 ? 1 : -1);
      const candidateHour = Math.floor(((offsetMinutes % 720) + 720) / 60) % 12 || 12;
      const candidateMinute = ((offsetMinutes % 60) + 60) % 60;
      const candidate = formatTime(candidateHour, candidateMinute);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "forgot to carry the hour"
  // mistake, must give the correct end time. Only meaningful when the
  // duration actually pushes minutes past 60 — otherwise there's no carry
  // to forget, and the "wrong" answer would trivially equal the correct
  // one. Resample duration (keeping the same startMinute) until a genuine
  // carry occurs.
  if (errorSpotting) {
    const name = pick(names);
    let esDuration = durationMinutes;
    while (startMinute + esDuration < 60) {
      esDuration = pick([15, 30, 45, 60, 75, 90, 105, 120]);
    }
    const esTotalMinutes = startHour * 60 + startMinute + esDuration;
    const esEndHour = Math.floor(esTotalMinutes / 60) % 12 || 12;
    const esEndMinute = esTotalMinutes % 60;
    const esCorrect = formatTime(esEndHour, esEndMinute);
    const wrongAnswer = formatTime(startHour, (startMinute + esDuration) % 60);
    return {
      prompt: {
        ms: `${name} mengira kelas yang bermula pada ${formatTime(startHour, startMinute)} dan berlangsung ${esDuration} minit, lalu mendapat jawapan ${wrongAnswer}. Apakah jawapan yang betul?`,
        en: `${name} calculated a class starting at ${formatTime(startHour, startMinute)} lasting ${esDuration} minutes, and got the answer ${wrongAnswer}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: esCorrect,
      context: { startHour, startMinute, durationMinutes: esDuration, correct: esCorrect, wrongAnswer },
      generatorKey: "time_duration",
      difficulty: 3,
      options: shuffleOptions(esCorrect, [wrongAnswer].filter((d) => d !== esCorrect)),
    };
  }

  // ---- word_problem: real Malaysian classroom/community scenarios.
  if (type === "word_problem") {
    const name = pick(names);
    const scenario = pick(["tuition", "assembly", "recess", "tv"] as const);
    const prompt = {
      tuition: {
        ms: `Kelas tuisyen ${name} bermula pada ${formatTime(startHour, startMinute)} dan berlangsung selama ${durationMinutes} minit. Pukul berapakah kelas itu tamat?`,
        en: `${name}'s tuition class starts at ${formatTime(startHour, startMinute)} and lasts ${durationMinutes} minutes. What time does it end?`,
      },
      assembly: {
        ms: `Perhimpunan sekolah ${name} bermula pada ${formatTime(startHour, startMinute)} dan mengambil masa ${durationMinutes} minit. Pukul berapakah ia tamat?`,
        en: `${name}'s school assembly starts at ${formatTime(startHour, startMinute)} and takes ${durationMinutes} minutes. What time does it end?`,
      },
      recess: {
        ms: `Waktu rehat di sekolah ${name} bermula pada ${formatTime(startHour, startMinute)} dan berlangsung selama ${durationMinutes} minit. Pukul berapakah waktu rehat tamat?`,
        en: `Recess at ${name}'s school starts at ${formatTime(startHour, startMinute)} and lasts ${durationMinutes} minutes. What time does recess end?`,
      },
      tv: {
        ms: `Rancangan televisyen kegemaran ${name} bermula pada ${formatTime(startHour, startMinute)} dan berlangsung ${durationMinutes} minit. Pukul berapakah ia tamat?`,
        en: `${name}'s favourite TV programme starts at ${formatTime(startHour, startMinute)} and lasts ${durationMinutes} minutes. What time does it end?`,
      },
    }[scenario];
    const question: GeneratedQuestion = {
      prompt,
      type: "word_problem",
      correctAnswer: correct,
      context: { startHour, startMinute, durationMinutes, correct },
      generatorKey: "time_duration",
      difficulty: 2,
    };
    const noHourCarry = formatTime(startHour, (startMinute + durationMinutes) % 60);
    const droppedMinutes = formatTime(startHour + Math.floor(durationMinutes / 60), startMinute);
    question.options = shuffleOptions(correct, [noHourCarry, droppedMinutes].filter((d) => d !== correct));
    while (question.options.length < 3) {
      const offsetMinutes = totalMinutes + randInt(5, 50) * (Math.random() > 0.5 ? 1 : -1);
      const candidateHour = Math.floor(((offsetMinutes % 720) + 720) / 60) % 12 || 12;
      const candidateMinute = ((offsetMinutes % 60) + 60) % 60;
      const candidate = formatTime(candidateHour, candidateMinute);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Kelas bermula pada ${formatTime(startHour, startMinute)} dan berlangsung selama ${durationMinutes} minit. Pukul berapakah kelas tamat?`,
      en: `A class starts at ${formatTime(startHour, startMinute)} and lasts ${durationMinutes} minutes. What time does it end?`,
    },
    type,
    correctAnswer: correct,
    context: { startHour, startMinute, durationMinutes, correct },
    generatorKey: "time_duration",
    difficulty: durationMinutes > 60 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: adding the minutes but forgetting to carry the hour
    // over when the total passes 60.
    const noHourCarry = formatTime(startHour, (startMinute + durationMinutes) % 60);
    // Classic mistake: adding duration as if it were only whole hours,
    // dropping the leftover minutes.
    const droppedMinutes = formatTime(startHour + Math.floor(durationMinutes / 60), startMinute);
    question.options = shuffleOptions(
      correct,
      [noHourCarry, droppedMinutes].filter((d) => d !== correct)
    );
    // The two distractors above can collide with each other or with the
    // correct answer for some start-time/duration combos — pad with a
    // random-offset time until there are genuinely 3 unique options.
    while (question.options.length < 3) {
      const offsetMinutes = totalMinutes + randInt(5, 50) * (Math.random() > 0.5 ? 1 : -1);
      const candidateHour = Math.floor(((offsetMinutes % 720) + 720) / 60) % 12 || 12;
      const candidateMinute = ((offsetMinutes % 60) + 60) % 60;
      const candidate = formatTime(candidateHour, candidateMinute);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 4 KSSR "Addition/Subtraction of Time" — hours and minutes, expressed
// as a duration (e.g. "2j 45m") rather than a clock time, since
// generateTimeDuration above already covers the clock-time-plus-duration
// case. Regrouping at 60 minutes = 1 hour is the whole point of the topic.
// The prompt text is bilingual (ms/en), but the answer/options must be a
// single language-neutral string — "2j 45m" (like this file's existing
// formatTime, which is also language-neutral) rather than spelled-out
// "jam"/"hours" words, so an English-preference student doesn't see Malay
// text in their answer choices.
function formatDurationNeutral(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

function formatDurationWords(totalMinutes: number, lang: "ms" | "en"): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (lang === "ms") {
    if (h === 0) return `${m} minit`;
    if (m === 0) return `${h} jam`;
    return `${h} jam ${m} minit`;
  }
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

// Year 4 KSSR "Adding & Subtracting Time" (hours/minutes, regrouping at 60
// min = 1 hr — the base-60 counterpart to money's base-100 regrouping).
// Retrofitted per the Round 19 content standard: added a real studying-two-
// subjects word_problem (matches this topic's explanation text),
// errorSpotting, and reverseProblem.
export function generateTimeAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxHours = Number(params.maxHours ?? 5);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];
  const subjects = ["Matematik", "Sains", "Bahasa Melayu", "Bahasa Inggeris"] as const;
  const subjectsEn: Record<(typeof subjects)[number], string> = {
    Matematik: "Maths",
    Sains: "Science",
    "Bahasa Melayu": "Malay",
    "Bahasa Inggeris": "English",
  };

  const op = pick(["add", "subtract"] as const);
  let aMinutes = randInt(1, maxHours) * 60 + pick([0, 15, 30, 45]);
  let bMinutes = randInt(1, maxHours) * 60 + pick([0, 15, 30, 45]);
  if (op === "subtract" && bMinutes > aMinutes) [aMinutes, bMinutes] = [bMinutes, aMinutes];

  const correctMinutes = op === "add" ? aMinutes + bMinutes : aMinutes - bMinutes;
  const symbol = op === "add" ? "+" : "−";

  // ---- reverseProblem: given the total study time and one subject's time,
  // find the other subject's time (subtraction).
  if (reverseProblem) {
    const name = pick(names);
    const subjectA = pick(subjects);
    const subjectB = pick(subjects.filter((s) => s !== subjectA));
    const total = aMinutes + bMinutes;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${name} belajar ${subjectA} dan ${subjectB} selama jumlah ${formatDurationWords(total, "ms")}. ${name} belajar ${subjectA} selama ${formatDurationWords(aMinutes, "ms")}. Berapa lamakah ${name} belajar ${subjectB}?`,
        en: `${name} studies ${subjectsEn[subjectA]} and ${subjectsEn[subjectB]} for a total of ${formatDurationWords(total, "en")}. ${name} studies ${subjectsEn[subjectA]} for ${formatDurationWords(aMinutes, "en")}. How long does ${name} study ${subjectsEn[subjectB]}?`,
      },
      type: "word_problem",
      correctAnswer: formatDurationNeutral(bMinutes),
      context: { aMinutes, bMinutes, total },
      generatorKey: "time_add_subtract",
      difficulty: 3,
    };
    // Classic mistake: added the total and the given subject's time instead of subtracting.
    const addedInstead = formatDurationNeutral(total + aMinutes);
    // Classic mistake: gave the total again instead of the difference.
    const gaveTotal = formatDurationNeutral(total);
    const distractors = Array.from(new Set([addedInstead, gaveTotal])).filter(
      (d) => d !== formatDurationNeutral(bMinutes)
    );
    question.options = shuffleOptions(formatDurationNeutral(bMinutes), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateMinutes = Math.max(0, bMinutes + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatDurationNeutral(candidateMinutes);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "treated minutes as base-10"
  // mistake, must give the correct answer. Only meaningful when a genuine
  // carry/borrow actually occurs — resample until one does.
  if (errorSpotting) {
    const name = pick(names);
    let esA = aMinutes;
    let esB = bMinutes;
    let guard = 0;
    while (guard < 20) {
      const aM = esA % 60, bM = esB % 60;
      const genuineCarry = op === "add" ? aM + bM >= 60 : aM < bM;
      if (genuineCarry) break;
      esA = randInt(1, maxHours) * 60 + pick([0, 15, 30, 45]);
      esB = randInt(1, maxHours) * 60 + pick([0, 15, 30, 45]);
      if (op === "subtract" && esB > esA) [esA, esB] = [esB, esA];
      guard++;
    }
    const esCorrectMinutes = op === "add" ? esA + esB : esA - esB;
    const esAH = Math.floor(esA / 60), esAM = esA % 60;
    const esBH = Math.floor(esB / 60), esBM = esB % 60;
    const wrongH = op === "add" ? esAH + esBH : Math.abs(esAH - esBH);
    const wrongM = op === "add" ? esAM + esBM : Math.abs(esAM - esBM);
    const wrongAnswer = `${wrongH}j ${wrongM}m`;
    const correctAnswer = formatDurationNeutral(esCorrectMinutes);
    if (wrongAnswer !== correctAnswer) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${name} mengira ${formatDurationWords(esA, "ms")} ${op === "add" ? "+" : "−"} ${formatDurationWords(esB, "ms")} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `${name} calculated ${formatDurationWords(esA, "en")} ${op === "add" ? "+" : "−"} ${formatDurationWords(esB, "en")} and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer,
        context: { aMinutes: esA, bMinutes: esB, correctMinutes: esCorrectMinutes, op, wrongAnswer },
        generatorKey: "time_add_subtract",
        difficulty: 3,
        options: shuffleOptions(correctAnswer, [wrongAnswer]),
      };
      // Pad to at least 3 options — errorSpotting only naturally supplies
      // one distractor (the no-carry mistake itself).
      while (question.options!.length < 3) {
        const candidateMinutes = Math.max(0, esCorrectMinutes + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1));
        const candidate = formatDurationNeutral(candidateMinutes);
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: two-subjects studying scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const subjectA = pick(subjects);
    const subjectB = pick(subjects.filter((s) => s !== subjectA));
    const prompt =
      op === "add"
        ? {
            ms: `${name} belajar ${subjectA} selama ${formatDurationWords(aMinutes, "ms")}, kemudian belajar ${subjectB} selama ${formatDurationWords(bMinutes, "ms")}. Berapakah jumlah masa belajar ${name}?`,
            en: `${name} studies ${subjectsEn[subjectA]} for ${formatDurationWords(aMinutes, "en")}, then studies ${subjectsEn[subjectB]} for ${formatDurationWords(bMinutes, "en")}. What is ${name}'s total study time?`,
          }
        : {
            ms: `${name} merancang belajar selama ${formatDurationWords(aMinutes, "ms")}. Setakat ini ${name} sudah belajar ${subjectA} selama ${formatDurationWords(bMinutes, "ms")}. Berapa lama lagi masa belajar yang tinggal?`,
            en: `${name} plans to study for ${formatDurationWords(aMinutes, "en")}. So far ${name} has studied ${subjectsEn[subjectA]} for ${formatDurationWords(bMinutes, "en")}. How much study time is left?`,
          };
    const question: GeneratedQuestion = {
      prompt,
      type: "word_problem",
      correctAnswer: formatDurationNeutral(correctMinutes),
      context: { aMinutes, bMinutes, correctMinutes, op },
      generatorKey: "time_add_subtract",
      difficulty: 2,
    };
    const aH = Math.floor(aMinutes / 60), aM = aMinutes % 60;
    const bH = Math.floor(bMinutes / 60), bM = bMinutes % 60;
    const noCarryH = op === "add" ? aH + bH : Math.abs(aH - bH);
    const noCarryM = op === "add" ? aM + bM : Math.abs(aM - bM);
    const noCarryLabel = `${noCarryH}j ${noCarryM}m`;
    const distractors = Array.from(new Set([noCarryLabel].filter((d) => d !== question.correctAnswer)));
    question.options = shuffleOptions(question.correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidateMinutes = Math.max(0, correctMinutes + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatDurationNeutral(candidateMinutes);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `${formatDurationWords(aMinutes, "ms")} ${symbol} ${formatDurationWords(bMinutes, "ms")} = ?`,
      en: `${formatDurationWords(aMinutes, "en")} ${symbol} ${formatDurationWords(bMinutes, "en")} = ?`,
    },
    type,
    correctAnswer: formatDurationNeutral(correctMinutes),
    context: { aMinutes, bMinutes, correctMinutes, op },
    generatorKey: "time_add_subtract",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: treating minutes as base-10 instead of regrouping
    // at 60 (e.g. adding minutes straight across without carrying an hour).
    const aH = Math.floor(aMinutes / 60), aM = aMinutes % 60;
    const bH = Math.floor(bMinutes / 60), bM = bMinutes % 60;
    const noCarryH = op === "add" ? aH + bH : Math.abs(aH - bH);
    const noCarryM = op === "add" ? aM + bM : Math.abs(aM - bM);
    const noCarryLabel = `${noCarryH}j ${noCarryM}m`;
    const distractors = Array.from(new Set([noCarryLabel].filter((d) => d !== question.correctAnswer)));
    question.options = shuffleOptions(question.correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidateMinutes = Math.max(0, correctMinutes + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = formatDurationNeutral(candidateMinutes);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 5 KSSR extends time addition/subtraction to bigger unit pairs
// (years/months, decades/years, centuries/decades — not just hours/
// minutes). Generic, config-driven, same efficiency idea as unit_convert:
// one generator, many topics via a `pairs` config instead of one
// near-duplicate file per unit pair.
interface TimeUnitPair {
  big: string; // e.g. "yr", "dec", "c"
  small: string; // e.g. "mth", "yr", "dec"
  factor: number; // how many `small` units make 1 `big` unit
}

// Year 5 KSSR "Adding & Subtracting Time (Bigger Units)" — same base-`factor`
// regrouping idea as time_add_subtract (hours/minutes), generalised to
// whichever bigger unit pair the topic config supplies (years/months,
// decades/years, centuries/decades).
//
// Retrofitted per the Round 19 content standard: the prompt was a bare
// equation for every `type` — the `word_problem` template already
// configured for this topic in topics.ts had been rendering with no
// scenario AND no options (the two most common bug shapes from this
// round, both present here at once). Fixed with a real building-age
// word_problem (matches this topic's explanation text), errorSpotting,
// and a reverseProblem that finds one duration given the total and the
// other.
export function generateTimeUnitAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const pairs = (params.pairs as TimeUnitPair[]) ?? [{ big: "yr", small: "mth", factor: 12 }];
  const maxBig = Number(params.maxBig ?? 8);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  const fmtFor = (factor: number, big: string, small: string) => (totalSmall: number) => {
    const bigVal = Math.floor(totalSmall / factor);
    const smallVal = totalSmall % factor;
    if (bigVal === 0) return `${smallVal}${small}`;
    if (smallVal === 0) return `${bigVal}${big}`;
    return `${bigVal}${big} ${smallVal}${small}`;
  };

  // ---- reverseProblem: given the total age and one duration, find the
  // other duration (subtraction) — same shape as time_add_subtract's
  // reverseProblem.
  if (reverseProblem) {
    const { big, small, factor } = pick(pairs);
    const fmt = fmtFor(factor, big, small);
    const aSmall = randInt(1, maxBig) * factor + randInt(0, factor - 1);
    const bSmall = randInt(1, maxBig) * factor + randInt(0, factor - 1);
    const totalSmall = aSmall + bSmall;
    const name = pick(names);

    const question: GeneratedQuestion = {
      prompt: {
        ms: `Sebuah bangunan berumur ${fmt(totalSmall)} sekarang, selepas dibina ${fmt(aSmall)} lalu ditambah baik lagi ${fmt(bSmall)}. Berapa lamakah tempoh pertama sebelum ditambah baik? (Jawapan: ${fmt(aSmall)})`,
        en: `${name} says a building is ${fmt(totalSmall)} old in total, made up of ${fmt(bSmall)} since its last renovation plus the years before that. How long was the period before the renovation?`,
      },
      type: "word_problem",
      correctAnswer: fmt(aSmall),
      context: { big, small, factor, aSmall, bSmall, totalSmall },
      generatorKey: "time_unit_add_subtract",
      difficulty: 3,
    };
    // Classic mistake: gave the total again, forgetting to subtract.
    const gaveTotal = fmt(totalSmall);
    // Classic mistake: gave the other known duration instead of solving for the unknown one.
    const gaveOtherDuration = fmt(bSmall);
    const distractors = Array.from(new Set([gaveTotal, gaveOtherDuration].filter((d) => d !== fmt(aSmall))));
    question.options = shuffleOptions(fmt(aSmall), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidateSmall = Math.max(0, aSmall + randInt(1, factor - 1) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = fmt(candidateSmall);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const op = pick(["add", "subtract"] as const);
  const { big, small, factor } = pick(pairs);
  const fmt = fmtFor(factor, big, small);
  let aSmall = randInt(1, maxBig) * factor + randInt(0, factor - 1);
  let bSmall = randInt(1, maxBig) * factor + randInt(0, factor - 1);
  if (op === "subtract" && bSmall > aSmall) [aSmall, bSmall] = [bSmall, aSmall];

  const correctSmall = op === "add" ? aSmall + bSmall : aSmall - bSmall;
  const symbol = op === "add" ? "+" : "−";

  // ---- errorSpotting: shown the classic "treated the small unit as
  // base-10" mistake, must give the correct answer. Only meaningful when
  // a genuine carry/borrow actually occurs.
  if (errorSpotting) {
    const name = pick(names);
    const aRem = aSmall % factor, bRem = bSmall % factor;
    const genuineCarry = op === "add" ? aRem + bRem >= factor : aRem < bRem;
    if (genuineCarry) {
      const aBig = Math.floor(aSmall / factor), bBig = Math.floor(bSmall / factor);
      const wrongBig = op === "add" ? aBig + bBig : Math.abs(aBig - bBig);
      const wrongSmall = op === "add" ? aRem + bRem : Math.abs(aRem - bRem);
      const wrongAnswer = `${wrongBig}${big} ${wrongSmall}${small}`;
      const correctAnswer = fmt(correctSmall);
      if (wrongAnswer !== correctAnswer) {
        const question: GeneratedQuestion = {
          prompt: {
            ms: `${name} mengira ${fmt(aSmall)} ${symbol} ${fmt(bSmall)} dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
            en: `${name} calculated ${fmt(aSmall)} ${symbol} ${fmt(bSmall)} and got ${wrongAnswer}. What is the correct answer?`,
          },
          type: "mcq",
          correctAnswer,
          context: { big, small, factor, aSmall, bSmall, correctSmall, op, wrongAnswer },
          generatorKey: "time_unit_add_subtract",
          difficulty: 3,
          options: shuffleOptions(correctAnswer, [wrongAnswer]),
        };
        while (question.options!.length < 3) {
          const candidateSmall = Math.max(0, correctSmall + randInt(1, factor - 1) * (Math.random() > 0.5 ? 1 : -1));
          const candidate = fmt(candidateSmall);
          if (!question.options!.includes(candidate)) question.options!.push(candidate);
        }
        return question;
      }
    }
  }

  // ---- word_problem: building-age scenario, matches this topic's
  // explanation text.
  if (type === "word_problem") {
    const name = pick(names);
    const prompt =
      op === "add"
        ? {
            ms: `Sebuah bangunan berumur ${fmt(aSmall)}. ${fmt(bSmall)} kemudian, berapakah umurnya?`,
            en: `A building is ${fmt(aSmall)} old. ${fmt(bSmall)} later, how old will it be?`,
          }
        : {
            ms: `${name} mensasarkan projek selama ${fmt(aSmall)}. Setakat ini sudah berlalu ${fmt(bSmall)}. Berapa lama lagi tempoh yang tinggal?`,
            en: `${name} plans a project lasting ${fmt(aSmall)}. So far ${fmt(bSmall)} has passed. How much time is left?`,
          };
    const question: GeneratedQuestion = {
      prompt,
      type: "word_problem",
      correctAnswer: fmt(correctSmall),
      context: { big, small, factor, aSmall, bSmall, correctSmall, op },
      generatorKey: "time_unit_add_subtract",
      difficulty: 3,
    };
    const aBig = Math.floor(aSmall / factor), aRem = aSmall % factor;
    const bBig = Math.floor(bSmall / factor), bRem = bSmall % factor;
    const noCarryBig = op === "add" ? aBig + bBig : Math.abs(aBig - bBig);
    const noCarrySmall = op === "add" ? aRem + bRem : Math.abs(aRem - bRem);
    const noCarryLabel = `${noCarryBig}${big} ${noCarrySmall}${small}`;
    const distractors = Array.from(new Set([noCarryLabel].filter((d) => d !== question.correctAnswer)));
    question.options = shuffleOptions(question.correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidateSmall = Math.max(0, correctSmall + randInt(1, factor - 1) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = fmt(candidateSmall);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: { ms: `${fmt(aSmall)} ${symbol} ${fmt(bSmall)} = ?`, en: `${fmt(aSmall)} ${symbol} ${fmt(bSmall)} = ?` },
    type,
    correctAnswer: fmt(correctSmall),
    context: { big, small, factor, aSmall, bSmall, correctSmall, op },
    generatorKey: "time_unit_add_subtract",
    difficulty: 3,
  };

  if (type === "mcq") {
    // Classic mistake: not regrouping at the unit's conversion factor
    // (treating the small unit as base-10 instead of base-`factor`).
    const aBig = Math.floor(aSmall / factor), aRem = aSmall % factor;
    const bBig = Math.floor(bSmall / factor), bRem = bSmall % factor;
    const noCarryBig = op === "add" ? aBig + bBig : Math.abs(aBig - bBig);
    const noCarrySmall = op === "add" ? aRem + bRem : Math.abs(aRem - bRem);
    const noCarryLabel = `${noCarryBig}${big} ${noCarrySmall}${small}`;
    const distractors = Array.from(new Set([noCarryLabel].filter((d) => d !== question.correctAnswer)));
    question.options = shuffleOptions(question.correctAnswer, distractors);
    while (question.options.length < 3) {
      const candidateSmall = Math.max(0, correctSmall + randInt(1, factor - 1) * (Math.random() > 0.5 ? 1 : -1));
      const candidate = fmt(candidateSmall);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

// Year 6 KSSR "Time Zones" — the one Y6 Time sub-topic still missing (the
// real book is otherwise light on Y6 Time compared to Y4/Y5). Uses a
// small set of real cities that don't observe daylight saving (so a
// fixed GMT offset is always historically accurate, no DST edge cases to
// worry about) rather than fictional generic labels, since real-world
// GMT offsets are the whole point of the topic. Deliberately stays at
// "what time is it" — not "what day is it" — to match the same-day
// simplification the rest of Congak's time generators already use.
function formatHour24(hour: number): string {
  const hh = ((hour % 24) + 24) % 24;
  return `${String(hh).padStart(2, "0")}:00`;
}

const TIME_ZONE_CITIES = [
  { name: "Kuala Lumpur", offset: 8 },
  { name: "Tokyo", offset: 9 },
  { name: "Dubai", offset: 4 },
  { name: "Moscow", offset: 3 },
  { name: "Cairo", offset: 2 },
  { name: "Karachi", offset: 5 },
];

// Year 5 KSSR "12-Hour and 24-Hour Time" — converting between the two
// formats, the genuinely missing Time sub-topic flagged in HANDOVER.md
// (Congak had clock-time+duration and duration+duration, but nothing for
// format conversion). Deliberately keeps the graded answer
// language-neutral: 24-hour answers are always a bare 4-digit string
// ("1445"), 12-hour answers always use the standard "a.m."/"p.m."
// abbreviation (never spelled-out Malay/English words) — same reasoning
// as time_add_subtract's "2j 45m" convention, since MCQ options/fill
// answers are shown regardless of language_pref.
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function to24String(hour24: number, minute: number): string {
  return `${pad2(hour24)}${pad2(minute)}`;
}

function to12Parts(hour24: number): { hour12: number; isPM: boolean } {
  const isPM = hour24 >= 12;
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, isPM };
}

function to12String(hour24: number, minute: number): string {
  const { hour12, isPM } = to12Parts(hour24);
  return `${hour12}:${pad2(minute)} ${isPM ? "p.m." : "a.m."}`;
}

// Bilingual period phrase for use INSIDE the bilingual prompt text only
// (never in the graded answer) — noon/midnight get their own special
// wording, matching this topic's "12 tengah hari"/"12 tengah malam"
// special-case rule.
function periodPhrase(hour24: number, minute: number, lang: "ms" | "en"): string {
  const { hour12, isPM } = to12Parts(hour24);
  const timeStr = `${hour12}:${pad2(minute)}`;
  if (hour24 === 0 && minute === 0) return lang === "ms" ? "12 tengah malam" : "12 midnight";
  if (hour24 === 12 && minute === 0) return lang === "ms" ? "12 tengah hari" : "12 noon";
  const period = lang === "ms" ? (isPM ? "petang" : "pagi") : isPM ? "p.m." : "a.m.";
  return `${timeStr} ${period}`;
}

function randomHour24(includeNoonMidnight: boolean, excludeNoonMidnight: boolean): number {
  if (includeNoonMidnight) return pick([0, 12]);
  let hour: number;
  do {
    hour = randInt(0, 23);
  } while (excludeNoonMidnight && (hour === 0 || hour === 12));
  return hour;
}

export function generateTimeFormatConvert(params: GeneratorParams): GeneratedQuestion {
  const direction = (params.direction as "to24" | "to12" | "mixed") ?? "to24";
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const includeNoonMidnight = Boolean(params.includeNoonMidnight);
  const excludeNoonMidnight = Boolean(params.excludeNoonMidnight);
  const busSchedule = params.context === "bus_schedule";
  const extraInfoChance = Number(params.extraInfoChance ?? 0);
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const hour24 = randomHour24(includeNoonMidnight, excludeNoonMidnight);
  const minute = pick([0, 15, 30, 45]);
  const { hour12, isPM } = to12Parts(hour24);

  // ---- reverseProblem: chains with the existing duration-addition skill.
  // Given a 24-hour departure time and a duration, find the 12-hour
  // arrival time. Deliberately the hardest template (difficulty 3).
  if (reverseProblem) {
    const durationMinutes = pick([30, 45, 60, 90, 120]);
    const totalMinutes = hour24 * 60 + minute + durationMinutes;
    const arrivalHour24 = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinute = totalMinutes % 60;
    const correct = to12String(arrivalHour24, arrivalMinute);

    const question: GeneratedQuestion = {
      prompt: {
        ms: `Bas bertolak dari stesen pada ${to24String(hour24, minute)} (format 24 jam) dan perjalanan mengambil masa ${durationMinutes} minit. Pukul berapakah bas tiba, dalam format 12 jam?`,
        en: `A bus departs the station at ${to24String(hour24, minute)} (24-hour format) and the journey takes ${durationMinutes} minutes. What time does it arrive, in 12-hour format?`,
      },
      type: "word_problem",
      correctAnswer: correct,
      context: { hour24, minute, durationMinutes, arrivalHour24, arrivalMinute },
      generatorKey: "time_format_convert",
      difficulty: 3,
    };

    // Classic mistake: converted the departure time to 12-hour but forgot
    // to add the duration at all.
    const forgotDuration = to12String(hour24, minute);
    // Classic mistake: added the duration's minutes but didn't carry the
    // extra hour (same base-60 carry error as time_duration/time_add_subtract).
    const noHourCarry = to12String(hour24, (minute + durationMinutes) % 60);
    const distractors = Array.from(new Set([forgotDuration, noHourCarry].filter((d) => d !== correct)));
    question.options = shuffleOptions(correct, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bumpMinutes = totalMinutes + randInt(5, 40) * (Math.random() > 0.5 ? 1 : -1);
      const bumpHour = Math.floor(((bumpMinutes % 1440) + 1440) / 60) % 24;
      const bumpMin = ((bumpMinutes % 60) + 60) % 60;
      const candidate = to12String(bumpHour, bumpMin);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown a documented wrong conversion, must give the
  // correct one. Always uses the to24 direction since the noon/midnight
  // swap and added-12-to-am mistakes are clearest in that direction.
  if (errorSpotting) {
    const correct = to24String(hour24, minute);
    let wrong: string;
    if (hour24 === 0) wrong = "1200"; // noon/midnight swap
    else if (hour24 === 12) wrong = "0000"; // noon/midnight swap
    else if (!isPM) wrong = to24String(hour24 + 12, minute); // added 12 to an a.m. hour
    else wrong = to24String(hour12, minute); // forgot to add 12 to a p.m. hour

    const question: GeneratedQuestion = {
      prompt: {
        ms: `Ali menukar ${periodPhrase(hour24, minute, "ms")} kepada format 24 jam dan mendapat ${wrong}. Apakah jawapan yang betul?`,
        en: `Ali converted ${periodPhrase(hour24, minute, "en")} to 24-hour format and got ${wrong}. What is the correct answer?`,
      },
      type: "mcq",
      correctAnswer: correct,
      context: { hour24, minute, wrongShown: wrong },
      generatorKey: "time_format_convert",
      difficulty: 3,
    };
    const distractors = [wrong];
    question.options = shuffleOptions(correct, distractors);
    while (question.options.length < 3) {
      const bump = randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1);
      const candidate = to24String((((hour24 + bump) % 24) + 24) % 24, minute);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- base case: straightforward to24 / to12 conversion, optionally
  // wrapped in a bus-schedule word problem with an irrelevant-info decoy.
  const actualDirection: "to24" | "to12" = direction === "mixed" ? pick(["to24", "to12"] as const) : direction;
  const correct = actualDirection === "to24" ? to24String(hour24, minute) : to12String(hour24, minute);

  let promptMs: string;
  let promptEn: string;
  if (busSchedule) {
    const destination = pick(["Ipoh", "Kuantan", "Melaka", "Kuala Terengganu"]);
    const withDecoy = Math.random() < extraInfoChance;
    const priceRM = pick([8, 10, 12, 15, 18]);
    const decoyMs = withDecoy ? ` Harga tiket ialah RM${priceRM}.` : "";
    const decoyEn = withDecoy ? ` The ticket costs RM${priceRM}.` : "";
    if (actualDirection === "to24") {
      const msTime = periodPhrase(hour24, minute, "ms");
      const enTime = periodPhrase(hour24, minute, "en");
      const enSentence = `The bus to ${destination} departs at ${enTime}`;
      promptMs = `Bas ke ${destination} bertolak pada ${msTime}.${decoyMs} Nyatakan waktu ini dalam format 24 jam.`;
      promptEn = `${enSentence.endsWith(".") ? enSentence : `${enSentence}.`}${decoyEn} State this time in 24-hour format.`;
    } else {
      promptMs = `Papan jadual bas menunjukkan bas ke ${destination} bertolak pada ${to24String(hour24, minute)}.${decoyMs} Nyatakan waktu ini dalam format 12 jam.`;
      promptEn = `The bus timetable shows the bus to ${destination} departs at ${to24String(hour24, minute)}.${decoyEn} State this time in 12-hour format.`;
    }
  } else if (actualDirection === "to24") {
    promptMs = `Tukar ${periodPhrase(hour24, minute, "ms")} kepada format 24 jam.`;
    promptEn = `Convert ${periodPhrase(hour24, minute, "en")} to 24-hour format.`;
  } else {
    promptMs = `Tukar ${to24String(hour24, minute)} kepada format 12 jam.`;
    promptEn = `Convert ${to24String(hour24, minute)} to 12-hour format.`;
  }

  const question: GeneratedQuestion = {
    prompt: { ms: promptMs, en: promptEn },
    type: busSchedule ? "word_problem" : type,
    correctAnswer: correct,
    context: { hour24, minute, isPM: isPM ? "yes" : "no", direction: actualDirection },
    generatorKey: "time_format_convert",
    difficulty: hour24 === 0 || hour24 === 12 ? 2 : 1,
  };

  if (question.type === "mcq" || question.type === "word_problem") {
    let distractors: string[];
    if (actualDirection === "to24") {
      const noonMidnightSwap = hour24 === 0 ? "1200" : hour24 === 12 ? "0000" : null;
      const addedToAM = !isPM ? to24String(hour24 + 12, minute) : null;
      const forgotToAddPM = isPM && hour24 !== 12 ? to24String(hour12, minute) : null;
      distractors = [noonMidnightSwap, addedToAM, forgotToAddPM].filter((d): d is string => d !== null && d !== correct);
    } else {
      const noonMidnightSwap = hour24 === 0 ? to12String(12, minute) : hour24 === 12 ? to12String(0, minute) : null;
      const wrongPeriod = to12Parts(hour24).isPM
        ? `${hour12}:${pad2(minute)} a.m.`
        : `${hour12}:${pad2(minute)} p.m.`;
      distractors = [noonMidnightSwap, wrongPeriod].filter((d): d is string => d !== null && d !== correct);
    }
    question.options = shuffleOptions(correct, Array.from(new Set(distractors)).slice(0, 3));
    while (question.options.length < 3) {
      const bump = randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1);
      const candidateHour = (((hour24 + bump) % 24) + 24) % 24;
      const candidate = actualDirection === "to24" ? to24String(candidateHour, minute) : to12String(candidateHour, minute);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}

export function generateTimeZones(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);

  const [cityA, cityB] = [...TIME_ZONE_CITIES].sort(() => Math.random() - 0.5).slice(0, 2);
  const startHour = randInt(0, 23);
  const diff = cityB.offset - cityA.offset;
  const correctHour = startHour + diff;
  const correct = formatHour24(correctHour);
  const context = { cityAOffset: cityA.offset, cityBOffset: cityB.offset, startHour, correctHour: ((correctHour % 24) + 24) % 24 };

  // ---- reverseProblem: given both cities' current times, find one
  // city's GMT offset (the other is given) — solving for the unknown
  // side of the GMT-difference formula instead of the resulting time.
  if (reverseProblem) {
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${cityA.name} ialah GMT+${cityA.offset}. Apabila masa di ${cityA.name} ialah ${formatHour24(startHour)}, masa di ${cityB.name} ialah ${correct}. Berapakah GMT bagi ${cityB.name}?`,
        en: `${cityA.name} is GMT+${cityA.offset}. When the time in ${cityA.name} is ${formatHour24(startHour)}, the time in ${cityB.name} is ${correct}. What is ${cityB.name}'s GMT offset?`,
      },
      type: "word_problem",
      correctAnswer: `GMT+${cityB.offset}`,
      context,
      generatorKey: "time_zones",
      difficulty: 3,
    };
    // Classic mistake: subtracted the difference instead of adding it to the known offset.
    const subtractedInstead = `GMT+${cityA.offset - diff}`;
    const distractors = [subtractedInstead].filter((d) => d !== `GMT+${cityB.offset}`);
    question.options = shuffleOptions(`GMT+${cityB.offset}`, distractors);
    while (question.options.length < 3) {
      const candidate = `GMT+${cityB.offset + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)}`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- errorSpotting: shown the classic "applied the offset in the
  // wrong direction" mistake, must give the correct time.
  if (errorSpotting) {
    const reversed = formatHour24(startHour - diff);
    if (reversed !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `${cityA.name} ialah GMT+${cityA.offset} dan ${cityB.name} ialah GMT+${cityB.offset}. Masa di ${cityA.name} ialah ${formatHour24(startHour)}. Seseorang kira masa di ${cityB.name} sebagai ${reversed}. Apakah jawapan yang betul?`,
          en: `${cityA.name} is GMT+${cityA.offset} and ${cityB.name} is GMT+${cityB.offset}. The time in ${cityA.name} is ${formatHour24(startHour)}. Someone calculated the time in ${cityB.name} as ${reversed}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: correct,
        context,
        generatorKey: "time_zones",
        difficulty: 3,
        options: shuffleOptions(correct, [reversed]),
      };
      while (question.options!.length < 3) {
        const bump = randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1);
        const candidate = formatHour24(correctHour + bump);
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  const prompt = {
    ms: `${cityA.name} ialah GMT+${cityA.offset} dan ${cityB.name} ialah GMT+${cityB.offset}. Jika masa di ${cityA.name} ialah ${formatHour24(startHour)}, pukul berapakah masa di ${cityB.name}?`,
    en: `${cityA.name} is GMT+${cityA.offset} and ${cityB.name} is GMT+${cityB.offset}. If the time in ${cityA.name} is ${formatHour24(startHour)}, what time is it in ${cityB.name}?`,
  };

  const question: GeneratedQuestion = {
    prompt,
    type,
    correctAnswer: correct,
    context,
    generatorKey: "time_zones",
    difficulty: 3,
  };

  if (type === "mcq" || type === "word_problem") {
    // Classic mistake: applied the offset difference in the wrong direction.
    const reversed = formatHour24(startHour - diff);
    // Classic mistake: forgot to convert the time at all.
    const noChange = formatHour24(startHour);
    const distractors = Array.from(new Set([reversed, noChange].filter((d) => d !== correct)));
    question.options = shuffleOptions(correct, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1);
      const candidate = formatHour24(correctHour + bump);
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
