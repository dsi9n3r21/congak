import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { LanguageSelector } from "@/components/student/LanguageSelector";
import { AccessibilityToggles } from "@/components/student/AccessibilityToggles";
import { SupportFooter } from "@/components/shared/SupportFooter";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from("students")
    .select("display_name, year_level, avatar_id, theme, link_code, language_pref, a11y_large_text, a11y_dyslexia_font, a11y_low_distraction")
    .eq("user_id", user?.id ?? "")
    .single();

  const lang = student?.language_pref ?? "both";

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      {/* Gradient hero, matching the dashboard's header treatment — same
          decorative blob + rounded avatar badge language as the level
          card there, so this page doesn't feel like a different app. */}
      <header className="relative overflow-hidden px-5 pt-6 pb-8">
        <div className="decorative absolute right-3 -top-4 h-28 w-28 rounded-full bg-kuning-light/60" />
        <div className="relative z-10 overflow-hidden rounded-kite bg-gradient-to-b from-biru to-biru-dark px-5 py-6 shadow-hero">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
          <div className="relative flex flex-col items-center text-center text-paper">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kuning text-3xl">
              {student?.avatar_id ?? "🙂"}
            </div>
            <h1 className="mt-3 font-display text-xl font-bold">{student?.display_name}</h1>
            <p className="mt-0.5 text-xs opacity-80">
              {lang === "en" ? "Year" : "Tahun"} {student?.year_level} · {user?.email}
            </p>
          </div>
        </div>
      </header>

      {student?.link_code && (
        <section className="mx-5 mt-2 rounded-kite border-2 border-dashed border-biru-light bg-biru-light/30 px-5 py-4 text-center shadow-card">
          <p className="text-xs text-ink/60"><Bi text={UI.linkCode} lang={lang} /></p>
          <p className="mt-1 font-num text-xl font-bold tracking-widest text-biru-dark">{student.link_code}</p>
        </section>
      )}

      <section className="mx-5 mt-5 rounded-kite bg-white px-5 py-4 shadow-card">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          <Bi text={UI.language} lang={lang} />
        </p>
        <LanguageSelector current={lang} />
      </section>

      {/* Accessibility toggles — wired to the a11y-* body classes in
          globals.css. Kept as a simple static list for now; persisting
          the choice per-student is a fast-follow. */}
      <section className="mx-5 mt-4 rounded-kite bg-white px-5 py-4 shadow-card">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          <Bi text={UI.accessibility} lang={lang} />
        </p>
        <AccessibilityToggles
          lang={lang}
          initial={{
            a11y_large_text: student?.a11y_large_text ?? false,
            a11y_dyslexia_font: student?.a11y_dyslexia_font ?? false,
            a11y_low_distraction: student?.a11y_low_distraction ?? false,
          }}
        />
      </section>

      <section className="mx-5 mt-5">
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-kite border-2 border-saga-light py-3 font-display font-bold text-saga min-h-[44px]"
          >
            <Bi text={UI.logout} lang={lang} />
          </button>
        </form>
      </section>

      {/* Same reasoning as the parent dashboard: a "support us
          financially / email us feedback" ask belongs somewhere an
          adult might land, not the core mission/learning flow a child
          is actually using. Profile/settings is the one student-side
          screen that fits — a parent checking language or account
          settings alongside their kid will see it, without it
          interrupting anything a child is doing mid-lesson. Added after
          Lynda pointed out some parents never create a separate parent
          account at all and only ever use the student login. */}
      <SupportFooter lang={lang} />
    </main>
  );
}
