"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { signUp } from "@/lib/actions/auth";

type FormState = { error?: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-kite bg-kuning py-3 font-display font-bold text-white disabled:opacity-50 min-h-[44px]"
    >
      {pending ? "Sedang daftar..." : "Daftar"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState<FormState, FormData>(
    async (_prev, formData) => (await signUp(formData)) ?? {},
    {}
  );
  const [role, setRole] = useState<"student" | "parent">("student");

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Daftar Akaun Congak 🪁</h1>
      <p className="mt-1 text-sm text-ink/60">Untuk murid atau ibu bapa.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="role" value={role} />

        <div className="flex gap-2">
          {(["student", "parent"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={clsx(
                "flex-1 rounded-kite border-2 py-3 text-sm font-semibold min-h-[44px]",
                role === r ? "border-kuning bg-kuning-light text-kuning-dark" : "border-ink/10 text-ink/60"
              )}
            >
              {r === "student" ? "Saya Murid" : "Saya Ibu Bapa"}
            </button>
          ))}
        </div>

        <input
          name="email"
          type="email"
          required
          placeholder="Emel"
          className="w-full rounded-kite border-2 border-ink/10 px-4 py-3 text-base focus:border-biru focus:outline-none"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Kata Laluan (min 6 aksara)"
          className="w-full rounded-kite border-2 border-ink/10 px-4 py-3 text-base focus:border-biru focus:outline-none"
        />

        {state.error && <p className="text-sm text-saga">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Sudah ada akaun?{" "}
        <Link href="/auth/login" className="font-semibold text-biru">
          Log Masuk
        </Link>
      </p>
    </main>
  );
}
