import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

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

  // TODO: Reativar validação com API externa
  // const player = await fetchPlayer(cityId);
  // if (player.banned === 1) { ... }
  // if (player.whitelist === 1) { ... }
  // if (player.steam !== session.steamId) { ... }

  return NextResponse.json({ valid: true });
}
