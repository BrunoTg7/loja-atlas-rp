import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";
import { addReaction, replyToMessage } from "@/lib/discord";

interface ActionPayload {
  messageId: string;
  action: "approve" | "reject";
  motivo?: string;
  cityId: string;
  steamName: string;
}

export async function POST(req: NextRequest) {
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

  let body: ActionPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  if (!body.messageId || !body.action) {
    return NextResponse.json(
      { error: "Dados incompletos." },
      { status: 422 }
    );
  }

  try {
    if (body.action === "approve") {
      await addReaction(body.messageId, "✅");
      await replyToMessage(
        body.messageId,
        `✅ **Whitelist APROVADA** por <@${session.steamId}>\n>ID #${body.cityId} — ${body.steamName}`
      );
    } else {
      await addReaction(body.messageId, "❌");
      const motivoText = body.motivo ? `\n>Motivo: ${body.motivo}` : "";
      await replyToMessage(
        body.messageId,
        `❌ **Whitelist REPROVADA** por <@${session.steamId}>\n>ID #${body.cityId} — ${body.steamName}${motivoText}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao processar ação no Discord:", err);
    return NextResponse.json(
      { error: "Erro ao processar ação no Discord." },
      { status: 502 }
    );
  }
}
