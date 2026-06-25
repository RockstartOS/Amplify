import { db } from "@/lib/db";
import {
  AdminHeader,
  Card,
  Field,
  TextareaField,
  SubmitButton,
  DeleteButton,
} from "@/components/admin-ui";
import { TRACK_COLORS } from "@/lib/domain";
import {
  createTrackAction,
  updateTrackAction,
  deleteTrackAction,
} from "../actions";

export default async function AdminTracksPage() {
  const event = await db.event.findFirst({ orderBy: { startDate: "asc" } });
  if (!event) return <p>No event found.</p>;

  const tracks = await db.track.findMany({
    where: { eventId: event.id },
    orderBy: { position: "asc" },
    include: { _count: { select: { sessions: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Tracks"
        description="Thematic tracks shown on the Amplify It day. Add as many as you need."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Existing tracks */}
        <div className="space-y-3">
          {tracks.length === 0 && (
            <Card>
              <p className="text-sm text-ink/55">No tracks yet. Add your first one.</p>
            </Card>
          )}
          {tracks.map((track) => (
            <Card key={track.id}>
              <form action={updateTrackAction} className="space-y-3">
                <input type="hidden" name="id" value={track.id} />
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    defaultValue={track.color}
                    className="h-9 w-12 cursor-pointer rounded border border-cream/15"
                  />
                  <input
                    name="name"
                    defaultValue={track.name}
                    className="flex-1 rounded-lg border border-cream/15 px-3 py-2 font-semibold outline-none focus:border-brand"
                  />
                  <span className="text-xs text-ink/40">
                    {track._count.sessions} sessions
                  </span>
                </div>
                <Field
                  label="Market metric"
                  name="metric"
                  defaultValue={track.metric ?? ""}
                  placeholder="€4.5TN+ by 2035"
                />
                <TextareaField
                  label="Description"
                  name="description"
                  defaultValue={track.description}
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <SubmitButton>Save</SubmitButton>
                  <DeleteButton action={deleteTrackAction} id={track.id} />
                </div>
              </form>
            </Card>
          ))}
        </div>

        {/* New track */}
        <Card className="h-fit">
          <h2 className="font-semibold">Add a track</h2>
          <form action={createTrackAction} className="mt-4 space-y-3">
            <input type="hidden" name="eventId" value={event.id} />
            <Field label="Name" name="name" placeholder="Amplify Climate" required />
            <label className="block">
              <span className="text-sm font-medium text-ink/80">Colour</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {TRACK_COLORS.map((c, i) => (
                  <label key={c} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={c}
                      defaultChecked={i === 0}
                      className="peer sr-only"
                    />
                    <span
                      className="block h-7 w-7 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-ink"
                      style={{ backgroundColor: c }}
                    />
                  </label>
                ))}
              </div>
            </label>
            <Field label="Market metric" name="metric" placeholder="€600B+ by 2035" />
            <TextareaField label="Description" name="description" rows={2} />
            <SubmitButton>Add track</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
