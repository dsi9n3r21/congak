import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { getMissionById } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import { MissionPlayer } from "@/components/student/MissionPlayer";

export default async function MissionPage({ params }: { params: { missionId: string } }) {
  const mission = getMissionById(params.missionId);
  if (!mission) notFound();

  const style = MISSION_CATEGORY_STYLES[mission.category];

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
        <Link href={`/quests/category/${mission.category}`} className="text-xs font-semibold text-ink/50">
          ← {lang === "en" ? "Back" : "Kembali"}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl">{mission.emoji}</span>
          <h1 className="font-display text-lg font-bold text-ink">
            <Bi text={mission.title} lang={lang} />
          </h1>
        </div>
      </header>

      <MissionPlayer missionId={mission.id} lang={lang} />
    </main>
  );
}
