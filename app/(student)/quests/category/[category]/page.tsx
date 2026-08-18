import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { MISSIONS } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import type { MissionCategory } from "@/lib/missions/types";

const YEAR_LABEL: Record<number, { ms: string; en: string }> = {
  4: { ms: "Mudah", en: "Easy" },
  5: { ms: "Sederhana", en: "Medium" },
  6: { ms: "Sukar", en: "Hard" },
};

export default async function MissionCategoryPage({ params }: { params: { category: string } }) {
  const category = params.category as MissionCategory;
  const style = MISSION_CATEGORY_STYLES[category];
  if (!style) notFound();

  const missions = MISSIONS.filter((m) => m.category === category);
  if (missions.length === 0) notFound();

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
          ← {lang === "en" ? "All categories" : "Semua kategori"}
        </Link>
        <div className="mt-2 flex items-center gap-2.5">
          <style.Icon className={style.fg} size={28} strokeWidth={2.25} />
          <h1 className={`font-display text-xl font-bold ${style.fg}`}>
            <Bi text={style.label} lang={lang} />
          </h1>
        </div>
      </header>

      <section className="mx-5 -mt-4 flex flex-col gap-3">
        {missions.map((mission) => (
          <Link
            key={mission.id}
            href={`/quests/${mission.id}`}
            className="flex items-center gap-3 rounded-kite bg-white p-4 shadow-card"
          >
            <span className="text-3xl">{mission.emoji}</span>
            <div className="flex-1">
              <p className="font-display text-sm font-bold text-ink">
                <Bi text={mission.title} lang={lang} />
              </p>
              <p className="mt-0.5 text-xs text-ink/50">
                <Bi text={mission.skillTag} lang={lang} />
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-full bg-biru-light px-2 py-0.5 text-[10px] font-bold text-biru-dark">
                  <Bi text={YEAR_LABEL[mission.yearLevel]} lang={lang} />
                </span>
                <span className="text-[10px] font-bold text-kuning-dark">+{mission.rewardXp} XP</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
