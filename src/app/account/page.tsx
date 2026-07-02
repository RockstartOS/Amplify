import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentAttendee } from "@/lib/attendee-auth";
import {
  updateProfileAction,
  changePasswordAction,
  logoutAttendeeAction,
} from "@/lib/account-actions";

export const metadata: Metadata = { title: "My account" };

const input =
  "mt-1 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default async function AccountPage() {
  const me = await getCurrentAttendee();
  if (!me) redirect("/login");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 py-12">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My account</h1>
              <p className="mt-1 text-ink/60">
                {me.email} · {me.ticketType.name} ·{" "}
                <span className="font-mono text-brand">{me.reference}</span>
              </p>
            </div>
            <form action={logoutAttendeeAction}>
              <button className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface">
                Log out
              </button>
            </form>
          </header>

          {/* Profile */}
          <section className="mt-8 rounded-2xl border border-ink/10 bg-surface p-6">
            <h2 className="font-semibold">Networking profile</h2>
            <p className="mt-1 text-sm text-ink/55">
              This is what other participants see in the directory.
            </p>
            <form action={updateProfileAction} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-ink/80">First name</span>
                  <input name="firstName" defaultValue={me.firstName} className={input} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-ink/80">Last name</span>
                  <input name="lastName" defaultValue={me.lastName} className={input} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-ink/80">Company / fund</span>
                  <input name="company" defaultValue={me.company ?? ""} className={input} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-ink/80">Role</span>
                  <input name="role" defaultValue={me.role ?? ""} className={input} />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-ink/80">Headline</span>
                <input name="headline" defaultValue={me.headline ?? ""} placeholder="One line about what you do" className={input} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink/80">Bio</span>
                <textarea name="bio" rows={3} defaultValue={me.bio ?? ""} className={input} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink/80">Interests</span>
                <input name="interests" defaultValue={me.interests ?? ""} placeholder="Comma-separated, e.g. Energy, Pre-seed" className={input} />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
                <input
                  type="checkbox"
                  name="networkingOptIn"
                  defaultChecked={me.networkingOptIn}
                  className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
                />
                Show me in the participant directory
              </label>
              <button className="rounded-full bg-indigo px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brand">
                Save profile
              </button>
            </form>
          </section>

          {/* Password */}
          <section className="mt-6 rounded-2xl border border-ink/10 bg-surface p-6">
            <h2 className="font-semibold">Change password</h2>
            <form action={changePasswordAction} className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block flex-1">
                <span className="text-sm font-medium text-ink/80">New password</span>
                <input name="newPassword" type="password" minLength={6} className={input} />
              </label>
              <button className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-paper">
                Update
              </button>
            </form>
          </section>

          <div className="mt-6 flex gap-3 text-sm">
            <Link href="/agenda" className="font-medium text-brand hover:underline">My schedule →</Link>
            <Link href="/network" className="font-medium text-brand hover:underline">The network →</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
