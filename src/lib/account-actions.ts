"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  verifyPassword,
  hashPassword,
  startAttendeeSession,
  endAttendeeSession,
  getAttendeeId,
} from "@/lib/attendee-auth";

export type LoginState = { error?: string };

export async function loginAttendeeAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const registration = await db.registration.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (!registration || !verifyPassword(password, registration.passwordHash)) {
    return { error: "Incorrect email or password." };
  }

  await startAttendeeSession(registration.id);
  redirect("/network");
}

export async function logoutAttendeeAction() {
  await endAttendeeSession();
  redirect("/");
}

export async function updateProfileAction(formData: FormData) {
  const id = await getAttendeeId();
  if (!id) return;
  await db.registration.update({
    where: { id },
    data: {
      firstName: String(formData.get("firstName") || "").trim() || undefined,
      lastName: String(formData.get("lastName") || "").trim() || undefined,
      company: String(formData.get("company") || "") || null,
      role: String(formData.get("role") || "") || null,
      headline: String(formData.get("headline") || "") || null,
      bio: String(formData.get("bio") || "") || null,
      interests: String(formData.get("interests") || "") || null,
      networkingOptIn: formData.get("networkingOptIn") === "on",
    },
  });
  revalidatePath("/account");
  revalidatePath("/network");
}

export async function changePasswordAction(formData: FormData) {
  const id = await getAttendeeId();
  if (!id) return;
  const next = String(formData.get("newPassword") || "");
  if (next.length < 6) return;
  await db.registration.update({
    where: { id },
    data: { passwordHash: hashPassword(next) },
  });
  revalidatePath("/account");
}
