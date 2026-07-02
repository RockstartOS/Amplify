import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AttendeeLoginForm } from "./login-form";
import { SocialAuth } from "@/components/social-auth";
import { getAttendeeId } from "@/lib/attendee-auth";

export const metadata: Metadata = { title: "Log in" };

const errorMessages: Record<string, string> = {
  oauth_denied: "Social login was cancelled. Try again or use email.",
  oauth_state: "Your login session expired. Please try again.",
  oauth_profile: "We couldn't read your profile from that provider.",
  not_configured: "That provider isn't configured yet.",
  no_event: "Registration isn't open yet.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAttendeeId()) redirect("/network");
  const { error } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-5 py-20">
        <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
        <p className="mt-2 text-ink/60">
          Access your schedule and the participant network.
        </p>
        {error && errorMessages[error] && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-700">
            {errorMessages[error]}
          </p>
        )}
        <div className="mt-6 space-y-5 rounded-2xl border border-ink/10 bg-surface p-6">
          <SocialAuth label="Log in" />
          <AttendeeLoginForm />
        </div>
        <p className="mt-4 text-center text-sm text-ink/50">
          Don&apos;t have a ticket yet?{" "}
          <Link href="/register" className="font-medium text-brand underline">
            Register here
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
