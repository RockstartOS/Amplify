"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAttendeeId } from "@/lib/attendee-auth";

/** Add or remove a session from the logged-in attendee's personal schedule. */
export async function toggleAgendaItem(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  const registrationId = await getAttendeeId();
  if (!sessionId || !registrationId) return;

  const existing = await db.agendaItem.findUnique({
    where: { registrationId_sessionId: { registrationId, sessionId } },
  });

  if (existing) {
    await db.agendaItem.delete({ where: { id: existing.id } });
  } else {
    await db.agendaItem.create({ data: { registrationId, sessionId } });
  }

  revalidatePath("/schedule");
  revalidatePath("/agenda");
}
