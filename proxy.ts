import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "atlas_session";
const SECRET = process.env.SESSION_SECRET || "atlas-rp-fallback-secret-change-me";
const STAFF_IDS = (process.env.STAFF_STEAM_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function base64UrlDecode(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function verifyJwt(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = encoder.encode(`${header}.${payload}`);
    const sig = base64UrlDecode(signature);

    const valid = await crypto.subtle.verify("HMAC", key, sig, data);
    if (!valid) return null;

    const payloadBuffer = base64UrlDecode(payload);
    const decoded = new TextDecoder().decode(payloadBuffer);
    const parsed = JSON.parse(decoded);

    if (parsed.exp && Date.now() / 1000 > parsed.exp) return null;

    return parsed;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const payload = await verifyJwt(token);

    if (!payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const steamId = payload.steamId as string;
    if (!steamId || !STAFF_IDS.includes(steamId)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
