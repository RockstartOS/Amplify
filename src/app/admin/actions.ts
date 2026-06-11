"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { signInAdmin, signOutAdmin } from "@/lib/auth";
import { slugify, wallTimeToUtc } from "@/lib/domain";

function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const ok = await signInAdmin(password);
  if (!ok) return { error: "Incorrect password." };
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logoutAction() {
  await signOutAdmin();
  redirect("/admin");
}

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export async function updateEventAction(formData: FormData) {
  const id = String(formData.get("id"));
  await db.event.update({
    where: { id },
    data: {
      name: String(formData.get("name")),
      tagline: String(formData.get("tagline") || "") || null,
      description: String(formData.get("description") || "") || null,
      city: String(formData.get("city")),
      venue: String(formData.get("venue") || "") || null,
      startDate: wallTimeToUtc(String(formData.get("startDate"))),
      endDate: wallTimeToUtc(String(formData.get("endDate"))),
      published: formData.get("published") === "on",
    },
  });
  revalidateAll();
  redirect("/admin/event");
}

// ---------------------------------------------------------------------------
// Days
// ---------------------------------------------------------------------------

export async function createDayAction(formData: FormData) {
  const eventId = String(formData.get("eventId"));
  const count = await db.eventDay.count({ where: { eventId } });
  await db.eventDay.create({
    data: {
      eventId,
      name: String(formData.get("name")),
      theme: String(formData.get("theme") || "") || null,
      description: String(formData.get("description") || "") || null,
      date: wallTimeToUtc(String(formData.get("date")) + "T00:00"),
      position: count,
    },
  });
  revalidateAll();
  redirect("/admin/event");
}

export async function deleteDayAction(formData: FormData) {
  await db.eventDay.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
  redirect("/admin/event");
}

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

export async function createTrackAction(formData: FormData) {
  const eventId = String(formData.get("eventId"));
  const name = String(formData.get("name"));
  const count = await db.track.count({ where: { eventId } });
  await db.track.create({
    data: {
      eventId,
      name,
      slug: slugify(name.replace(/^amplify\s+/i, "")),
      color: String(formData.get("color") || "#6366f1"),
      description: String(formData.get("description") || "") || null,
      position: count,
    },
  });
  revalidateAll();
  redirect("/admin/tracks");
}

export async function updateTrackAction(formData: FormData) {
  const id = String(formData.get("id"));
  await db.track.update({
    where: { id },
    data: {
      name: String(formData.get("name")),
      color: String(formData.get("color")),
      description: String(formData.get("description") || "") || null,
    },
  });
  revalidateAll();
  redirect("/admin/tracks");
}

export async function deleteTrackAction(formData: FormData) {
  await db.track.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
  redirect("/admin/tracks");
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

async function sessionDataFromForm(formData: FormData) {
  const trackId = String(formData.get("trackId") || "");
  const capacityRaw = String(formData.get("capacity") || "").trim();
  return {
    dayId: String(formData.get("dayId")),
    trackId: trackId || null,
    title: String(formData.get("title")),
    description: String(formData.get("description") || "") || null,
    kind: String(formData.get("kind") || "TALK"),
    room: String(formData.get("room") || "") || null,
    capacity: capacityRaw ? Number(capacityRaw) : null,
    startTime: wallTimeToUtc(String(formData.get("startTime"))),
    endTime: wallTimeToUtc(String(formData.get("endTime"))),
  };
}

export async function createSessionAction(formData: FormData) {
  const eventId = String(formData.get("eventId"));
  const data = await sessionDataFromForm(formData);
  const speakerIds = formData.getAll("speakerIds").map(String);
  const session = await db.session.create({
    data: {
      eventId,
      ...data,
      speakers: {
        create: speakerIds.map((speakerId, position) => ({ speakerId, position })),
      },
    },
  });
  revalidateAll();
  redirect(`/admin/sessions?day=${session.dayId}`);
}

export async function updateSessionAction(formData: FormData) {
  const id = String(formData.get("id"));
  const data = await sessionDataFromForm(formData);
  const speakerIds = formData.getAll("speakerIds").map(String);
  await db.session.update({ where: { id }, data });
  await db.sessionSpeaker.deleteMany({ where: { sessionId: id } });
  if (speakerIds.length) {
    await db.sessionSpeaker.createMany({
      data: speakerIds.map((speakerId, position) => ({
        sessionId: id,
        speakerId,
        position,
      })),
    });
  }
  revalidateAll();
  redirect(`/admin/sessions?day=${data.dayId}`);
}

export async function deleteSessionAction(formData: FormData) {
  await db.session.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
  redirect("/admin/sessions");
}

// ---------------------------------------------------------------------------
// Speakers
// ---------------------------------------------------------------------------

export async function createSpeakerAction(formData: FormData) {
  await db.speaker.create({
    data: {
      name: String(formData.get("name")),
      title: String(formData.get("title") || "") || null,
      company: String(formData.get("company") || "") || null,
      bio: String(formData.get("bio") || "") || null,
    },
  });
  revalidateAll();
  redirect("/admin/speakers");
}

export async function updateSpeakerAction(formData: FormData) {
  await db.speaker.update({
    where: { id: String(formData.get("id")) },
    data: {
      name: String(formData.get("name")),
      title: String(formData.get("title") || "") || null,
      company: String(formData.get("company") || "") || null,
      bio: String(formData.get("bio") || "") || null,
    },
  });
  revalidateAll();
  redirect("/admin/speakers");
}

export async function deleteSpeakerAction(formData: FormData) {
  await db.speaker.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
  redirect("/admin/speakers");
}

// ---------------------------------------------------------------------------
// Ticket types
// ---------------------------------------------------------------------------

function ticketDataFromForm(formData: FormData) {
  const quantityRaw = String(formData.get("quantity") || "").trim();
  const priceRaw = String(formData.get("price") || "0").trim();
  return {
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    priceCents: Math.round(Number(priceRaw || 0) * 100),
    currency: String(formData.get("currency") || "EUR"),
    quantity: quantityRaw ? Number(quantityRaw) : null,
    active: formData.get("active") === "on",
  };
}

export async function createTicketAction(formData: FormData) {
  const eventId = String(formData.get("eventId"));
  const count = await db.ticketType.count({ where: { eventId } });
  await db.ticketType.create({
    data: { eventId, position: count, ...ticketDataFromForm(formData) },
  });
  revalidateAll();
  redirect("/admin/tickets");
}

export async function updateTicketAction(formData: FormData) {
  await db.ticketType.update({
    where: { id: String(formData.get("id")) },
    data: ticketDataFromForm(formData),
  });
  revalidateAll();
  redirect("/admin/tickets");
}

export async function deleteTicketAction(formData: FormData) {
  await db.ticketType.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
  redirect("/admin/tickets");
}

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

export async function updateRegistrationStatusAction(formData: FormData) {
  await db.registration.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status")) },
  });
  revalidateAll();
  redirect("/admin/registrations");
}

export async function deleteRegistrationAction(formData: FormData) {
  await db.registration.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
  redirect("/admin/registrations");
}
