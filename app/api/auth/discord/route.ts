import { NextResponse } from "next/server";
import { getDiscordLoginUrl } from "@/lib/discord";

export async function GET() {
  try {
    const state = crypto.randomUUID();
    const url = getDiscordLoginUrl(state);
    const response = NextResponse.redirect(url);
    response.cookies.set("discord_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Discord login error:", error);
    return NextResponse.redirect(
      new URL("/?error=discord_login_failed", process.env.NEXT_PUBLIC_BASE_URL!)
    );
  }
}
