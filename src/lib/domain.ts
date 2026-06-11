// Shared domain constants, types and formatting helpers for Amplify You.

export const TIMEZONE = "Europe/Amsterdam";

/** Programme item kinds. Stored as plain strings (SQLite has no enums). */
export const SESSION_KINDS = [
  "KEYNOTE",
  "TALK",
  "PANEL",
  "WORKSHOP",
  "PITCH",
  "NETWORKING",
  "BREAK",
] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export const SESSION_KIND_LABELS: Record<SessionKind, string> = {
  KEYNOTE: "Keynote",
  TALK: "Talk",
  PANEL: "Panel",
  WORKSHOP: "Workshop",
  PITCH: "Pitch",
  NETWORKING: "Networking",
  BREAK: "Break",
};

export const REGISTRATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

/** Suggested palette for new tracks in the admin UI. */
export const TRACK_COLORS = [
  "#f59e0b", // energy / amber
  "#22c55e", // food & bio / green
  "#6366f1", // scaling / indigo
  "#ec4899", // health / pink
  "#06b6d4", // emerging tech / cyan
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
];

export function formatMoney(cents: number, currency = "EUR"): string {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: TIMEZONE,
  }).format(date);
}

export function formatDateRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: sameMonth ? undefined : "long",
    timeZone: TIMEZONE,
  }).format(start);
  const endStr = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(end);
  return `${startStr}–${endStr}`;
}

/** Generate a human-friendly registration reference, e.g. AMS-7Q3K2P. */
export function generateReference(prefix = "AMS"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${code}`;
}

/** Offset (ms) of `timeZone` from UTC at the given instant. East of UTC is positive. */
function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value])
  );
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUTC - date.getTime();
}

/**
 * Interpret a `datetime-local` string ("YYYY-MM-DDTHH:mm") as wall-clock time in
 * `timeZone` and return the corresponding UTC Date. Robust across DST.
 */
export function wallTimeToUtc(local: string, timeZone = TIMEZONE): Date {
  const normalized = local.length === 16 ? `${local}:00` : local;
  const wallAsUtc = new Date(`${normalized}Z`);
  const offset = timeZoneOffsetMs(wallAsUtc, timeZone);
  return new Date(wallAsUtc.getTime() - offset);
}

/** Format a Date as a `datetime-local` value ("YYYY-MM-DDTHH:mm") in `timeZone`. */
export function toDatetimeLocal(date: Date, timeZone = TIMEZONE): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
