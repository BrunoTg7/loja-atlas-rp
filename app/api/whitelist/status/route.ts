import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { checkWhitelistStatus } from "@/lib/discord";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Faça login com a Steam primeiro." },
      { status: 401 }
    );
  }

  try {
    const status = await checkWhitelistStatus(session.steamId);
    return NextResponse.json(status);
  } catch (err) {
    console.error("Erro ao verificar status da whitelist:", err);
    return NextResponse.json(
      { error: "Erro ao consultar status." },
      { status: 502 }
    );
  }
}
