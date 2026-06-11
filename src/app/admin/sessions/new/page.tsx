import { db } from "@/lib/db";
import { AdminHeader, Card, BackLink } from "@/components/admin-ui";
import { AdminSessionForm } from "@/components/admin-session-form";
import { createSessionAction } from "../../actions";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const { day } = await searchParams;
  const event = await db.event.findFirst({ orderBy: { startDate: "asc" } });
  if (!event) return <p>No event found.</p>;

  const [days, tracks, speakers] = await Promise.all([
    db.eventDay.findMany({ where: { eventId: event.id }, orderBy: { position: "asc" } }),
    db.track.findMany({ where: { eventId: event.id }, orderBy: { position: "asc" } }),
    db.speaker.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/sessions">← Back to schedule</BackLink>
      <AdminHeader title="New session" />
      <Card>
        <AdminSessionForm
          eventId={event.id}
          days={days}
          tracks={tracks}
          speakers={speakers}
          defaultDayId={day}
          action={createSessionAction}
        />
      </Card>
    </div>
  );
}
