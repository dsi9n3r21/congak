"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bi } from "@/lib/i18n/Bi";
import type { Bilingual, Lang } from "@/lib/i18n/dictionary";
import Link from "next/link";
import { fillTemplate } from "@/lib/missions/types";
import type { MissionMode, MissionCategory } from "@/lib/missions/types";
import { getMissionById } from "@/lib/missions/missions";
import { BADGES } from "@/lib/missions/badges";
import { completeMission } from "@/lib/actions/missions";
import { isAnswerCorrect } from "@/lib/questions/grading";
import { MathSymbolBar } from "@/components/student/MathSymbolBar";

type Stage = "intro" | "question" | "success" | "reward" | "reflection";

/**
 * Small "Pintar walks to the next stop" strip — a compact row of dots
 * (one per map node) with Pintar's icon animating one step forward on
 * mount. Shown on the reward screen right when a mission finishes, so
 * the moment of finishing VISUALLY connects to the next node instead of
 * just returning to a static map afterward (per Lynda's ask: "when it
 * finish 1 stop, pintar move to the next stop, then continue to the
 * next question"). Purely decorative — the actual node-unlock state
 * still lives server-side in adventure_runs, this just previews the
 * move that's about to happen.
 */
function PintarWalkStrip({ fromNode, totalNodes, lang }: { fromNode: number; totalNodes: number; lang: Lang }) {
  const [walked, setWalked] = useState(false);
  useEffect(() => {
    // Fires once on mount, after a short beat, so the student sees
    // Pintar sitting at the JUST-CLEARED node before stepping forward —
    // a plain instant jump wouldn't read as "moving".
    const t = setTimeout(() => setWalked(true), 450);
    return () => clearTimeout(t);
  }, []);
  const dots = Array.from({ length: totalNodes }, (_, i) => i + 1);
  const atNode = walked ? Math.min(fromNode + 1, totalNodes) : fromNode;

  return (
    <div className="relative mt-4 rounded-kite bg-white/15 px-4 py-5">
      <div className="relative flex items-center justify-between">
        {dots.map((n) => (
          <div key={n} className="flex flex-1 items-center">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                n <= fromNode ? "bg-white" : n === fromNode + 1 ? "bg-white/90" : "bg-white/30"
              }`}
            />
            {n < totalNodes && (
              <div className={`h-0.5 flex-1 ${n < atNode ? "bg-white" : "bg-white/25"} transition-colors duration-700`} />
            )}
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute top-1/2 h-9 w-9 -translate-y-[calc(50%+13px)] transition-all duration-700 ease-out"
        style={{ left: `calc(${((atNode - 1) / (totalNodes - 1)) * 100}% - ${((atNode - 1) / (totalNodes - 1)) * 36}px)` }}
      >
        <Image src="/pintar/idle.png" alt="Pintar" fill className="object-contain drop-shadow" />
      </div>
      <p className="relative mt-4 text-center text-[11px] font-semibold text-white/80">
        {walked ? (
          <Bi text={{ ms: `Menuju ke Halangan ${atNode}...`, en: `Heading to Obstacle ${atNode}...` }} lang={lang} />
        ) : (
          <Bi text={{ ms: `Halangan ${fromNode} selesai!`, en: `Obstacle ${fromNode} cleared!` }} lang={lang} />
        )}
      </p>
    </div>
  );
}

const PINTAR = {
  intro: "/pintar/showing.png",
  question: "/pintar/thinking.png",
  retry: "/pintar/wrong.png",
  success: "/pintar/correct.png",
  reward: "/pintar/reward.png",
  reflection: "/pintar/idle.png",
};

/**
 * Takes `missionId` (a plain string), not the full MissionTemplate — a
 * mission's variants carry a `generateMath` function each, and functions
 * can't cross the server→client component boundary. The page.tsx server
 * component looks the mission up once just to validate it exists /
 * render the header; this component re-resolves the same id itself so
 * the (non-serializable) function values never have to be passed as a
 * prop.
 */
export function MissionPlayer({
  missionId,
  lang,
  mode = "medium",
  nodeNumber,
  totalNodes,
  category,
}: {
  missionId: string;
  lang: Lang;
  mode?: MissionMode;
  /** This mission's level number within its world (1..LEVELS_PER_WORLD),
   * and the world's total level count — together drive the small
   * animated "Pintar walks to the next stop" strip on the reward screen
   * (see PintarWalkStrip below). Both optional so MissionPlayer still
   * works if a mission is ever opened outside the world-map flow. */
  nodeNumber?: number;
  totalNodes?: number;
  /** Which world (category) this level belongs to — needed so
   * completeMission can progress the right world's level count, and so
   * "Back to map"/"Continue" knows which world page to return to. */
  category?: MissionCategory;
}) {
  const router = useRouter();
  // Safe: page.tsx already calls notFound() server-side if this id
  // doesn't resolve, so MissionPlayer is never mounted with a bad id.
  const mission = useMemo(() => getMissionById(missionId)!, [missionId]);

  // One variant (story skin) picked for this whole playthrough, and one
  // math draw from it. Both start with useState's lazy initializer and
  // both get rerolled together on restart() — previously only the math
  // draw rerolled while the story stayed pinned to the first variant,
  // so "Play again" repeated the same story with new numbers instead of
  // a genuinely fresh combination.
  const [variant, setVariant] = useState(() => mission.variants[Math.floor(Math.random() * mission.variants.length)]);
  const [draw, setDraw] = useState(() => variant.generateMath(mode));
  const [stage, setStage] = useState<Stage>("intro");
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [reward, setReward] = useState<{
    badgeJustEarned: boolean;
    leveledUp: boolean;
    coinsEarned: number;
    adventureCompleted: boolean;
    worldCompleted: boolean;
  } | null>(null);
  const [rewardError, setRewardError] = useState(false);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const merged = useMemo(() => ({ ...variant.tokens, ...draw.values }), [variant, draw]);
  const t = useCallback((field: Bilingual) => fillTemplate(field, merged), [merged]);

  const submit = useCallback(() => {
    if (!answer.trim()) return;
    if (isAnswerCorrect(answer, draw.correctAnswer)) {
      setStage("success");
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 2) setShowHint(true);
    }
  }, [answer, attempts, draw.correctAnswer]);

  const claimReward = useCallback(async () => {
    setStage("reward");
    setRewardError(false);
    const result = await completeMission({
      missionId: mission.id,
      category: category ?? mission.category,
      xpEarned: mission.rewardXp,
      badgeId: mission.badgeId,
      mode,
    }).catch(() => null);
    if (!result?.ok) {
      setRewardError(true);
      return;
    }
    setReward({
      badgeJustEarned: !!result.badgeJustEarned,
      leveledUp: !!result.leveledUp,
      coinsEarned: result.coinsEarned ?? 0,
      adventureCompleted: !!result.adventureCompleted,
      worldCompleted: !!result.worldCompleted,
    });
  }, [mission, mode, category]);

  const restart = useCallback(() => {
    // Prefer a different variant than the one just played (when there is
    // more than one) so back-to-back plays of the same mission don't
    // show the identical story twice in a row — the math draw is always
    // fresh regardless (every generator re-rolls its own randInt/pick
    // calls), so this is what makes a replay feel like a new mission.
    const others = mission.variants.filter((v) => v !== variant);
    const nextVariant = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : variant;
    setVariant(nextVariant);
    setDraw(nextVariant.generateMath(mode));
    setAnswer("");
    setAttempts(0);
    setShowHint(false);
    setReward(null);
    setRewardError(false);
    setStage("intro");
    router.refresh();
  }, [mission, variant, mode, router]);

  const badge = mission.badgeId ? BADGES[mission.badgeId] : null;

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-4">
      {/* ---- Story Introduction ---- */}
      {stage === "intro" && (
        <div className="overflow-hidden rounded-kite bg-white shadow-card">
          {variant.image && (
            <div className="relative aspect-[4/3] w-full">
              <Image src={variant.image} alt="" fill className="object-cover" priority />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}
          <div className="p-5 text-center">
            <div className={`relative mx-auto h-28 w-28 ${variant.image ? "-mt-16" : ""}`}>
              <Image src={PINTAR.intro} alt="Pintar" fill className="object-contain drop-shadow-lg" />
            </div>
            <p className="mt-3 text-base leading-relaxed text-ink">
              <Bi text={t(variant.intro)} lang={lang} />
            </p>
            <button
              onClick={() => setStage("question")}
              className="mt-5 w-full min-h-[44px] rounded-kite bg-kuning py-3 font-display font-bold text-white"
            >
              {lang === "en" ? "Let's help!" : "Mari bantu!"} →
            </button>
          </div>
        </div>
      )}

      {/* ---- Challenge + Mathematics Problem + Student Decision ---- */}
      {stage === "question" && (
        <div className="rounded-kite bg-white p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="relative h-14 w-14 shrink-0">
              <Image src={attempts > 0 ? PINTAR.retry : PINTAR.question} alt="Pintar" fill className="object-contain" />
            </div>
            <p className="text-sm leading-snug text-ink/80">
              <Bi text={t(variant.challenge)} lang={lang} />
            </p>
          </div>

          {attempts > 0 && (
            <div className="mt-3 rounded-kite border border-saga-light bg-saga-light/40 p-3">
              <p className="text-sm text-saga-dark">
                <Bi text={t(variant.outcomeRetry)} lang={lang} />
              </p>
              {showHint && (
                <p className="mt-1.5 font-num text-sm font-semibold text-ink">
                  💡 <Bi text={fillTemplate(draw.workingHint, merged)} lang={lang} />
                </p>
              )}
              {attempts >= 2 && (
                <div className="mt-2.5 flex gap-2 border-t border-saga-light/60 pt-2.5 text-xs font-semibold">
                  <Link
                    href={`/pintar?ask=${encodeURIComponent(t(draw.questionText)[lang === "en" ? "en" : "ms"])}`}
                    className="flex-1 text-center text-ungu-dark underline"
                  >
                    {lang === "en" ? "Ask Pintar" : "Tanya Pintar"}
                  </Link>
                  <Link href="/learn" className="flex-1 text-center text-ungu-dark underline">
                    {lang === "en" ? "Review this topic" : "Ulang kaji topik ini"}
                  </Link>
                </div>
              )}
            </div>
          )}

          <p className="mt-4 font-display text-base font-bold leading-snug text-ink">
            <Bi text={t(draw.questionText)} lang={lang} />
          </p>

          <input
            ref={answerInputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={lang === "en" ? "Type your answer..." : "Taip jawapan..."}
            className="mt-4 w-full rounded-kite border-2 border-ink/10 px-4 py-3 font-num text-base focus:border-ungu focus:outline-none"
          />
          <div className="mt-2.5">
            <MathSymbolBar inputRef={answerInputRef} value={answer} onChange={setAnswer} />
          </div>

          <button
            onClick={submit}
            disabled={!answer.trim()}
            className="mt-4 w-full min-h-[44px] rounded-kite bg-kuning py-3 font-display font-bold text-white disabled:opacity-40"
          >
            {lang === "en" ? "Check answer" : "Semak jawapan"}
          </button>
        </div>
      )}

      {/* ---- Outcome (success) ---- */}
      {stage === "success" && (
        <div className="rounded-kite bg-white p-5 text-center shadow-card">
          <div className="relative mx-auto h-28 w-28">
            <Image src={PINTAR.success} alt="Pintar" fill className="object-contain" />
          </div>
          <p className="mt-3 text-base leading-relaxed text-ink">
            <Bi text={t(variant.outcomeSuccess)} lang={lang} />
          </p>
          <button
            onClick={claimReward}
            className="mt-5 w-full min-h-[44px] rounded-kite bg-pandan py-3 font-display font-bold text-white"
          >
            {lang === "en" ? "Claim reward" : "Tuntut ganjaran"} 🎁
          </button>
        </div>
      )}

      {/* ---- Reward ---- */}
      {stage === "reward" && rewardError && (
        <div className="rounded-kite bg-white p-5 text-center shadow-card">
          <div className="relative mx-auto h-24 w-24">
            <Image src={PINTAR.retry} alt="Pintar" fill className="object-contain" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            {lang === "en"
              ? "Couldn't save your reward — check your connection and try again."
              : "Ganjaran tidak dapat disimpan — semak sambungan anda dan cuba lagi."}
          </p>
          <button
            onClick={claimReward}
            className="mt-5 w-full min-h-[44px] rounded-kite bg-kuning py-3 font-display font-bold text-white"
          >
            {lang === "en" ? "Try again" : "Cuba lagi"}
          </button>
        </div>
      )}
      {stage === "reward" && !rewardError && !reward && (
        <div className="rounded-kite bg-gradient-to-b from-pandan to-pandan-dark p-6 text-center text-paper shadow-hero">
          <div className="relative mx-auto h-28 w-28 animate-pulse">
            <Image src={PINTAR.reward} alt="Pintar" fill className="object-contain" />
          </div>
          <p className="mt-3 text-sm opacity-90">{lang === "en" ? "Saving your reward..." : "Menyimpan ganjaran anda..."}</p>
        </div>
      )}
      {stage === "reward" && !rewardError && reward && !reward.adventureCompleted && (
        <div className="relative overflow-hidden rounded-kite bg-gradient-to-b from-pandan to-pandan-dark p-6 text-center text-paper shadow-hero">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
          <div className="relative mx-auto h-28 w-28">
            <Image src={PINTAR.reward} alt="Pintar" fill className="object-contain" />
          </div>
          <p className="relative mt-3 font-display text-xl font-bold">+{mission.rewardXp} XP</p>
          {reward && reward.coinsEarned > 0 && (
            <p className="relative mt-0.5 font-display text-base font-bold">🪙 +{reward.coinsEarned}</p>
          )}
          {reward?.leveledUp && (
            <p className="relative mt-1 text-sm font-semibold opacity-95">
              {lang === "en" ? "Level up! 🎉" : "Naik tahap! 🎉"}
            </p>
          )}
          {reward.worldCompleted ? (
            <div className="relative mt-4 rounded-kite bg-white/15 px-4 py-4 text-center">
              <p className="text-2xl">🏆</p>
              <p className="mt-1 text-sm font-bold">
                <Bi text={{ ms: "Dunia ini selesai!", en: "World complete!" }} lang={lang} />
              </p>
            </div>
          ) : (
            nodeNumber &&
            totalNodes &&
            totalNodes > 1 && <PintarWalkStrip fromNode={nodeNumber} totalNodes={totalNodes} lang={lang} />
          )}
          {badge && (
            <p className="relative mt-2 text-sm opacity-90">
              {badge.emoji}{" "}
              {reward?.badgeJustEarned ? (
                <Bi
                  text={{
                    ms: `Anda dapat ${badge.name.ms}!`,
                    en: `You earned the ${badge.name.en}!`,
                  }}
                  lang={lang}
                />
              ) : (
                <Bi
                  text={{ ms: `Kemajuan menuju ${badge.name.ms}...`, en: `Progress toward the ${badge.name.en}...` }}
                  lang={lang}
                />
              )}
            </p>
          )}
          <button
            onClick={() => setStage("reflection")}
            className="relative mt-5 w-full min-h-[44px] rounded-kite bg-white py-3 font-display font-bold text-pandan-dark"
          >
            {lang === "en" ? "Continue" : "Teruskan"} →
          </button>
        </div>
      )}

      {/* ---- Mega reward: last obstacle on the Adventure Map cleared ---- */}
      {stage === "reward" && !rewardError && reward && reward.adventureCompleted && (
        <div className="relative overflow-hidden rounded-kite bg-gradient-to-b from-kuning via-kuning-dark to-ungu-dark p-6 text-center text-paper shadow-hero">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
          <div className="relative mx-auto h-32 w-32 animate-bounce">
            <Image src={PINTAR.reward} alt="Pintar" fill className="object-contain" />
          </div>
          <p className="relative mt-2 text-4xl">🏆</p>
          <p className="relative mt-1 font-display text-xl font-bold">
            {lang === "en" ? "Adventure Champion!" : "Juara Pengembaraan!"}
          </p>
          <p className="relative mt-1 text-sm opacity-90">
            {lang === "en"
              ? "You crossed every obstacle on the map and reached the end."
              : "Anda telah melalui semua halangan di peta dan sampai ke penghujungnya."}
          </p>
          <p className="relative mt-3 font-display text-lg font-bold">+{mission.rewardXp} XP</p>
          {reward.coinsEarned > 0 && <p className="relative mt-0.5 font-display text-base font-bold">🪙 +{reward.coinsEarned}</p>}
          <button
            onClick={() => setStage("reflection")}
            className="relative mt-5 w-full min-h-[44px] rounded-kite bg-white py-3 font-display font-bold text-ungu-dark"
          >
            {lang === "en" ? "Continue" : "Teruskan"} →
          </button>
        </div>
      )}

      {/* ---- Reflection ---- */}
      {stage === "reflection" && (
        <div className="rounded-kite bg-white p-5 text-center shadow-card">
          <div className="relative mx-auto h-24 w-24">
            <Image src={PINTAR.reflection} alt="Pintar" fill className="object-contain" />
          </div>
          <p className="mt-3 text-sm font-semibold text-ungu-dark">
            {lang === "en" ? "What you learned" : "Apa yang anda pelajari"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/80">
            <Bi text={t(variant.reflection)} lang={lang} />
          </p>
          <div className="mt-5 flex gap-2.5">
            <button
              onClick={restart}
              className="flex-1 min-h-[44px] rounded-kite border-2 border-ink/10 py-3 font-display text-sm font-bold text-ink"
            >
              {lang === "en" ? "Play again" : "Main lagi"}
            </button>
            <button
              onClick={() =>
                router.push(
                  reward?.adventureCompleted
                    ? `/quests`
                    : `/quests/world/${category ?? mission.category}?mode=${mode}`
                )
              }
              className="flex-1 min-h-[44px] rounded-kite bg-ungu py-3 font-display text-sm font-bold text-white"
            >
              {reward?.adventureCompleted
                ? lang === "en"
                  ? "Back to map"
                  : "Kembali ke peta"
                : lang === "en"
                  ? "Next stop"
                  : "Seterusnya"}{" "}
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
