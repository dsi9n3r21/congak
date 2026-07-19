"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import clsx from "clsx";
import { createStudentProfile } from "@/lib/actions/profile";

type FormState = { error?: string };

// Neutral, non-stereotyped avatar set — objects/animals/abstract shapes,
// not gendered character designs. Swap emoji for real illustrations later.
const AVATARS = ["🦊", "🐢", "🦉", "🐙", "🦜", "🐸", "🦋", "🐳"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-kite bg-kuning py-3 font-display font-bold text-white disabled:opacity-50 min-h-[44px]"
    >
      {pending ? "Menyimpan..." : "Mula Belajar →"}
    </button>
  );
}

export default function ProfileSetupPage() {
  const [state, formAction] = useFormState<FormState, FormData>(
    async (_prev, formData) => (await createStudentProfile(formData)) ?? {},
    {}
  );
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [theme, setTheme] = useState<"adventure" | "explorer">("explorer");

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Sediakan Profil Anda</h1>
      <p className="mt-1 text-sm text-ink/60">Sikit lagi sebelum mula belajar!</p>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="avatarId" value={avatar} />
        <input type="hidden" name="theme" value={theme} />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Nama</label>
          <input
            name="displayName"
            required
            placeholder="Nama panggilan anda"
            className="w-full rounded-kite border-2 border-ink/10 px-4 py-3 text-base focus:border-biru focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Tahun</label>
          <div className="flex gap-2">
            {[4, 5, 6].map((y) => (
              <label key={y} className="flex-1">
                <input type="radio" name="yearLevel" value={y} required className="peer sr-only" />
                <span className="block cursor-pointer rounded-kite border-2 border-ink/10 py-3 text-center font-num font-semibold peer-checked:border-kuning peer-checked:bg-kuning-light">
                  Tahun {y}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Pilih Avatar</label>
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={clsx(
                  "flex h-14 items-center justify-center rounded-kite border-2 text-2xl",
                  avatar === a ? "border-kuning bg-kuning-light" : "border-ink/10"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Pilih Tema</label>
          <div className="flex gap-2">
            {(["adventure", "explorer"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={clsx(
                  "flex-1 rounded-kite border-2 py-3 text-sm font-semibold min-h-[44px]",
                  theme === t ? "border-biru bg-biru-light text-biru-dark" : "border-ink/10 text-ink/60"
                )}
              >
                {t === "adventure" ? "🗺️ Pengembaraan" : "🔭 Penjelajah"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Jantina (pilihan)</label>
          <select
            name="gender"
            defaultValue=""
            className="w-full rounded-kite border-2 border-ink/10 px-4 py-3 text-base focus:border-biru focus:outline-none"
          >
            <option value="">Tidak nyatakan</option>
            <option value="male">Lelaki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        {state.error && <p className="text-sm text-saga">{state.error}</p>}

        <SubmitButton />
      </form>
    </main>
  );
}
