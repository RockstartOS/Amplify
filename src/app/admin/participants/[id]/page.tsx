import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  AdminHeader,
  Card,
  Field,
  SelectField,
  CheckboxField,
  SubmitButton,
  BackLink,
} from "@/components/admin-ui";
import { KindBadge } from "@/components/ui";
import { REGISTRATION_STATUSES, formatTimeRange, formatMoney } from "@/lib/domain";
import { updateParticipantAction, deleteRegistrationAction } from "../../actions";

export default async function AdminParticipantDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await db.registration.findUnique({
    where: { id },
    include: {
      ticketType: true,
      agenda: { include: { session: { include: { day: true, track: true } } } },
      connectionsSent: { include: { addressee: true } },
      connectionsReceived: { include: { requester: true } },
    },
  });
  if (!p) notFound();

  const agenda = [...p.agenda].sort(
    (a, b) => a.session.startTime.getTime() - b.session.startTime.getTime()
  );
  const connections = [
    ...p.connectionsSent.map((c) => ({ id: c.id, status: c.status, who: c.addressee, dir: "→" })),
    ...p.connectionsReceived.map((c) => ({ id: c.id, status: c.status, who: c.requester, dir: "←" })),
  ];

  return (
    <div className="space-y-6">
      <BackLink href="/admin/participants">← Back to participants</BackLink>
      <AdminHeader
        title={`${p.firstName} ${p.lastName}`}
        description={`${p.email} · ${p.ticketType.name} · ${formatMoney(p.ticketType.priceCents, p.ticketType.currency)} · ref ${p.reference}`}
        action={
          <form action={deleteRegistrationAction}>
            <input type="hidden" name="id" value={p.id} />
            <button className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10">
              Delete participant
            </button>
          </form>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Edit */}
        <Card>
          <h2 className="font-semibold">Details</h2>
          <form action={updateParticipantAction} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={p.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" name="firstName" defaultValue={p.firstName} />
              <Field label="Last name" name="lastName" defaultValue={p.lastName} />
              <Field label="Email" name="email" defaultValue={p.email} className="sm:col-span-2" />
              <Field label="Company" name="company" defaultValue={p.company ?? ""} />
              <Field label="Role" name="role" defaultValue={p.role ?? ""} />
              <Field label="Headline" name="headline" defaultValue={p.headline ?? ""} className="sm:col-span-2" />
              <SelectField
                label="Status"
                name="status"
                defaultValue={p.status}
                options={REGISTRATION_STATUSES.map((s) => ({ value: s, label: s }))}
              />
              <div className="flex items-end pb-2">
                <CheckboxField label="In directory" name="networkingOptIn" defaultChecked={p.networkingOptIn} />
              </div>
            </div>
            {p.bio && <p className="text-sm text-ink/55">Bio: {p.bio}</p>}
            {p.interests && <p className="text-sm text-ink/55">Interests: {p.interests}</p>}
            <SubmitButton>Save</SubmitButton>
          </form>
        </Card>

        {/* Schedule + connections */}
        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold">Schedule ({agenda.length})</h2>
            <div className="mt-3 space-y-2">
              {agenda.length === 0 && <p className="text-sm text-ink/45">No sessions saved.</p>}
              {agenda.map(({ session }) => (
                <div key={session.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink/50">{formatTimeRange(session.startTime, session.endTime)}</span>
                    <KindBadge kind={session.kind} />
                  </div>
                  <div className="text-ink/80">{session.title}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold">Connections ({connections.length})</h2>
            <div className="mt-3 space-y-2 text-sm">
              {connections.length === 0 && <p className="text-ink/45">No connections.</p>}
              {connections.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-ink/80">{c.dir} {c.who.firstName} {c.who.lastName}</span>
                  <span className="mono text-[10px] uppercase tracking-wide text-ink/45">{c.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
