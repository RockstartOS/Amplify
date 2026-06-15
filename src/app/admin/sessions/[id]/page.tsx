import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader, Card, BackLink } from "@/components/admin-ui";
import { AdminSessionForm } from "@/components/admin-session-form";
import { updateSessionAction, deleteSessionAction } from "../../actions";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await db.session.findUnique({
    where: { id },
    include: { speakers: true },
  });
  if (!session) notFound();

  const [days, tracks, speakers] = await Promise.all([
    db.eventDay.findMany({ where: { eventId: session.eventId }, orderBy: { position: "asc" } }),
    db.track.findMany({ where: { eventId: session.eventId }, orderBy: { position: "asc" } }),
    db.speaker.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/sessions">← Back to schedule</BackLink>
      <AdminHeader
        title="Edit session"
        action={
          <form action={deleteSessionAction}>
            <input type="hidden" name="id" value={session.id} />
            <button className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10">
              Delete session
            </button>
          </form>
        }
      />
      <Card>
        <AdminSessionForm
          eventId={session.eventId}
          days={days}
          tracks={tracks}
          speakers={speakers}
          action={updateSessionAction}
          session={session}
        />
      </Card>
    </div>
  );
}
