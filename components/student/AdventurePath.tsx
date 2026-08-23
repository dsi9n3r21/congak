"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bi } from "@/lib/i18n/Bi";
import type { Bilingual, Lang } from "@/lib/i18n/dictionary";
import type { PathPoint } from "@/lib/missions/worldPathPoints";

// Node diameter: the original top-level map's nodes read ~60px on
// screen; +20% per the brief that started this component.
const NODE_SIZE = 72;
// Explicit safe-area asks from the brief: 120px clearance above the
// bottom nav, plus the nav's own height (~64px bar + iOS home-indicator
// safe-area-inset, roughly another 24px on notched phones) so level 1
// is never actually touching the tab bar. Applied as bottom padding on
// the OUTER scroll container (below the image), not baked into the
// image-aspect box itself.
const BOTTOM_SAFE_PADDING = 120 + 88;

export interface AdventureLevel {
  index: number; // 1-based
  state: "cleared" | "current" | "locked";
}

export function AdventurePath({
  totalLevels,
  clearedCount,
  worldImage,
  imageAspect,
  pathPoints,
  levelLabels,
  lang,
  levelHref,
  onLevelPress,
}: {
  totalLevels: number;
  clearedCount: number;
  worldImage: string;
  /** width / height of `worldImage`'s native pixels — the image renders
   * at exactly this ratio (no crop, no stretch) so `pathPoints`
   * (percentages of the image) land exactly where they were traced. */
  imageAspect: number;
  /** Hand-traced points (percent of image width/height), bottom-to-top,
   * one per level. Falls back to a generic centered zig-zag if omitted
   * or the wrong length — kept as a fallback, not the primary path, so
   * a future world/mode without traced points yet still renders
   * sensibly instead of crashing. */
  pathPoints?: PathPoint[];
  /** One label per level, shown as a small pill beside its node — e.g.
   * the mission title that level currently shows. Optional; omit to
   * render nodes with no labels. */
  levelLabels?: Bilingual[];
  lang?: Lang;
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

  const points: PathPoint[] =
    pathPoints && pathPoints.length === totalLevels
      ? pathPoints
      : Array.from({ length: totalLevels }, (_, i) => ({
          x: 50 + (i % 2 === 0 ? 22 : -22),
          y: 6 + ((totalLevels - 1 - i) / Math.max(1, totalLevels - 1)) * 88,
        }));

  // ---- Camera: auto-focus the current (next playable) level on mount,
  // instead of opening at the top of a long path — the whole point of
  // this component. Runs after layout so scrollIntoView has real
  // dimensions to work with; "auto" (not "smooth") so it doesn't
  // visibly scroll-race the fade-in on slower phones.
  useEffect(() => {
    const t = setTimeout(() => {
      currentNodeRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  // ---- Parallax: a couple of decorative layers drift at a fraction of
  // scroll speed, inside the same image-aspect box as the backdrop and
  // nodes. rAF-throttled so it stays smooth on a mid-range phone.
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

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative max-h-[75vh] w-full overflow-y-auto overscroll-contain rounded-kite shadow-card"
      style={{ WebkitOverflowScrolling: "touch", paddingBottom: BOTTOM_SAFE_PADDING }}
    >
      {/* Image-aspect box: renders the backdrop at its TRUE native ratio
          (no object-cover crop, no stretch to an arbitrary height) so
          the hand-traced percentage points in `pathPoints` land exactly
          on the path drawn in the artwork. */}
      <div className="relative w-full" style={{ aspectRatio: imageAspect }}>
        <Image src={worldImage} alt="" fill className="object-contain" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />

        {/* Parallax leaf accents near a couple of the path points */}
        <div
          className="pointer-events-none absolute inset-0 text-2xl opacity-70"
          style={{ transform: `translateY(${-parallaxY * 0.08}px)` }}
        >
          {points
            .filter((_, i) => i % 2 === 0)
            .map((p, i) => (
              <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${Math.max(2, p.y - 6)}%` }}>
                🌿
              </span>
            ))}
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {levels.slice(0, -1).map((lvl, i) => {
            const next = levels[i + 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const segmentDone = next.state !== "locked";
            return (
              <line
                key={`seg-${lvl.index}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                vectorEffect="non-scaling-stroke"
                stroke={segmentDone ? "#ffd94a" : "white"}
                strokeWidth={segmentDone ? 8 : 6}
                strokeLinecap="round"
                strokeDasharray={segmentDone ? undefined : "3 10"}
                opacity={segmentDone ? 1 : 0.6}
                style={segmentDone ? { filter: "drop-shadow(0 0 4px #ffd94a)" } : undefined}
              />
            );
          })}
        </svg>

        {levels.map((lvl, i) => {
          const p = points[i];
          const isCurrent = lvl.state === "current";
          const isCleared = lvl.state === "cleared";
          const label = levelLabels?.[i];
          // Labels sit on whichever side of the node has more room —
          // opposite the direction the node leans on the zig-zag, so a
          // label near the right edge of the image doesn't get clipped.
          const labelOnRight = p.x < 50;
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
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${p.y}%`, left: `${p.x}%`, opacity: lvl.state === "locked" ? 0.55 : 1 }}
            >
              <div className="relative flex items-center" style={{ flexDirection: labelOnRight ? "row" : "row-reverse" }}>
                {isCurrent ? (
                  <Link href={levelHref} onClick={() => onLevelPress?.(lvl.index)} aria-label={`Level ${lvl.index}`}>
                    {node}
                  </Link>
                ) : (
                  <div aria-label={`Level ${lvl.index}`} aria-disabled={lvl.state === "locked"}>
                    {node}
                  </div>
                )}
                {label && lang && (
                  <span
                    className={`whitespace-nowrap rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-ink shadow-card ${
                      labelOnRight ? "ml-1.5" : "mr-1.5"
                    }`}
                  >
                    <Bi text={label} lang={lang} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
