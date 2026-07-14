import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { verifyPayloadSignature } from "@/lib/discord";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const { signature, ...payloadBody } = payload;
    if (!signature) {
      return NextResponse.json({ error: "Assinatura ausente" }, { status: 401 });
    }

    const valid = verifyPayloadSignature(payloadBody, signature);
    if (!valid) {
      console.error("[FULFILLMENT] Assinatura inválida — possível tentativa de fraude");
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    const { order_id, success, error: fulfillmentError } = payloadBody;

    if (!order_id) {
      return NextResponse.json({ error: "order_id ausente" }, { status: 400 });
    }

    const db = getSupabaseServer();

    const newStatus = success ? "approved" : "failed";

    await db
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", order_id);

    console.log(`[FULFILLMENT] Pedido ${order_id} marcado como ${newStatus}`);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[FULFILLMENT] Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
