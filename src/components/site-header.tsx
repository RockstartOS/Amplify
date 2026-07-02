import Link from "next/link";
import { getAttendeeId } from "@/lib/attendee-auth";

const navItems = [
  { href: "/#about", label: "About" },
  { href: "/schedule", label: "Schedule" },
  { href: "/#tracks", label: "Tracks" },
  { href: "/tickets", label: "Tickets" },
  { href: "/network", label: "Network" },
];

export async function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const loggedIn = Boolean(await getAttendeeId());

  return (
    <header
      className={
        transparent
          ? "absolute inset-x-0 top-0 z-20"
          : "sticky top-0 z-20 border-b border-ink/10 bg-paper/85 backdrop-blur"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink"
        >
          Amplify <span className="text-indigo">Europe</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink/50 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/account"
              className="mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink/50 transition-colors hover:text-ink"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="mono hidden text-[10px] font-medium uppercase tracking-[0.22em] text-ink/50 transition-colors hover:text-ink sm:block"
            >
              Log in
            </Link>
          )}
          <Link
            href="/register"
            className="rounded-full bg-indigo px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-indigo-soft"
          >
            Get tickets
          </Link>
        </div>
      </div>
    </header>
  );
}
