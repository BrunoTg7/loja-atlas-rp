import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember, fetchPlayer } from "@/lib/whitelistApi";

const MAX_PLAYER_ID = 9999;

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }

  if (!isStaffMember(session.steamId)) {
    return NextResponse.json(
      { error: "Acesso negado." },
      { status: 403 }
    );
  }

  const pendingPlayers: Array<{
    id: number;
    steam: string;
    whitelist: number;
    banned: number;
  }> = [];

  const errors: string[] = [];

  for (let id = 1; id <= MAX_PLAYER_ID; id++) {
    try {
      const player = await fetchPlayer(id);
      if (player.whitelist === 0) {
        pendingPlayers.push(player);
      }
    } catch {
      errors.push(`Erro ao buscar ID ${id}`);
    }
  }

  return NextResponse.json({
    players: pendingPlayers,
    total: pendingPlayers.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
