"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, BookOpen, Compass, User } from "lucide-react";

// Latihan (practice) no longer gets its own tab — every topic in Belajar
// already links straight into its practice set (see
// app/(student)/learn/[topicId]/page.tsx), so the standalone tab was a
// redundant hop. Pintar moves into the vacated middle slot and gets Congak's
// mascot face instead of a generic chat-bubble icon, per Lynda's request.
const TABS = [
  { href: "/dashboard", label: "Rumah", Icon: Home },
  { href: "/learn", label: "Belajar", Icon: BookOpen },
  { href: "/pintar", label: "Pintar", Icon: null },
  { href: "/quests", label: "Misi", Icon: Compass },
  { href: "/profile", label: "Saya", Icon: User },
] as const;

// Bottom tab bar: primary nav lives in the thumb zone on mobile, not a top
// header — matches how a 10-12 year old actually holds a phone one-handed.
// Active icon gets a filled rounded-square backdrop + shadow (a "chunky
// sticker" look) rather than just a color tint, per Lynda's request to
// make icons feel more 3D and prominent for kids. Pintar, in the middle,
// is raised above the bar as a circular mascot-face button — a distinct
// treatment from the other four tabs so it reads as "talk to a friend",
// not just another menu item.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/5 bg-paper/95 backdrop-blur
                 pb-[env(safe-area-inset-bottom)] md:static md:border-t-0 md:bg-transparent md:pb-0"
      aria-label="Navigasi utama"
    >
      <ul className="flex items-end justify-around md:justify-start md:gap-8 md:px-6">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);

          if (!Icon) {
            // Pintar — raised circular mascot button.
            return (
              <li key={href} className="flex-1 md:flex-none">
                <Link
                  href={href}
                  className="flex flex-col items-center gap-1 py-1 text-[11px] font-body min-h-[44px] justify-end"
                >
                  <span
                    className={clsx(
                      "-mt-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-paper bg-gradient-to-br from-ungu to-ungu-dark shadow-hero transition-transform",
                      active && "scale-105 ring-2 ring-ungu"
                    )}
                  >
                    <Image
                      src="/pintar/idle.png"
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full scale-125 object-cover object-top"
                    />
                  </span>
                  <span className={active ? "font-semibold text-ungu" : "text-ink/50"}>{label}</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-2 text-[11px] font-body min-h-[44px] justify-center"
              >
                <span
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    active ? "bg-gradient-to-br from-ungu to-ungu-dark shadow-card" : ""
                  )}
                >
                  <Icon size={23} strokeWidth={active ? 2.5 : 2} className={active ? "text-paper" : "text-ink/50"} />
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
