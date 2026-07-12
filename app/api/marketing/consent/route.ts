import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

interface MarketingConsentPayload {
  email: string;
  phone: string;
  consent: boolean;
  timestamp: string;
  consentText: string;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Faça login com a Steam primeiro." },
      { status: 401 }
    );
  }

  let body: MarketingConsentPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  if (!body.consent) {
    return NextResponse.json(
      { error: "Consentimento é obrigatório." },
      { status: 422 }
    );
  }

  if (!body.email?.trim()) {
    return NextResponse.json(
      { error: "E-mail é obrigatório." },
      { status: 422 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json(
      { error: "E-mail inválido." },
      { status: 422 }
    );
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_MARKETING_CHANNEL_ID;
  if (!botToken || !channelId) {
    return NextResponse.json(
      { error: "Bot do Discord ou canal de marketing não configurado no servidor." },
      { status: 500 }
    );
  }

  const consentData = {
    steamId: session.steamId,
    steamIdFormatted: session.steamIdFormatted,
    personaName: session.personaName,
    email: body.email?.trim() || null,
    phone: body.phone?.trim() || null,
    consent: true,
    consentText: body.consentText,
    timestamp: body.timestamp,
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
  };

  try {
    const embed = {
      title: "Novo consentimento de marketing",
      color: 0xd4af37,
      fields: [
        { name: "Steam ID", value: consentData.steamId, inline: true },
        { name: "Steam Formatado", value: consentData.steamIdFormatted, inline: true },
        { name: "Nome Steam", value: consentData.personaName, inline: true },
        { name: "E-mail", value: consentData.email || "Não informado", inline: true },
        { name: "Telefone/WhatsApp", value: consentData.phone || "Não informado", inline: true },
        { name: "Consentimento", value: consentData.consentText, inline: false },
        { name: "Data/Hora do Aceite", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: "Canal", value: `<#${process.env.DISCORD_MARKETING_CHANNEL_ID}>`, inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "Atlas RP • Marketing Opt-in" },
    };

    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${botToken}`,
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      }
    );

    if (!discordRes.ok) {
      const text = await discordRes.text();
      console.error("[Marketing Consent] Discord webhook error:", discordRes.status, text);
      return NextResponse.json(
        { error: "Não foi possível enviar para o Discord. Tente novamente." },
        { status: 502 }
      );
    }

    console.log("[Marketing Consent] Success", consentData);
  } catch (err) {
    console.error("[Marketing Consent] Erro ao processar:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao processar. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
