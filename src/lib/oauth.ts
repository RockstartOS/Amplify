import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Social login via OpenID Connect for Google and LinkedIn. Fully functional
// once the provider env vars are set; falls back to a clearly-labelled demo
// identity in non-production when they aren't, so the flow is testable.

const SECRET = process.env.SESSION_SECRET ?? "amplify-dev-session-secret";

export type ProviderId = "google" | "linkedin";

type ProviderConfig = {
  id: ProviderId;
  label: string;
  authUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
};

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  google: {
    id: "google",
    label: "Google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userinfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userinfoUrl: "https://api.linkedin.com/v2/userinfo",
    scope: "openid email profile",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
  },
};

export function isProvider(value: string): value is ProviderId {
  return value === "google" || value === "linkedin";
}

export function providerConfigured(id: ProviderId): boolean {
  const p = PROVIDERS[id];
  return Boolean(process.env[p.clientIdEnv] && process.env[p.clientSecretEnv]);
}

/** In non-production we allow a labelled demo identity so the button works. */
export function devFallbackAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function redirectUri(origin: string, id: ProviderId): string {
  const base = process.env.OAUTH_BASE_URL ?? origin;
  return `${base}/api/auth/${id}/callback`;
}

// ── Signed short-lived values (HMAC) ──
function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}
function pack(value: string): string {
  return `${Buffer.from(value).toString("base64url")}.${sign(value)}`;
}
function unpack(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const raw = Buffer.from(token.slice(0, dot), "base64url").toString();
  const sig = token.slice(dot + 1);
  const expected = sign(raw);
  if (sig.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? raw : null;
}

// ── CSRF state ──
export async function setState(id: ProviderId): Promise<string> {
  const nonce = randomBytes(12).toString("hex");
  const value = `${id}:${nonce}`;
  const store = await cookies();
  store.set("oauth_state", pack(value), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 600,
  });
  return nonce;
}
export async function checkState(id: ProviderId, nonce: string): Promise<boolean> {
  const store = await cookies();
  const value = unpack(store.get("oauth_state")?.value);
  store.delete("oauth_state");
  return value === `${id}:${nonce}`;
}

// ── Pending OAuth signup (identity verified, account not yet created) ──
export type PendingOAuth = {
  provider: ProviderId;
  email: string;
  firstName: string;
  lastName: string;
};
export async function setPendingOAuth(p: PendingOAuth): Promise<void> {
  const store = await cookies();
  store.set("oauth_pending", pack(JSON.stringify(p)), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 600,
  });
}
export async function getPendingOAuth(): Promise<PendingOAuth | null> {
  const store = await cookies();
  const raw = unpack(store.get("oauth_pending")?.value);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingOAuth;
  } catch {
    return null;
  }
}
export async function clearPendingOAuth(): Promise<void> {
  const store = await cookies();
  store.delete("oauth_pending");
}

// ── Authorization URL ──
export function buildAuthUrl(id: ProviderId, origin: string, state: string): string {
  const p = PROVIDERS[id];
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env[p.clientIdEnv]!,
    redirect_uri: redirectUri(origin, id),
    scope: p.scope,
    state,
  });
  return `${p.authUrl}?${params.toString()}`;
}

// ── Code exchange + profile ──
export type OAuthProfile = { email: string; firstName: string; lastName: string };

export async function exchangeAndFetchProfile(
  id: ProviderId,
  code: string,
  origin: string
): Promise<OAuthProfile | null> {
  const p = PROVIDERS[id];
  const tokenRes = await fetch(p.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env[p.clientIdEnv]!,
      client_secret: process.env[p.clientSecretEnv]!,
      redirect_uri: redirectUri(origin, id),
    }),
  });
  if (!tokenRes.ok) return null;
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) return null;

  const infoRes = await fetch(p.userinfoUrl, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!infoRes.ok) return null;
  const info = (await infoRes.json()) as {
    email?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
  };
  if (!info.email) return null;
  const [first, ...rest] = (info.name ?? "").split(" ");
  return {
    email: info.email.toLowerCase(),
    firstName: info.given_name ?? first ?? "",
    lastName: info.family_name ?? rest.join(" ") ?? "",
  };
}
