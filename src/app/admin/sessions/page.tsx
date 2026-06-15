import Link from "next/link";
import { db } from "@/lib/db";
import { AdminHeader, Card } from "@/components/admin-ui";
import { KindBadge, TrackPill } from "@/components/ui";
import { formatTimeRange, formatDayDate } from "@/lib/domain";

export default async function AdminSessionsPage() {
  const event = await db.event.findFirst({ orderBy: { startDate: "asc" } });
  if (!event) return <p>No event found.</p>;

  const days = await db.eventDay.findMany({
    where: { eventId: event.id },
    orderBy: { position: "asc" },
    include: {
      sessions: {
        orderBy: { startTime: "asc" },
        include: { track: true, speakers: { include: { speaker: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Schedule"
        description="Everything you edit here renders on the public schedule."
        action={
          <Link
            href="/admin/sessions/new"
            className="rounded-full bg-indigo px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand"
          >
            + New session
          </Link>
        }
      />

      {days.map((day) => (
        <Card key={day.id}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{day.name}</h2>
              <p className="text-sm text-ink/50">{formatDayDate(day.date)}</p>
            </div>
            <Link
              href={`/admin/sessions/new?day=${day.id}`}
              className="text-sm font-semibold text-brand hover:underline"
            >
              + Add to this day
            </Link>
          </div>

          <div className="mt-3 divide-y divide-cream/10">
            {day.sessions.length === 0 && (
              <p className="py-6 text-sm text-ink/45">No sessions on this day yet.</p>
            )}
            {day.sessions.map((session) => (
              <Link
                key={session.id}
                href={`/admin/sessions/${session.id}`}
                className="flex items-center gap-4 py-3 transition-colors hover:bg-paper"
              >
                <span className="w-24 shrink-0 font-mono text-sm text-ink/55">
                  {formatTimeRange(session.startTime, session.endTime)}
                </span>
                <span className="flex flex-1 flex-wrap items-center gap-2">
                  <KindBadge kind={session.kind} />
                  {session.track && (
                    <TrackPill name={session.track.name} color={session.track.color} />
                  )}
                  <span className="font-medium">{session.title}</span>
                  {session.room && (
                    <span className="text-xs text-ink/40">· {session.room}</span>
                  )}
                </span>
                <span className="text-xs text-ink/35">edit →</span>
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
