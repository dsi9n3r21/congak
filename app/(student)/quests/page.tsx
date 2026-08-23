import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { MISSIONS } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import { LEVELS_PER_WORLD, WORLD_NAME } from "@/lib/missions/worldConfig";
import { BADGES } from "@/lib/missions/badges";
import type { MissionCategory, MissionMode } from "@/lib/missions/types";
import Link from "next/link";
import Image from "next/image";
import { ReplayAdventureButton } from "@/components/student/ReplayAdventureButton";

const VALID_MODES: MissionMode[] = ["easy", "medium", "hard"];
const MODE_LABEL: Record<MissionMode, { ms: string; en: string }> = {
  easy: { ms: "Mudah", en: "Easy" },
  medium: { ms: "Sederhana", en: "Medium" },
  hard: { ms: "Sukar", en: "Hard" },
};

export default async function QuestsPage({ searchParams }: { searchParams: { mode?: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: student } = await supabase
    .from("students")
    .select("id, language_pref")
    .eq("user_id", user?.id ?? "")
    .single();
  const lang = student?.language_pref ?? "both";

  const mode: MissionMode = VALID_MODES.includes(searchParams.mode as MissionMode)
    ? (searchParams.mode as MissionMode)
    : "medium";

  // Fixed world order = the category order — worlds unlock strictly in
  // this sequence, same progression rule the old single-map view used.
  const worldOrder = (Object.keys(MISSION_CATEGORY_STYLES) as MissionCategory[]).filter((cat) =>
    MISSIONS.some((m) => m.category === cat)
  );

  let clearedSet = new Set<string>();
  const levelCounts: Partial<Record<MissionCategory, number>> = {};
  if (student) {
    const { data: run } = await supabase
      .from("adventure_runs")
      .select("categories_cleared")
      .eq("student_id", student.id)
      .eq("mode", mode)
      .single();
    clearedSet = new Set(run?.categories_cleared ?? []);

    const { data: levels } = await supabase
      .from("world_levels")
      .select("category, cleared_count")
      .eq("student_id", student.id)
      .eq("mode", mode);
    for (const row of levels ?? []) {
      levelCounts[row.category as MissionCategory] = row.cleared_count;
    }
  }

  let clearedCount = 0;
  while (clearedCount < worldOrder.length && clearedSet.has(worldOrder[clearedCount])) clearedCount++;
  const allCleared = clearedCount === worldOrder.length;
  const currentCategory = allCleared ? null : worldOrder[clearedCount];
  const journeyHref = currentCategory ? `/quests/world/${currentCategory}?mode=${mode}` : null;
  // Only say "START" when there's genuinely nothing done yet anywhere in
  // this mode — the moment ANY world is fully cleared, or the current
  // world already has a level or two done, this is a returning student,
  // not a fresh one, even though the button always points at the same
  // href (the next uncleared level). Lynda flagged the old always-"START"
  // wording as misleading once she had 3 worlds done and it still said
  // "START YOUR JOURNEY" going into world 4.
  const hasAnyProgress = clearedCount > 0 || (currentCategory ? (levelCounts[currentCategory] ?? 0) > 0 : false);
  const champion = BADGES.adventure_champion;

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-3">
        <h1 className="font-display text-xl font-bold text-ink">
          <Bi text={{ ms: "Misi Pengembaraan", en: "Adventure Mission" }} lang={lang} />
        </h1>
        <p className="mt-1 text-xs text-ink/50">
          <Bi text={{ ms: "Bantu Pintar terokai setiap dunia!", en: "Help Pintar explore every world!" }} lang={lang} />
        </p>
      </header>

      <section className="mx-5 flex gap-2">
        {VALID_MODES.map((m) => (
          <Link
            key={m}
            href={`/quests?mode=${m}`}
            className={`flex-1 rounded-kite py-2 text-center font-display text-xs font-bold ${
              m === mode ? "bg-ungu text-white" : "bg-white text-ink/60 shadow-card"
            }`}
          >
            <Bi text={MODE_LABEL[m]} lang={lang} />
          </Link>
        ))}
      </section>

      <section className="mx-5 mt-4">
        {journeyHref ? (
          <Link
            href={journeyHref}
            className="block w-full min-h-[52px] rounded-kite bg-gradient-to-r from-kuning to-kuning-dark py-4 text-center font-display text-base font-bold text-white shadow-hero"
          >
            <Bi
              text={
                hasAnyProgress
                  ? { ms: "TERUSKAN PENGEMBARAAN", en: "CONTINUE YOUR JOURNEY" }
                  : { ms: "MULA PENGEMBARAAN", en: "START YOUR JOURNEY" }
              }
              lang={lang}
            />{" "}
            →
          </Link>
        ) : (
          <div className="rounded-kite bg-gradient-to-r from-kuning to-ungu-dark py-4 text-center font-display text-base font-bold text-white shadow-hero">
            🏆 <Bi text={{ ms: "Semua dunia selesai!", en: "All worlds complete!" }} lang={lang} />
          </div>
        )}
      </section>

      {/* ---- World list ---- */}
      <section className="mx-5 mt-4 flex flex-col gap-2.5">
        {worldOrder.map((cat, i) => {
          const style = MISSION_CATEGORY_STYLES[cat];
          const cleared = i < clearedCount;
          const isCurrent = i === clearedCount;
          const locked = i > clearedCount;
          const levelsCleared = Math.min(levelCounts[cat] ?? 0, LEVELS_PER_WORLD);
          const card = (
            <div
              className={`relative flex items-center gap-3 rounded-kite ${style.bg} p-4 shadow-card ${
                locked ? "opacity-50" : ""
              } ${isCurrent ? "ring-4 ring-kuning" : ""}`}
            >
              <style.Icon className={style.fg} size={28} strokeWidth={2.25} />
              <div className="flex-1">
                <p className={`font-display text-sm font-bold ${style.fg}`}>
                  <Bi text={WORLD_NAME[cat]} lang={lang} />
                </p>
                <p className={`mt-0.5 text-[11px] font-semibold ${style.fg} opacity-80`}>
                  {cleared ? `${LEVELS_PER_WORLD}/${LEVELS_PER_WORLD}` : `${levelsCleared}/${LEVELS_PER_WORLD}`}{" "}
                  <Bi text={{ ms: "aras", en: "levels" }} lang={lang} />
                </p>
              </div>
              {cleared && <span className="text-lg">✅</span>}
              {locked && <span className="text-lg">🔒</span>}
            </div>
          );
          return locked ? (
            <div key={cat}>{card}</div>
          ) : (
            <Link key={cat} href={`/quests/world/${cat}?mode=${mode}`}>
              {card}
            </Link>
          );
        })}
      </section>

      {allCleared && (
        <section className="mx-5 mt-4 rounded-kite bg-gradient-to-br from-kuning to-ungu-dark p-4 text-center text-paper shadow-card">
          <p className="text-2xl">{champion.emoji}</p>
          <p className="mt-1 font-display text-sm font-bold">
            <Bi text={{ ms: "Anda telah menamatkan peta ini!", en: "You've cleared this map!" }} lang={lang} />
          </p>
          <p className="mt-1 text-xs opacity-90">
            <Bi
              text={{
                ms: "Cuba mod lain, atau main semula untuk cabaran baharu.",
                en: "Try another mode, or play again for a fresh set of challenges.",
              }}
              lang={lang}
            />
          </p>
          <ReplayAdventureButton mode={mode} lang={lang} />
        </section>
      )}

      <section className="mx-5 mt-4 rounded-kite bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <Image src="/pintar/idle.png" alt="Pintar" fill className="object-contain" />
          </div>
          <p className="text-xs text-ink/60">
            <Bi
              text={{
                ms: "Sesat? Tanya Pintar bila-bila masa semasa cabaran.",
                en: "Stuck? Ask Pintar any time during a challenge.",
              }}
              lang={lang}
            />
          </p>
        </div>
      </section>
    </main>
  );
}
