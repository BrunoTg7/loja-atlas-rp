const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_WL_CHANNEL_ID;

export interface WhitelistRequest {
  messageId: string;
  cityId: string;
  steamId: string;
  steamFormatted: string;
  steamName: string;
  characterName: string;
  age: string;
  birthDate: string;
  discord: string;
  rpExperience: string;
  characterStory: string;
  timestamp: string;
}

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bot ${BOT_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function getField(fields: { name: string; value: string }[], name: string): string {
  return fields.find((f) => f.name === name)?.value || "";
}

export function parseWhitelistEmbed(message: {
  id: string;
  embeds: { title?: string; fields?: { name: string; value: string }[]; timestamp?: string }[];
}): WhitelistRequest | null {
  const embed = message.embeds.find((e) => e.title === "Nova solicitação de Whitelist");
  if (!embed || !embed.fields) return null;

  return {
    messageId: message.id,
    cityId: getField(embed.fields, "ID na cidade"),
    steamId: getField(embed.fields, "Steam ID"),
    steamFormatted: getField(embed.fields, "Steam Formatado"),
    steamName: getField(embed.fields, "Conta Steam"),
    characterName: getField(embed.fields, "Nome do personagem"),
    age: getField(embed.fields, "Idade"),
    birthDate: getField(embed.fields, "Data de Nascimento"),
    discord: getField(embed.fields, "Discord"),
    rpExperience: getField(embed.fields, "Já jogou RP?"),
    characterStory: getField(embed.fields, "História do personagem"),
    timestamp: embed.timestamp || message.embeds[0]?.timestamp || "",
  };
}

export async function fetchWhitelistMessages(): Promise<WhitelistRequest[]> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error("Discord bot não configurado");
  }

  const res = await fetch(
    `${DISCORD_API}/channels/${CHANNEL_ID}/messages?limit=100`,
    { headers: getHeaders(), cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Erro ao buscar mensagens: ${res.status}`);
  }

  const messages: {
    id: string;
    embeds: { title?: string; fields?: { name: string; value: string }[]; timestamp?: string }[];
    reactions?: { emoji: { name: string }; count: number }[];
    content?: string;
    attachments?: { filename: string; url: string }[];
  }[] = await res.json();

  const requests = messages
    .map(parseWhitelistEmbed)
    .filter((req): req is WhitelistRequest => {
      if (!req) return false;
      const msg = messages.find((m) => m.id === req.messageId);
      if (msg?.reactions) {
        const hasReaction = msg.reactions.some(
          (r) => r.emoji.name === "✅" || r.emoji.name === "❌"
        );
        if (hasReaction) return false;
      }
      return true;
    });

  for (const req of requests) {
    const msg = messages.find((m) => m.id === req.messageId);
    const attachment = msg?.attachments?.find((a) => a.filename.startsWith("historia-"));
    if (attachment?.url) {
      try {
        const fileRes = await fetch(attachment.url, { headers: getHeaders() });
        if (fileRes.ok) {
          const text = await fileRes.text();
          const storyStart = text.indexOf("\n\n");
          req.characterStory = storyStart !== -1 ? text.slice(storyStart + 2) : text;
        }
      } catch {}
    }
  }

  return requests;
}

export interface WhitelistHistoryEntry extends WhitelistRequest {
  status: "approved" | "rejected";
  rejectReason?: string | null;
}

export async function fetchWhitelistHistory(): Promise<WhitelistHistoryEntry[]> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error("Discord bot não configurado");
  }

  const res = await fetch(
    `${DISCORD_API}/channels/${CHANNEL_ID}/messages?limit=100`,
    { headers: getHeaders(), cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Erro ao buscar mensagens: ${res.status}`);
  }

  const messages: {
    id: string;
    embeds: { title?: string; fields?: { name: string; value: string }[]; timestamp?: string }[];
    reactions?: { emoji: { name: string }; count: number }[];
    content?: string;
    message_reference?: { message_id: string };
    attachments?: { filename: string; url: string }[];
  }[] = await res.json();

  const history: WhitelistHistoryEntry[] = [];

  for (const msg of messages) {
    if (!msg.embeds) continue;
    const parsed = parseWhitelistEmbed(msg);
    if (!parsed) continue;

    const hasApproved = msg.reactions?.some((r) => r.emoji.name === "✅");
    const hasRejected = msg.reactions?.some((r) => r.emoji.name === "❌");

    if (hasApproved) {
      history.push({ ...parsed, status: "approved", rejectReason: null });
    } else if (hasRejected) {
      let reason: string | null = null;
      const rejectReply = messages.find(
        (m) =>
          m.content?.includes("Whitelist REPROVADA") &&
          m.message_reference?.message_id === msg.id
      );
      if (rejectReply?.content) {
        const motivoMatch = rejectReply.content.match(/Motivo:\s*(.+)/);
        if (motivoMatch) {
          reason = motivoMatch[1].trim();
        }
      }
      history.push({ ...parsed, status: "rejected", rejectReason: reason });
    }
  }

  for (const entry of history) {
    const msg = messages.find((m) => m.id === entry.messageId);
    const attachment = msg?.attachments?.find((a) => a.filename.startsWith("historia-"));
    if (attachment?.url) {
      try {
        const fileRes = await fetch(attachment.url, { headers: getHeaders() });
        if (fileRes.ok) {
          const text = await fileRes.text();
          const storyStart = text.indexOf("\n\n");
          entry.characterStory = storyStart !== -1 ? text.slice(storyStart + 2) : text;
        }
      } catch {}
    }
  }

  return history;
}

