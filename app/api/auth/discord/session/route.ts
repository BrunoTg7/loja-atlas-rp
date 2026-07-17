import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/s5d5nja52cacubca923e0=([^;]+)/);
  if (!match) return NextResponse.json({ user: null });

  try {
    const user = JSON.parse(decodeURIComponent(match[1]));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
