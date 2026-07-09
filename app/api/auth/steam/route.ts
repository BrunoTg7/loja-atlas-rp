import { NextResponse } from "next/server";
import { getSteamLoginUrl } from "@/lib/steam";

export async function GET() {
  try {
    const url = await getSteamLoginUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Steam login error:", error);
    return NextResponse.redirect(
      new URL("/?error=steam_login_failed", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
    );
  }
}
