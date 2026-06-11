import { SESSION_KIND_LABELS, type SessionKind } from "@/lib/domain";

export function TrackPill({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

const kindStyles: Record<string, string> = {
  KEYNOTE: "bg-brand/10 text-brand",
  PANEL: "bg-accent/15 text-amber-700",
  WORKSHOP: "bg-emerald-100 text-emerald-700",
  PITCH: "bg-pink-100 text-pink-700",
  TALK: "bg-slate-100 text-slate-600",
  NETWORKING: "bg-cyan-100 text-cyan-700",
  BREAK: "bg-slate-100 text-slate-500",
};

export function KindBadge({ kind }: { kind: string }) {
  const label = SESSION_KIND_LABELS[kind as SessionKind] ?? kind;
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        kindStyles[kind] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}
