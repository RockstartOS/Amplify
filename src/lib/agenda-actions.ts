"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAttendeeReference, setAttendeeReference, clearAttendeeReference } from "@/lib/auth";

/** Add or remove a session from the signed-in attendee's personal agenda. */
export async function toggleAgendaItem(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  const reference = await getAttendeeReference();
  if (!sessionId || !reference) return;

  const registration = await db.registration.findUnique({
    where: { reference },
    select: { id: true },
  });
  if (!registration) return;

  const existing = await db.agendaItem.findUnique({
    where: {
      registrationId_sessionId: {
        registrationId: registration.id,
        sessionId,
      },
    },
  });

  if (existing) {
    await db.agendaItem.delete({ where: { id: existing.id } });
  } else {
    await db.agendaItem.create({
      data: { registrationId: registration.id, sessionId },
    });
  }

  revalidatePath("/schedule");
  revalidatePath("/agenda");
}

export type LinkState = { error?: string };

/** Look up a registration by reference and remember it in a cookie. */
export async function linkAttendeeAction(
  _prev: LinkState,
  formData: FormData
): Promise<LinkState> {
  const reference = String(formData.get("reference") ?? "").trim().toUpperCase();
  if (!reference) return { error: "Enter your reference code." };

  const registration = await db.registration.findUnique({
    where: { reference },
    select: { id: true },
  });
  if (!registration) {
    return { error: "We couldn't find that reference. Check and try again." };
  }

  await setAttendeeReference(reference);
  revalidatePath("/agenda");
  revalidatePath("/schedule");
  return {};
}

export async function signOutAttendee() {
  await clearAttendeeReference();
  revalidatePath("/agenda");
  revalidatePath("/schedule");
}
