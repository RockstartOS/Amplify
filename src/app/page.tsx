import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  getActiveEvent,
  getScheduleForEvent,
  getTracksForEvent,
  getTicketTypesForEvent,
} from "@/lib/queries";
import {
  formatDateRange,
  formatDayDate,
  formatMoney,
} from "@/lib/domain";

export default async function HomePage() {
  const event = await getActiveEvent();

  if (!event) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-5 py-32 text-center">
          <h1 className="text-3xl font-bold">No event published yet</h1>
          <p className="mt-3 text-ink/60">
            An organiser can publish the next Amplify Europe edition from the{" "}
            <Link href="/admin" className="text-brand underline">
              admin backend
            </Link>
            .
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const [days, tracks, tickets] = await Promise.all([
    getScheduleForEvent(event.id),
    getTracksForEvent(event.id),
    getTicketTypesForEvent(event.id, true),
  ]);

  const lowestPrice = tickets.length
    ? Math.min(...tickets.map((t) => t.priceCents))
    : null;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-gradient text-ink">
        <SiteHeader transparent />
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 sm:pt-44">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-surface px-3 py-1 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {event.city} · {formatDateRange(event.startDate, event.endDate)}
          </div>

          <h1 className="mt-6 max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Amplify <span className="text-accent">Europe</span>
          </h1>
          <p className="mt-5 max-w-2xl text-balance text-lg text-ink/80 sm:text-xl">
            {event.tagline}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-cream transition-transform hover:scale-[1.03]"
            >
              Get your ticket
              {lowestPrice != null && (
                <span className="ml-2 font-normal opacity-70">
                  from {formatMoney(lowestPrice)}
                </span>
              )}
            </Link>
            <Link
              href="/schedule"
              className="rounded-full border border-ink/20 bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:bg-ink/5"
            >
              Explore the schedule
            </Link>
          </div>

          <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { k: "Format", v: event.format ?? `${days.length} days` },
              {
                k: "Participants",
                v: event.expectedAttendees ? `${event.expectedAttendees}+` : `${days.length}`,
              },
              { k: "Pillars", v: `${tracks.filter((t) => t.metric).length}` },
              { k: "City", v: event.city },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-xs uppercase tracking-wide text-ink/50">
                  {s.k}
                </dt>
                <dd className="mt-1 text-2xl font-semibold">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main className="flex-1">
        {/* About / the 1.5-day structure */}
        <section id="about" className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-indigo">
              The format
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Two and a half days, framed by two questions.
            </h2>
            <p className="mt-4 text-ink/70">{event.description}</p>
            <p className="mt-4 text-ink/70">
              We open on{" "}
              <span className="font-semibold text-ink">the pre-seed gap</span>,
              go deep across the four pillars of resilience, and close on{" "}
              <span className="font-semibold text-ink">
                the value-driven economy
              </span>
              .
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {days.map((day, i) => (
              <div
                key={day.id}
                className="rounded-2xl border border-ink/10 bg-surface p-7 "
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/10 text-xs">
                    {i + 1}
                  </span>
                  {day.name}
                </div>
                <p className="mt-1 text-sm text-ink/50">
                  {formatDayDate(day.date)}
                </p>
                {day.theme && (
                  <h3 className="mt-4 text-xl font-semibold">{day.theme}</h3>
                )}
                <p className="mt-2 text-ink/70">{day.description}</p>
                <p className="mt-4 text-sm text-ink/40">
                  {day.sessions.length} sessions
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tracks */}
        <section id="tracks" className="border-y border-ink/10 bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-indigo">
                  Amplify Europe · Thesis
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Four pillars, two questions.
                </h2>
                <p className="mt-4 text-ink/70">
                  Four pillars of resilience — each sized to the European market
                  it unlocks by 2035 — framed by two cross-cutting questions we
                  explore together. Every theme can be edited from the backend.
                </p>
              </div>
              <Link
                href="/schedule"
                className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper"
              >
                See all sessions
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="group rounded-2xl border border-ink/10 p-6 transition-shadow "
                  style={{ borderTopColor: track.color, borderTopWidth: 3 }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <h3 className="text-lg font-semibold">{track.name}</h3>
                  </div>
                  {track.metric && (
                    <span className="mono mt-3 inline-block rounded-full border border-indigo/30 bg-indigo/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-indigo-soft">
                      {track.metric}
                    </span>
                  )}
                  <p className="mt-3 text-sm text-ink/70">{track.description}</p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink/40">
                    {track._count.sessions} sessions
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tickets */}
        <section id="tickets" className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-indigo">
              Passes
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Find the right way in.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-col rounded-2xl border border-ink/10 bg-surface p-6 "
              >
                <h3 className="text-lg font-semibold">{ticket.name}</h3>
                <p className="mt-1 text-2xl font-bold text-brand">
                  {formatMoney(ticket.priceCents, ticket.currency)}
                </p>
                <p className="mt-3 flex-1 text-sm text-ink/60">
                  {ticket.description}
                </p>
                <Link
                  href={`/register?ticket=${ticket.id}`}
                  className="mt-5 rounded-full bg-indigo px-4 py-2.5 text-center text-sm font-semibold text-cream transition-colors hover:bg-brand"
                >
                  Choose {ticket.name}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-ink/10 bg-brand-gradient text-ink">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to amplify?
              </h2>
              <p className="mt-2 text-ink/75">
                Join Europe&apos;s builders and backers in {event.city}, April 2027.
              </p>
            </div>
            <Link
              href="/register"
              className="rounded-full bg-accent px-7 py-3.5 font-semibold text-cream transition-transform hover:scale-[1.03]"
            >
              Get your ticket
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
