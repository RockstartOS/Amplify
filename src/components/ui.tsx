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
  KEYNOTE: "text-indigo-soft",
  PANEL: "text-ink/70",
  WORKSHOP: "text-ink/70",
  PITCH: "text-indigo-soft",
  TALK: "text-ink/55",
  NETWORKING: "text-ink/55",
  BREAK: "text-ink/40",
};

export function KindBadge({ kind }: { kind: string }) {
  const label = SESSION_KIND_LABELS[kind as SessionKind] ?? kind;
  return (
    <span
      className={`mono inline-block text-[10px] font-medium uppercase tracking-[0.18em] ${
        kindStyles[kind] ?? "text-ink/55"
      }`}
    >
      {label}
    </span>
  );
}
