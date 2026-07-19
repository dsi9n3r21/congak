"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { login } from "@/lib/actions/auth";

type FormState = { error?: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-kite bg-kuning py-3 font-display font-bold text-white disabled:opacity-50 min-h-[44px]"
    >
      {pending ? "Sedang log masuk..." : "Log Masuk"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<FormState, FormData>(
    async (_prev, formData) => (await login(formData)) ?? {},
    {}
  );

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Selamat Kembali 👋</h1>
      <p className="mt-1 text-sm text-ink/60">Log masuk ke akaun Congak anda.</p>

      <form action={formAction} className="mt-6 space-y-4">
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
          placeholder="Kata Laluan"
          className="w-full rounded-kite border-2 border-ink/10 px-4 py-3 text-base focus:border-biru focus:outline-none"
        />

        {state.error && <p className="text-sm text-saga">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Belum ada akaun?{" "}
        <Link href="/auth/signup" className="font-semibold text-biru">
          Daftar
        </Link>
      </p>
    </main>
  );
}
