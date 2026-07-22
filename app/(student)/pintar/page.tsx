import { createClient } from "@/lib/supabase/server";
import { getRecommendedTopic } from "@/lib/content/recommended";
import { PintarChat } from "@/components/student/PintarChat";
import type { Lang } from "@/lib/i18n/dictionary";

export default async function PintarPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from("students")
    .select("id, display_name, xp, level, streak_count, language_pref")
    .eq("user_id", user?.id ?? "")
    .single();

  const lang: Lang = student?.language_pref ?? "both";
  const recommended = await getRecommendedTopic(supabase, student?.id ?? "");
  const currentTopicTitle = recommended ? (lang === "en" ? recommended.title.en : recommended.title.ms) : null;

  return (
    <PintarChat
      studentName={student?.display_name ?? "Murid"}
      lang={lang}
      currentTopicTitle={currentTopicTitle}
      level={student?.level ?? 1}
      xp={student?.xp ?? 0}
      streakDays={student?.streak_count ?? 0}
    />
  );
}
