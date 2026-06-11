import { cookies } from "next/headers";

// Lightweight gate for the admin backend. For a production deployment, replace
// with a real identity provider — this is a shared-password session good enough
// for a single-event control panel and demos.

const ADMIN_COOKIE = "amplify_admin";
const ATTENDEE_COOKIE = "amplify_ref";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "amplify";
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === getAdminPassword();
}

export async function signInAdmin(password: string): Promise<boolean> {
  if (password !== getAdminPassword()) return false;
  const store = await cookies();
  store.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return true;
}

export async function signOutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/** The reference code of the attendee browsing the public site, if known. */
export async function getAttendeeReference(): Promise<string | null> {
  const store = await cookies();
  return store.get(ATTENDEE_COOKIE)?.value ?? null;
}

export async function setAttendeeReference(reference: string): Promise<void> {
  const store = await cookies();
  store.set(ATTENDEE_COOKIE, reference, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function clearAttendeeReference(): Promise<void> {
  const store = await cookies();
  store.delete(ATTENDEE_COOKIE);
}
