import { Field, TextareaField, SelectField, SubmitButton } from "@/components/admin-ui";
import {
  SESSION_KINDS,
  SESSION_KIND_LABELS,
  toDatetimeLocal,
  type SessionKind,
} from "@/lib/domain";

type DayLite = { id: string; name: string };
type TrackLite = { id: string; name: string };
type SpeakerLite = { id: string; name: string; company: string | null };

type ExistingSession = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  dayId: string;
  trackId: string | null;
  room: string | null;
  capacity: number | null;
  startTime: Date;
  endTime: Date;
  speakers: { speakerId: string }[];
};

export function AdminSessionForm({
  eventId,
  days,
  tracks,
  speakers,
  defaultDayId,
  action,
  session,
}: {
  eventId: string;
  days: DayLite[];
  tracks: TrackLite[];
  speakers: SpeakerLite[];
  defaultDayId?: string;
  action: (formData: FormData) => void;
  session?: ExistingSession;
}) {
  const selectedSpeakers = new Set(session?.speakers.map((s) => s.speakerId) ?? []);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="eventId" value={eventId} />
      {session && <input type="hidden" name="id" value={session.id} />}

      <Field label="Title" name="title" defaultValue={session?.title} required />

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Kind"
          name="kind"
          defaultValue={session?.kind ?? "TALK"}
          options={SESSION_KINDS.map((k) => ({
            value: k,
            label: SESSION_KIND_LABELS[k as SessionKind],
          }))}
        />
        <SelectField
          label="Day"
          name="dayId"
          defaultValue={session?.dayId ?? defaultDayId ?? days[0]?.id}
          options={days.map((d) => ({ value: d.id, label: d.name }))}
        />
        <SelectField
          label="Track"
          name="trackId"
          defaultValue={session?.trackId ?? ""}
          options={[
            { value: "", label: "— No track (plenary) —" },
            ...tracks.map((t) => ({ value: t.id, label: t.name })),
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Start"
          name="startTime"
          type="datetime-local"
          defaultValue={session ? toDatetimeLocal(session.startTime) : undefined}
          required
        />
        <Field
          label="End"
          name="endTime"
          type="datetime-local"
          defaultValue={session ? toDatetimeLocal(session.endTime) : undefined}
          required
        />
        <Field label="Room" name="room" defaultValue={session?.room ?? ""} />
        <Field
          label="Capacity"
          name="capacity"
          type="number"
          defaultValue={session?.capacity ?? ""}
        />
      </div>

      <TextareaField label="Description" name="description" defaultValue={session?.description} rows={3} />

      <fieldset>
        <legend className="text-sm font-medium text-ink/80">Speakers</legend>
        {speakers.length === 0 ? (
          <p className="mt-2 text-sm text-ink/45">
            No speakers yet — add them on the Speakers page.
          </p>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {speakers.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="speakerIds"
                  value={s.id}
                  defaultChecked={selectedSpeakers.has(s.id)}
                  className="h-4 w-4 rounded border-black/20 text-brand focus:ring-brand"
                />
                <span>
                  {s.name}
                  {s.company && <span className="text-ink/40"> · {s.company}</span>}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <SubmitButton>{session ? "Save session" : "Create session"}</SubmitButton>
    </form>
  );
}
