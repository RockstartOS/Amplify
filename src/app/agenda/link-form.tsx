"use client";

import { useActionState } from "react";
import { linkAttendeeAction, type LinkState } from "@/lib/agenda-actions";

export function LinkForm() {
  const [state, formAction, pending] = useActionState<LinkState, FormData>(
    linkAttendeeAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-ink/80">Reference code</span>
        <input
          name="reference"
          placeholder="AMS-XXXXXX"
          autoComplete="off"
          className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2.5 font-mono uppercase tracking-widest outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand disabled:opacity-60"
      >
        {pending ? "Looking up…" : "Open my agenda"}
      </button>
    </form>
  );
}
