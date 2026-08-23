import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { MISSIONS } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import { LEVELS_PER_WORLD } from "@/lib/missions/worldConfig";
import type { MissionCategory, MissionMode } from "@/lib/missions/types";
import Link from "next/link";
import Image from "next/image";

const VALID_MODES: MissionMode[] = ["easy", "medium", "hard"];
const MODE_LABEL: Record<MissionMode, { ms: string; en: string }> = {
  easy: { ms: "Mudah", en: "Easy" },
  medium: { ms: "Sederhana", en: "Medium" },
  hard: { ms: "Sukar", en: "Hard" },
};
const MODE_WORLD_NAME: Record<MissionMode, { ms: string; en: string }> = {
  easy: { ms: "Taman Ceria", en: "Fun Park" },
  medium: { ms: "Bandar Raya", en: "Cityscape" },
  hard: { ms: "Pengembaraan Ekstrem", en: "Extreme Adventure" },
};
const MODE_THUMB: Record<MissionMode, string> = {
  easy: "/quests/world-easy.webp",
  medium: "/quests/world-medium.webp",
  hard: "/quests/world-hard.webp",
};
const MODE_ACCENT: Record<MissionMode, string> = {
  easy: "from-pandan to-pandan-dark",
  medium: "from-biru to-biru-dark",
  hard: "from-saga to-saga-dark",
};

export default async function QuestsPage() {
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

  // Fixed world order = the category order — worlds unlock strictly in
  // this sequence, same progression rule the map has always used.
  const worldOrder = (Object.keys(MISSION_CATEGORY_STYLES) as MissionCategory[]).filter((cat) =>
    MISSIONS.some((m) => m.category === cat)
  );

  // One query per table across ALL 3 modes at once, so every mode's card
  // can show its own real progress without a separate page load per mode
  // — the whole point of collapsing this down to "3 buttons, tap one and
  // go" instead of picking a mode THEN separately hitting a journey CTA.
  let clearedByMode: Partial<Record<MissionMode, Set<string>>> = {};
  let levelsByMode: Partial<Record<MissionMode, number>> = {};
  if (student) {
    const { data: runs } = await supabase
      .from("adventure_runs")
      .select("mode, categories_cleared")
      .eq("student_id", student.id)
      .in("mode", VALID_MODES);
    for (const row of runs ?? []) {
      clearedByMode[row.mode as MissionMode] = new Set(row.categories_cleared ?? []);
    }
    const { data: levels } = await supabase
      .from("world_levels")
      .select("mode, category, cleared_count")
      .eq("student_id", student.id)
      .in("mode", VALID_MODES);
    for (const row of levels ?? []) {
      const m = row.mode as MissionMode;
      // Only need "does the CURRENT world have any progress" for the
      // start/continue wording below, tallied per mode as we go.
      levelsByMode[m] = Math.max(levelsByMode[m] ?? 0, row.cleared_count);
    }
  }

  const modeStats = VALID_MODES.map((mode) => {
    const cleared = clearedByMode[mode] ?? new Set<string>();
    let clearedCount = 0;
    while (clearedCount < worldOrder.length && cleared.has(worldOrder[clearedCount])) clearedCount++;
    const allCleared = clearedCount === worldOrder.length;
    const currentCategory = allCleared ? null : worldOrder[clearedCount];
    const hasProgress = clearedCount > 0 || (levelsByMode[mode] ?? 0) > 0;
    const href = currentCategory ? `/quests/world/${currentCategory}?mode=${mode}` : `/quests/world/${worldOrder[0]}?mode=${mode}`;
    return { mode, clearedCount, allCleared, hasProgress, href };
  });

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      {/* ---- Big Pintar hero ---- */}
      <header className="relative overflow-hidden px-5 pt-8 pb-4 text-center">
        <div className="relative mx-auto h-40 w-40">
          <Image src="/pintar/showing.png" alt="Pintar" fill className="object-contain drop-shadow-lg" priority />
        </div>
        <h1 className="mt-2 font-display text-xl font-bold text-ink">
          <Bi text={{ ms: "Misi Pengembaraan", en: "Adventure Mission" }} lang={lang} />
        </h1>
        <p className="mt-1 text-xs text-ink/50">
          <Bi text={{ ms: "Pilih mod untuk mula bersama Pintar!", en: "Pick a mode to start with Pintar!" }} lang={lang} />
        </p>
      </header>

      {/* ---- The 3 mode cards ARE the navigation now — no separate mode
          toggle + journey button + world list underneath. Tapping one
          resolves that mode's own next-uncleared world server-side and
          goes straight there. */}
      <section className="mx-5 flex flex-col gap-3">
        {modeStats.map(({ mode, clearedCount, allCleared, hasProgress, href }) => (
          <Link
            key={mode}
            href={href}
            className={`relative flex items-center gap-3 overflow-hidden rounded-kite bg-gradient-to-r ${MODE_ACCENT[mode]} p-3 shadow-hero`}
          >
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-kite border-2 border-white/60">
              <Image src={MODE_THUMB[mode]} alt="" fill className="object-cover" />
            </div>
            <div className="flex-1 text-left text-white">
              <p className="font-display text-base font-bold">
                <Bi text={MODE_LABEL[mode]} lang={lang} />
              </p>
              <p className="text-[11px] font-semibold opacity-90">
                <Bi text={MODE_WORLD_NAME[mode]} lang={lang} />
              </p>
              <p className="mt-1 text-[11px] font-bold opacity-95">
                {allCleared ? "🏆 " : ""}
                {clearedCount}/{worldOrder.length} <Bi text={{ ms: "dunia", en: "worlds" }} lang={lang} />
              </p>
            </div>
            <span className="pr-1 font-display text-sm font-bold text-white">
              {allCleared ? (
                <Bi text={{ ms: "Main semula", en: "Replay" }} lang={lang} />
              ) : hasProgress ? (
                <Bi text={{ ms: "Teruskan", en: "Continue" }} lang={lang} />
              ) : (
                <Bi text={{ ms: "Mula", en: "Start" }} lang={lang} />
              )}{" "}
              →
            </span>
          </Link>
        ))}
      </section>

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
