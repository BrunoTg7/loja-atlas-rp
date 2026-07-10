import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { lookupRegistry } from "@/lib/discord";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Faça login com a Steam primeiro." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Informe um ID ou nome para buscar." },
      { status: 422 }
    );
  }

  try {
    const results = await lookupRegistry(query);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Erro ao buscar no registro:", err);
    return NextResponse.json(
      { error: "Erro ao consultar registro." },
      { status: 502 }
    );
  }
}
