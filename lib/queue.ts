import { getSupabaseServer } from "@/lib/supabase-server";
import { buildFulfillmentPayload, signPayload, sendSignedToDiscord } from "@/lib/discord";

interface OrderData {
  id: string;
  user_steam_id: string;
  steam_hex: string;
  char_id: string;
  total_cents: number;
  currency: string;
  terms_accepted: boolean;
  terms_version: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  amount: number;
  price_cents: number;
  type: string;
}

export async function enqueueDiscordNotification(
  orderId: string,
  order: OrderData,
  items: OrderItem[]
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const payload = buildFulfillmentPayload({
    orderId: order.id,
    charId: order.char_id,
    steamId: order.user_steam_id,
    steamHex: order.steam_hex,
    totalCents: order.total_cents,
    currency: order.currency,
    termsAccepted: order.terms_accepted,
    termsVersion: order.terms_version,
    items: items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      amount: item.amount,
      priceCents: item.price_cents,
      type: item.type,
    })),
    callbackUrl: `${baseUrl}/api/fulfillment/confirm`,
  });

  const { signature } = signPayload(payload);

  const db = getSupabaseServer();

  await db.from("discord_queue").insert({
    id: `DQ-${crypto.randomUUID()}`,
    order_id: orderId,
    payload: { ...payload, signature },
    status: "pending",
    attempts: 0,
  });
}
