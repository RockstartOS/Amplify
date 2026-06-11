import { db } from "@/lib/db";
import { AdminHeader, Card } from "@/components/admin-ui";
import { formatMoney } from "@/lib/domain";
import {
  updateRegistrationStatusAction,
  deleteRegistrationAction,
} from "../actions";
import { REGISTRATION_STATUSES } from "@/lib/domain";

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminRegistrationsPage() {
  const event = await db.event.findFirst({ orderBy: { startDate: "asc" } });
  if (!event) return <p>No event found.</p>;

  const registrations = await db.registration.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
    include: { ticketType: true, _count: { select: { agenda: true } } },
  });

  const confirmed = registrations.filter((r) => r.status !== "CANCELLED");
  const revenue = confirmed.reduce((s, r) => s + r.ticketType.priceCents, 0);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Registrations"
        description={`${registrations.length} total · ${confirmed.length} active · ${formatMoney(revenue)} revenue`}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-ink/45">
            <tr>
              <th className="px-5 py-3">Attendee</th>
              <th className="px-5 py-3">Ticket</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Agenda</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink/50">
                  No registrations yet.
                </td>
              </tr>
            )}
            {registrations.map((r) => (
              <tr key={r.id} className="border-b border-black/5 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-medium">
                    {r.firstName} {r.lastName}
                  </div>
                  <div className="text-xs text-ink/50">{r.email}</div>
                  {r.company && (
                    <div className="text-xs text-ink/40">
                      {r.role ? `${r.role} · ` : ""}
                      {r.company}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3">
                  {r.ticketType.name}
                  <div className="text-xs text-ink/40">
                    {formatMoney(r.ticketType.priceCents, r.ticketType.currency)}
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-brand">{r.reference}</td>
                <td className="px-5 py-3 text-ink/60">{r._count.agenda}</td>
                <td className="px-5 py-3">
                  <form action={updateRegistrationStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        statusStyles[r.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {r.status}
                    </span>
                    <select
                      name="status"
                      defaultValue={r.status}
                      className="rounded border border-black/15 px-1.5 py-1 text-xs outline-none focus:border-brand"
                    >
                      {REGISTRATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button className="rounded bg-ink px-2 py-1 text-xs font-semibold text-white hover:bg-brand">
                      Set
                    </button>
                  </form>
                </td>
                <td className="px-5 py-3">
                  <form action={deleteRegistrationAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-xs font-semibold text-ink/40 hover:text-red-600">
                      Delete
                    </button>
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
