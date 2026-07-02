import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getActiveEvent, getTicketTypesForEvent } from "@/lib/queries";
import { db } from "@/lib/db";
import { formatMoney, formatDateRange } from "@/lib/domain";

export const metadata: Metadata = { title: "Tickets" };

export default async function TicketsPage() {
  const event = await getActiveEvent();
  if (!event) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl flex-1 px-5 py-32 text-center">
          <h1 className="text-2xl font-bold">Tickets aren&apos;t on sale yet.</h1>
        </main>
        <SiteFooter />
      </>
    );
  }

  const tickets = await getTicketTypesForEvent(event.id, true);
  const counts = await db.registration.groupBy({
    by: ["ticketTypeId"],
    where: { eventId: event.id },
    _count: { _all: true },
  });
  const sold = new Map(counts.map((c) => [c.ticketTypeId, c._count._all]));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <header className="max-w-2xl">
            <p className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-indigo">
              {event.city} · {formatDateRange(event.startDate, event.endDate)}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Tickets
            </h1>
            <p className="mt-2 text-ink/60">
              Every pass includes both Invested Day and the Amplify It tracks,
              plus the agenda builder and networking reception.
            </p>
          </header>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {tickets.map((ticket) => {
              const used = sold.get(ticket.id) ?? 0;
              const remaining =
                ticket.quantity == null ? null : Math.max(ticket.quantity - used, 0);
              const soldOut = remaining === 0;
              return (
                <div
                  key={ticket.id}
                  className="flex flex-col rounded-2xl border border-ink/10 bg-surface p-7 "
                >
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold">{ticket.name}</h2>
                    <span className="text-2xl font-bold text-brand">
                      {formatMoney(ticket.priceCents, ticket.currency)}
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm text-ink/60">
                    {ticket.description}
                  </p>
                  {remaining != null && (
                    <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink/40">
                      {soldOut ? "Sold out" : `${remaining} of ${ticket.quantity} left`}
                    </p>
                  )}
                  <Link
                    href={soldOut ? "/tickets" : `/register?ticket=${ticket.id}`}
                    aria-disabled={soldOut}
                    className={`mt-5 rounded-full px-5 py-3 text-center text-sm font-semibold transition-colors ${
                      soldOut
                        ? "cursor-not-allowed bg-ink/5 text-ink/40"
                        : "bg-indigo text-cream hover:bg-brand"
                    }`}
                  >
                    {soldOut ? "Sold out" : `Choose ${ticket.name}`}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
