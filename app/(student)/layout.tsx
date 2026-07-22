import type { ReactNode } from "react";
import { BottomNav } from "@/components/ui/BottomNav";

// Every route in this group (dashboard, learn, practice, quiz, exam,
// quests, profile, pintar) used to import and render <BottomNav /> itself
// — nine copies of the same line. BottomNav is `fixed bottom-0`, so
// rendering it once here as a sibling after {children} is visually
// identical to rendering it inside each page's own <main>.
export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
