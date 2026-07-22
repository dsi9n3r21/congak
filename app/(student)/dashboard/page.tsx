import { createClient } from "@/lib/supabase/server";
import { TOPICS } from "@/lib/content/topics";
import { getRecommendedTopic } from "@/lib/content/recommended";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";
import type { Bilingual } from "@/lib/i18n/dictionary";
import Image from "next/image";

// Presentational only — not stored anywhere, just a friendlier label under
// the level number on the dashboard hero card. Purely cosmetic, doesn't
// affect XP/leveling logic at all.
function levelTierName(level: number): Bilingual {
  if (level <= 2) return { ms: "Pelajar Baru", en: "New Learner" };
  if (level <= 5) return { ms: "Pelajar Rajin", en: "Diligent Learner" };
  if (level <= 9) return { ms: "Pelajar Hebat", en: "Great Learner" };
  return { ms: "Juara Congak", en: "Congak Champion" };
}

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

  const level = student?.level ?? 1;
  const xp = student?.xp ?? 0;
  const xpToNext = level * 125;
  const xpPct = Math.min(100, Math.round((xp / xpToNext) * 100));
  const streak = student?.streak_count ?? 0;

  // UI.dashboardGreeting has a "{name}" placeholder — Bi renders text
  // as-is, so the substitution happens here before handing it to <Bi>.
  const greeting: Bilingual = {
    ms: UI.dashboardGreeting.ms.replace("{name}", student?.display_name ?? "Murid"),
    en: UI.dashboardGreeting.en.replace("{name}", student?.display_name ?? "Murid"),
  };

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="relative overflow-hidden px-5 pt-6 pb-4">
        <div className="relative z-10 max-w-[65%]">
          <h1 className="font-display text-2xl font-bold text-ink">
            <Bi text={greeting} lang={lang} />
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            <Bi text={UI.dashboardSubtitle} lang={lang} />
          </p>
        </div>
        <div className="absolute right-3 -top-2 h-28 w-28 rounded-full bg-kuning-light/60" />
        <div className="absolute right-4 top-1 h-24 w-24">
          <Image src="/pintar/idle.png" alt="" fill className="object-contain" priority />
        </div>
      </header>

      {/* Hero: level + XP, mirrors the "Tahap Kamu / XP Hari Ini" card in
          the reference design — labeled as total XP toward next level
          rather than "today's XP", since Congak doesn't track daily XP
          separately (only a running total) */}
      <section className="mx-5 rounded-kite bg-gradient-to-br from-biru to-biru-dark shadow-card px-5 py-5 text-paper">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kuning text-xl">
              ⭐
            </div>
            <div>
              <p className="text-xs opacity-80">
                <Bi text={UI.yourLevel} lang={lang} />
              </p>
              <p className="font-num text-2xl font-bold leading-none">Lvl {level}</p>
              <p className="mt-1 text-[11px] font-semibold text-kuning-light">
                <Bi text={levelTierName(level)} lang={lang} />
              </p>
            </div>
          </div>
          <div className="h-10 w-px shrink-0 bg-paper/25" />
          <div className="text-right">
            <p className="text-xs opacity-80">
              <Bi text={UI.yourXp} lang={lang} />
            </p>
            <p className="font-num text-xl font-bold">
              {xp} <span className="text-sm font-normal opacity-70">/ {xpToNext}</span>
            </p>
            <div className="mt-1.5 h-1.5 w-24 rounded-full bg-paper/25">
              <div className="h-1.5 rounded-full bg-kuning" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 border-t border-paper/15 pt-3 text-xs opacity-90">
          <span>🔥</span>
          <span className="font-num font-semibold">{streak}</span>
          <span>
            <Bi text={UI.streakDaysLabel} lang={lang} />
          </span>
        </div>
      </section>

      {recommended && (
        <section className="mx-5 mt-4 rounded-kite bg-pandan-light px-5 py-4 shadow-card">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-pandan-dark">
                <Bi text={UI.recommendedToday} lang={lang} />
              </p>
              <p className="mt-0.5 font-display text-base font-bold text-ink">
                <Bi text={recommended.title} lang={lang} />
              </p>
              <a
                href={`/learn/${recommended.id}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pandan px-4 py-2 text-xs font-semibold text-paper active:scale-[0.97] transition-transform"
              >
                <Bi text={UI.continueLearning} lang={lang} /> →
              </a>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
        </section>
      )}

      {weakTopics.length > 0 && (
        <section className="mx-5 mt-4 rounded-kite border border-saga-light bg-saga-light/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-xs font-semibold uppercase tracking-wide text-saga-dark">
              <Bi text={UI.needsAttention} lang={lang} />
            </p>
          </div>
          <ul className="mt-2 space-y-1.5">
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
        <section className="mx-5 mt-4 flex items-center gap-3 rounded-kite border-2 border-dashed border-biru-light bg-biru-light/30 px-5 py-4">
          <span className="text-xl">🔒</span>
          <div className="flex-1">
            <p className="text-xs text-ink/60">
              <Bi text={UI.linkCode} lang={lang} />
            </p>
            <p className="font-num text-lg font-bold tracking-widest text-biru-dark">{student.link_code}</p>
            <p className="text-[11px] text-ink/50">
              <Bi text={UI.linkCodeShare} lang={lang} />
            </p>
          </div>
        </section>
      )}

      <section className="mx-5 mt-4 mb-2">
        <a
          href="/exam"
          className="flex items-center justify-between rounded-kite bg-kuning-light px-5 py-4 shadow-card active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="font-display text-sm font-bold text-kuning-dark">
                <Bi text={UI.examCta} lang={lang} />
              </p>
              <p className="text-xs text-ink/60">
                <Bi text={UI.examCtaSub} lang={lang} />
              </p>
            </div>
          </div>
          <span className="rounded-full bg-kuning px-4 py-2 text-xs font-semibold text-ink whitespace-nowrap">
            <Bi text={UI.examCtaButton} lang={lang} /> ⚡
          </span>
        </a>
      </section>
    </main>
  );
}
