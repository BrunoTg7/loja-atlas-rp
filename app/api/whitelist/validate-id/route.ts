import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchPlayer } from "@/lib/whitelistApi";

const DISCORD_SUPPORT_URL = process.env.DISCORD_SUPPORT_URL || "https://discord.gg/e426pZyTCp";

interface ValidatePayload {
  cityId: string;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { valid: false, error: "Faça login com a Steam primeiro." },
      { status: 401 }
    );
  }

  let body: ValidatePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { valid: false, error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  if (!body.cityId?.trim()) {
    return NextResponse.json(
      { valid: false, error: "Informe o ID da cidade." },
      { status: 422 }
    );
  }

  const cityId = Number(body.cityId.trim());
  if (Number.isNaN(cityId) || cityId <= 0) {
    return NextResponse.json(
      { valid: false, error: "ID inválido." },
      { status: 422 }
    );
  }

  try {
    const player = await fetchPlayer(cityId);

    if (player.banned === 1) {
      return NextResponse.json(
        {
          valid: false,
          error: `Este passaporte está banido. Mais informações no Discord: ${DISCORD_SUPPORT_URL}`,
        },
        { status: 403 }
      );
    }

    if (player.whitelist === 1) {
      return NextResponse.json(
        {
          valid: false,
          error: "Este ID já está com whitelist aprovada, você já pode jogar.",
        },
        { status: 409 }
      );
    }

    if (player.steam !== session.steamId) {
      return NextResponse.json(
        {
          valid: false,
          error: "Este ID não pertence à sua conta Steam.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (err) {
    if (err instanceof Error && err.message === "PLAYER_NOT_FOUND") {
      return NextResponse.json(
        {
          valid: false,
          error:
            "ID não encontrado. Conecte no servidor antes de solicitar whitelist.",
        },
        { status: 404 }
      );
    }
    console.error("Erro ao validar ID na API externa:", err);
    return NextResponse.json(
      { valid: false, error: "Erro ao consultar API externa. Tente novamente." },
      { status: 502 }
    );
  }
}