export interface WhitelistStatus {
  exists: boolean;
  status: "pending" | "approved" | "rejected" | null;
  messageId: string | null;
  rejectReason: string | null;
}

export async function checkWhitelistStatus(steamId: string): Promise<WhitelistStatus> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error("Discord bot não configurado");
  }

  const res = await fetch(
    `${DISCORD_API}/channels/${CHANNEL_ID}/messages?limit=100`,
    { headers: getHeaders(), cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Erro ao buscar mensagens: ${res.status}`);
  }

  const messages: {
    id: string;
    embeds: { title?: string; fields?: { name: string; value: string }[]; timestamp?: string }[];
    reactions?: { emoji: { name: string }; count: number }[];
    content?: string;
    message_reference?: { message_id: string };
  }[] = await res.json();

  for (const msg of messages) {
    if (!msg.embeds) continue;
    const embed = msg.embeds.find((e) => e.title === "Nova solicitação de Whitelist");
    if (!embed || !embed.fields) continue;

    const msgSteamId = getField(embed.fields, "Steam ID");
    if (msgSteamId !== steamId) continue;

    const hasApproved = msg.reactions?.some((r) => r.emoji.name === "✅");
    const hasRejected = msg.reactions?.some((r) => r.emoji.name === "❌");

    if (hasApproved) {
      return { exists: true, status: "approved", messageId: msg.id, rejectReason: null };
    }
    if (hasRejected) {
      let reason: string | null = null;
      const rejectReply = messages.find(
        (m) =>
          m.content?.includes("Whitelist REPROVADA") &&
          m.message_reference?.message_id === msg.id
      );
      if (rejectReply?.content) {
        const motivoMatch = rejectReply.content.match(/Motivo:\s*(.+)/);
        if (motivoMatch) {
          reason = motivoMatch[1].trim();
        }
      }
      return { exists: true, status: "rejected", messageId: msg.id, rejectReason: reason };
    }
    return { exists: true, status: "pending", messageId: msg.id, rejectReason: null };
  }

  return { exists: false, status: null, messageId: null, rejectReason: null };
}

export async function addReaction(
  messageId: string,
  emoji: string
): Promise<void> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error("Discord bot não configurado");
  }

  const encoded = encodeURIComponent(emoji);
  const res = await fetch(
    `${DISCORD_API}/channels/${CHANNEL_ID}/messages/${messageId}/reactions/${encoded}/@me`,
    { method: "PUT", headers: getHeaders() }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error(`Erro ao adicionar reação: ${res.status}`);
  }
}

export async function replyToMessage(
  messageId: string,
  content: string
): Promise<void> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    throw new Error("Discord bot não configurado");
  }

  const res = await fetch(
    `${DISCORD_API}/channels/${CHANNEL_ID}/messages`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        content,
        message_reference: { message_id: messageId, channel_id: CHANNEL_ID, guild_id: undefined },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Erro ao responder mensagem: ${res.status}`);
  }
}

