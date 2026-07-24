import { TOPICS } from "@/lib/content/topics";
import { createClient } from "@/lib/supabase/server";
import { TopicYearBrowser, type YearGroup } from "@/components/student/TopicYearBrowser";

export default async function LearnIndexPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: student } = await supabase
    .from("students")
    .select("id, year_level, language_pref")
    .eq("user_id", user?.id ?? "")
    .single();

  const lang = student?.language_pref ?? "both";

  const { data: mastery } = await supabase
    .from("topic_mastery")
    .select("topic_id, mastery_score")
    .eq("student_id", student?.id ?? "");
  const masteryByTopic = new Map((mastery ?? []).map((m) => [m.topic_id, m.mastery_score]));

  const groups: YearGroup[] = [4, 5, 6].map((year) => ({
    year,
    topics: Object.values(TOPICS)
      .filter((t) => t.yearLevel === year)
      .map((topic) => ({
        id: topic.id,
        strand: topic.strand,
        title: topic.title,
        href: `/learn/${topic.id}`,
        score: masteryByTopic.get(topic.id),
      })),
  }));

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4">
        <h1 className="font-display text-xl font-bold text-ink">
          {lang === "en" ? "Learn — Choose a Topic" : "Belajar — Pilih Topik"}
        </h1>
        <p className="mt-1 text-xs text-ink/50">
          {lang === "en"
            ? "Pick a year, then any topic to learn or revise — not just what's recommended."
            : "Pilih tahun, kemudian mana-mana topik untuk belajar atau mengulang kaji — bukan hanya cadangan sahaja."}
        </p>
      </header>

      <TopicYearBrowser
        groups={groups}
        lang={lang}
        studentYear={student?.year_level ?? undefined}
        emptyText={{ ms: "Tiada topik untuk tahun ini.", en: "No topics for this year." }}
      />
    </main>
  );
}
