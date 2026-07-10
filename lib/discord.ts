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
  }[] = await res.json();

  return messages
    .map(parseWhitelistEmbed)
    .filter((req): req is WhitelistRequest => {
      if (!req) return false;
      // Filtrar mensagens que já foram processadas (com reação ✅ ou ❌)
      const msg = messages.find((m) => m.id === req.messageId);
      if (msg?.reactions) {
        const hasReaction = msg.reactions.some(
          (r) => r.emoji.name === "✅" || r.emoji.name === "❌"
        );
        if (hasReaction) return false;
      }
      return true;
    });
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
