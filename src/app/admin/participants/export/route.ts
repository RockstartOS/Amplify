import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/domain";

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const event = await db.event.findFirst({ orderBy: { startDate: "asc" } });
  if (!event) return new NextResponse("No event", { status: 404 });

  const regs = await db.registration.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "asc" },
    include: {
      ticketType: true,
      _count: { select: { agenda: true } },
    },
  });

  const header = [
    "Reference", "First name", "Last name", "Email", "Company", "Role",
    "Ticket", "Price", "Status", "Networking", "Sessions saved", "Headline", "Registered",
  ];
  const rows = regs.map((r) => [
    r.reference, r.firstName, r.lastName, r.email, r.company, r.role,
    r.ticketType.name, formatMoney(r.ticketType.priceCents, r.ticketType.currency),
    r.status, r.networkingOptIn ? "opted-in" : "hidden",
    r._count.agenda, r.headline, r.createdAt.toISOString().slice(0, 10),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amplify-europe-participants.csv"`,
    },
  });
}
