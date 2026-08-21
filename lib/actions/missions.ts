"use server";

import { createClient } from "@/lib/supabase/server";
import { BADGES } from "@/lib/missions/badges";
import { MISSION_CATEGORY_STYLES } from "@/lib/missions/categoryStyle";
import { LEVELS_PER_WORLD } from "@/lib/missions/worldConfig";
import type { MissionMode } from "@/lib/missions/types";

const TOTAL_ADVENTURE_CATEGORIES = Object.keys(MISSION_CATEGORY_STYLES).length;

export interface CompleteMissionInput {
  missionId: string;
  category: string;
  xpEarned: number;
  badgeId?: string;
  /** Which mode this playthrough used — drives Adventure Map obstacle
   * clearing. Optional so any older/direct caller (e.g. a mission opened
   * outside the map flow) still works, just without map progress. */
  mode?: MissionMode;
}

export interface CompleteMissionResult {
  ok: boolean;
  xp?: number;
  level?: number;
  leveledUp?: boolean;
  coinsEarned?: number;
  badgeJustEarned?: boolean;
  /** True the moment this completion clears the LAST obstacle on the
   * Adventure Map for `mode` — MissionPlayer uses this to show the mega
   * reward screen instead of (or alongside) the normal reward screen. */
  adventureCompleted?: boolean;
  /** True the moment this completion clears the LAST level in this
   * category's world (see lib/missions/worldConfig.ts). Distinct from
   * adventureCompleted (the WHOLE map, all 9 worlds) — this fires once
   * per world, adventureCompleted once for the whole journey. */
  worldCompleted?: boolean;
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

  let adventureCompleted = false;
  let worldCompleted = false;
  if (input.mode) {
    // Level layer first: does completing THIS mission clear the last
    // level in its world? Only then does the world itself count as
    // "cleared" on the top-level map (clear_adventure_obstacle) — so a
    // category no longer completes the whole map off a single mission,
    // it takes a full LEVELS_PER_WORLD walk through that world's path.
    const { data: levelDone } = await supabase.rpc("clear_world_level", {
      p_student_id: student.id,
      p_mode: input.mode,
      p_category: input.category,
      p_total_levels: LEVELS_PER_WORLD,
    });
    worldCompleted = !!levelDone;

    if (worldCompleted) {
      const { data: mapDone } = await supabase.rpc("clear_adventure_obstacle", {
        p_student_id: student.id,
        p_mode: input.mode,
        p_category: input.category,
        p_total_categories: TOTAL_ADVENTURE_CATEGORIES,
      });
      adventureCompleted = !!mapDone;

      if (adventureCompleted) {
        const champion = BADGES.adventure_champion;
        const { data: beforeChampion } = await supabase
          .from("student_badges")
          .select("progress")
          .eq("student_id", student.id)
          .eq("badge_id", "adventure_champion")
          .single();
        const championProgressBefore = beforeChampion?.progress ?? 0;
        // Raise target by 1 each clear so a student who replays the map
        // on another mode (or replays the same one again) keeps
        // progressing the badge past 1, instead of
        // record_badge_progress's cap making every clear after the
        // first a no-op.
        const championTarget = Math.max(champion.target, championProgressBefore + 1);
        await supabase.rpc("record_badge_progress", {
          p_student_id: student.id,
          p_badge_id: "adventure_champion",
          p_increment: 1,
          p_target: championTarget,
        });
      }
    }
  }

  return { ok: true, xp, level, leveledUp: level > startingLevel, coinsEarned, badgeJustEarned, adventureCompleted, worldCompleted };
}

export async function restartAdventure(mode: MissionMode): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).single();
  if (!student) return { ok: false };
  await supabase.rpc("restart_adventure_run", { p_student_id: student.id, p_mode: mode });
  return { ok: true };
}

export async function restartWorld(mode: MissionMode, category: string): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).single();
  if (!student) return { ok: false };
  await supabase.rpc("restart_world", { p_student_id: student.id, p_mode: mode, p_category: category });
  return { ok: true };
}
