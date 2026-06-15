import Link from "next/link";

const navItems = [
  { href: "/#about", label: "About" },
  { href: "/schedule", label: "Schedule" },
  { href: "/#tracks", label: "Tracks" },
  { href: "/tickets", label: "Tickets" },
  { href: "/agenda", label: "My agenda" },
];

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  return (
    <header
      className={
        transparent
          ? "absolute inset-x-0 top-0 z-20"
          : "sticky top-0 z-20 border-b border-cream/10 bg-paper/85 backdrop-blur"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-cream"
        >
          Amplify <span className="text-indigo">You</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mono text-[10px] font-medium uppercase tracking-[0.22em] text-cream/50 transition-colors hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/register"
          className="rounded-full bg-indigo px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-indigo-soft"
        >
          Get tickets
        </Link>
      </div>
    </header>
  );
}
