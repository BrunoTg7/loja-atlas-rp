const API_URL = process.env.WHITELIST_API_URL;
const API_KEY = process.env.WHITELIST_API_KEY;

export interface PlayerData {
  id: number;
  steam: string;
  whitelist: number;
  banned: number;
}

export interface PlayerStatus {
  whitelist: number;
  banned: number;
}

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };
}

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error("WHITELIST_API_URL não configurada");
  }
  return API_URL.replace(/\/+$/, "");
}

export async function fetchPlayer(id: number): Promise<PlayerData> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/api/players/${id}`;
  const headers = getHeaders();
  const maskedKey = API_KEY
    ? `${API_KEY.slice(0, 4)}...${API_KEY.slice(-4)}`
    : "NOT_SET";

  console.log("[whitelistApi] fetchPlayer START", {
    id,
    url,
    method: "GET",
    apiKeyPreview: maskedKey,
    apiUrlSet: !!API_URL,
    timestamp: new Date().toISOString(),
  });

  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const elapsed = Date.now() - start;

    console.log("[whitelistApi] fetchPlayer RESPONSE", {
      id,
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      elapsedMs: elapsed,
      contentType: res.headers.get("content-type"),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "unable to read body");
      console.error("[whitelistApi] fetchPlayer ERROR_BODY", {
        id,
        status: res.status,
        body: body.slice(0, 500),
      });

      if (res.status === 404) {
        throw new Error("PLAYER_NOT_FOUND");
      }
      throw new Error(`Erro ao consultar jogador: ${res.status} - ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    console.log("[whitelistApi] fetchPlayer SUCCESS", {
      id,
      resultId: data.id,
      steam: data.steam,
      whitelist: data.whitelist,
      banned: data.banned,
      elapsedMs: elapsed,
    });

    return data;
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error("[whitelistApi] fetchPlayer CATCH", {
      id,
      url,
      elapsedMs: elapsed,
      errorName: err instanceof Error ? err.name : "unknown",
      errorMessage: err instanceof Error ? err.message : String(err),
      errorCause: err instanceof Error && err.cause
        ? { name: (err.cause as Error).name, message: (err.cause as Error).message, code: (err.cause as Record<string, unknown>).code }
        : undefined,
      stack: err instanceof Error ? err.stack?.slice(0, 500) : undefined,
    });
    throw err;
  }
}

export async function fetchPlayerStatus(id: number): Promise<PlayerStatus> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/players/${id}/status`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Erro ao consultar status: ${res.status}`);
  }

  return res.json();
}

export async function approvePlayer(id: number): Promise<void> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/players/${id}/whitelist/approve`, {
    method: "PATCH",
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Erro ao aprovar jogador: ${res.status}`);
  }
}

export async function rejectPlayer(
  id: number,
  motivo?: string
): Promise<void> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/players/${id}/whitelist/reject`, {
    method: "PATCH",
    headers: getHeaders(),
    body: motivo ? JSON.stringify({ motivo }) : undefined,
  });

  if (!res.ok) {
    throw new Error(`Erro ao reprovar jogador: ${res.status}`);
  }
}

export function isStaffMember(steamId: string): boolean {
  const staffIds = process.env.STAFF_STEAM_IDS || "";
  const ids = staffIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return ids.includes(steamId);
}
