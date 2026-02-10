import { NextRequest, NextResponse } from "next/server";
import { decryptState } from "@/lib/oauth/state";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session } = body;

  if (!session) {
    return NextResponse.json(
      { error: "session is required" },
      { status: 400 }
    );
  }

  const encryptionSecret = process.env.ENCRYPTION_SECRET;
  if (!encryptionSecret) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  try {
    const token = await decryptState(session, encryptionSecret);
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 400 }
    );
  }
}
