import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getRegistrationByReference } from "@/lib/queries";
import { formatMoney } from "@/lib/domain";

export const metadata: Metadata = { title: "You're registered" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) notFound();
  const registration = await getRegistrationByReference(ref);
  if (!registration) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col px-5 py-16">
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
            ✓
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">
            You&apos;re in, {registration.firstName}!
          </h1>
          <p className="mt-2 text-ink/60">
            Your {registration.ticketType.name} for {registration.event.name} is
            confirmed.
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-dashed border-brand/40 bg-brand/5 p-5">
            <p className="text-xs uppercase tracking-wide text-ink/50">
              Your reference code
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-brand">
              {registration.reference}
            </p>
            <p className="mt-2 text-xs text-ink/50">
              Keep this to access your agenda and check in on the day.
            </p>
          </div>

          <p className="mt-4 text-sm text-ink/60">
            Pass: {registration.ticketType.name} ·{" "}
            {formatMoney(
              registration.ticketType.priceCents,
              registration.ticketType.currency
            )}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/schedule"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-ink transition-transform hover:scale-[1.03]"
            >
              Build my agenda
            </Link>
            <Link
              href="/agenda"
              className="rounded-full border border-black/15 px-6 py-3 font-semibold transition-colors hover:bg-paper"
            >
              View my agenda
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
