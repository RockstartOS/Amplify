"use client";

import { useActionState, useState } from "react";
import { registerAction, type RegisterState } from "./actions";
import { formatMoney } from "@/lib/domain";

type Ticket = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  soldOut: boolean;
};

type OAuthPrefill = {
  provider: string;
  email: string;
  firstName: string;
  lastName: string;
};

export function RegisterForm({
  tickets,
  initialTicketId,
  oauth,
}: {
  tickets: Ticket[];
  initialTicketId?: string;
  oauth?: OAuthPrefill;
}) {
  const firstAvailable = tickets.find((t) => !t.soldOut);
  const [selected, setSelected] = useState(
    initialTicketId && tickets.some((t) => t.id === initialTicketId && !t.soldOut)
      ? initialTicketId
      : firstAvailable?.id ?? ""
  );
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-8">
      {/* Ticket selection */}
      <fieldset>
        <legend className="text-sm font-semibold text-ink">Choose your pass</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {tickets.map((ticket) => (
            <label
              key={ticket.id}
              className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-colors ${
                ticket.soldOut
                  ? "cursor-not-allowed border-cream/10 bg-paper opacity-60"
                  : selected === ticket.id
                  ? "border-brand bg-brand/5 ring-1 ring-brand"
                  : "border-cream/15 hover:border-brand/50"
              }`}
            >
              <input
                type="radio"
                name="ticketTypeId"
                value={ticket.id}
                checked={selected === ticket.id}
                disabled={ticket.soldOut}
                onChange={() => setSelected(ticket.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="font-semibold">{ticket.name}</span>
                <span className="font-bold text-brand">
                  {formatMoney(ticket.priceCents, ticket.currency)}
                </span>
              </div>
              {ticket.description && (
                <span className="mt-1 text-xs text-ink/55">{ticket.description}</span>
              )}
              {ticket.soldOut && (
                <span className="mt-2 text-xs font-semibold uppercase text-red-400">
                  Sold out
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Attendee details */}
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-semibold text-ink">Your details</legend>
        <Field name="firstName" label="First name" required defaultValue={oauth?.firstName} />
        <Field name="lastName" label="Last name" required defaultValue={oauth?.lastName} />
        <Field
          name="email"
          label="Email"
          type="email"
          required
          className="sm:col-span-2"
          defaultValue={oauth?.email}
          readOnly={Boolean(oauth)}
        />
        <Field name="company" label="Company / fund" />
        <Field name="role" label="Role (e.g. Founder, Investor)" />
        {!oauth && (
          <Field name="password" label="Password" type="password" required className="sm:col-span-2" />
        )}
      </fieldset>

      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !selected}
        className="w-full rounded-full bg-accent px-6 py-3.5 font-semibold text-ink transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Confirming…" : "Complete registration"}
      </button>
      <p className="text-xs text-ink/40">
        This is a demo checkout — no payment is taken.{" "}
        {oauth
          ? `You're verified with ${oauth.provider}; that's your login.`
          : "Your email and password become your login to manage your schedule and network."}
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  className = "",
  defaultValue,
  readOnly,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
  readOnly?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-ink/80">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`mt-1 w-full rounded-lg border border-cream/15 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 ${
          readOnly ? "cursor-not-allowed text-ink/60" : ""
        }`}
      />
    </label>
  );
}