const LIBERACAO_WEBHOOK_URL = process.env.DISCORD_LIBERACAO_WEBHOOK_URL;
const LIBERACAO_BOT_TOKEN = process.env.DISCORD_LIBERACAO_BOT_TOKEN;
const LIBERACAO_USER_ID = process.env.DISCORD_LIBERACAO_USER_ID;
const LOGRESET_CHANNEL_ID = process.env.DISCORD_LOGRESET_CHANNEL_ID;
const LOGRESET_WEBHOOK_URL = process.env.DISCORD_LOGRESET_webhook;
const LOGSAIRDC_CHANNEL_ID = process.env.DISCORD_LOGSAIRDC_CHANNEL_ID;
const REGISTRY_CHANNEL_ID = process.env.DISCORD_REGISTRY_CHANNEL_ID;

function getLiberacaoHeaders(): HeadersInit {
  const token = LIBERACAO_BOT_TOKEN || BOT_TOKEN;
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

async function getDMChannel(userId: string): Promise<string> {
  const res = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: getLiberacaoHeaders(),
    body: JSON.stringify({ recipient_id: userId }),
  });

  if (!res.ok) {
    throw new Error(`Erro ao criar DM: ${res.status}`);
  }

  const data = await res.json();
  return data.id;
}

export async function sendToLiberacao(cityId: string): Promise<void> {
  if (!LIBERACAO_WEBHOOK_URL) {
    throw new Error("Webhook de liberação não configurado");
  }

  const res = await fetch(LIBERACAO_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: cityId,
      username: "Atlas RP Autenticação",
      avatar_url: "https://cdn.discordapp.com/attachments/1523811762502238318/1524518600248004750/logo-atlas-rp.png?ex=6a53fe96&is=6a52ad16&hm=a9d0490ffaf411e6bd247606d10227ac66522e7bbfaac07a9edad20c7cb7be85&",
    }),
  });

  if (!res.ok) {
    throw new Error(`Erro ao enviar para canal de liberação: ${res.status}`);
  }
}

