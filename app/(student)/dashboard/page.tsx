import { createClient } from "@/lib/supabase/server";
import { TOPICS } from "@/lib/content/topics";
import { getRecommendedTopic } from "@/lib/content/recommended";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from("students")
    .select("id, display_name, xp, level, streak_count, link_code, language_pref")
    .eq("user_id", user?.id ?? "")
    .single();

  const lang = student?.language_pref ?? "both";

  const { data: mastery } = await supabase
    .from("topic_mastery")
    .select("topic_id, mastery_score, weak_flag")
    .eq("student_id", student?.id ?? "");

  const allTopics = Object.values(TOPICS);
  const masteryByTopic = new Map((mastery ?? []).map((m) => [m.topic_id, m]));

  const weakTopics = allTopics.filter((t) => masteryByTopic.get(t.id)?.weak_flag);
  const recommended = await getRecommendedTopic(supabase, student?.id ?? "");

  const xpToNext = (student?.level ?? 1) * 125;
  const xpPct = Math.min(100, Math.round(((student?.xp ?? 0) / xpToNext) * 100));

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4">
        <p className="font-body text-sm text-ink/60"><Bi text={UI.welcomeBack} lang={lang} /></p>
        <h1 className="font-display text-2xl font-bold text-ink">{student?.display_name ?? "Murid"} 👋</h1>
      </header>

      <section className="mx-5 flex items-center justify-between rounded-kite bg-biru shadow-card px-5 py-4 text-paper">
        <div>
          <p className="font-num text-2xl font-bold">{student?.streak_count ?? 0}</p>
          <p className="text-xs opacity-80">hari berturut-turut 🪁</p>
        </div>
        <div className="h-10 w-px bg-paper/30" />
        <div className="text-right">
          <p className="font-num text-2xl font-bold">Lvl {student?.level ?? 1}</p>
          <div className="mt-1 h-1.5 w-24 rounded-full bg-paper/25">
            <div className="h-1.5 rounded-full bg-kuning" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="mt-0.5 text-[11px] opacity-80 font-num">{student?.xp ?? 0}/{xpToNext} XP</p>
        </div>
      </section>

      {recommended && (
        <section className="mx-5 mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
            <Bi text={UI.recommendedToday} lang={lang} />
          </p>
          <a
            href={`/learn/${recommended.id}`}
            className="block rounded-kite bg-kuning-light px-5 py-4 shadow-card active:scale-[0.98] transition-transform"
          >
            <p className="text-xs font-semibold text-kuning-dark"><Bi text={recommended.strand} lang={lang} /></p>
            <p className="font-display text-lg font-bold text-ink"><Bi text={recommended.title} lang={lang} /></p>
            <p className="mt-1 text-sm text-ink/70"><Bi text={UI.continueLearning} lang={lang} /> →</p>
          </a>
        </section>
      )}

      {weakTopics.length > 0 && (
        <section className="mx-5 mt-5 rounded-kite border border-saga-light bg-saga-light/40 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-saga-dark">
            <Bi text={UI.needsAttention} lang={lang} />
          </p>
          <ul className="space-y-1.5">
            {weakTopics.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-saga" />
                <Bi text={t.title} lang={lang} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {student?.link_code && (
        <section className="mx-5 mt-5 rounded-kite border-2 border-dashed border-biru-light bg-biru-light/30 px-5 py-4 text-center">
          <p className="text-xs text-ink/60"><Bi text={UI.linkCode} lang={lang} /></p>
          <p className="mt-1 font-num text-xl font-bold tracking-widest text-biru-dark">{student.link_code}</p>
          <p className="mt-1 text-[11px] text-ink/50"><Bi text={UI.linkCodeShare} lang={lang} /></p>
        </section>
      )}

      <section className="mx-5 mt-5">
        <a
          href="/exam"
          className="flex items-center justify-between rounded-kite border-2 border-saga-light bg-saga-light/30 px-5 py-4"
        >
          <div>
            <p className="font-display text-sm font-bold text-saga-dark"><Bi text={UI.examCta} lang={lang} /></p>
            <p className="text-xs text-ink/60"><Bi text={UI.examCtaSub} lang={lang} /></p>
          </div>
          <span className="text-lg">⏱️</span>
        </a>
      </section>

    </main>
  );
}
