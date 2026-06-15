import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SessionRow } from "@/components/schedule-view";
import {
  getActiveEvent,
  getScheduleForEvent,
  getTracksForEvent,
  getRegistrationByReference,
} from "@/lib/queries";
import { getAttendeeReference } from "@/lib/auth";
import { formatDayDate } from "@/lib/domain";

export const metadata: Metadata = { title: "Schedule" };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; track?: string }>;
}) {
  const { day: dayFilter, track: trackFilter } = await searchParams;
  const event = await getActiveEvent();

  if (!event) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl flex-1 px-5 py-32 text-center">
          <h1 className="text-2xl font-bold">No schedule published yet.</h1>
        </main>
        <SiteFooter />
      </>
    );
  }

  const [days, tracks] = await Promise.all([
    getScheduleForEvent(event.id),
    getTracksForEvent(event.id),
  ]);

  // Determine the attendee (if any) and their saved sessions.
  const reference = await getAttendeeReference();
  const registration = reference
    ? await getRegistrationByReference(reference)
    : null;
  const isLinked = Boolean(registration);
  const savedIds = new Set(registration?.agenda.map((a) => a.sessionId) ?? []);

  const visibleDays = dayFilter
    ? days.filter((d) => d.id === dayFilter)
    : days;

  const filterSession = (trackId: string | null) =>
    !trackFilter || trackFilter === trackId;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-indigo">
                {event.name}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                Schedule
              </h1>
              <p className="mt-2 text-ink/60">
                Browse the programme, filter by track, and build your own agenda.
              </p>
            </div>
            {isLinked ? (
              <Link
                href="/agenda"
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
              >
                My agenda ({savedIds.size})
              </Link>
            ) : (
              <Link
                href="/agenda"
                className="rounded-full border border-cream/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper"
              >
                Sign in to save sessions
              </Link>
            )}
          </header>

          {/* Day filter */}
          <div className="mt-8 flex flex-wrap gap-2">
            <FilterChip href={buildHref(undefined, trackFilter)} active={!dayFilter}>
              All days
            </FilterChip>
            {days.map((d) => (
              <FilterChip
                key={d.id}
                href={buildHref(d.id, trackFilter)}
                active={dayFilter === d.id}
              >
                {d.name}
              </FilterChip>
            ))}
          </div>

          {/* Track filter */}
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip href={buildHref(dayFilter, undefined)} active={!trackFilter}>
              All tracks
            </FilterChip>
            {tracks.map((t) => (
              <FilterChip
                key={t.id}
                href={buildHref(dayFilter, t.id)}
                active={trackFilter === t.id}
                color={t.color}
              >
                {t.name}
              </FilterChip>
            ))}
          </div>

          {/* Programme */}
          <div className="mt-10 space-y-12">
            {visibleDays.map((day) => {
              const sessions = day.sessions.filter((s) =>
                filterSession(s.trackId)
              );
              if (sessions.length === 0) return null;
              return (
                <section key={day.id}>
                  <div className="sticky top-16 z-10 -mx-2 bg-paper/90 px-2 py-2 backdrop-blur">
                    <h2 className="text-xl font-bold">{day.name}</h2>
                    <p className="text-sm text-ink/50">
                      {formatDayDate(day.date)}
                      {day.theme ? ` · ${day.theme}` : ""}
                    </p>
                  </div>
                  <div className="mt-2 rounded-2xl border border-cream/10 bg-surface px-5 ">
                    {sessions.map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        saved={savedIds.has(session.id)}
                        isLinked={isLinked}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
            {visibleDays.every(
              (d) => d.sessions.filter((s) => filterSession(s.trackId)).length === 0
            ) && (
              <p className="rounded-2xl border border-dashed border-cream/15 py-16 text-center text-ink/50">
                No sessions match this filter.
              </p>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function buildHref(day?: string, track?: string) {
  const params = new URLSearchParams();
  if (day) params.set("day", day);
  if (track) params.set("track", track);
  const qs = params.toString();
  return qs ? `/schedule?${qs}` : "/schedule";
}

function FilterChip({
  href,
  active,
  color,
  children,
}: {
  href: string;
  active: boolean;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-transparent bg-indigo text-cream"
          : "border-cream/15 text-ink/70 hover:bg-surface"
      }`}
    >
      {color && (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      )}
      {children}
    </Link>
  );
}
