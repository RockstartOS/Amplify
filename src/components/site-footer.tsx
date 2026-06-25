import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-cream/10 bg-surface text-cream/65">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="font-display text-lg font-bold text-cream">
            Amplify <span className="text-indigo">Europe</span>
          </div>
          <p className="mt-3 max-w-xs text-sm">
            Where investors and founders amplify what&apos;s next. The first
            edition lands in Amsterdam.
          </p>
        </div>

        <div>
          <h3 className="eyebrow">Event</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/#about" className="transition-colors hover:text-cream">About</Link></li>
            <li><Link href="/schedule" className="transition-colors hover:text-cream">Schedule</Link></li>
            <li><Link href="/#tracks" className="transition-colors hover:text-cream">Tracks</Link></li>
            <li><Link href="/tickets" className="transition-colors hover:text-cream">Tickets</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Attendees</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/register" className="transition-colors hover:text-cream">Register</Link></li>
            <li><Link href="/agenda" className="transition-colors hover:text-cream">My agenda</Link></li>
            <li><Link href="/admin" className="transition-colors hover:text-cream">Organiser login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Series</h3>
          <p className="mt-4 text-sm">
            Amplify Europe is a travelling series. Amsterdam first — more cities to
            follow.
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-cream/40 sm:flex-row">
          <span>© {new Date().getFullYear()} Amplify Europe. All rights reserved.</span>
          <span className="mono tracking-[0.2em] uppercase">Amplify Europe · Amsterdam 2027</span>
        </div>
      </div>
    </footer>
  );
}
