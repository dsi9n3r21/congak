"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Lang } from "@/lib/i18n/dictionary";

// Vertical distance between level nodes, and how far alternating nodes
// zig-zag left/right — hand-tuned so the path reads as a winding trail
// on a ~380-430px wide phone viewport, not a straight ladder.
const LEVEL_SPACING = 132;
const ZIGZAG_X = 22; // percentage points either side of center
// Node diameter: the previous map's nodes read ~60px on screen; +20%
// per the brief.
const NODE_SIZE = 72;
// Explicit safe-area asks from the brief: 120px clearance above the
// bottom nav, plus the nav's own height (~64px bar + iOS home-indicator
// safe-area-inset, roughly another 24px on notched phones) so level 1
// is never actually touching the tab bar.
const BOTTOM_SAFE_PADDING = 120 + 88;
const TOP_SAFE_PADDING = 32;

export interface AdventureLevel {
  index: number; // 1-based
  state: "cleared" | "current" | "locked";
}

export function AdventurePath({
  totalLevels,
  clearedCount,
  worldImage,
  levelHref,
  onLevelPress,
}: {
  totalLevels: number;
  clearedCount: number;
  worldImage: string;
  /** href for the CURRENT (next playable) level only — locked/cleared
   * nodes render as plain non-navigating markers in this v1 (replaying a
   * cleared level happens via the world page's own restart flow, not by
   * tapping an old node — see HANDOVER note). */
  levelHref: string;
  onLevelPress?: (level: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  const containerHeight = totalLevels * LEVEL_SPACING + TOP_SAFE_PADDING + BOTTOM_SAFE_PADDING;

  // ---- Camera: auto-focus the current (next playable) level on mount,
  // instead of opening at the top of a long path — the whole point of
  // this rebuild per the brief. Runs after layout so scrollIntoView has
  // real dimensions to work with; "auto" (not "smooth") so it doesn't
  // visibly scroll-race the fade-in on slower phones.
  useEffect(() => {
    const t = setTimeout(() => {
      currentNodeRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  // ---- Parallax: background layers drift at a fraction of scroll
  // speed. Listens on the SCROLL CONTAINER (this component owns its own
  // overflow-y-auto region rather than relying on window/page scroll) —
  // rAF-throttled so it stays smooth on a mid-range phone.
  const ticking = useRef(false);
  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      setParallaxY(scrollRef.current?.scrollTop ?? 0);
      ticking.current = false;
    });
  }, []);

  const levels: AdventureLevel[] = Array.from({ length: totalLevels }, (_, i) => {
    const levelNumber = i + 1;
    const state: AdventureLevel["state"] =
      levelNumber <= clearedCount ? "cleared" : levelNumber === clearedCount + 1 ? "current" : "locked";
    return { index: levelNumber, state };
  });

  // Node `top`, counting from the BOTTOM of the tall container upward —
  // level 1 is lowest (large `top`), level `totalLevels` is highest
  // (small `top`, just below TOP_SAFE_PADDING) — per "path starts at
  // the bottom".
  const topFor = (levelIndex: number) => TOP_SAFE_PADDING + (totalLevels - levelIndex) * LEVEL_SPACING;
  const leftPctFor = (levelIndex: number) => 50 + (levelIndex % 2 === 0 ? ZIGZAG_X : -ZIGZAG_X);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative h-[70vh] min-h-[420px] w-full overflow-y-auto overscroll-contain rounded-kite shadow-card"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Backdrop image, sized to the full scrollable height so it
          doesn't tile/repeat. */}
      <div className="absolute inset-x-0 top-0" style={{ height: containerHeight }}>
        <Image src={worldImage} alt="" fill className="object-cover object-top" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      </div>

      {/* Parallax layer 1 (far, slow): clouds */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 text-4xl opacity-70"
        style={{ height: containerHeight, transform: `translateY(${-parallaxY * 0.15}px)` }}
      >
        {Array.from({ length: Math.ceil(totalLevels / 2) }, (_, i) => (
          <span key={i} className="absolute" style={{ left: `${(i % 2 === 0 ? 12 : 68) + (i % 3) * 4}%`, top: i * LEVEL_SPACING * 2 + 40 }}>
            ☁️
          </span>
        ))}
      </div>

      {/* Parallax layer 2 (near, faster): leafy decoration */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 text-2xl opacity-80"
        style={{ height: containerHeight, transform: `translateY(${-parallaxY * 0.35}px)` }}
      >
        {Array.from({ length: totalLevels }, (_, i) => (
          <span key={i} className="absolute" style={{ left: `${(i % 2 === 0 ? 82 : 6) + (i % 2) * 4}%`, top: i * LEVEL_SPACING + 90 }}>
            🌿
          </span>
        ))}
      </div>

      {/* Path + nodes */}
      <div className="relative" style={{ height: containerHeight }}>
        <svg className="absolute inset-0 h-full w-full">
          {levels.slice(0, -1).map((lvl) => {
            const next = levels[lvl.index]; // levels[lvl.index] === level (lvl.index+1), since 0-based array
            const y1 = topFor(lvl.index) + NODE_SIZE / 2;
            const y2 = topFor(next.index) + NODE_SIZE / 2;
            const x1 = leftPctFor(lvl.index);
            const x2 = leftPctFor(next.index);
            const segmentDone = next.state !== "locked";
            return (
              <line
                key={`seg-${lvl.index}`}
                x1={`${x1}%`}
                y1={y1}
                x2={`${x2}%`}
                y2={y2}
                stroke={segmentDone ? "#ffd94a" : "white"}
                strokeWidth={segmentDone ? 8 : 6}
                strokeLinecap="round"
                strokeDasharray={segmentDone ? undefined : "3 12"}
                opacity={segmentDone ? 1 : 0.5}
                style={segmentDone ? { filter: "drop-shadow(0 0 6px #ffd94a)" } : undefined}
              />
            );
          })}
        </svg>

        {levels.map((lvl) => {
          const isCurrent = lvl.state === "current";
          const isCleared = lvl.state === "cleared";
          const node = (
            <div
              className={`relative flex items-center justify-center rounded-full border-4 border-white font-display font-bold text-white shadow-hero ${
                isCleared ? "bg-pandan" : isCurrent ? "bg-kuning" : "bg-slate-400/70"
              } ${isCurrent ? "animate-pulse" : ""}`}
              style={{
                width: NODE_SIZE,
                height: NODE_SIZE,
                fontSize: 22,
                filter: isCleared ? "drop-shadow(0 0 8px #6fcf97)" : undefined,
              }}
            >
              {isCurrent && (
                <span className="absolute inset-0 -m-2 rounded-full bg-kuning/40 animate-ping" style={{ animationDuration: "2s" }} />
              )}
              <span className="relative">{isCleared ? "✓" : lvl.index}</span>
            </div>
          );
          return (
            <div
              key={lvl.index}
              ref={isCurrent ? currentNodeRef : undefined}
              className="absolute -translate-x-1/2"
              style={{ top: topFor(lvl.index), left: `${leftPctFor(lvl.index)}%`, opacity: lvl.state === "locked" ? 0.5 : 1 }}
            >
              {isCurrent ? (
                <Link href={levelHref} onClick={() => onLevelPress?.(lvl.index)} aria-label={`Level ${lvl.index}`}>
                  {node}
                </Link>
              ) : (
                <div aria-label={`Level ${lvl.index}`} aria-disabled={lvl.state === "locked"}>
                  {node}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
