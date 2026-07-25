import { ExamFlow } from "@/components/student/ExamFlow";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";
import { createClient } from "@/lib/supabase/server";

export default async function ExamPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: student } = await supabase
    .from("students")
    .select("language_pref")
    .eq("user_id", user?.id ?? "")
    .single();
  const lang = student?.language_pref ?? "both";

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="relative overflow-hidden px-5 pt-6 pb-4">
        <div className="absolute right-3 -top-4 h-24 w-24 rounded-full bg-saga-light/50" />
        <div className="relative z-10 max-w-[75%]">
          <p className="text-xs font-semibold uppercase tracking-wide text-saga">
            <Bi text={UI.examMode} lang={lang} />
          </p>
          <h1 className="font-display text-xl font-bold text-ink">
            <Bi text={UI.examTimed} lang={lang} />
          </h1>
        </div>
      </header>

      <section className="mx-5">
        <ExamFlow lang={lang} />
      </section>

    </main>
  );
}
