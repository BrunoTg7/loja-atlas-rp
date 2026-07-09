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
  const res = await fetch(`${baseUrl}/api/players/${id}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("PLAYER_NOT_FOUND");
    }
    throw new Error(`Erro ao consultar jogador: ${res.status}`);
  }

  return res.json();
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
