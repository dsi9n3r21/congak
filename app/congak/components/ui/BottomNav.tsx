"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { href: "/dashboard", label: "Rumah", icon: "🏠" },
  { href: "/learn", label: "Belajar", icon: "📖" },
  { href: "/practice", label: "Latihan", icon: "✏️" },
  { href: "/quests", label: "Misi", icon: "🪁" }, // kite = quests/adventure, ties to the wau motif
  { href: "/profile", label: "Saya", icon: "🙂" },
] as const;

// Bottom tab bar: primary nav lives in the thumb zone on mobile, not a top
// header — matches how a 10-12 year old actually holds a phone one-handed.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-kuning-light bg-paper/95 backdrop-blur
                 pb-[env(safe-area-inset-bottom)] md:static md:border-t-0 md:bg-transparent md:pb-0"
      aria-label="Navigasi utama"
    >
      <ul className="flex justify-around md:justify-start md:gap-8 md:px-6">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1 md:flex-none">
              <Link
                href={tab.href}
                className={clsx(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-body min-h-[44px] justify-center",
                  active ? "text-kuning-dark font-semibold" : "text-ink/60"
                )}
              >
                <span
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center text-lg transition-transform",
                    active && "rotate-45 rounded-kite bg-kuning-light"
                  )}
                >
                  <span className={clsx(active && "-rotate-45")}>{tab.icon}</span>
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
