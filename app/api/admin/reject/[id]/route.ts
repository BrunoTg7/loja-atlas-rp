import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember, rejectPlayer } from "@/lib/whitelistApi";

export async function PATCH(
  req: NextRequest,
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

  let motivo: string | undefined;
  try {
    const body = await req.json();
    motivo = body?.motivo || undefined;
  } catch {
    // corpo opcional
  }

  try {
    await rejectPlayer(playerId, motivo);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao reprovar jogador:", err);
    return NextResponse.json(
      { error: "Erro ao reprovar jogador na API externa." },
      { status: 502 }
    );
  }
}
