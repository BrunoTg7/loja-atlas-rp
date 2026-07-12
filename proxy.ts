import { NextResponse, type NextRequest } from "next/server";

const BLOCKED_BOTS = [
  /curl/i,
  /wget/i,
  /python/i,
  /scrapy/i,
  /phantom/i,
  /headless/i,
  /httrack/i,
  /sitecopy/i,
  /teleport/i,
  /webcopier/i,
  /webzip/i,
  /clshttp/i,
  /mass/i,
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
  /dirbuster/i,
  /gobuster/i,
  /ffuf/i,
  /burpsuite/i,
  /owasp/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
];

const BLOCKED_PATHS = [
  /^\/_next\//,
  /^\/api\/internal\//,
  /^\/node_modules\//,
  /^\/\.env/,
  /^\/\.git/,
  /^\/\.htaccess/,
  /^\/config\//,
  /^\/backup\//,
];

function isBlockedBot(ua: string | null): boolean {
  if (!ua || ua.trim() === "") return true;
  return BLOCKED_BOTS.some((pattern) => pattern.test(ua));
}

function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PATHS.some((pattern) => pattern.test(pathname));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get("user-agent");

  if (isBlockedBot(ua)) {
    return new NextResponse(null, { status: 403 });
  }

  if (isBlockedPath(pathname)) {
    return new NextResponse(null, { status: 403 });
  }

  if (pathname === "/api/internal/trap") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    console.log(
      `[HONEYPOT] Blocked request from ${ip} | UA: ${ua} | Path: ${pathname}`
    );
    return new NextResponse(null, { status: 204 });
  }

  const response = NextResponse.next();

  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|Imagens/).*)"],
};
