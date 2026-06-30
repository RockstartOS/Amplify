import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AttendeeLoginForm } from "./login-form";
import { getAttendeeId } from "@/lib/attendee-auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getAttendeeId()) redirect("/network");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-5 py-20">
        <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
        <p className="mt-2 text-ink/60">
          Access your schedule and the participant network.
        </p>
        <div className="mt-6 rounded-2xl border border-cream/10 bg-surface p-6">
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
