import { db } from "@/lib/db";

/** The event shown on the public site: the soonest upcoming published edition. */
export async function getActiveEvent() {
  return db.event.findFirst({
    where: { published: true },
    orderBy: { startDate: "asc" },
  });
}

/** Full programme for an event, ordered for display. */
export async function getScheduleForEvent(eventId: string) {
  return db.eventDay.findMany({
    where: { eventId },
    orderBy: { position: "asc" },
    include: {
      sessions: {
        orderBy: { startTime: "asc" },
        include: {
          track: true,
          speakers: {
            orderBy: { position: "asc" },
            include: { speaker: true },
          },
        },
      },
    },
  });
}

export async function getTracksForEvent(eventId: string) {
  return db.track.findMany({
    where: { eventId },
    orderBy: { position: "asc" },
    include: { _count: { select: { sessions: true } } },
  });
}

export async function getTicketTypesForEvent(eventId: string, onlyActive = false) {
  return db.ticketType.findMany({
    where: { eventId, ...(onlyActive ? { active: true } : {}) },
    orderBy: { position: "asc" },
  });
}

/** A registration plus the sessions the attendee has saved to their agenda. */
export async function getRegistrationByReference(reference: string) {
  return db.registration.findUnique({
    where: { reference },
    include: {
      event: true,
      ticketType: true,
      agenda: {
        include: {
          session: {
            include: { track: true, day: true },
          },
        },
      },
    },
  });
}

export async function getTicketAvailability(ticketTypeId: string) {
  const ticket = await db.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { _count: { select: { registrations: true } } },
  });
  if (!ticket) return null;
  const sold = ticket._count.registrations;
  const remaining = ticket.quantity == null ? null : Math.max(ticket.quantity - sold, 0);
  return { ticket, sold, remaining };
}
