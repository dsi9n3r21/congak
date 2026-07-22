import Link from "next/link";
import { TOPICS } from "@/lib/content/topics";
import { Bi } from "@/lib/i18n/Bi";
import { createClient } from "@/lib/supabase/server";

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

  const topicsByYear = [4, 5, 6].map((year) => ({
    year,
    topics: Object.values(TOPICS).filter((t) => t.yearLevel === year),
  }));

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4">
        <h1 className="font-display text-xl font-bold text-ink">
          {lang === "en" ? "Learn — Choose a Topic" : "Belajar — Pilih Topik"}
        </h1>
        <p className="mt-1 text-xs text-ink/50">
          {lang === "en"
            ? "Pick any topic from any year to learn or revise — not just what's recommended."
            : "Pilih mana-mana topik dari tahun mana-mana untuk belajar atau mengulang kaji — bukan hanya cadangan sahaja."}
        </p>
      </header>

      {topicsByYear.map(({ year, topics }) => {
        if (topics.length === 0) return null;
        return (
          <section key={year} className="mx-5 mt-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
              Tahun {year}
              {student?.year_level === year && (
                <span className="rounded-full bg-kuning-light px-2 py-0.5 text-[10px] text-kuning-dark">
                  {lang === "en" ? "Your year" : "Tahun anda"}
                </span>
              )}
            </p>
            <div className="space-y-2">
              {topics.map((topic) => {
                const score = masteryByTopic.get(topic.id);
                return (
                  <Link
                    key={topic.id}
                    href={`/learn/${topic.id}`}
                    className="block rounded-kite bg-white p-4 shadow-card active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-kuning-dark"><Bi text={topic.strand} lang={lang} /></p>
                        <p className="font-display text-base font-bold text-ink"><Bi text={topic.title} lang={lang} /></p>
                      </div>
                      {score !== undefined && (
                        <div className="text-right">
                          <p className="font-num text-sm font-bold text-ink/60">{score}%</p>
                        </div>
                      )}
                    </div>
                    {score !== undefined && (
                      <div className="mt-2 h-1 w-full rounded-full bg-ink/10">
                        <div
                          className={`h-1 rounded-full ${score < 50 ? "bg-saga" : "bg-pandan"}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

    </main>
  );
}
