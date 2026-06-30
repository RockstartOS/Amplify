"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAttendeeId } from "@/lib/attendee-auth";

/** Send a connection request to another participant. */
export async function requestConnectionAction(formData: FormData) {
  const me = await getAttendeeId();
  const addresseeId = String(formData.get("addresseeId") ?? "");
  const message = String(formData.get("message") ?? "").trim() || null;
  if (!me || !addresseeId || me === addresseeId) return;

  // If a connection already exists either way, do nothing.
  const existing = await db.connection.findFirst({
    where: {
      OR: [
        { requesterId: me, addresseeId },
        { requesterId: addresseeId, addresseeId: me },
      ],
    },
  });
  if (existing) return;

  await db.connection.create({
    data: { requesterId: me, addresseeId, message, status: "PENDING" },
  });
  revalidatePath("/network");
}

/** Accept or decline a pending request addressed to me. */
export async function respondConnectionAction(formData: FormData) {
  const me = await getAttendeeId();
  const connectionId = String(formData.get("connectionId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!me || !connectionId || !["ACCEPTED", "DECLINED"].includes(decision)) return;

  const conn = await db.connection.findUnique({ where: { id: connectionId } });
  if (!conn || conn.addresseeId !== me) return; // only the addressee can respond

  await db.connection.update({
    where: { id: connectionId },
    data: { status: decision },
  });
  revalidatePath("/network");
}

/** Withdraw a request I sent, or remove an existing connection. */
export async function removeConnectionAction(formData: FormData) {
  const me = await getAttendeeId();
  const connectionId = String(formData.get("connectionId") ?? "");
  if (!me || !connectionId) return;

  const conn = await db.connection.findUnique({ where: { id: connectionId } });
  if (!conn || (conn.requesterId !== me && conn.addresseeId !== me)) return;

  await db.connection.delete({ where: { id: connectionId } });
  revalidatePath("/network");
}
