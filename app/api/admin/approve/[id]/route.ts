import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember, approvePlayer } from "@/lib/whitelistApi";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const playerId = Number(id);

  if (Number.isNaN(playerId) || playerId <= 0) {
    return NextResponse.json(
      { error: "ID inválido." },
      { status: 400 }
    );
  }

  try {
    await approvePlayer(playerId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao aprovar jogador:", err);
    return NextResponse.json(
      { error: "Erro ao aprovar jogador na API externa." },
      { status: 502 }
    );
  }
}
