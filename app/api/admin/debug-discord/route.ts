import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1416894585401118863";

export async function GET() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_WL_CHANNEL_ID;

  if (!token || !channelId) {
    return NextResponse.json({ error: "Variáveis não configuradas" });
  }

  const headers = { Authorization: `Bot ${token}` };

  // 1. Bot info
  const botRes = await fetch(`${DISCORD_API}/users/@me`, { headers });
  const botData = await botRes.json();

  // 2. Verificar se bot está no servidor
  const guildRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}`, { headers });
  const guildData = await guildRes.json();

  // 3. Listar canais do servidor
  let channels: unknown = null;
  if (guildRes.ok) {
    const chRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/channels`, { headers });
    channels = chRes.ok ? await chRes.json() : await chRes.json();
  }

  // 4. Tentar acessar o canal específico
  const channelRes = await fetch(`${DISCORD_API}/channels/${channelId}`, { headers });
  const channelData = await channelRes.json();

  return NextResponse.json({
    bot: botRes.ok ? { id: botData.id, username: botData.username } : { error: botData },
    guild: guildRes.ok ? { id: guildData.id, name: guildData.name } : { error: guildData },
    channel: channelRes.ok ? { id: channelData.id, name: channelData.name } : { error: channelData },
    channels,
  });
}
