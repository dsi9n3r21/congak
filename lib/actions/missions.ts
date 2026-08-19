"use server";

import { createClient } from "@/lib/supabase/server";
import { BADGES } from "@/lib/missions/badges";

export interface CompleteMissionInput {
  missionId: string;
  category: string;
  xpEarned: number;
  badgeId?: string;
}

export interface CompleteMissionResult {
  ok: boolean;
  xp?: number;
  level?: number;
  leveledUp?: boolean;
  coinsEarned?: number;
  badgeJustEarned?: boolean;
}

export async function completeMission(input: CompleteMissionInput): Promise<CompleteMissionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: student } = await supabase
    .from("students")
    .select("id, xp, level, coins")
    .eq("user_id", user.id)
    .single();
  if (!student) return { ok: false };

  // Coins are a flat bonus alongside XP — half the XP amount, rounded,
  // so bigger/harder missions still pay out more coins without needing
  // a second per-mission config value to keep in sync with rewardXp.
  const coinsEarned = Math.round(input.xpEarned / 2);

  await supabase.from("mission_completions").insert({
    student_id: student.id,
    mission_id: input.missionId,
    category: input.category,
    xp_earned: input.xpEarned,
    coins_earned: coinsEarned,
  });

  // Same level curve as awardXp in lib/actions/practice.ts (level*125) —
  // kept as its own copy here rather than importing/exporting that
  // private helper, since missions award a variable amount per mission
  // rather than practice's fixed +10, and this keeps the mission feature
  // self-contained from the existing practice-session code path.
  let xp = student.xp + input.xpEarned;
  let level = student.level;
  const startingLevel = student.level;
  while (xp >= level * 125) {
    xp -= level * 125;
    level += 1;
  }
  await supabase.from("students").update({ xp, level, coins: student.coins + coinsEarned }).eq("id", student.id);

  let badgeJustEarned = false;
  if (input.badgeId && BADGES[input.badgeId]) {
    const badge = BADGES[input.badgeId];

    const { data: before } = await supabase
      .from("student_badges")
      .select("progress")
      .eq("student_id", student.id)
      .eq("badge_id", input.badgeId)
      .single();
    const progressBefore = before?.progress ?? 0;

    await supabase.rpc("record_badge_progress", {
      p_student_id: student.id,
      p_badge_id: input.badgeId,
      p_increment: 1,
      p_target: badge.target,
    });

    badgeJustEarned = progressBefore < badge.target && progressBefore + 1 >= badge.target;
  }

  return { ok: true, xp, level, leveledUp: level > startingLevel, coinsEarned, badgeJustEarned };
}
