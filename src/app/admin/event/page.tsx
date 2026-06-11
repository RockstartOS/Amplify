import { db } from "@/lib/db";
import {
  AdminHeader,
  Card,
  Field,
  TextareaField,
  CheckboxField,
  SubmitButton,
  DeleteButton,
} from "@/components/admin-ui";
import { toDatetimeLocal, formatDayDate } from "@/lib/domain";
import {
  updateEventAction,
  createDayAction,
  deleteDayAction,
} from "../actions";

export default async function AdminEventPage() {
  const event = await db.event.findFirst({ orderBy: { startDate: "asc" } });
  if (!event) return <p>No event found. Seed the database first.</p>;

  const days = await db.eventDay.findMany({
    where: { eventId: event.id },
    orderBy: { position: "asc" },
    include: { _count: { select: { sessions: true } } },
  });

  const dateOnly = (d: Date) => toDatetimeLocal(d).slice(0, 10);

  return (
    <div className="space-y-8">
      <AdminHeader title="Event & days" description="Core details and the day structure of the programme." />

      <Card>
        <h2 className="font-semibold">Event details</h2>
        <form action={updateEventAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={event.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" defaultValue={event.name} required />
            <Field label="City" name="city" defaultValue={event.city} required />
            <Field label="Tagline" name="tagline" defaultValue={event.tagline ?? ""} className="sm:col-span-2" />
            <Field label="Venue" name="venue" defaultValue={event.venue ?? ""} className="sm:col-span-2" />
            <Field
              label="Start"
              name="startDate"
              type="datetime-local"
              defaultValue={toDatetimeLocal(event.startDate)}
              required
            />
            <Field
              label="End"
              name="endDate"
              type="datetime-local"
              defaultValue={toDatetimeLocal(event.endDate)}
              required
            />
          </div>
          <TextareaField label="Description" name="description" defaultValue={event.description} rows={3} />
          <CheckboxField label="Published (visible on the public site)" name="published" defaultChecked={event.published} />
          <SubmitButton>Save event</SubmitButton>
        </form>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <h2 className="font-semibold">Days</h2>
          {days.map((day) => (
            <Card key={day.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{day.name}</div>
                  <div className="text-sm text-ink/50">{formatDayDate(day.date)}</div>
                  {day.theme && <div className="text-sm text-ink/60">{day.theme}</div>}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink/40">
                  {day._count.sessions} sessions
                  <DeleteButton action={deleteDayAction} id={day.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <h2 className="font-semibold">Add a day</h2>
          <form action={createDayAction} className="mt-4 space-y-3">
            <input type="hidden" name="eventId" value={event.id} />
            <Field label="Name" name="name" placeholder="Invested Day" required />
            <Field label="Date" name="date" type="date" defaultValue={dateOnly(event.startDate)} required />
            <Field label="Theme" name="theme" placeholder="Capital meets conviction" />
            <TextareaField label="Description" name="description" rows={2} />
            <SubmitButton>Add day</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
