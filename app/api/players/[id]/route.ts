import { NextRequest, NextResponse } from "next/server";
import { fetchPlayer } from "@/lib/whitelistApi";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playerId = Number(id);

  if (Number.isNaN(playerId) || playerId <= 0) {
    return NextResponse.json(
      { error: "ID inválido." },
      { status: 400 }
    );
  }

  try {
    const player = await fetchPlayer(playerId);
    return NextResponse.json(player);
  } catch (err) {
    if (err instanceof Error && err.message === "PLAYER_NOT_FOUND") {
      return NextResponse.json(
        { error: "ID não encontrado." },
        { status: 404 }
      );
    }
    console.error("Erro ao buscar jogador:", err);
    return NextResponse.json(
      { error: "Erro ao consultar API externa." },
      { status: 502 }
    );
  }
}
