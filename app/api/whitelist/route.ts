import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface WhitelistPayload {
  cityId: string;
  characterName: string;
  age: string;
  rpExperience: string;
  characterStory: string;
}

function validatePayload(data: Partial<WhitelistPayload>) {
  const errors: Record<string, string> = {};

  if (!data.cityId?.trim()) errors.cityId = "Informe seu ID na cidade.";
  if (!data.characterName?.trim())
    errors.characterName = "Informe o nome do personagem.";

  const ageNumber = Number(data.age);
  if (!data.age?.trim()) {
    errors.age = "Informe sua idade.";
  } else if (Number.isNaN(ageNumber) || ageNumber < 16) {
    errors.age = "Idade mínima de 16 anos.";
  }

  if (!data.rpExperience?.trim())
    errors.rpExperience = "Conte um pouco da sua experiência.";
  if (!data.characterStory?.trim() || data.characterStory.trim().length < 30) {
    errors.characterStory =
      "Escreva uma história com pelo menos 30 caracteres.";
  }

  return errors;
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_URL) {
    return NextResponse.json(
      { error: "Webhook não configurado no servidor." },
      { status: 500 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Faça login com a Steam primeiro." },
      { status: 401 }
    );
  }

  let body: Partial<WhitelistPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const errors = validatePayload(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const { cityId, characterName, age, rpExperience, characterStory } =
    body as WhitelistPayload;

  const embed = {
    title: "Nova solicitação de Whitelist",
    color: 0x6366f1,
    fields: [
      { name: "ID na cidade", value: cityId, inline: true },
      { name: "Steam ID", value: session.steamId, inline: true },
      {
        name: "Steam Formatado",
        value: session.steamIdFormatted,
        inline: true,
      },
      { name: "Conta Steam", value: session.personaName, inline: true },
      { name: "Idade", value: age, inline: true },
      { name: "Nome do personagem", value: characterName, inline: false },
      {
        name: "Já jogou RP?",
        value: rpExperience.slice(0, 1024),
        inline: false,
      },
      {
        name: "História do personagem",
        value: characterStory.slice(0, 1024),
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Atlas RP • Sistema de Whitelist" },
  };

  try {
    const discordRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      console.error("Discord webhook error:", discordRes.status, text);
      return NextResponse.json(
        { error: "Não foi possível enviar para o Discord. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao enviar webhook:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao enviar. Tente novamente." },
      { status: 500 }
    );
  }
}
