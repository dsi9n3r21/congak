"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Eraser, Pencil } from "lucide-react";
import { Bi } from "@/lib/i18n/Bi";
import type { Lang } from "@/lib/i18n/dictionary";

export interface WorkingCanvasHandle {
  clear: () => void;
}

/** Free-draw scratchpad for showing working by hand instead of typing it.
 * Built from real parent/teacher feedback (a Year 5 student flagged the
 * typed "show your working" box as awkward to use for actual math
 * working — column addition, long division, etc. don't type out
 * naturally). Purely a scratchpad: nothing here is graded or saved,
 * matching how the typed `workingText` it sits alongside already
 * worked (ephemeral, reset on every new question, never read for
 * grading in any of the 3 places this pattern was duplicated).
 *
 * Pointer Events (not separate touch/mouse handlers) so one code path
 * covers finger, mouse, and stylus input identically. */
export const WorkingCanvas = forwardRef<WorkingCanvasHandle, { lang: Lang; disabled?: boolean }>(function WorkingCanvas(
  { lang, disabled },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasDrawnRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    setHasDrawn(false);
  };

  useImperativeHandle(ref, () => ({ clear: clearCanvas }));

  // Size the canvas's drawing buffer to match its on-screen size at the
  // device's actual pixel ratio — without this, lines look blurry on
  // phone screens and drawing coordinates drift from touch position.
  //
  // Real bug fixed here: setting canvas.width/height ALWAYS wipes its
  // contents, even to an unchanged value — and mobile browsers fire a
  // window `resize` event when the on-screen keyboard opens (the
  // viewport shrinks) even though this canvas's own container size
  // never changed. Net effect: tapping the "final answer" field right
  // below the canvas silently erased anything just drawn. Fixed with
  // two guards: skip the resize entirely when the computed size hasn't
  // actually changed, and snapshot + restore the drawing across any
  // resize that IS real (e.g. rotating the phone), so neither case can
  // lose a student's work.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const newWidth = Math.round(rect.width * dpr);
      const newHeight = Math.round(rect.height * dpr);
      if (canvas.width === newWidth && canvas.height === newHeight) return;

      const snapshot = hasDrawnRef.current ? canvas.toDataURL() : null;
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (snapshot) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
          img.src = snapshot;
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    hasDrawnRef.current = true;
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || disabled) return;
    const ctx = canvasRef.current?.getContext("2d");
    const point = getPoint(e);
    if (ctx && lastPointRef.current) {
      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = tool === "eraser" ? 20 : 2.5;
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setTool("pen")}
            aria-label="Pen"
            className={`flex h-9 w-9 items-center justify-center rounded-kite border-2 ${
              tool === "pen" ? "border-ungu bg-ungu-light" : "border-ink/10"
            }`}
          >
            <Pencil size={16} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            aria-label="Eraser"
            className={`flex h-9 w-9 items-center justify-center rounded-kite border-2 ${
              tool === "eraser" ? "border-ungu bg-ungu-light" : "border-ink/10"
            }`}
          >
            <Eraser size={16} strokeWidth={2.5} />
          </button>
        </div>
        <button type="button" onClick={clearCanvas} className="text-xs font-bold text-ink/50 underline">
          <Bi text={{ ms: "Kosongkan", en: "Clear" }} lang={lang} />
        </button>
      </div>

      <div ref={containerRef} className="relative h-[220px] w-full overflow-hidden rounded-kite border-2 border-dashed border-ink/15 bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="absolute inset-0 h-full w-full touch-none"
          style={{ cursor: disabled ? "default" : "crosshair" }}
        />
        {/* The actual "how do I use this" instruction — a ghost prompt
            INSIDE the empty canvas reads as an obvious invitation to
            write, the way a signature pad's "sign here" line does. A
            caption below the box is easy to skip past; this isn't. It
            disappears the moment a student draws anything. */}
        {!hasDrawn && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="text-sm font-semibold text-ink/25">
              ✏️{" "}
              <Bi
                text={{
                  ms: "Ketik dan tulis di sini dengan jari atau stylus",
                  en: "Tap and write here with your finger or a stylus",
                }}
                lang={lang}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
