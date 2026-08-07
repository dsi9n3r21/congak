import { TOPICS } from "@/lib/content/topics";
import { createClient } from "@/lib/supabase/server";
import { TopicYearBrowser, type YearGroup } from "@/components/student/TopicYearBrowser";
import Image from "next/image";

export default async function PracticeIndexPage() {
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
    .select("topic_id, mastery_score, weak_flag")
    .eq("student_id", student?.id ?? "");
  const masteryByTopic = new Map((mastery ?? []).map((m) => [m.topic_id, m]));

  const groups: YearGroup[] = [4, 5, 6].map((year) => ({
    year,
    topics: Object.values(TOPICS)
      .filter((t) => t.yearLevel === year)
      .map((topic) => ({
        id: topic.id,
        strand: topic.strand,
        bidang: topic.bidang,
        title: topic.title,
        href: `/practice/${topic.id}`,
        weak: masteryByTopic.has(topic.id) ? Boolean(masteryByTopic.get(topic.id)?.weak_flag) : undefined,
      })),
  }));

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="relative overflow-hidden px-5 pt-6 pb-4">
        <div className="decorative absolute right-1 -top-6 h-32 w-32 rounded-full bg-kuning-light/50" />
        <div className="absolute -right-3 top-0 h-32 w-32">
          <Image src="/pintar/correct.png" alt="" fill className="object-contain" />
        </div>
        <div className="relative z-10 max-w-[60%]">
          <h1 className="font-display text-xl font-bold text-ink">
            {lang === "en" ? "Practice — Choose a Topic" : "Latihan — Pilih Topik"}
          </h1>
          <p className="mt-1 text-xs text-ink/50">
            {lang === "en"
              ? "Pick a year, then jump straight into practice questions for any topic."
              : "Pilih tahun, kemudian terus mula soalan latihan untuk mana-mana topik."}
          </p>
        </div>
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
