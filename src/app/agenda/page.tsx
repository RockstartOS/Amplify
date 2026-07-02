import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KindBadge, TrackPill } from "@/components/ui";
import { getCurrentAttendee } from "@/lib/attendee-auth";
import { getAgendaForAttendee } from "@/lib/queries";
import { toggleAgendaItem } from "@/lib/agenda-actions";
import { formatTimeRange, formatDayDate } from "@/lib/domain";

export const metadata: Metadata = { title: "My schedule" };

export default async function AgendaPage() {
  const me = await getCurrentAttendee();

  if (!me) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-5 py-20 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Your schedule</h1>
          <p className="mt-2 text-ink/60">
            Log in to view and build your personal schedule.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login" className="rounded-full bg-indigo px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand">
              Log in
            </Link>
            <Link href="/register" className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold hover:bg-surface">
              Register
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const agenda = await getAgendaForAttendee(me.id);
  const items = [...agenda].sort((a, b) => {
    const dp = a.session.day.position - b.session.day.position;
    if (dp !== 0) return dp;
    return a.session.startTime.getTime() - b.session.startTime.getTime();
  });

  const byDay = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.session.day.id;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(item);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-12">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My schedule</h1>
              <p className="mt-1 text-ink/60">
                {me.firstName} {me.lastName} · {me.ticketType.name}
              </p>
            </div>
            <Link
              href="/schedule"
              className="rounded-full bg-indigo px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-brand"
            >
              + Add sessions
            </Link>
          </header>

          {items.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-ink/15 py-16 text-center">
              <p className="text-ink/60">Your schedule is empty.</p>
              <Link
                href="/schedule"
                className="mt-4 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-cream"
              >
                Browse the programme
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {[...byDay.values()].map((dayItems) => {
                const day = dayItems[0].session.day;
                return (
                  <section key={day.id}>
                    <h2 className="text-lg font-bold">{day.name}</h2>
                    <p className="text-sm text-ink/50">{formatDayDate(day.date)}</p>
                    <div className="mt-3 space-y-3">
                      {dayItems.map(({ session }) => (
                        <div
                          key={session.id}
                          className="flex items-start gap-4 rounded-xl border border-ink/10 bg-surface p-4"
                        >
                          <div className="w-24 shrink-0 font-mono text-sm text-ink/60">
                            {formatTimeRange(session.startTime, session.endTime)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <KindBadge kind={session.kind} />
                              {session.track && (
                                <TrackPill name={session.track.name} color={session.track.color} />
                              )}
                              {session.room && (
                                <span className="text-xs text-ink/40">· {session.room}</span>
                              )}
                            </div>
                            <h3 className="mt-1 font-semibold">{session.title}</h3>
                          </div>
                          <form action={toggleAgendaItem}>
                            <input type="hidden" name="sessionId" value={session.id} />
                            <button
                              className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                              title="Remove from schedule"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
