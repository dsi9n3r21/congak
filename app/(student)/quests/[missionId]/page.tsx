import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { getMissionById, MISSIONS } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import { MissionPlayer } from "@/components/student/MissionPlayer";
import type { MissionCategory, MissionMode } from "@/lib/missions/types";

const VALID_MODES: MissionMode[] = ["easy", "medium", "hard"];

export default async function MissionPage({
  params,
  searchParams,
}: {
  params: { missionId: string };
  searchParams: { mode?: string };
}) {
  const mission = getMissionById(params.missionId);
  if (!mission) notFound();
  const mode: MissionMode = VALID_MODES.includes(searchParams.mode as MissionMode)
    ? (searchParams.mode as MissionMode)
    : "medium";

  const style = MISSION_CATEGORY_STYLES[mission.category];
  const nodeOrder = (Object.keys(MISSION_CATEGORY_STYLES) as MissionCategory[]).filter((cat) =>
    MISSIONS.some((m) => m.category === cat)
  );
  const nodeNumber = nodeOrder.indexOf(mission.category) + 1;
  const nextCategory = nodeOrder[nodeNumber]; // nodeNumber is 1-indexed, so this is the NEXT one
  const nextLabel = nextCategory ? MISSION_CATEGORY_STYLES[nextCategory].label : undefined;

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
      <header className="px-5 pt-6 pb-2">
        <Link href={`/quests?mode=${mode}`} className="text-xs font-semibold text-ink/50">
          ← <Bi text={{ ms: "Peta Pengembaraan", en: "Adventure Map" }} lang={lang} />
        </Link>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-ungu-dark">
          <Bi text={{ ms: `Misi ${nodeNumber}`, en: `Mission ${nodeNumber}` }} lang={lang} />
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-2xl">{mission.emoji}</span>
          <h1 className="font-display text-lg font-bold text-ink">
            <Bi text={mission.title} lang={lang} />
          </h1>
        </div>
        <span className="mt-1 inline-block text-xs font-bold text-kuning-dark">⭐ +{mission.rewardXp} XP</span>
      </header>

      <MissionPlayer
        missionId={mission.id}
        lang={lang}
        mode={mode}
        nextCategoryLabel={nextLabel}
        nodeNumber={nodeNumber}
        totalNodes={nodeOrder.length}
      />
    </main>
  );
}
