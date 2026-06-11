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
          : "sticky top-0 z-20 border-b border-black/10 bg-paper/85 backdrop-blur"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className={`flex items-center gap-2 font-semibold tracking-tight ${
            transparent ? "text-white" : "text-ink"
          }`}
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-sm font-bold text-white">
            A
          </span>
          <span>
            Amplify <span className="text-accent">You</span>
          </span>
        </Link>

        <nav
          className={`hidden items-center gap-6 text-sm md:flex ${
            transparent ? "text-white/80" : "text-ink/70"
          }`}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
          >
            Get tickets
          </Link>
        </div>
      </div>
    </header>
  );
}
