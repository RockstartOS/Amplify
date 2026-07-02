import { NextRequest, NextResponse } from "next/server";
import {
  isProvider,
  checkState,
  exchangeAndFetchProfile,
} from "@/lib/oauth";
import { handleOAuthProfile } from "@/lib/oauth-complete";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const url = new URL(req.url);
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));

  if (!isProvider(provider)) return fail("unknown_provider");
  if (url.searchParams.get("error")) return fail("oauth_denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || !(await checkState(provider, state))) {
    return fail("oauth_state");
  }

  const profile = await exchangeAndFetchProfile(provider, code, url.origin);
  if (!profile) return fail("oauth_profile");

  const dest = await handleOAuthProfile(provider, profile);
  return NextResponse.redirect(new URL(dest, req.url));
}
