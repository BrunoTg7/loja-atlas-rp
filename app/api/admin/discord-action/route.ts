import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";
import {
  addReaction,
  replyToMessage,
  sendToLiberacao,
  saveToRegistry,
} from "@/lib/discord";

interface ActionPayload {
  messageId: string;
  action: "approve" | "reject";
  motivo?: string;
  cityId: string;
  steamId: string;
  steamName: string;
  characterName: string;
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
      await addReaction(body.messageId, "✅").catch((err) =>
        console.error("Erro ao adicionar reação (não bloqueante):", err)
      );
      await replyToMessage(
        body.messageId,
        `✅ **Whitelist APROVADA** por <@${session.steamId}>\n>ID #${body.cityId} — ${body.steamName}`
      ).catch((err) =>
        console.error("Erro ao responder mensagem (não bloqueante):", err)
      );

      await sendToLiberacao(body.cityId).catch((err) =>
        console.error("Erro ao enviar para liberacao (não bloqueante):", err)
      );
      await saveToRegistry(
        body.cityId,
        body.steamId,
        body.steamName,
        body.characterName,
        session.personaName
      ).catch((err) =>
        console.error("Erro ao salvar no registro (não bloqueante):", err)
      );
    } else {
      await addReaction(body.messageId, "❌").catch((err) =>
        console.error("Erro ao adicionar reação (não bloqueante):", err)
      );
      const motivoText = body.motivo ? `\n>Motivo: ${body.motivo}` : "";
      await replyToMessage(
        body.messageId,
        `❌ **Whitelist REPROVADA** por <@${session.steamId}>\n>ID #${body.cityId} — ${body.steamName}${motivoText}`
      ).catch((err) =>
        console.error("Erro ao responder mensagem (não bloqueante):", err)
      );

      await sendToLiberacao(body.cityId).catch((err) =>
        console.error("Erro ao enviar para liberacao (não bloqueante):", err)
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
