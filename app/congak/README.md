# Congak — Phase 0 Scaffold

Mobile-first PWA for Malaysian KSSR primary maths (Year 4–6). Next.js 14 (App Router) + TypeScript + Tailwind + Supabase.

## What's in this scaffold
- `next.config.js` — PWA config via `next-pwa`, with runtime caching for lesson/topic content (offline + low-bandwidth support).
- `public/manifest.json` — home-screen install manifest.
- `tailwind.config.ts` — design tokens: wau (kite) inspired palette (`kuning`, `biru`, `saga`, `pandan`), mobile-first breakpoints starting at 360px.
- `app/globals.css` — accessibility hooks: `.a11y-large-text`, `.a11y-dyslexia-font`, `.a11y-low-distraction`, plus `prefers-reduced-motion` support.
- `components/ui/BottomNav.tsx` — thumb-zone bottom tab bar (mobile) that becomes a top nav on `md:` and up.
- `app/(student)/dashboard/page.tsx` — first real screen: single-column, one primary CTA, streak/level strip, weak-topics list. This is the reference pattern for every other student screen.
- `lib/supabase/` — browser + server Supabase clients.
- `supabase/migrations/0001_init.sql` — core tables (organizations, users, students, topics, lessons, question_templates, practice_sessions, attempts, topic_mastery) with RLS policies scoped to student/parent.

## Setup
```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npx supabase db push          # applies 0001_init.sql
npm run dev
```
You'll need a `public/icons/` set (192, 512, maskable-512 PNGs) before the PWA install prompt will pass Lighthouse — placeholder icons not included here.

## Next up (Phase 1)
- Seed 2–3 strands of `topics` + `lessons` content (Whole Numbers, Fractions, Money).
- Build the parametric question generator in `lib/questions/` (2–3 question types first: MCQ, fill-in-blank).
- Learn screen (`app/(student)/learn/`) using the swipeable card pattern from the plan.
- Practice player + immediate feedback, wiring up `mistake_type` classification in `lib/mistakes/`.
