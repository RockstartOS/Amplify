import { cookies } from "next/headers";
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import { db } from "@/lib/db";

// Attendee authentication. The Registration row IS the account: people log in
// with the email + password they set at registration. Sessions are a signed
// cookie holding the registration id (HMAC-verified, so it can't be forged).

const ATTENDEE_COOKIE = "amplify_session";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "amplify-dev-session-secret";

// ── Password hashing (scrypt, no external deps) ──
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
}

// ── Signed session token ──
function sign(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function makeToken(registrationId: string): string {
  return `${registrationId}.${sign(registrationId)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const id = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(id);
  if (sig.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? id : null;
}

// ── Session helpers ──
export async function startAttendeeSession(registrationId: string): Promise<void> {
  const store = await cookies();
  store.set(ATTENDEE_COOKIE, makeToken(registrationId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function endAttendeeSession(): Promise<void> {
  const store = await cookies();
  store.delete(ATTENDEE_COOKIE);
}

/** The currently logged-in attendee's registration id, or null. */
export async function getAttendeeId(): Promise<string | null> {
  const store = await cookies();
  return readToken(store.get(ATTENDEE_COOKIE)?.value);
}

/** The currently logged-in attendee (with ticket + event), or null. */
export async function getCurrentAttendee() {
  const id = await getAttendeeId();
  if (!id) return null;
  return db.registration.findUnique({
    where: { id },
    include: { event: true, ticketType: true },
  });
}
