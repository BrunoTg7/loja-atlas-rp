import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const admin = isStaffMember(session.steamId);
  return NextResponse.json({ isAdmin: admin });
}
