import type { createClient } from "@/lib/supabase/server";
import { TOPICS, type TopicContent } from "@/lib/content/topics";

/**
 * Same priority order as the dashboard's "Recommended Today" card: a
 * flagged-weak topic first, then an unstarted topic, then whichever topic
 * has the lowest mastery score. Extracted so both `dashboard/page.tsx` and
 * `pintar/page.tsx` call one function instead of duplicating the logic.
 */
export async function getRecommendedTopic(
  supabase: ReturnType<typeof createClient>,
  studentId: string
): Promise<TopicContent | undefined> {
  const { data: mastery } = await supabase
    .from("topic_mastery")
    .select("topic_id, mastery_score, weak_flag")
    .eq("student_id", studentId);

  const allTopics = Object.values(TOPICS);
  const masteryByTopic = new Map((mastery ?? []).map((m) => [m.topic_id, m]));

  const weakTopics = allTopics.filter((t) => masteryByTopic.get(t.id)?.weak_flag);
  const unstarted = allTopics.filter((t) => !masteryByTopic.has(t.id));

  return (
    weakTopics[0] ??
    unstarted[0] ??
    allTopics.sort(
      (a, b) => (masteryByTopic.get(a.id)?.mastery_score ?? 0) - (masteryByTopic.get(b.id)?.mastery_score ?? 0)
    )[0]
  );
}
