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
