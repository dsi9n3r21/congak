"use server";

import { createClient } from "@/lib/supabase/server";
import { classifyMistake } from "@/lib/mistakes/classify";
import type { GeneratedQuestion } from "@/lib/questions/types";

interface QuizAnswer {
  question: GeneratedQuestion;
  studentAnswer: string;
}

export interface QuizResult {
  score: number;
  total: number;
  accuracy: number;
  timeTakenSeconds: number;
  mistakeBreakdown: { mistakeType: string; count: number; hint: string }[];
}

export async function submitQuiz(
  topicId: string,
  answers: QuizAnswer[],
  timeTakenSeconds: number
): Promise<QuizResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let score = 0;
  const mistakeCounts = new Map<string, { count: number; hint: string }>();

  for (const { question, studentAnswer } of answers) {
    const isCorrect = studentAnswer.trim() === question.correctAnswer;
    if (isCorrect) {
      score += 1;
    } else {
      const { mistakeType, hint } = classifyMistake(question, studentAnswer);
      const existing = mistakeCounts.get(mistakeType);
      mistakeCounts.set(mistakeType, { count: (existing?.count ?? 0) + 1, hint });
    }
  }

  const accuracy = Math.round((score / answers.length) * 100);

  // Persist — tolerant of no session, same pattern as practice, so the
  // quiz UI never breaks even if a write fails.
  if (user) {
    const { data: student } = await supabase
      .from("students")
      .select("id, xp, level")
      .eq("user_id", user.id)
      .single();

    if (student) {
      await supabase.from("quizzes").insert({
        student_id: student.id,
        topic_id: topicId,
        score,
        accuracy,
        time_taken: timeTakenSeconds,
      });

      for (const [mistakeType] of mistakeCounts) {
        await supabase.rpc("record_mistake_pattern", {
          p_student_id: student.id,
          p_topic_id: topicId,
          p_mistake_type: mistakeType,
        });
      }

      // Quiz performance moves mastery more than a single practice attempt —
      // it's a deliberate check, not a first pass at the material.
      const masteryDelta = accuracy >= 80 ? 15 : accuracy >= 50 ? 0 : -15;
      const { data: existingMastery } = await supabase
        .from("topic_mastery")
        .select("mastery_score")
        .eq("student_id", student.id)
        .eq("topic_id", topicId)
        .single();
      const nextMastery = Math.max(0, Math.min(100, (existingMastery?.mastery_score ?? 0) + masteryDelta));
      await supabase.from("topic_mastery").upsert({
        student_id: student.id,
        topic_id: topicId,
        mastery_score: nextMastery,
        weak_flag: nextMastery < 50,
        updated_at: new Date().toISOString(),
      });

      // Bonus XP for finishing a quiz, scaled by accuracy.
      const bonusXp = Math.round(score * 15);
      let xp = student.xp + bonusXp;
      let level = student.level;
      while (xp >= level * 125) {
        xp -= level * 125;
        level += 1;
      }
      await supabase.from("students").update({ xp, level }).eq("id", student.id);
    }
  }

  return {
    score,
    total: answers.length,
    accuracy,
    timeTakenSeconds,
    mistakeBreakdown: Array.from(mistakeCounts.entries()).map(([mistakeType, v]) => ({
      mistakeType,
      count: v.count,
      hint: v.hint,
    })),
  };
}
