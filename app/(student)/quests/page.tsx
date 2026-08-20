import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import { MISSIONS } from "@/lib/missions/missions";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
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

// Fixed winding-path coordinates for up to 9 nodes, hand-placed (not
// computed) so the path reads as a natural trail rather than a straight
// grid line — same viewBox convention as the app's other SVG diagrams.
const PATH_POINTS = [
  { x: 40, y: 460 },
  { x: 110, y: 380 },
  { x: 70, y: 300 },
  { x: 150, y: 240 },
  { x: 230, y: 280 },
  { x: 270, y: 200 },
  { x: 210, y: 130 },
  { x: 280, y: 70 },
  { x: 350, y: 40 },
];

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

  const categories = Object.keys(MISSION_CATEGORY_STYLES) as MissionCategory[];
  const categoriesWithMissions = categories.filter((cat) => MISSIONS.some((m) => m.category === cat));

  let clearedSet = new Set<string>();
  if (student) {
    const { data: run } = await supabase
      .from("adventure_runs")
      .select("categories_cleared")
      .eq("student_id", student.id)
      .eq("mode", mode)
      .single();
    clearedSet = new Set(run?.categories_cleared ?? []);
  }
  const clearedCount = categoriesWithMissions.filter((c) => clearedSet.has(c)).length;
  const allCleared = clearedCount === categoriesWithMissions.length;
  const points = PATH_POINTS.slice(0, categoriesWithMissions.length);
  // Pintar stands just past the last cleared node — at the start (point
  // A) if nothing's cleared yet, or at the final chest if everything is.
  const pintarAt = allCleared ? points[points.length - 1] : points[Math.max(0, clearedCount - 1)];
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const champion = BADGES.adventure_champion;

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="relative overflow-hidden px-5 pt-6 pb-3">
        <div className="decorative absolute right-3 -top-2 h-28 w-28 rounded-full bg-kuning-light/60" />
        <div className="relative z-10">
          <h1 className="font-display text-xl font-bold text-ink">
            <Bi text={{ ms: "Peta Pengembaraan", en: "Adventure Map" }} lang={lang} />
          </h1>
          <p className="mt-1 text-xs text-ink/50">
            <Bi
              text={{
                ms: "Bantu Pintar merentasi setiap halangan dari A ke B",
                en: "Help Pintar cross every obstacle from A to B",
              }}
              lang={lang}
            />
          </p>
        </div>
      </header>

      {/* ---- Mode selector ---- */}
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

      {/* ---- The map ---- */}
      <section className="relative mx-5 mt-4 overflow-hidden rounded-kite bg-gradient-to-b from-pandan-light to-biru-light p-3 shadow-card">
        <svg viewBox="0 0 400 500" className="h-[420px] w-full">
          <path d={pathD} fill="none" stroke="white" strokeWidth={6} strokeLinecap="round" strokeDasharray="2 14" opacity={0.8} />

          {points.map((p, i) => {
            const cat = categoriesWithMissions[i];
            const style = MISSION_CATEGORY_STYLES[cat];
            const cleared = clearedSet.has(cat);
            return (
              <g key={cat}>
                <circle cx={p.x} cy={p.y} r={22} fill={cleared ? "#22c55e" : "white"} stroke="#00000022" strokeWidth={2} />
                <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize={18}>
                  {cleared ? "✓" : i + 1}
                </text>
              </g>
            );
          })}

          {/* Point A / point B labels */}
          <text x={points[0].x} y={points[0].y + 45} textAnchor="middle" fontSize={13} fontWeight={700} fill="#334155">A</text>
          <text x={points[points.length - 1].x} y={points[points.length - 1].y - 30} textAnchor="middle" fontSize={13} fontWeight={700} fill="#334155">B</text>

          {/* Final chest at B — unlocked once every obstacle is cleared */}
          <text x={points[points.length - 1].x + 34} y={points[points.length - 1].y + 6} fontSize={26}>
            {allCleared ? "🏆" : "🔒"}
          </text>
        </svg>

        {/* Pintar marker, positioned via the same coordinate space */}
        <div
          className="pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 transition-all"
          style={{ left: `${(pintarAt.x / 400) * 100}%`, top: `${(pintarAt.y / 500) * 100}%` }}
        >
          <Image src="/pintar/idle.png" alt="Pintar" fill className="object-contain drop-shadow" />
        </div>
      </section>

      {/* ---- Node list (tappable — the SVG map is the illustration, this is the real nav) ---- */}
      <section className="mx-5 mt-4 grid grid-cols-2 gap-2.5">
        {categoriesWithMissions.map((cat) => {
          const style = MISSION_CATEGORY_STYLES[cat];
          const cleared = clearedSet.has(cat);
          return (
            <Link
              key={cat}
              href={`/quests/category/${cat}?mode=${mode}`}
              className={`relative flex flex-col items-start gap-2 rounded-kite ${style.bg} p-4 shadow-card`}
            >
              {cleared && <span className="absolute right-3 top-3 text-lg">✅</span>}
              <style.Icon className={style.fg} size={26} strokeWidth={2.25} />
              <p className={`font-display text-sm font-bold leading-snug ${style.fg}`}>
                <Bi text={style.label} lang={lang} />
              </p>
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
                ms: "Setiap halangan guna matematik sebenar — sesat? Tanya Pintar bila-bila masa.",
                en: "Every obstacle uses real math — stuck? Ask Pintar any time.",
              }}
              lang={lang}
            />
          </p>
        </div>
      </section>
    </main>
  );
}
