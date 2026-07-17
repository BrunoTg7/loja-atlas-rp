import { NextRequest, NextResponse } from "next/server";
import { exchangeDiscordCode, getDiscordUser, getDiscordAvatarUrl } from "@/lib/discord";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get("discord_oauth_state")?.value;
  const returnTo = req.cookies.get("discord_return_to")?.value || "/checkout";

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/checkout?error=discord_auth_failed", process.env.NEXT_PUBLIC_BASE_URL!)
    );
  }

  try {
    const accessToken = await exchangeDiscordCode(code);
    const discordUser = await getDiscordUser(accessToken);
    const avatarUrl = getDiscordAvatarUrl(discordUser.id, discordUser.avatar);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const response = NextResponse.redirect(new URL(returnTo, baseUrl));

    response.cookies.set("s5d5nja52cacubca923e0", JSON.stringify({
      id: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      avatar: avatarUrl,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("discord_oauth_state", "", { maxAge: 0, path: "/" });
    response.cookies.set("discord_return_to", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    console.error("Discord callback error:", error);
    return NextResponse.redirect(
      new URL("/checkout?error=discord_auth_failed", process.env.NEXT_PUBLIC_BASE_URL!)
    );
  }
}
