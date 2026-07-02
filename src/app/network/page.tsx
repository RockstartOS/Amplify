import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentAttendee } from "@/lib/attendee-auth";
import { getParticipants, getConnectionsFor } from "@/lib/queries";
import {
  requestConnectionAction,
  respondConnectionAction,
  removeConnectionAction,
} from "@/lib/network-actions";

export const metadata: Metadata = { title: "Network" };

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function Avatar({ first, last }: { first: string; last: string }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-indigo/15 font-display text-sm font-bold text-indigo-soft">
      {initials(first, last)}
    </span>
  );
}

export default async function NetworkPage() {
  const me = await getCurrentAttendee();
  if (!me) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-5 py-20 text-center">
          <h1 className="text-2xl font-bold tracking-tight">The network</h1>
          <p className="mt-2 text-ink/60">
            Log in to meet other participants and build your connections.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login" className="rounded-full bg-indigo px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand">
              Log in
            </Link>
            <Link href="/register" className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold hover:bg-surface">
              Register
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const [participants, connections] = await Promise.all([
    getParticipants(me.eventId, me.id),
    getConnectionsFor(me.id),
  ]);

  // Map the "other" participant id -> connection involving me.
  const byOther = new Map<string, (typeof connections)[number]>();
  for (const c of connections) {
    const otherId = c.requesterId === me.id ? c.addresseeId : c.requesterId;
    byOther.set(otherId, c);
  }

  const incoming = connections.filter((c) => c.addresseeId === me.id && c.status === "PENDING");
  const accepted = connections.filter((c) => c.status === "ACCEPTED");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-indigo">
                {me.event.name}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Network</h1>
              <p className="mt-2 text-ink/60">
                Meet the room. Connect with participants and swap details.
              </p>
            </div>
            <div className="text-right text-sm text-ink/50">
              <Link href="/account" className="font-medium text-brand hover:underline">
                Edit your profile →
              </Link>
              {!me.networkingOptIn && (
                <p className="mt-1 text-xs text-amber-700">
                  You&apos;re hidden from the directory.
                </p>
              )}
            </div>
          </header>

          {/* Incoming requests */}
          {incoming.length > 0 && (
            <section className="mt-8">
              <h2 className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink/45">
                Requests ({incoming.length})
              </h2>
              <div className="mt-3 space-y-3">
                {incoming.map((c) => (
                  <div key={c.id} className="flex items-start gap-4 rounded-xl border border-ink/10 bg-surface p-4">
                    <Avatar first={c.requester.firstName} last={c.requester.lastName} />
                    <div className="flex-1">
                      <div className="font-semibold">
                        {c.requester.firstName} {c.requester.lastName}
                      </div>
                      <div className="text-sm text-ink/55">
                        {c.requester.headline ?? c.requester.role ?? ""}
                        {c.requester.company ? ` · ${c.requester.company}` : ""}
                      </div>
                      {c.message && <p className="mt-1 text-sm text-ink/70">“{c.message}”</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <form action={respondConnectionAction}>
                        <input type="hidden" name="connectionId" value={c.id} />
                        <input type="hidden" name="decision" value="ACCEPTED" />
                        <button className="rounded-full bg-indigo px-3 py-1.5 text-xs font-semibold text-cream hover:bg-brand">
                          Accept
                        </button>
                      </form>
                      <form action={respondConnectionAction}>
                        <input type="hidden" name="connectionId" value={c.id} />
                        <input type="hidden" name="decision" value="DECLINED" />
                        <button className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/60 hover:bg-paper">
                          Decline
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Your connections */}
          {accepted.length > 0 && (
            <section className="mt-8">
              <h2 className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink/45">
                Your connections ({accepted.length})
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {accepted.map((c) => {
                  const other = c.requesterId === me.id ? c.addressee : c.requester;
                  return (
                    <div key={c.id} className="flex items-start gap-3 rounded-xl border border-ink/10 bg-surface p-4">
                      <Avatar first={other.firstName} last={other.lastName} />
                      <div className="flex-1">
                        <div className="font-semibold">
                          {other.firstName} {other.lastName}
                        </div>
                        <div className="text-sm text-ink/55">
                          {other.headline ?? other.role ?? ""}
                          {other.company ? ` · ${other.company}` : ""}
                        </div>
                        <a href={`mailto:${other.email}`} className="mt-1 inline-block text-sm text-brand hover:underline">
                          {other.email}
                        </a>
                      </div>
                      <form action={removeConnectionAction}>
                        <input type="hidden" name="connectionId" value={c.id} />
                        <button className="text-xs font-semibold text-ink/40 hover:text-red-400" title="Remove connection">
                          ✕
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Directory */}
          <section className="mt-10">
            <h2 className="mono text-[11px] font-medium uppercase tracking-[0.22em] text-ink/45">
              Participants ({participants.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {participants.map((p) => {
                const conn = byOther.get(p.id);
                return (
                  <div key={p.id} className="flex flex-col rounded-xl border border-ink/10 bg-surface p-4">
                    <div className="flex items-start gap-3">
                      <Avatar first={p.firstName} last={p.lastName} />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold leading-tight">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="truncate text-sm text-ink/55">
                          {p.role ?? ""}
                          {p.company ? ` · ${p.company}` : ""}
                        </div>
                      </div>
                    </div>
                    {p.headline && <p className="mt-2 text-sm text-ink/70">{p.headline}</p>}
                    {p.interests && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.interests.split(",").map((tag) => (
                          <span key={tag} className="mono rounded-full border border-ink/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink/50">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      {!conn && (
                        <form action={requestConnectionAction}>
                          <input type="hidden" name="addresseeId" value={p.id} />
                          <button className="w-full rounded-full bg-indigo px-3 py-1.5 text-xs font-semibold text-cream hover:bg-brand">
                            Connect
                          </button>
                        </form>
                      )}
                      {conn?.status === "ACCEPTED" && (
                        <span className="block rounded-full bg-indigo/10 px-3 py-1.5 text-center text-xs font-semibold text-indigo-soft">
                          ✓ Connected
                        </span>
                      )}
                      {conn?.status === "PENDING" && conn.requesterId === me.id && (
                        <span className="block rounded-full border border-ink/15 px-3 py-1.5 text-center text-xs font-semibold text-ink/50">
                          Request sent
                        </span>
                      )}
                      {conn?.status === "PENDING" && conn.addresseeId === me.id && (
                        <span className="block rounded-full border border-ink/15 px-3 py-1.5 text-center text-xs font-semibold text-indigo-soft">
                          Responds above ↑
                        </span>
                      )}
                      {conn?.status === "DECLINED" && (
                        <span className="block rounded-full border border-ink/15 px-3 py-1.5 text-center text-xs font-semibold text-ink/40">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {participants.length === 0 && (
                <p className="text-sm text-ink/50">No other participants are visible yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
