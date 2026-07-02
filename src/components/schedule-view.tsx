import Link from "next/link";
import { KindBadge, TrackPill } from "@/components/ui";
import { formatTimeRange } from "@/lib/domain";
import { toggleAgendaItem } from "@/lib/agenda-actions";

type SpeakerLite = { speaker: { id: string; name: string; title: string | null; company: string | null } };
type TrackLite = { id: string; name: string; color: string } | null;
export type ScheduleSession = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  startTime: Date;
  endTime: Date;
  room: string | null;
  track: TrackLite;
  speakers: SpeakerLite[];
};

function AgendaButton({
  sessionId,
  saved,
  isLinked,
}: {
  sessionId: string;
  saved: boolean;
  isLinked: boolean;
}) {
  if (!isLinked) {
    return (
      <Link
        href="/login"
        className="shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:bg-paper"
        title="Log in to build your schedule"
      >
        + Save
      </Link>
    );
  }
  return (
    <form action={toggleAgendaItem} className="shrink-0">
      <input type="hidden" name="sessionId" value={sessionId} />
      <button
        type="submit"
        className={
          saved
            ? "rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-brand-dark"
            : "rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:bg-paper"
        }
      >
        {saved ? "✓ In agenda" : "+ Add"}
      </button>
    </form>
  );
}

export function SessionRow({
  session,
  saved,
  isLinked,
  showAgenda = true,
}: {
  session: ScheduleSession;
  saved: boolean;
  isLinked: boolean;
  showAgenda?: boolean;
}) {
  return (
    <div className="flex gap-4 border-b border-ink/10 py-4 last:border-0">
      <div className="w-24 shrink-0 pt-0.5 font-mono text-sm text-ink/60">
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
        <h4 className="mt-1.5 font-semibold leading-snug">{session.title}</h4>
        {session.description && (
          <p className="mt-1 text-sm text-ink/60">{session.description}</p>
        )}
        {session.speakers.length > 0 && (
          <p className="mt-1.5 text-sm text-ink/50">
            {session.speakers
              .map(
                (s) =>
                  s.speaker.name +
                  (s.speaker.company ? ` · ${s.speaker.company}` : "")
              )
              .join(", ")}
          </p>
        )}
      </div>
      {showAgenda && (
        <AgendaButton sessionId={session.id} saved={saved} isLinked={isLinked} />
      )}
    </div>
  );
}
