"use client";

import { useFormState, useFormStatus } from "react-dom";
import { linkChildByCode } from "@/lib/actions/parent";
import { UI } from "@/lib/i18n/dictionary";
import { Bi } from "@/lib/i18n/Bi";

type FormState = { error?: string; success?: boolean; childName?: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-kite bg-kuning px-5 py-3 font-display font-bold text-white disabled:opacity-50 min-h-[44px]"
    >
      {pending ? "..." : <Bi text={UI.linkButton} lang="both" />}
    </button>
  );
}

// Title/subtitle are rendered by the parent dashboard page, which wraps
// this in the same bordered card — this component is just the input row
// and its result messages.
export function LinkChildForm() {
  const [state, formAction] = useFormState<FormState, FormData>(
    async (_prev, formData) => (await linkChildByCode(formData)) ?? {},
    {}
  );

  return (
    <div>
      <form action={formAction} className="mt-3 flex gap-2">
        <input
          name="code"
          required
          maxLength={6}
          placeholder="cth: 4K7QXR"
          className="flex-1 rounded-kite border-2 border-ink/10 px-3 py-3 text-center font-num text-base uppercase tracking-widest focus:border-biru focus:outline-none"
        />
        <SubmitButton />
      </form>
      {state.error && <p className="mt-2 text-sm text-saga">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-pandan-dark">Berjaya dipautkan dengan {state.childName}! 🎉</p>}
    </div>
  );
}
