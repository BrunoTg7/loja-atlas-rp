const STEAM_RETURN_URL = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/steam/callback`;

export function getSteamLoginUrl(): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": STEAM_RETURN_URL,
    "openid.realm": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

export async function validateSteamCallback(
  query: Record<string, string>
): Promise<string> {
  const mode = query["openid.mode"];
  if (mode !== "id_res") {
    throw new Error("Invalid OpenID mode");
  }

  const claimedId = query["openid.claimed_id"];
  if (!claimedId) {
    throw new Error("No claimed identifier");
  }

  const match = claimedId.match(/\/id\/(\d+)$/);
  if (!match) {
    throw new Error("Could not extract Steam ID");
  }

  // Verify the nonce hasn't been used before (basic replay protection)
  const nonce = query["openid.response_nonce"];
  if (!nonce) {
    throw new Error("No response nonce");
  }

  return match[1];
}

export async function getSteamProfile(steamId: string) {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );
    const data = await res.json();
    return data?.response?.players?.[0] ?? null;
  } catch {
    return null;
  }
}

export function formatSteamId(steamId64: string): string {
  const universe = 1;
  const accountId = BigInt(steamId64) - BigInt(76561197960265728);
  const z = accountId & BigInt(1);
  const w = accountId >> BigInt(2);
  return `STEAM_${universe}:${z}:${w}`;
}
