"use server";

import { createClient } from "@/lib/supabase/server";
import { classifyMistake } from "@/lib/mistakes/classify";
import { updateStreak } from "./streak";
import type { GeneratedQuestion } from "@/lib/questions/types";
import type { Bilingual } from "@/lib/i18n/dictionary";

interface ExamAnswer {
  topicId: string;
  question: GeneratedQuestion;
  studentAnswer: string;
}

export interface ExamResult {
  score: number;
  total: number;
  timeTakenSeconds: number;
  strengths: string[]; // topic ids
  weaknesses: string[]; // topic ids
  recommendedPath: string[]; // topic ids, weakest first
}

/** One row per question, stored in exams.question_results_json — this is
 * what lets a parent actually see "she answered X, the correct answer was
 * Y, here's why" instead of just a percentage. */
interface QuestionReviewEntry {
  topicId: string;
  prompt: Bilingual;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  mistakeType: string | null;
  hint: Bilingual | null;
}

export async function submitExam(
  selectedTopicIds: string[],
  answers: ExamAnswer[],
  timeTakenSeconds: number
): Promise<ExamResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let score = 0;
  // Per-topic tally so a student who's strong in Money but weak in
  // Fractions gets a genuinely differentiated result, not one blended score.
  const perTopic = new Map<string, { correct: number; total: number }>();
  const mistakesByTopic = new Map<string, string[]>();
  const questionResults: QuestionReviewEntry[] = [];

  for (const { topicId, question, studentAnswer } of answers) {
    const isCorrect = studentAnswer.trim() === question.correctAnswer;
    const entry = perTopic.get(topicId) ?? { correct: 0, total: 0 };
    entry.total += 1;

    let mistakeType: string | null = null;
    let hint: Bilingual | null = null;

    if (isCorrect) {
      entry.correct += 1;
      score += 1;
    } else {
      const classification = classifyMistake(question, studentAnswer);
      mistakeType = classification.mistakeType;
      hint = classification.hint;
      mistakesByTopic.set(topicId, [...(mistakesByTopic.get(topicId) ?? []), mistakeType]);
    }
    perTopic.set(topicId, entry);

    questionResults.push({
      topicId,
      prompt: question.prompt,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      mistakeType,
      hint,
    });
  }

  const topicAccuracy = Array.from(perTopic.entries()).map(([topicId, { correct, total }]) => ({
    topicId,
    accuracy: Math.round((correct / total) * 100),
  }));

  const strengths = topicAccuracy.filter((t) => t.accuracy >= 70).map((t) => t.topicId);
  const weaknesses = topicAccuracy.filter((t) => t.accuracy < 50).map((t) => t.topicId);
  const recommendedPath = [...topicAccuracy]
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((t) => t.topicId);

  if (user) {
    const { data: student } = await supabase
      .from("students")
      .select("id, xp, level")
      .eq("user_id", user.id)
      .single();

    if (student) {
      await supabase.from("exams").insert({
        student_id: student.id,
        config_json: { topicIds: selectedTopicIds },
        score,
        total: answers.length,
        strengths_json: strengths,
        weaknesses_json: weaknesses,
        recommended_path_json: recommendedPath,
        question_results_json: questionResults,
        time_taken_seconds: timeTakenSeconds,
      });

      await updateStreak(supabase, student.id);

      // An exam is the most deliberate check in the product — bigger
      // mastery swing per topic than a quiz, plus mistake pattern tracking
      // same as practice/quiz so exam mistakes feed the same recurring-
      // weakness data the parent detail page reads from.
      for (const { topicId, accuracy } of topicAccuracy) {
        const { data: existingMastery } = await supabase
          .from("topic_mastery")
          .select("mastery_score")
          .eq("student_id", student.id)
          .eq("topic_id", topicId)
          .single();
        const delta = accuracy >= 70 ? 20 : accuracy >= 50 ? 5 : -20;
        const next = Math.max(0, Math.min(100, (existingMastery?.mastery_score ?? 0) + delta));
        await supabase.from("topic_mastery").upsert({
          student_id: student.id,
          topic_id: topicId,
          mastery_score: next,
          weak_flag: next < 50,
          updated_at: new Date().toISOString(),
        });

        for (const mistakeType of mistakesByTopic.get(topicId) ?? []) {
          await supabase.rpc("record_mistake_pattern", {
            p_student_id: student.id,
            p_topic_id: topicId,
            p_mistake_type: mistakeType,
          });
        }
      }

      const bonusXp = Math.round(score * 20); // exams pay out more than quizzes
      let xp = student.xp + bonusXp;
      let level = student.level;
      while (xp >= level * 125) {
        xp -= level * 125;
        level += 1;
      }
      await supabase.from("students").update({ xp, level }).eq("id", student.id);
    }
  }

  return { score, total: answers.length, timeTakenSeconds, strengths, weaknesses, recommendedPath };
}
