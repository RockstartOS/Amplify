import Link from "next/link";
import { db } from "@/lib/db";
import { AdminHeader, Card } from "@/components/admin-ui";
import { formatMoney, REGISTRATION_STATUSES } from "@/lib/domain";
import {
  updateRegistrationStatusAction,
  deleteRegistrationAction,
} from "../actions";

const statusStyles: Record<string, string> = {
  CONFIRMED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-300",
};

export default async function AdminParticipantsPage() {
  const event = await db.event.findFirst({ orderBy: { startDate: "asc" } });
  if (!event) return <p>No event found.</p>;

  const participants = await db.registration.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
    include: {
      ticketType: true,
      _count: { select: { agenda: true, connectionsSent: true, connectionsReceived: true } },
    },
  });

  const active = participants.filter((r) => r.status !== "CANCELLED");
  const revenue = active.reduce((s, r) => s + r.ticketType.priceCents, 0);
  const optedIn = participants.filter((r) => r.networkingOptIn).length;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Participants"
        description={`${participants.length} total · ${active.length} active · ${optedIn} in directory · ${formatMoney(revenue)} revenue`}
        action={
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- route handler download, not a page
          <a
            href="/admin/participants/export"
            className="rounded-full border border-cream/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface"
          >
            ↓ Export CSV
          </a>
        }
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-cream/10 text-left text-xs uppercase tracking-wide text-ink/45">
            <tr>
              <th className="px-5 py-3">Participant</th>
              <th className="px-5 py-3">Ticket</th>
              <th className="px-5 py-3">Net.</th>
              <th className="px-5 py-3">Sessions</th>
              <th className="px-5 py-3">Conns</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-ink/50">No participants yet.</td></tr>
            )}
            {participants.map((r) => (
              <tr key={r.id} className="border-b border-cream/10 last:border-0">
                <td className="px-5 py-3">
                  <Link href={`/admin/participants/${r.id}`} className="font-medium hover:text-brand">
                    {r.firstName} {r.lastName}
                  </Link>
                  <div className="text-xs text-ink/50">{r.email}</div>
                  {r.company && <div className="text-xs text-ink/40">{r.role ? `${r.role} · ` : ""}{r.company}</div>}
                </td>
                <td className="px-5 py-3">
                  {r.ticketType.name}
                  <div className="text-xs text-ink/40">{formatMoney(r.ticketType.priceCents, r.ticketType.currency)}</div>
                </td>
                <td className="px-5 py-3 text-ink/60">{r.networkingOptIn ? "✓" : "—"}</td>
                <td className="px-5 py-3 text-ink/60">{r._count.agenda}</td>
                <td className="px-5 py-3 text-ink/60">{r._count.connectionsSent + r._count.connectionsReceived}</td>
                <td className="px-5 py-3">
                  <form action={updateRegistrationStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <span className={`mono rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ${statusStyles[r.status] ?? "border-cream/15 bg-cream/5 text-cream/60"}`}>
                      {r.status}
                    </span>
                    <select name="status" defaultValue={r.status} className="rounded border border-cream/15 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-brand">
                      {REGISTRATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="rounded bg-indigo px-2 py-1 text-xs font-semibold text-cream hover:bg-brand">Set</button>
                  </form>
                </td>
                <td className="px-5 py-3">
                  <form action={deleteRegistrationAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-xs font-semibold text-ink/40 hover:text-red-400">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
