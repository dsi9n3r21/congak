import Link from "next/link";
import Image from "next/image";
import { Coffee, Heart } from "lucide-react";
import { Bi } from "@/lib/i18n/Bi";
import { COFFEE } from "@/lib/content/coffeeCopy";

// No student/parent session on this page — it's public, reachable
// without logging in, same reasoning app/page.tsx's Homepage uses for
// defaulting to "both".
const lang = "both" as const;

export const metadata = {
  title: "Buy Congak a Coffee ☕",
  description: "Congak is free for every student. If it's helped your child, you're welcome to treat us to a coffee.",
};

export default function CoffeePage() {
  return (
    <main className="min-h-screen bg-paper pb-16">
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-xl font-bold text-ink">
          Congak 🪁
        </Link>
      </header>

      {/* ---- Hero ---- */}
      <section className="mx-5 mt-2 overflow-hidden rounded-kite bg-gradient-to-b from-kuning-light/60 to-transparent px-5 pb-8 pt-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-kuning-dark shadow-card">
          <Coffee size={14} strokeWidth={2.5} />
          <Bi text={COFFEE.eyebrow} lang={lang} />
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          <Bi text={COFFEE.headline} lang={lang} />
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base font-semibold text-ink/70">
          <Bi text={COFFEE.subheadline} lang={lang} />
        </p>

        <div className="relative mx-auto mt-6 h-36 w-36">
          <Image src="/pintar/reward.png" alt="Pintar" fill className="object-contain drop-shadow-lg" priority />
        </div>
      </section>

      {/* ---- The story ---- */}
      <section className="mx-5 mt-6 flex flex-col gap-4 rounded-kite bg-white p-5 shadow-card">
        {COFFEE.storyParagraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-ink/80">
            <Bi text={p} lang={lang} />
          </p>
        ))}
      </section>

      {/* ---- The QR ---- */}
      <section className="mx-5 mt-6 rounded-kite bg-white p-5 text-center shadow-card">
        <div className="relative mx-auto aspect-[1031/1595] w-full max-w-[280px] overflow-hidden rounded-kite shadow-hero">
          <Image src="/support/tng-qr.webp" alt="Touch 'n Go eWallet QR code" fill className="object-contain" />
        </div>
        <p className="mt-3 text-xs font-semibold text-ink/50">
          <Bi text={COFFEE.qrCaption} lang={lang} />
        </p>
      </section>

      {/* ---- Reassurance: this is optional ---- */}
      <section className="mx-5 mt-6 flex items-start gap-3 rounded-kite bg-pandan-light/50 p-4">
        <Heart size={20} strokeWidth={2.5} className="mt-0.5 shrink-0 text-pandan-dark" />
        <p className="text-sm leading-relaxed text-ink/80">
          <Bi text={COFFEE.reassurance} lang={lang} />
        </p>
      </section>

      {/* ---- Feedback ---- */}
      <section className="mx-5 mt-6 rounded-kite bg-biru-light/40 p-4 text-center">
        <h2 className="font-display text-base font-bold text-ink">
          <Bi text={COFFEE.feedbackHeadline} lang={lang} />
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink/70">
          <Bi text={COFFEE.feedbackBody} lang={lang} />
        </p>
        <a href={`mailto:${COFFEE.feedbackEmail}`} className="mt-3 inline-block text-sm font-bold text-biru-dark underline">
          {COFFEE.feedbackEmail}
        </a>
      </section>

      {/* ---- Thanks ---- */}
      <section className="mx-5 mt-8 text-center">
        <h2 className="font-display text-lg font-bold text-ink">
          <Bi text={COFFEE.thanksHeadline} lang={lang} />
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
          <Bi text={COFFEE.thanksBody} lang={lang} />
        </p>
        <Link href="/" className="mt-5 inline-block text-sm font-bold text-ungu-dark underline">
          <Bi text={COFFEE.backLink} lang={lang} />
        </Link>
      </section>
    </main>
  );
}
