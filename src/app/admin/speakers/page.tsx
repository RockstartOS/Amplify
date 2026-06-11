import { db } from "@/lib/db";
import {
  AdminHeader,
  Card,
  Field,
  TextareaField,
  SubmitButton,
  DeleteButton,
} from "@/components/admin-ui";
import {
  createSpeakerAction,
  updateSpeakerAction,
  deleteSpeakerAction,
} from "../actions";

export default async function AdminSpeakersPage() {
  const speakers = await db.speaker.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { sessions: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Speakers"
        description="People appearing on the programme. Assign them to sessions from the schedule editor."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {speakers.length === 0 && (
            <Card>
              <p className="text-sm text-ink/55">No speakers yet.</p>
            </Card>
          )}
          {speakers.map((speaker) => (
            <Card key={speaker.id}>
              <form action={updateSpeakerAction} className="space-y-3">
                <input type="hidden" name="id" value={speaker.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" name="name" defaultValue={speaker.name} required />
                  <Field label="Title" name="title" defaultValue={speaker.title ?? ""} />
                  <Field label="Company" name="company" defaultValue={speaker.company ?? ""} />
                  <div className="flex items-end text-xs text-ink/40">
                    {speaker._count.sessions} session(s)
                  </div>
                </div>
                <TextareaField label="Bio" name="bio" defaultValue={speaker.bio} rows={2} />
                <div className="flex items-center justify-between">
                  <SubmitButton>Save</SubmitButton>
                  <DeleteButton action={deleteSpeakerAction} id={speaker.id} />
                </div>
              </form>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <h2 className="font-semibold">Add a speaker</h2>
          <form action={createSpeakerAction} className="mt-4 space-y-3">
            <Field label="Name" name="name" required />
            <Field label="Title" name="title" placeholder="Managing Partner" />
            <Field label="Company" name="company" />
            <TextareaField label="Bio" name="bio" rows={2} />
            <SubmitButton>Add speaker</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
