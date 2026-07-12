import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  console.log(`[HONEYPOT] GET from ${ip} | UA: ${ua}`);

  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  console.log(`[HONEYPOT] POST from ${ip} | UA: ${ua}`);

  return new NextResponse(null, { status: 204 });
}
