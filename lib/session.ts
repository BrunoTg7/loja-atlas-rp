import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = process.env.SESSION_COOKIE!;
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET
);

export interface SessionData {
  steamId: string;
  steamIdFormatted: string;
  avatar: string;
  personaName: string;
  profileUrl: string;
}

export async function createSession(data: SessionData): Promise<string> {
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
  return token;
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return {
      steamId: payload.steamId as string,
      steamIdFormatted: payload.steamIdFormatted as string,
      avatar: payload.avatar as string,
      personaName: payload.personaName as string,
      profileUrl: payload.profileUrl as string,
    };
  } catch {
    return null;
  }
}

export function sessionCookieName(): string {
  return SESSION_COOKIE;
}
