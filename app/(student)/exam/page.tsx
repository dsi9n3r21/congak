import { ExamFlow } from "@/components/student/ExamFlow";
import { BottomNav } from "@/components/ui/BottomNav";

export default function ExamPage() {
  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-saga">Mod Peperiksaan</p>
        <h1 className="font-display text-xl font-bold text-ink">Peperiksaan Bertempoh</h1>
      </header>

      <section className="mx-5">
        <ExamFlow />
      </section>

      <BottomNav />
    </main>
  );
}
