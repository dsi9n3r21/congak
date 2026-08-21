import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { MISSIONS } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import { LEVELS_PER_WORLD, WORLD_NAME } from "@/lib/missions/worldConfig";
import { AdventurePath } from "@/components/student/AdventurePath";
import { ReplayWorldButton } from "@/components/student/ReplayWorldButton";
import type { MissionCategory, MissionMode } from "@/lib/missions/types";

const VALID_MODES: MissionMode[] = ["easy", "medium", "hard"];
const MODE_LABEL: Record<MissionMode, { ms: string; en: string }> = {
  easy: { ms: "Mudah", en: "Easy" },
  medium: { ms: "Sederhana", en: "Medium" },
  hard: { ms: "Sukar", en: "Hard" },
};
// Reuse the same 3 world-mode backdrops from the top-level map — a
// world's terrain still changes with difficulty, same as before.
const MODE_BACKDROP: Record<MissionMode, string> = {
  easy: "/quests/world-easy.webp",
  medium: "/quests/world-medium.webp",
  hard: "/quests/world-hard.webp",
};

export default async function WorldPage({
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

  let clearedCount = 0;
  if (student) {
    const { data: world } = await supabase
      .from("world_levels")
      .select("cleared_count")
      .eq("student_id", student.id)
      .eq("mode", mode)
      .eq("category", category)
      .single();
    clearedCount = Math.min(world?.cleared_count ?? 0, LEVELS_PER_WORLD);
  }
  const worldComplete = clearedCount >= LEVELS_PER_WORLD;

  // The current level's mission is picked fresh on every visit, same
  // "unlimited via randomization" approach the obstacle model already
  // used — a level isn't a specific authored mission, just a slot in
  // the path.
  const featured = missions[Math.floor(Math.random() * missions.length)];
  const levelHref = `/quests/${featured.id}?mode=${mode}&category=${category}&level=${Math.min(clearedCount + 1, LEVELS_PER_WORLD)}`;

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-3">
        <Link href={`/quests?mode=${mode}`} className="text-xs font-semibold text-ink/50">
          ← <Bi text={{ ms: "Semua Dunia", en: "All Worlds" }} lang={lang} />
        </Link>
        <div className="mt-2 flex items-center gap-2.5">
          <style.Icon className="text-ink/70" size={26} strokeWidth={2.25} />
          <h1 className="font-display text-xl font-bold text-ink">
            <Bi text={WORLD_NAME[category]} lang={lang} />
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full bg-ungu/10 px-2.5 py-1 text-[11px] font-bold text-ungu-dark">
            <Bi text={MODE_LABEL[mode]} lang={lang} />
          </span>
          <span className="text-[11px] font-semibold text-ink/40">
            {clearedCount}/{LEVELS_PER_WORLD} <Bi text={{ ms: "aras", en: "levels" }} lang={lang} />
          </span>
        </div>
      </header>

      <section className="mx-5">
        <AdventurePath
          totalLevels={LEVELS_PER_WORLD}
          clearedCount={clearedCount}
          worldImage={MODE_BACKDROP[mode]}
          levelHref={levelHref}
        />
      </section>

      {worldComplete && (
        <section className="mx-5 mt-4 rounded-kite bg-gradient-to-br from-kuning to-ungu-dark p-4 text-center text-paper shadow-card">
          <p className="text-2xl">🏆</p>
          <p className="mt-1 font-display text-sm font-bold">
            <Bi text={{ ms: "Dunia ini selesai!", en: "This world is complete!" }} lang={lang} />
          </p>
          <p className="mt-1 text-xs opacity-90">
            <Bi
              text={{
                ms: "Kembali ke peta untuk terokai dunia lain, atau main semula di sini.",
                en: "Head back to the map for another world, or replay this one.",
              }}
              lang={lang}
            />
          </p>
          <ReplayWorldButton mode={mode} category={category} lang={lang} />
        </section>
      )}

      <section className="mx-5 mt-4 rounded-kite bg-white p-4 shadow-card">
        <p className="text-xs text-ink/60">
          <Bi
            text={{
              ms: "Ketik nod bercahaya untuk teruskan pengembaraan. Tatal untuk terokai lebih lanjut.",
              en: "Tap the glowing node to continue the adventure. Scroll to explore further.",
            }}
            lang={lang}
          />
        </p>
      </section>
    </main>
  );
}
