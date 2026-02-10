import { NextRequest, NextResponse } from "next/server";
import { encryptState } from "@/lib/oauth/state";

const STATE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const redirectUri = request.nextUrl.searchParams.get("redirect_uri");
  if (!redirectUri) {
    return NextResponse.json(
      { error: "redirect_uri is required" },
      { status: 400 }
    );
  }

  const encryptionSecret = process.env.ENCRYPTION_SECRET;
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!encryptionSecret || !clientId) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const state = await encryptState(
    redirectUri,
    encryptionSecret,
    Date.now() + STATE_EXPIRY_MS
  );

  const callbackUrl = `${request.nextUrl.origin}/api/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    state,
    scope: "",
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`
  );
}
