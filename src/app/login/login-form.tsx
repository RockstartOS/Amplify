"use client";

import { useActionState } from "react";
import { loginAttendeeAction, type LoginState } from "@/lib/account-actions";

export function AttendeeLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAttendeeAction,
    {}
  );
  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-ink/80">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-cream/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink/80">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-cream/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-indigo px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brand disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