export async function sendToLogReset(cityId: string, characterName: string): Promise<void> {
  if ((!LIBERACAO_BOT_TOKEN && !BOT_TOKEN) || !LOGRESET_CHANNEL_ID) {
    throw new Error("Bot de liberação ou canal logreset não configurado");
  }

  const res = await fetch(
    `${DISCORD_API}/channels/${LOGRESET_CHANNEL_ID}/messages`,
    {
      method: "POST",
      headers: getLiberacaoHeaders(),
      body: JSON.stringify({
        content: `✅ **Whitelist APROVADA — Log Reset**\n> Nome: **${characterName}**\n> ID: **#${cityId}**`,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Erro ao enviar para canal logreset: ${res.status}`);
  }
}

export async function sendToLogResetWebhook(
  cityId: string,
  steamName: string,
  characterName: string,
  reviewerName: string,
  discord?: string
): Promise<void> {
  if (!LOGRESET_WEBHOOK_URL) {
    console.error("[LOGRESET] Variavel DISCORD_LOGRESET_webhook nao configurada no .env");
    throw new Error("Webhook de log reset não configurado");
  }

  const discordTag = discord ? ` (<@${discord}>)` : "";

  console.log("[LOGRESET] Enviando webhook para:", LOGRESET_WEBHOOK_URL.substring(0, 60) + "...");

  const res = await fetch(LOGRESET_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `✅ **Whitelist APROVADA**\n> Nome: **${characterName}**${discordTag}\n> ID: **#${cityId}**`,
      username: "Atlas RP Whitelist",
      avatar_url: "https://cdn.discordapp.com/attachments/1523811762502238318/1524518600248004750/logo-atlas-rp.png?ex=6a53fe96&is=6a52ad16&hm=a9d0490ffaf411e6bd247606d10227ac66522e7bbfaac07a9edad20c7cb7be85&",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "N/A");
    console.error("[LOGRESET] Webhook falhou:", res.status, res.statusText, body);
    throw new Error(`Erro ao enviar para webhook logreset: ${res.status} - ${body}`);
  }

  console.log("[LOGRESET] Webhook enviado com sucesso");
}

export async function sendToLogSairDC(cityId: string, characterName: string, motivo?: string): Promise<void> {
  if ((!LIBERACAO_BOT_TOKEN && !BOT_TOKEN) || !LOGSAIRDC_CHANNEL_ID) {
    throw new Error("Bot de liberação ou canal logsairdc não configurado");
  }

  const motivoText = motivo ? `\n> Motivo: ${motivo}` : "";

  const res = await fetch(
    `${DISCORD_API}/channels/${LOGSAIRDC_CHANNEL_ID}/messages`,
    {
      method: "POST",
      headers: getLiberacaoHeaders(),
      body: JSON.stringify({
        content: `❌ **Whitelist REPROVADA — Log Sair DC**\n> Nome: **${characterName}**\n> ID: **#${cityId}**${motivoText}`,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Erro ao enviar para canal logsairdc: ${res.status}`);
  }
}

export interface RegistryEntry {
  messageId: string;
  cityId: string;
  steamId: string;
  steamName: string;
  characterName: string;
  approvedBy: string;
  timestamp: string;
}

export async function saveToRegistry(
  cityId: string,
  steamId: string,
  steamName: string,
  characterName: string,
  approvedBy: string
): Promise<void> {
  if (!BOT_TOKEN || !REGISTRY_CHANNEL_ID) {
    throw new Error("Bot ou canal de registro não configurado");
  }

  const embed = {
    title: "Whitelist Aprovada",
    color: 0x22c55e,
    fields: [
      { name: "ID na cidade", value: cityId, inline: true },
      { name: "Steam ID", value: steamId, inline: true },
      { name: "Conta Steam", value: steamName, inline: true },
      { name: "Personagem", value: characterName, inline: true },
      { name: "Aprovado por", value: approvedBy, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "Atlas RP • Registro de Whitelist" },
  };

  const res = await fetch(
    `${DISCORD_API}/channels/${REGISTRY_CHANNEL_ID}/messages`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ embeds: [embed] }),
    }
  );

  if (!res.ok) {
    throw new Error(`Erro ao salvar no registro: ${res.status}`);
  }
}

export async function lookupRegistry(
  query: string
): Promise<RegistryEntry[]> {
  if (!BOT_TOKEN || !REGISTRY_CHANNEL_ID) {
    throw new Error("Bot ou canal de registro não configurado");
  }

  const res = await fetch(
    `${DISCORD_API}/channels/${REGISTRY_CHANNEL_ID}/messages?limit=100`,
    { headers: getHeaders(), cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Erro ao buscar registro: ${res.status}`);
  }

  const messages: {
    id: string;
    embeds: {
      title?: string;
      fields?: { name: string; value: string }[];
      timestamp?: string;
    }[];
  }[] = await res.json();

  const queryLower = query.toLowerCase();

  return messages
    .map((msg) => {
      const embed = msg.embeds.find((e) => e.title === "Whitelist Aprovada");
      if (!embed || !embed.fields) return null;

      const cityId = getField(embed.fields, "ID na cidade");
      const steamId = getField(embed.fields, "Steam ID");
      const steamName = getField(embed.fields, "Conta Steam");
      const characterName = getField(embed.fields, "Personagem");
      const approvedBy = getField(embed.fields, "Aprovado por");

      const matches =
        cityId.toLowerCase() === queryLower ||
        steamId === query ||
        steamName.toLowerCase().includes(queryLower);

      if (!matches) return null;

      return {
        messageId: msg.id,
        cityId,
        steamId,
        steamName,
        characterName,
        approvedBy,
        timestamp: embed.timestamp || "",
      };
    })
    .filter((entry): entry is RegistryEntry => entry !== null);
}
