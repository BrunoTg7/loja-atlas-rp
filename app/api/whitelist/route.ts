import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sanitizeInput, hasSuspiciousContent } from "@/lib/sanitize";
import { checkWhitelistStatus, sendWhitelistNotification } from "@/lib/discord";
import { encrypt } from "@/lib/crypto";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const MIN_AGE = 18;

interface WhitelistPayload {
  cityId: string;
  characterName: string;
  discord: string;
  birthDate: string;
  rpExperience: string;
  characterStory: string;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function validatePayload(data: Partial<WhitelistPayload>) {
  const errors: Record<string, string> = {};

  if (!data.cityId?.trim()) errors.cityId = "Informe seu ID na cidade.";
  if (!data.characterName?.trim())
    errors.characterName = "Informe o nome do personagem.";
  if (!data.discord?.trim()) {
    errors.discord = "Informe seu Discord.";
  } else if (data.discord.trim().length < 2) {
    errors.discord = "Discord inválido.";
  }

  if (!data.birthDate?.trim()) {
    errors.birthDate = "Informe sua data de nascimento.";
  } else {
    const parts = data.birthDate.split("-");
    const year = parseInt(parts[0], 10);
    if (year < 1950 || year > 2008) {
      errors.birthDate = "Data de nascimento inválida.";
    } else {
      const age = calculateAge(data.birthDate);
      if (age < MIN_AGE) {
        errors.birthDate = `Idade mínima de ${MIN_AGE} anos.`;
      }
    }
  }

  if (!data.rpExperience?.trim())
    errors.rpExperience = "Conte um pouco da sua experiência.";
  if (!data.characterStory?.trim() || data.characterStory.trim().length < 300) {
    errors.characterStory =
      "Escreva uma história com pelo menos 300 caracteres.";
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

  try {
    const existingStatus = await checkWhitelistStatus(session.steamId);
    if (existingStatus.exists && existingStatus.status !== "rejected") {
      const message = existingStatus.status === "approved"
        ? "Sua whitelist já foi aprovada."
        : "Você já possui uma solicitação pendente. Aguarde a análise.";
      return NextResponse.json(
        { error: message, status: existingStatus.status },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error("[WHITELIST] Error checking status:", err);
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

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  const allFields = [body.cityId, body.characterName, body.discord, body.rpExperience, body.characterStory]
    .filter(Boolean)
    .join(" ");

  if (hasSuspiciousContent(allFields)) {
    console.log(`[WHITELIST] Suspicious input blocked | IP: ${ip} | UA: ${ua} | Steam: ${session.steamId}`);
    return NextResponse.json(
      { error: "Conteúdo inválido detectado." },
      { status: 422 }
    );
  }

  const errors = validatePayload(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const { cityId, characterName, discord, birthDate, rpExperience, characterStory } =
    body as WhitelistPayload;

  const cleanCityId = sanitizeInput(cityId);
  const cleanCharacterName = sanitizeInput(characterName);
  const cleanDiscord = sanitizeInput(discord);
  const cleanRpExperience = sanitizeInput(rpExperience);
  const cleanCharacterStory = sanitizeInput(characterStory);

  const age = calculateAge(birthDate);

  console.log(`[WHITELIST] Submission | IP: ${ip} | Steam: ${session.steamId} | Name: ${session.personaName} | Story: ${cleanCharacterStory.length} chars`);

  const embed = {
    title: "Nova solicitação de Whitelist",
    color: 0x6366f1,
    fields: [
      { name: "ID na cidade", value: cleanCityId, inline: true },
      { name: "Steam ID", value: encrypt(session.steamId), inline: true },
      {
        name: "Steam3 Hex",
        value: encrypt(session.steamIdFormatted),
        inline: true,
      },
      { name: "Conta Steam", value: encrypt(session.personaName), inline: true },
      { name: "Idade", value: String(age), inline: true },
      { name: "Data de Nascimento", value: encrypt(birthDate), inline: true },
      { name: "Discord", value: encrypt(cleanDiscord), inline: true },
      { name: "Nome do personagem", value: cleanCharacterName, inline: false },
      {
        name: "Já jogou RP?",
        value: cleanRpExperience.slice(0, 1024),
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Atlas RP • Sistema de Whitelist" },
  };

  const fileContent = `História Completa — ${cleanCharacterName} (${session.personaName})\n\n${cleanCharacterStory}`;
  const fileName = `historia-${cleanCharacterName.toLowerCase().replace(/\s+/g, "-")}.txt`;

  const formData = new FormData();
  formData.append("payload_json", JSON.stringify({
    embeds: [embed],
    username: "Atlas RP Whitelist",
    avatar_url: "https://cdn.discordapp.com/attachments/1523811762502238318/1524518600248004750/logo-atlas-rp.png?ex=6a53fe96&is=6a52ad16&hm=a9d0490ffaf411e6bd247606d10227ac66522e7bbfaac07a9edad20c7cb7be85&",
  }));
  formData.append("files[0]", new Blob([fileContent], { type: "text/plain" }), fileName);

  try {
    const discordRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      console.error("[WHITELIST] Discord webhook error:", discordRes.status, text);
      return NextResponse.json(
        { error: "Não foi possível enviar para o Discord. Tente novamente." },
        { status: 502 }
      );
    }

    console.log(`[WHITELIST] Success | Steam: ${session.steamId} | Story length: ${cleanCharacterStory.length}`);

    sendWhitelistNotification(cleanCharacterName, cleanCityId, cleanDiscord, session.personaName).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[WHITELIST] Erro ao enviar webhook:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao enviar. Tente novamente." },
      { status: 500 }
    );
  }
}
