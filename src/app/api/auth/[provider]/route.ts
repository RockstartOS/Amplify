import { NextRequest, NextResponse } from "next/server";
import {
  isProvider,
  providerConfigured,
  devFallbackAllowed,
  buildAuthUrl,
  setState,
  PROVIDERS,
} from "@/lib/oauth";
import { handleOAuthProfile } from "@/lib/oauth-complete";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  if (!isProvider(provider)) {
    return NextResponse.redirect(new URL("/login?error=unknown_provider", req.url));
  }
  const origin = new URL(req.url).origin;

  if (providerConfigured(provider)) {
    const nonce = await setState(provider);
    return NextResponse.redirect(buildAuthUrl(provider, origin, nonce));
  }

  // Not configured: in non-production, stand in with a labelled demo identity so
  // the button works end to end. In production, ask the operator to configure it.
  if (devFallbackAllowed()) {
    const profile = {
      email: `${provider}.demo@amplify.test`,
      firstName: PROVIDERS[provider].label,
      lastName: "Demo",
    };
    const dest = await handleOAuthProfile(provider, profile);
    const url = new URL(dest, req.url);
    url.searchParams.set("via", provider);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL("/login?error=not_configured", req.url));
}
