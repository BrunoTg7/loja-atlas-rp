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
