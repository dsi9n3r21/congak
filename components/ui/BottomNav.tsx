"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, BookOpen, PencilLine, Compass, MessageCircle, User } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Rumah", Icon: Home },
  { href: "/learn", label: "Belajar", Icon: BookOpen },
  { href: "/practice", label: "Latihan", Icon: PencilLine },
  { href: "/quests", label: "Misi", Icon: Compass },
  { href: "/pintar", label: "Pintar", Icon: MessageCircle },
  { href: "/profile", label: "Saya", Icon: User },
] as const;

// Bottom tab bar: primary nav lives in the thumb zone on mobile, not a top
// header — matches how a 10-12 year old actually holds a phone one-handed.
// Active icon gets a filled rounded-square backdrop + shadow (a "chunky
// sticker" look) rather than just a color tint, per Lynda's request to
// make icons feel more 3D and prominent for kids.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/5 bg-paper/95 backdrop-blur
                 pb-[env(safe-area-inset-bottom)] md:static md:border-t-0 md:bg-transparent md:pb-0"
      aria-label="Navigasi utama"
    >
      <ul className="flex justify-around md:justify-start md:gap-8 md:px-6">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-2 text-[11px] font-body min-h-[44px] justify-center"
              >
                <span
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    active ? "bg-ungu shadow-card" : ""
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? "text-paper" : "text-ink/50"} />
                </span>
                <span className={active ? "font-semibold text-ungu" : "text-ink/50"}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
