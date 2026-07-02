import { db } from "@/lib/db";
import { getActiveEvent } from "@/lib/queries";
import { startAttendeeSession } from "@/lib/attendee-auth";
import { setPendingOAuth, type OAuthProfile, type ProviderId } from "@/lib/oauth";

/**
 * Given a verified social profile, log the attendee in if an account exists for
 * the active event, otherwise stash the identity and send them to finish
 * registration (choose a pass). Returns the path to redirect to.
 */
export async function handleOAuthProfile(
  provider: ProviderId,
  profile: OAuthProfile
): Promise<string> {
  const event = await getActiveEvent();
  if (!event) return "/login?error=no_event";

  const existing = await db.registration.findFirst({
    where: { eventId: event.id, email: profile.email },
    select: { id: true },
  });

  if (existing) {
    await startAttendeeSession(existing.id);
    return "/network";
  }

  await setPendingOAuth({
    provider,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
  });
  return "/register";
}
