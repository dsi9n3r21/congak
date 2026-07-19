import type { SupabaseClient } from "@supabase/supabase-js";

/** Malaysia doesn't observe DST, so a fixed UTC+8 offset is safe and avoids
 * pulling in a timezone library just for this. */
function malaysiaDateString(date: Date): string {
  const utc8 = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return utc8.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Updates a student's streak based on calendar-day activity in Malaysia
 * time. Call this from any action that represents "the student did
 * something today" (practice, quiz, exam). Safe to call multiple times in
 * the same day — it only writes once per day, so a whole practice session
 * doesn't produce a write per question.
 */
export async function updateStreak(supabase: SupabaseClient, studentId: string) {
  const { data: student } = await supabase
    .from("students")
    .select("streak_count, last_active_at")
    .eq("id", studentId)
    .single();
  if (!student) return;

  const now = new Date();
  const today = malaysiaDateString(now);
  const lastActiveDate = student.last_active_at ? malaysiaDateString(new Date(student.last_active_at)) : null;

  if (lastActiveDate === today) {
    return; // already counted today, nothing to do
  }

  const yesterday = malaysiaDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const newStreak = lastActiveDate === yesterday ? student.streak_count + 1 : 1;

  await supabase
    .from("students")
    .update({ streak_count: newStreak, last_active_at: now.toISOString() })
    .eq("id", studentId);
}
