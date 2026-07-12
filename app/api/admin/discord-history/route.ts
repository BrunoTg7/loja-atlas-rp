import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";
import { fetchWhitelistHistory } from "@/lib/discord";

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

  try {
    const history = await fetchWhitelistHistory();
    return NextResponse.json({ history });
  } catch (err) {
    console.error("Erro ao buscar histórico do Discord:", err);
    return NextResponse.json(
      { error: "Erro ao consultar histórico do Discord." },
      { status: 502 }
    );
  }
}
