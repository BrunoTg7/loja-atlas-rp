import { NextRequest, NextResponse } from "next/server";
import { validateSteamCallback, getSteamProfile, formatSteamId } from "@/lib/steam";
import { createSession, sessionCookieName } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  try {
    const steamId = await validateSteamCallback(query);
    const profile = await getSteamProfile(steamId);

    const token = await createSession({
      steamId,
      steamIdFormatted: formatSteamId(steamId),
      avatar: profile?.avatarfull || "",
      personaName: profile?.personaname || "Jogador",
      profileUrl: profile?.profileurl || "",
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = NextResponse.redirect(new URL("/", baseUrl));
    response.cookies.set(sessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24h
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Steam callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(
      new URL("/?error=steam_auth_failed", baseUrl)
    );
  }
}
