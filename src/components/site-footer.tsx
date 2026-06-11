import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-ink text-white/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-sm font-bold">
              A
            </span>
            Amplify <span className="text-accent">You</span>
          </div>
          <p className="mt-3 max-w-xs text-sm">
            Where investors and founders amplify what&apos;s next. The first
            edition lands in Amsterdam.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Event</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/#about" className="hover:text-accent">About</Link></li>
            <li><Link href="/schedule" className="hover:text-accent">Schedule</Link></li>
            <li><Link href="/#tracks" className="hover:text-accent">Tracks</Link></li>
            <li><Link href="/tickets" className="hover:text-accent">Tickets</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Attendees</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/register" className="hover:text-accent">Register</Link></li>
            <li><Link href="/agenda" className="hover:text-accent">My agenda</Link></li>
            <li><Link href="/admin" className="hover:text-accent">Organiser login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Series</h3>
          <p className="mt-3 text-sm">
            Amplify You is a travelling series. Amsterdam first — more cities to
            follow.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Amplify You. All rights reserved.</span>
          <span>Built for the Amplify You series.</span>
        </div>
      </div>
    </footer>
  );
}
