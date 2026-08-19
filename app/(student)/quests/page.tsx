import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { MISSIONS } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import type { MissionCategory } from "@/lib/missions/types";
import Link from "next/link";
import Image from "next/image";

export default async function QuestsPage() {
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

  const categoriesWithMissions = Array.from(new Set(MISSIONS.map((m) => m.category))) as MissionCategory[];

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="relative overflow-hidden px-5 pt-6 pb-4">
        <div className="decorative absolute right-3 -top-2 h-28 w-28 rounded-full bg-kuning-light/60" />
        <div className="relative z-10 max-w-[80%]">
          <h1 className="font-display text-xl font-bold text-ink">
            {lang === "en" ? "Adventure Mode" : "Mod Pengembaraan"}
          </h1>
          <p className="mt-1 text-xs text-ink/50">
            {lang === "en" ? "Use math to help others on real missions" : "Guna matematik untuk bantu orang lain dalam misi sebenar"}
          </p>
        </div>
      </header>

      <section className="mx-5 grid grid-cols-2 gap-2.5">
        {categoriesWithMissions.map((cat) => {
          const style = MISSION_CATEGORY_STYLES[cat];
          const count = MISSIONS.filter((m) => m.category === cat).length;
          return (
            <Link
              key={cat}
              href={`/quests/category/${cat}`}
              className={`flex flex-col items-start gap-2 rounded-kite ${style.bg} p-4 shadow-card`}
            >
              <style.Icon className={style.fg} size={26} strokeWidth={2.25} />
              <p className={`font-display text-sm font-bold leading-snug ${style.fg}`}>
                <Bi text={style.label} lang={lang} />
              </p>
              <p className={`text-xs ${style.fg} opacity-80`}>
                {count} {lang === "en" ? "mission" + (count === 1 ? "" : "s") : "misi"}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="mx-5 mt-5 rounded-kite bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <Image src="/pintar/idle.png" alt="Pintar" fill className="object-contain" />
          </div>
          <p className="text-xs text-ink/60">
            {lang === "en"
              ? "Pick an adventure — every mission uses real math to help someone!"
              : "Pilih satu pengembaraan — setiap misi guna matematik sebenar untuk membantu seseorang!"}
          </p>
        </div>
      </section>
    </main>
  );
}
