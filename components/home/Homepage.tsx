import Link from "next/link";
import Image from "next/image";
import {
  Lightbulb,
  Target,
  Trophy,
  Flame,
  Zap,
  Award,
  TrendingUp,
  BarChart3,
  Search,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Bi } from "@/lib/i18n/Bi";
import { HOME } from "@/lib/content/homepageCopy";

// No student/parent session exists yet on this page, so there's no
// language_pref to read — 'both' is the same safe default the parent
// dashboard uses for the same reason, and it doubles as a quiet signal
// to parents that the whole app is genuinely bilingual (DLP-friendly),
// not just an English site with a translated menu.
const lang = "both" as const;

const VALUE_ICONS = [Lightbulb, Target, Trophy];
const GAMIFICATION_ICONS = [Flame, Zap, Award, TrendingUp];
const GAMIFICATION_COLORS = ["bg-saga-light text-saga-dark", "bg-kuning-light text-kuning-dark", "bg-ungu-light text-ungu-dark", "bg-pandan-light text-pandan-dark"];
const PARENT_ICONS = [BarChart3, Search, BookOpen, ClipboardCheck];

export function Homepage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* ---- Nav ---- */}
      <header className="flex items-center justify-between px-5 py-4">
        <span className="font-display text-xl font-bold text-ink">Congak 🪁</span>
        <Link
          href="/auth/login"
          className="rounded-kite border-2 border-ink/10 px-4 py-2 text-sm font-bold text-ink min-h-[44px] flex items-center"
        >
          <Bi text={HOME.nav.login} lang={lang} />
        </Link>
      </header>

      {/* ---- Hero ---- */}
      <section className="mx-5 mt-2 overflow-hidden rounded-kite bg-gradient-to-b from-ungu-light/60 to-transparent px-5 pb-8 pt-10 text-center">
        <h1 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          <Bi text={HOME.hero.headline} lang={lang} />
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-ink/70">
          <Bi text={HOME.hero.subheadline} lang={lang} />
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/auth/signup"
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-kite bg-kuning py-3.5 font-display text-base font-bold text-white shadow-hero min-h-[44px]"
          >
            <Bi text={HOME.hero.ctaPrimary} lang={lang} />
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
          <a
            href="#how-it-works"
            className="text-sm font-semibold text-ink/60 underline decoration-ink/20 underline-offset-4"
          >
            <Bi text={HOME.hero.ctaSecondary} lang={lang} />
          </a>
        </div>

        {/* Mascot + floating progress chips — communicates "learning +
            coaching + progress", not "worksheet + exam", per the brief. */}
        <div className="relative mx-auto mt-8 h-52 w-52">
          <Image src="/pintar/idle.png" alt="Pintar" width={222} height={249} className="mx-auto h-full w-auto drop-shadow-lg" priority />
          <span className="absolute -left-2 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-saga-dark shadow-card">
            <Flame size={14} strokeWidth={2.5} className="text-saga" />
            <Bi text={HOME.hero.chipStreak} lang="en" />
          </span>
          <span className="absolute -right-3 top-16 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ungu-dark shadow-card">
            <Zap size={14} strokeWidth={2.5} className="text-ungu" />
            <Bi text={HOME.hero.chipXp} lang="en" />
          </span>
        </div>
      </section>

      {/* ---- Trust ---- */}
      <section className="mx-5 mt-10">
        <h2 className="text-center font-display text-xl font-bold text-ink">
          <Bi text={HOME.trust.headline} lang={lang} />
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {HOME.trust.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-kite bg-white px-3 py-3 shadow-card">
              <CheckCircle2 size={18} strokeWidth={2.5} className="shrink-0 text-pandan" />
              <span className="text-sm font-semibold text-ink">
                <Bi text={item} lang={lang} />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Value propositions ---- */}
      <section className="mx-5 mt-12">
        <h2 className="text-center font-display text-xl font-bold text-ink">
          <Bi text={HOME.valueProps.headline} lang={lang} />
        </h2>
        <div className="mt-5 space-y-3">
          {HOME.valueProps.cards.map((card, i) => {
            const Icon = VALUE_ICONS[i];
            return (
              <div key={i} className="flex items-start gap-4 rounded-kite bg-white p-4 shadow-card">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-kite bg-biru-light">
                  <Icon size={24} strokeWidth={2.25} className="text-biru-dark" />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-ink">
                    <Bi text={card.title} lang={lang} />
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    <Bi text={card.description} lang={lang} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Meet Pintar AI ---- */}
      <section className="mx-5 mt-12 overflow-hidden rounded-kite bg-ungu-light/50 p-5">
        <div className="flex items-center gap-4">
          <Image src="/pintar/showing.png" alt="Pintar AI" width={230} height={238} className="h-24 w-auto shrink-0" />
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              <Bi text={HOME.pintar.headline} lang={lang} />
            </h2>
            <p className="text-sm font-semibold text-ungu-dark">
              <Bi text={HOME.pintar.tagline} lang={lang} />
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink/70">
          <Bi text={HOME.pintar.body} lang={lang} />
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HOME.pintar.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles size={16} strokeWidth={2.5} className="shrink-0 text-ungu" />
              <Bi text={f} lang={lang} />
            </div>
          ))}
        </div>

        {/* Small chat mockup — shows the coaching value concretely rather
            than just listing feature bullets. */}
        <div className="mt-5 rounded-kite bg-white p-4 shadow-card">
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-kite rounded-tr-sm bg-ink/5 px-3 py-2 text-sm text-ink">
              <Bi text={HOME.pintar.chatExample.studentLine} lang={lang} />
            </p>
          </div>
          <div className="mt-2 flex items-end gap-2">
            <Image src="/pintar/idle.png" alt="" width={222} height={249} className="h-8 w-auto shrink-0" />
            <p className="max-w-[80%] rounded-kite rounded-tl-sm bg-ungu-light px-3 py-2 text-sm text-ink">
              <Bi text={HOME.pintar.chatExample.pintarLine} lang={lang} />
            </p>
          </div>
        </div>
      </section>

      {/* ---- Gamification ---- */}
      <section className="mx-5 mt-12">
        <h2 className="text-center font-display text-xl font-bold text-ink">
          <Bi text={HOME.gamification.headline} lang={lang} />
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {HOME.gamification.cards.map((card, i) => {
            const Icon = GAMIFICATION_ICONS[i];
            return (
              <div key={i} className="rounded-kite bg-white p-4 shadow-card">
                <span className={`flex h-10 w-10 items-center justify-center rounded-kite ${GAMIFICATION_COLORS[i]}`}>
                  <Icon size={20} strokeWidth={2.5} />
                </span>
                <p className="mt-2 font-display text-sm font-bold text-ink">
                  <Bi text={card.title} lang={lang} />
                </p>
                <p className="mt-1 text-xs text-ink/60">
                  <Bi text={card.description} lang={lang} />
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center">
          <Image src="/pintar/reward.png" alt="" width={235} height={289} className="h-28 w-auto" />
        </div>
      </section>

      {/* ---- Parent dashboard ---- */}
      <section className="mx-5 mt-12">
        <h2 className="text-center font-display text-xl font-bold text-ink">
          <Bi text={HOME.parentDashboard.headline} lang={lang} />
        </h2>
        <p className="mt-1 text-center text-sm text-ink/60">
          <Bi text={HOME.parentDashboard.subheadline} lang={lang} />
        </p>

        {/* Small representative preview, built from the same visual
            language as the real parent dashboard (mastery bar, weak-topic
            chip) rather than a generic mockup. */}
        <div className="mt-5 rounded-kite bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold text-ink">
              <Bi text={HOME.parentDashboard.previewChild} lang="en" />
            </p>
            <span className="rounded-full bg-saga-light px-2 py-1 text-[10px] font-semibold text-saga-dark">
              <Bi text={HOME.parentDashboard.previewWeak} lang={lang} />
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {[78, 45, 62].map((pct, i) => (
              <div key={i} className="h-1.5 w-full rounded-full bg-ink/10">
                <div className={`h-1.5 rounded-full ${pct < 50 ? "bg-saga" : "bg-pandan"}`} style={{ width: `${pct}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {HOME.parentDashboard.features.map((f, i) => {
            const Icon = PARENT_ICONS[i];
            return (
              <div key={i} className="flex items-start gap-3 rounded-kite bg-white p-3 shadow-card">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-kite bg-biru-light">
                  <Icon size={18} strokeWidth={2.5} className="text-biru-dark" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">
                    <Bi text={f.title} lang={lang} />
                  </p>
                  <p className="text-xs text-ink/60">
                    <Bi text={f.description} lang={lang} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how-it-works" className="mx-5 mt-12 scroll-mt-6">
        <h2 className="text-center font-display text-xl font-bold text-ink">
          <Bi text={HOME.howItWorks.headline} lang={lang} />
        </h2>
        <div className="relative mt-6 space-y-6 pl-4">
          <div className="benang-trail absolute bottom-4 left-[15px] top-4" />
          {HOME.howItWorks.steps.map((step, i) => (
            <div key={i} className="relative flex items-start gap-4">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kuning font-num text-sm font-bold text-white shadow-card">
                {i + 1}
              </span>
              <div className="pt-0.5">
                <p className="font-display text-base font-bold text-ink">
                  <Bi text={step.title} lang={lang} />
                </p>
                <p className="mt-0.5 text-sm text-ink/60">
                  <Bi text={step.description} lang={lang} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- By the numbers ---- */}
      <section className="mx-5 mt-12 rounded-kite bg-ink px-5 py-8 text-center">
        <h2 className="font-display text-lg font-bold text-white/90">
          <Bi text={HOME.byTheNumbers.headline} lang={lang} />
        </h2>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {HOME.byTheNumbers.stats.map((stat, i) => (
            <div key={i}>
              <p className="font-num text-2xl font-extrabold text-kuning sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-[11px] font-semibold leading-tight text-white/70">
                <Bi text={stat.label} lang={lang} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="mx-5 mt-12 mb-10 rounded-kite bg-gradient-to-b from-ungu-light/60 to-transparent px-5 py-10 text-center">
        <h2 className="font-display text-2xl font-extrabold leading-tight text-ink">
          <Bi text={HOME.finalCta.headline} lang={lang} />
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          <Bi text={HOME.finalCta.subheadline} lang={lang} />
        </p>
        <Link
          href="/auth/signup"
          className="mx-auto mt-5 flex w-full max-w-xs items-center justify-center gap-2 rounded-kite bg-kuning py-3.5 font-display text-base font-bold text-white shadow-hero min-h-[44px]"
        >
          <Bi text={HOME.finalCta.cta} lang={lang} />
          <ArrowRight size={18} strokeWidth={2.5} />
        </Link>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-ink/10 px-5 py-8 text-center">
        <span className="font-display text-lg font-bold text-ink">Congak 🪁</span>
        <p className="mx-auto mt-1 max-w-xs text-xs text-ink/50">
          <Bi text={HOME.footer.tagline} lang={lang} />
        </p>
        <div className="mt-4 flex justify-center gap-4 text-xs font-semibold text-ink/60">
          <Link href="/auth/login" className="underline underline-offset-2">
            <Bi text={HOME.footer.login} lang={lang} />
          </Link>
          <Link href="/auth/signup" className="underline underline-offset-2">
            <Bi text={HOME.footer.signup} lang={lang} />
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-ink/30">© {new Date().getFullYear()} Congak</p>
      </footer>
    </main>
  );
}
