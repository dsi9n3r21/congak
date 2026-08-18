"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bi } from "@/lib/i18n/Bi";
import type { Bilingual, Lang } from "@/lib/i18n/dictionary";
import type { MissionTemplate } from "@/lib/missions/types";
import { fillTemplate } from "@/lib/missions/types";
import { BADGES } from "@/lib/missions/badges";
import { completeMission } from "@/lib/actions/missions";
import { isAnswerCorrect } from "@/lib/questions/grading";

type Stage = "intro" | "question" | "success" | "reward" | "reflection";

const PINTAR = {
  intro: "/pintar/showing.png",
  question: "/pintar/thinking.png",
  retry: "/pintar/wrong.png",
  success: "/pintar/correct.png",
  reward: "/pintar/reward.png",
  reflection: "/pintar/idle.png",
};

export function MissionPlayer({ mission, lang }: { mission: MissionTemplate; lang: Lang }) {
  const router = useRouter();

  // One variant (story skin) picked for this whole playthrough, and one
  // math draw from it — both fixed with useState's lazy initializer so
  // they don't reroll on every render, only when the student restarts.
  const [variant] = useState(() => mission.variants[Math.floor(Math.random() * mission.variants.length)]);
  const [draw, setDraw] = useState(() => variant.generateMath());
  const [stage, setStage] = useState<Stage>("intro");
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [reward, setReward] = useState<{ badgeJustEarned: boolean; leveledUp: boolean } | null>(null);

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
    const result = await completeMission({
      missionId: mission.id,
      category: mission.category,
      xpEarned: mission.rewardXp,
      badgeId: mission.badgeId,
    }).catch(() => null);
    setReward({ badgeJustEarned: !!result?.badgeJustEarned, leveledUp: !!result?.leveledUp });
  }, [mission]);

  const restart = useCallback(() => {
    const nextVariant = mission.variants[Math.floor(Math.random() * mission.variants.length)];
    setDraw(nextVariant.generateMath());
    setAnswer("");
    setAttempts(0);
    setShowHint(false);
    setReward(null);
    setStage("intro");
    router.refresh();
  }, [mission, router]);

  const badge = mission.badgeId ? BADGES[mission.badgeId] : null;

  return (
    <div className="mx-auto max-w-md px-5 pb-10 pt-4">
      {/* ---- Story Introduction ---- */}
      {stage === "intro" && (
        <div className="rounded-kite bg-white p-5 text-center shadow-card">
          <div className="relative mx-auto h-28 w-28">
            <Image src={PINTAR.intro} alt="Pintar" fill className="object-contain" />
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
            </div>
          )}

          <p className="mt-4 font-display text-base font-bold leading-snug text-ink">
            <Bi text={t(draw.questionText)} lang={lang} />
          </p>

          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={lang === "en" ? "Type your answer..." : "Taip jawapan..."}
            className="mt-4 w-full rounded-kite border-2 border-ink/10 px-4 py-3 font-num text-base focus:border-ungu focus:outline-none"
          />

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
      {stage === "reward" && (
        <div className="relative overflow-hidden rounded-kite bg-gradient-to-b from-pandan to-pandan-dark p-6 text-center text-paper shadow-hero">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
          <div className="relative mx-auto h-28 w-28">
            <Image src={PINTAR.reward} alt="Pintar" fill className="object-contain" />
          </div>
          <p className="relative mt-3 font-display text-xl font-bold">+{mission.rewardXp} XP</p>
          {reward?.leveledUp && (
            <p className="relative mt-1 text-sm font-semibold opacity-95">
              {lang === "en" ? "Level up! 🎉" : "Naik tahap! 🎉"}
            </p>
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
              onClick={() => router.push("/quests")}
              className="flex-1 min-h-[44px] rounded-kite bg-ungu py-3 font-display text-sm font-bold text-white"
            >
              {lang === "en" ? "More missions" : "Lebih misi"} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
