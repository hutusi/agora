import { NextRequest, NextResponse } from "next/server";
import { decryptState, encryptState } from "@/lib/oauth/state";

const SESSION_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "code and state are required" },
      { status: 400 }
    );
  }

  const encryptionSecret = process.env.ENCRYPTION_SECRET;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!encryptionSecret || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  // Decrypt the original redirect URI from state
  let redirectUri: string;
  try {
    redirectUri = await decryptState(state, encryptionSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired state" },
      { status: 400 }
    );
  }

  // Exchange code for access token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    }
  );

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Failed to exchange code for token" },
      { status: 502 }
    );
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token received" },
      { status: 502 }
    );
  }

  // Encrypt the access token into a session
  const session = await encryptState(
    accessToken,
    encryptionSecret,
    Date.now() + SESSION_EXPIRY_MS
  );

  // Redirect back to the original page with the session
  const returnUrl = new URL(redirectUri);
  returnUrl.searchParams.set("agora_session", session);

  return NextResponse.redirect(returnUrl.href);
}
