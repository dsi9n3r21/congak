import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { MISSIONS } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import type { MissionCategory, MissionMode } from "@/lib/missions/types";

const YEAR_LABEL: Record<number, { ms: string; en: string }> = {
  4: { ms: "Tahun 4", en: "Year 4" },
  5: { ms: "Tahun 5", en: "Year 5" },
  6: { ms: "Tahun 6", en: "Year 6" },
};

const MODE_LABEL: Record<MissionMode, { ms: string; en: string }> = {
  easy: { ms: "Mod Mudah", en: "Easy mode" },
  medium: { ms: "Mod Sederhana", en: "Medium mode" },
  hard: { ms: "Mod Sukar", en: "Hard mode" },
};

const VALID_MODES: MissionMode[] = ["easy", "medium", "hard"];

export default async function MissionCategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { mode?: string };
}) {
  const category = params.category as MissionCategory;
  const style = MISSION_CATEGORY_STYLES[category];
  if (!style) notFound();

  const missions = MISSIONS.filter((m) => m.category === category);
  if (missions.length === 0) notFound();

  const mode: MissionMode = VALID_MODES.includes(searchParams.mode as MissionMode)
    ? (searchParams.mode as MissionMode)
    : "medium";
  // Picked fresh on every visit (not memoized) so reopening the same
  // obstacle offers a different mission — this, plus every generator
  // re-rolling its own numbers, is what makes an obstacle feel
  // "unlimited" instead of capped at however many story variants exist.
  const featured = missions[Math.floor(Math.random() * missions.length)];

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: student } = await supabase
    .from("students")
    .select("language_pref")
    .eq("user_id", user?.id ?? "")
    .single();
  const lang = student?.language_pref ?? "both";

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className={`relative overflow-hidden ${style.bg} px-5 pt-6 pb-8`}>
        <Link href="/quests" className={`text-xs font-semibold ${style.fg} opacity-80`}>
          ← <Bi text={{ ms: "Peta Pengembaraan", en: "Adventure Map" }} lang={lang} />
        </Link>
        <div className="mt-2 flex items-center gap-2.5">
          <style.Icon className={style.fg} size={28} strokeWidth={2.25} />
          <h1 className={`font-display text-xl font-bold ${style.fg}`}>
            <Bi text={style.label} lang={lang} />
          </h1>
        </div>
        <span className={`mt-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold ${style.fg}`}>
          <Bi text={MODE_LABEL[mode]} lang={lang} />
        </span>
      </header>

      <section className="mx-5 -mt-4 rounded-kite bg-white p-4 shadow-card">
        <p className="text-xs font-semibold text-ink/50">
          <Bi text={{ ms: "Halangan ini", en: "This obstacle" }} lang={lang} />
        </p>
        <p className="mt-1 font-display text-base font-bold text-ink">
          <Bi text={featured.title} lang={lang} />
        </p>
        <p className="mt-0.5 text-xs text-ink/50">
          <Bi text={featured.skillTag} lang={lang} />
        </p>
        <Link
          href={`/quests/${featured.id}?mode=${mode}`}
          className="mt-3 block w-full min-h-[44px] rounded-kite bg-ungu py-3 text-center font-display text-sm font-bold text-white"
        >
          <Bi text={{ ms: "Mula Cabaran", en: "Start Challenge" }} lang={lang} /> →
        </Link>
      </section>

      <section className="mx-5 mt-4">
        <p className="px-1 text-xs font-semibold text-ink/40">
          <Bi text={{ ms: "Atau cuba cerita lain", en: "Or try a different story" }} lang={lang} />
        </p>
        <div className="mt-2 flex flex-col gap-2.5">
          {missions.map((mission) => (
            <Link
              key={mission.id}
              href={`/quests/${mission.id}?mode=${mode}`}
              className="flex items-center gap-3 rounded-kite bg-white p-3.5 shadow-card"
            >
              <span className="text-2xl">{mission.emoji}</span>
              <div className="flex-1">
                <p className="font-display text-sm font-bold text-ink">
                  <Bi text={mission.title} lang={lang} />
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-biru-light px-2 py-0.5 text-[10px] font-bold text-biru-dark">
                    <Bi text={YEAR_LABEL[mission.yearLevel]} lang={lang} />
                  </span>
                  <span className="text-[10px] font-bold text-kuning-dark">+{mission.rewardXp} XP</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
