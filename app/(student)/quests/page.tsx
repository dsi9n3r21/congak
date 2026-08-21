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
// One themed backdrop per mode, per the 3 world concepts (Fun Park /
// Cityscape / Volcano-mountain) — swapping the backdrop is what makes
// the SAME 1-9 node progression read as three different adventures
// rather than a re-skinned color change.
const MODE_WORLD: Record<MissionMode, { image: string; label: { ms: string; en: string } }> = {
  easy: { image: "/quests/world-easy.webp", label: { ms: "Taman Ceria", en: "Fun Park" } },
  medium: { image: "/quests/world-medium.webp", label: { ms: "Bandar Raya", en: "Cityscape" } },
  hard: { image: "/quests/world-hard.webp", label: { ms: "Pengembaraan Ekstrem", en: "Extreme Adventure" } },
};

// Fixed winding-path node coordinates (in the artwork's own ~898x1752
// portrait space, matched loosely to a path already readable across all
// 3 backdrops) — hand-placed, not computed, so the trail reads naturally
// rather than as a straight grid line.
const PATH_POINTS = [
  { x: 210, y: 1620 },
  { x: 340, y: 1480 },
  { x: 230, y: 1330 },
  { x: 420, y: 1220 },
  { x: 300, y: 1060 },
  { x: 480, y: 930 },
  { x: 360, y: 760 },
  { x: 520, y: 560 },
  { x: 640, y: 340 },
];
const VIEW_W = 898;
const VIEW_H = 1752;

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
  const world = MODE_WORLD[mode];

  // Fixed 1-9 node order = the category order — this IS the progression
  // sequence now (previously any category was reachable in any order;
  // per the UX brief the map itself is the navigation, so obstacles now
  // unlock strictly in sequence).
  const nodeOrder = (Object.keys(MISSION_CATEGORY_STYLES) as MissionCategory[]).filter((cat) =>
    MISSIONS.some((m) => m.category === cat)
  );

  let clearedList: string[] = [];
  if (student) {
    const { data: run } = await supabase
      .from("adventure_runs")
      .select("categories_cleared")
      .eq("student_id", student.id)
      .eq("mode", mode)
      .single();
    clearedList = run?.categories_cleared ?? [];
  }
  const clearedSet = new Set(clearedList);
  // Sequential progress: how many nodes from the START are cleared,
  // regardless of insertion order in the DB array — a node further along
  // never counts as "reached" if an earlier one is still open, since the
  // map no longer allows skipping ahead.
  let clearedCount = 0;
  while (clearedCount < nodeOrder.length && clearedSet.has(nodeOrder[clearedCount])) clearedCount++;
  const allCleared = clearedCount === nodeOrder.length;
  const currentCategory = allCleared ? null : nodeOrder[clearedCount];

  // The system (not the student) decides which mission within the
  // current-node category comes next — picked fresh server-side on every
  // page load, so replaying a node later offers a different mission.
  const pickMission = (category: MissionCategory) => {
    const pool = MISSIONS.filter((m) => m.category === category);
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const nextMission = currentCategory ? pickMission(currentCategory) : null;
  const points = PATH_POINTS.slice(0, nodeOrder.length);
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const champion = BADGES.adventure_champion;

  const journeyHref = nextMission ? `/quests/${nextMission.id}?mode=${mode}&category=${currentCategory}` : null;

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="relative overflow-hidden px-5 pt-6 pb-3">
        <h1 className="font-display text-xl font-bold text-ink">
          <Bi text={{ ms: "Misi Pengembaraan", en: "Adventure Mission" }} lang={lang} />
        </h1>
        <p className="mt-1 text-xs text-ink/50">
          <Bi text={{ ms: "Bantu Pintar sampai ke B!", en: "Help Pintar reach B!" }} lang={lang} />
        </p>
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

      {/* ---- Primary CTA, sitting just above the map ---- */}
      <section className="mx-5 mt-4">
        {journeyHref ? (
          <Link
            href={journeyHref}
            className="block w-full min-h-[52px] rounded-kite bg-gradient-to-r from-kuning to-kuning-dark py-4 text-center font-display text-base font-bold text-white shadow-hero"
          >
            <Bi text={{ ms: "MULA PENGEMBARAAN", en: "START YOUR JOURNEY" }} lang={lang} /> →
          </Link>
        ) : (
          <div className="rounded-kite bg-gradient-to-r from-kuning to-ungu-dark py-4 text-center font-display text-base font-bold text-white shadow-hero">
            🏆 <Bi text={{ ms: "Peta selesai!", en: "Map complete!" }} lang={lang} />
          </div>
        )}
        <p className="mt-1.5 text-center text-[11px] font-semibold text-ink/40">
          {allCleared ? (
            <Bi text={{ ms: "Semua 9 halangan selesai", en: "All 9 obstacles cleared" }} lang={lang} />
          ) : (
            <Bi
              text={{ ms: `Halangan ${clearedCount + 1} daripada ${nodeOrder.length}`, en: `Obstacle ${clearedCount + 1} of ${nodeOrder.length}` }}
              lang={lang}
            />
          )}
        </p>
      </section>

      {/* ---- The map: themed world backdrop + numbered node path ---- */}
      <section className="relative mx-5 mt-3 overflow-hidden rounded-kite shadow-card" style={{ aspectRatio: "898 / 1400" }}>
        <Image src={world.image} alt={world.label.en} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />

        <svg viewBox={`0 0 ${VIEW_W} 1400`} className="absolute inset-0 h-full w-full">
          {points.map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            const segmentDone = i <= clearedCount;
            return (
              <line
                key={i}
                x1={prev.x}
                y1={prev.y}
                x2={p.x}
                y2={p.y}
                stroke={segmentDone ? "#ffd94a" : "white"}
                strokeWidth={segmentDone ? 7 : 5}
                strokeLinecap="round"
                strokeDasharray={segmentDone ? undefined : "3 12"}
                opacity={segmentDone ? 0.95 : 0.55}
              />
            );
          })}

          {points.map((p, i) => {
            const cat = nodeOrder[i];
            const cleared = i < clearedCount;
            const isCurrent = i === clearedCount;
            const locked = i > clearedCount;
            const fill = cleared ? "#22c55e" : isCurrent ? "#ffd94a" : "#94a3b8";
            return (
              <g key={cat} opacity={locked ? 0.55 : 1}>
                {isCurrent && <circle cx={p.x} cy={p.y} r={30} fill="#ffd94a" opacity={0.35} className="animate-ping" />}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={24}
                  fill={fill}
                  stroke="white"
                  strokeWidth={3}
                  className={isCurrent ? "animate-pulse" : undefined}
                />
                <text x={p.x} y={p.y + 7} textAnchor="middle" fontSize={20} fontWeight={800} fill={locked ? "#1e293b" : "white"}>
                  {cleared ? "✓" : i + 1}
                </text>
              </g>
            );
          })}

          <text x={points[0].x} y={points[0].y + 48} textAnchor="middle" fontSize={16} fontWeight={800} fill="white">A</text>
          <text x={points[points.length - 1].x} y={points[points.length - 1].y - 34} textAnchor="middle" fontSize={16} fontWeight={800} fill="white">B</text>
          <text x={points[points.length - 1].x + 36} y={points[points.length - 1].y + 8} fontSize={30}>{allCleared ? "🏆" : "🔒"}</text>
        </svg>

        {/* Pintar marker at the furthest-cleared node (or point A if none) */}
        <div
          className="pointer-events-none absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg transition-all"
          style={{
            left: `${(points[allCleared ? points.length - 1 : Math.max(0, clearedCount - 1)].x / VIEW_W) * 100}%`,
            top: `${(points[allCleared ? points.length - 1 : Math.max(0, clearedCount - 1)].y / 1400) * 100}%`,
          }}
        >
          <Image src="/pintar/idle.png" alt="Pintar" fill className="object-contain" />
        </div>
      </section>

      {/* ---- Today's Focus: read-only labels, not navigation ---- */}
      <section className="mx-5 mt-4">
        <p className="px-1 text-xs font-semibold text-ink/40">
          <Bi text={{ ms: "Fokus Hari Ini", en: "Today's Focus" }} lang={lang} />
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {nodeOrder.map((cat, i) => {
            const style = MISSION_CATEGORY_STYLES[cat];
            const cleared = i < clearedCount;
            const isCurrent = i === clearedCount;
            return (
              <span
                key={cat}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  cleared ? "bg-pandan-light text-pandan-dark" : isCurrent ? "bg-kuning text-white" : "bg-ink/5 text-ink/35"
                }`}
              >
                <Bi text={style.label} lang={lang} />
              </span>
            );
          })}
        </div>
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
