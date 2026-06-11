import Link from "next/link";
import { db } from "@/lib/db";
import { getActiveEvent } from "@/lib/queries";
import { formatMoney, formatDateRange } from "@/lib/domain";

export default async function AdminDashboard() {
  const event = await getActiveEvent();
  const anyEvent = event ?? (await db.event.findFirst({ orderBy: { startDate: "asc" } }));

  if (!anyEvent) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-ink/60">No event found. Seed the database to begin.</p>
      </div>
    );
  }

  const [days, tracks, sessions, tickets, registrations, revenue] = await Promise.all([
    db.eventDay.count({ where: { eventId: anyEvent.id } }),
    db.track.count({ where: { eventId: anyEvent.id } }),
    db.session.count({ where: { eventId: anyEvent.id } }),
    db.ticketType.count({ where: { eventId: anyEvent.id } }),
    db.registration.count({ where: { eventId: anyEvent.id } }),
    db.registration.findMany({
      where: { eventId: anyEvent.id, status: { not: "CANCELLED" } },
      include: { ticketType: { select: { priceCents: true } } },
    }),
  ]);

  const totalRevenue = revenue.reduce((sum, r) => sum + r.ticketType.priceCents, 0);

  const stats = [
    { label: "Registrations", value: registrations, href: "/admin/registrations" },
    { label: "Revenue", value: formatMoney(totalRevenue), href: "/admin/registrations" },
    { label: "Sessions", value: sessions, href: "/admin/sessions" },
    { label: "Tracks", value: tracks, href: "/admin/tracks" },
    { label: "Ticket types", value: tickets, href: "/admin/tickets" },
    { label: "Days", value: days, href: "/admin/event" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{anyEvent.name}</h1>
          <p className="mt-1 text-sm text-ink/55">
            {anyEvent.city} · {formatDateRange(anyEvent.startDate, anyEvent.endDate)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            anyEvent.published
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {anyEvent.published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm text-ink/55">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/admin/sessions/new" className="rounded-full bg-ink px-4 py-2 font-semibold text-white hover:bg-brand">
            + Add a session
          </Link>
          <Link href="/admin/tracks" className="rounded-full border border-black/15 px-4 py-2 font-semibold hover:bg-paper">
            + Add a track
          </Link>
          <Link href="/admin/tickets" className="rounded-full border border-black/15 px-4 py-2 font-semibold hover:bg-paper">
            + Add a ticket type
          </Link>
          <Link href="/schedule" className="rounded-full border border-black/15 px-4 py-2 font-semibold hover:bg-paper">
            View public schedule →
          </Link>
        </div>
      </div>
    </div>
  );
}
