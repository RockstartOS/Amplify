import Link from "next/link";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin" };

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/event", label: "Event & days" },
  { href: "/admin/tracks", label: "Tracks" },
  { href: "/admin/sessions", label: "Schedule" },
  { href: "/admin/speakers", label: "Speakers" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/participants", label: "Participants" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdmin();

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-brand-gradient px-5">
        <div className="w-full max-w-sm rounded-2xl bg-surface p-8 ">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-sm font-bold text-cream">
              A
            </span>
            Amplify Europe · Organiser
          </div>
          <h1 className="mt-6 text-xl font-bold">Sign in to the backend</h1>
          <p className="mt-1 text-sm text-ink/55">
            Manage the event, schedule, tickets and registrations.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-4 text-xs text-ink/40">
            Default demo password: <code className="font-mono">amplify</code>{" "}
            (override with the <code className="font-mono">ADMIN_PASSWORD</code>{" "}
            env var).
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper md:flex-row">
      <aside className="border-b border-ink/10 bg-surface md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-5">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-sm font-bold text-cream">
              A
            </span>
            Organiser
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-paper hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden p-3 md:block">
          <form action={logoutAction}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink/50 hover:bg-paper hover:text-red-400">
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-1 block rounded-lg px-3 py-2 text-sm text-ink/50 hover:bg-paper"
          >
            ← View public site
          </Link>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
