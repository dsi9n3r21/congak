"use server";

import { createClient } from "@/lib/supabase/server";
import type { GeneratedQuestion } from "@/lib/questions/types";

export async function startPracticeSession(topicId: string): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!student) return null;

  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({ student_id: student.id, topic_id: topicId })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id as string;
}

interface RecordAttemptInput {
  sessionId: string;
  topicId: string;
  question: GeneratedQuestion;
  studentAnswer: string;
  isCorrect: boolean;
  mistakeType: string | null;
  timeTakenSeconds: number;
}

export async function recordAttempt(input: RecordAttemptInput) {
  const supabase = createClient();

  await supabase.from("attempts").insert({
    session_id: input.sessionId,
    question_snapshot_json: input.question,
    student_answer: input.studentAnswer,
    is_correct: input.isCorrect,
    mistake_type: input.mistakeType,
    time_taken_seconds: input.timeTakenSeconds,
  });

  if (!input.isCorrect && input.mistakeType) {
    const { data: session } = await supabase
      .from("practice_sessions")
      .select("student_id")
      .eq("id", input.sessionId)
      .single();
    if (session) {
      await supabase.rpc("record_mistake_pattern", {
        p_student_id: session.student_id,
        p_topic_id: input.topicId,
        p_mistake_type: input.mistakeType,
      });
    }
  }

  await updateTopicMastery(input.sessionId, input.topicId, input.isCorrect);
  if (input.isCorrect) {
    await awardXp(input.sessionId);
  }
}

/** +10 XP per correct answer. xpToNext scales as level*125 — matches the
 * curve the dashboard uses to render the progress bar, so keep them in sync
 * if this changes. */
async function awardXp(sessionId: string) {
  const supabase = createClient();

  const { data: session } = await supabase
    .from("practice_sessions")
    .select("student_id")
    .eq("id", sessionId)
    .single();
  if (!session) return;

  const { data: student } = await supabase
    .from("students")
    .select("xp, level")
    .eq("id", session.student_id)
    .single();
  if (!student) return;

  let xp = student.xp + 10;
  let level = student.level;
  while (xp >= level * 125) {
    xp -= level * 125;
    level += 1;
  }

  await supabase.from("students").update({ xp, level }).eq("id", session.student_id);
}

/** Simple heuristic for now: +8 mastery on correct, -5 on incorrect,
 * clamped 0-100. weak_flag trips below 50. Good enough to power the
 * dashboard's "weak topics" list until a proper model replaces it. */
async function updateTopicMastery(sessionId: string, topicId: string, isCorrect: boolean) {
  const supabase = createClient();

  const { data: session } = await supabase
    .from("practice_sessions")
    .select("student_id")
    .eq("id", sessionId)
    .single();
  if (!session) return;

  const { data: existing } = await supabase
    .from("topic_mastery")
    .select("mastery_score")
    .eq("student_id", session.student_id)
    .eq("topic_id", topicId)
    .single();

  const current = existing?.mastery_score ?? 0;
  const next = Math.max(0, Math.min(100, current + (isCorrect ? 8 : -5)));

  await supabase.from("topic_mastery").upsert({
    student_id: session.student_id,
    topic_id: topicId,
    mastery_score: next,
    weak_flag: next < 50,
    updated_at: new Date().toISOString(),
  });
}
