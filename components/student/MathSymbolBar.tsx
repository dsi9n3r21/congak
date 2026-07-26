"use client";

import type { RefObject } from "react";

// Covers what Y4-6 KSSR topics actually use: basic operations, common
// fractions, percent/degree, and the couple that show up in later years
// (√, π). Requested by kids at the spring cleaning event for Pintar's
// chat input, then extended to Latihan and Exam's fill-in-the-blank
// answer inputs too, since those need the same symbols just as often.
const MATH_SYMBOLS = ["+", "−", "×", "÷", "=", "½", "⅓", "¼", "¾", "%", "°", "√", "π"];

type SymbolTargetElement = HTMLInputElement | HTMLTextAreaElement;

export function MathSymbolBar({
  inputRef,
  value,
  onChange,
  disabled,
}: {
  inputRef: RefObject<SymbolTargetElement>;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  function insertSymbol(symbol: string) {
    if (disabled) return;
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + symbol + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1.5">
      {MATH_SYMBOLS.map((sym) => (
        <button
          key={sym}
          type="button"
          disabled={disabled}
          onClick={() => insertSymbol(sym)}
          className="min-w-[48px] shrink-0 rounded-kite border border-ink/10 bg-paper px-3 py-2.5 font-num text-lg font-semibold text-ink transition-transform active:scale-[0.95] active:bg-ungu-light disabled:opacity-40"
        >
          {sym}
        </button>
      ))}
    </div>
  );
}
