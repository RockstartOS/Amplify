"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { generateReference } from "@/lib/domain";
import { setAttendeeReference } from "@/lib/auth";

export type RegisterState = { error?: string };

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const ticketTypeId = String(formData.get("ticketTypeId") ?? "");

  if (!firstName || !lastName || !email) {
    return { error: "Please fill in your name and email." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!ticketTypeId) {
    return { error: "Please choose a ticket type." };
  }

  const ticket = await db.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { _count: { select: { registrations: true } } },
  });
  if (!ticket || !ticket.active) {
    return { error: "That ticket type is no longer available." };
  }
  if (ticket.quantity != null && ticket._count.registrations >= ticket.quantity) {
    return { error: `${ticket.name} is sold out. Please choose another pass.` };
  }

  const reference = generateReference();
  await db.registration.create({
    data: {
      reference,
      eventId: ticket.eventId,
      ticketTypeId: ticket.id,
      firstName,
      lastName,
      email,
      company: company || null,
      role: role || null,
      status: "CONFIRMED",
    },
  });

  // Remember the attendee so they can build an agenda straight away.
  await setAttendeeReference(reference);

  redirect(`/register/success?ref=${reference}`);
}
