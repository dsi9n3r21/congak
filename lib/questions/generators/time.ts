import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

function formatTime(hour: number, minute: number): string {
  const h = ((hour - 1) % 12) + 1;
  return `${h}:${String(minute).padStart(2, "0")}`;
}

export function generateTimeDuration(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "fill") ?? "mcq";

  const startHour = randInt(1, 12);
  const startMinute = pick([0, 15, 30, 45]);
  const durationMinutes = pick([15, 30, 45, 60, 75, 90, 105, 120]);

  let totalMinutes = startHour * 60 + startMinute + durationMinutes;
  const endHour = Math.floor(totalMinutes / 60) % 12 || 12;
  const endMinute = totalMinutes % 60;
  const correct = formatTime(endHour, endMinute);

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

export function generateTimeAddSubtract(params: GeneratorParams): GeneratedQuestion {
  const maxHours = Number(params.maxHours ?? 5);
  const type = (params.type as "mcq" | "fill") ?? "mcq";
  const op = pick(["add", "subtract"] as const);

  let aMinutes = randInt(1, maxHours) * 60 + pick([0, 15, 30, 45]);
  let bMinutes = randInt(1, maxHours) * 60 + pick([0, 15, 30, 45]);
  if (op === "subtract" && bMinutes > aMinutes) [aMinutes, bMinutes] = [bMinutes, aMinutes];

  const correctMinutes = op === "add" ? aMinutes + bMinutes : aMinutes - bMinutes;
  const symbol = op === "add" ? "+" : "−";

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
