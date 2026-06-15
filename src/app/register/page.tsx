import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RegisterForm } from "./register-form";
import { getActiveEvent, getTicketTypesForEvent } from "@/lib/queries";
import { db } from "@/lib/db";
import { formatDateRange } from "@/lib/domain";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { ticket: ticketParam } = await searchParams;
  const event = await getActiveEvent();

  if (!event) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl flex-1 px-5 py-32 text-center">
          <h1 className="text-2xl font-bold">Registration isn&apos;t open yet.</h1>
        </main>
        <SiteFooter />
      </>
    );
  }

  const ticketTypes = await getTicketTypesForEvent(event.id, true);
  const counts = await db.registration.groupBy({
    by: ["ticketTypeId"],
    where: { eventId: event.id },
    _count: { _all: true },
  });
  const soldByTicket = new Map(counts.map((c) => [c.ticketTypeId, c._count._all]));

  const tickets = ticketTypes.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    priceCents: t.priceCents,
    currency: t.currency,
    soldOut: t.quantity != null && (soldByTicket.get(t.id) ?? 0) >= t.quantity,
  }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 lg:grid-cols-[1fr_320px]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Register for {event.name}
            </h1>
            <p className="mt-2 text-ink/60">
              {event.city} · {formatDateRange(event.startDate, event.endDate)}
            </p>
            <div className="mt-8">
              <RegisterForm tickets={tickets} initialTicketId={ticketParam} />
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-cream/10 bg-surface p-6 ">
            <h2 className="font-semibold">What&apos;s included</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li>✓ Full access to Invested Day</li>
              <li>✓ Amplify It track sessions</li>
              <li>✓ A personal agenda builder</li>
              <li>✓ Networking reception</li>
            </ul>
            <hr className="my-5 border-cream/10" />
            <p className="text-sm text-ink/60">
              Already registered?{" "}
              <Link href="/agenda" className="font-medium text-brand underline">
                Open your agenda
              </Link>
              .
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
