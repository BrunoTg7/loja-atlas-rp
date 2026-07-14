import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { enqueueDiscordNotification } from "@/lib/queue";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    const gatewayProvider = process.env.GATEWAY_PROVIDER || "mock";
    const webhookSecret = process.env.GATEWAY_WEBHOOK_SECRET;

    if (gatewayProvider === "mock") {
      console.log("[WEBHOOK-MOCK] Recebido:", rawBody.substring(0, 200));
      return new Response("OK", { status: 200 });
    }

    if (webhookSecret) {
      const signature = headers["x-webhook-signature"] || headers["x-hub-signature-256"];
      if (!signature) {
        return new Response("Assinatura ausente", { status: 401 });
      }

      const crypto = await import("crypto");
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const sigClean = signature.replace("sha256=", "");
      const a = Buffer.from(sigClean);
      const b = Buffer.from(expectedSig);

      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return new Response("Assinatura inválida", { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response("JSON inválido", { status: 400 });
    }

    const paymentId = payload.payment_id || payload.id;
    const gatewayEventId = payload.event_id || payload.id;
    const status = payload.status;

    if (!paymentId || !status) {
      return new Response("Payload incompleto", { status: 400 });
    }

    const db = getSupabaseServer();

    // Idempotência
    const { error: eventError } = await db.from("payment_events").insert({
      id: `EVT-${crypto.randomUUID()}`,
      payment_id: paymentId,
      gateway_event_id: gatewayEventId,
      event_type: status,
      processed: false,
    });

    if (eventError && eventError.code === "23505") {
      return new Response("OK", { status: 200 });
    }

    if (status === "approved") {
      const { data: payment } = await db
        .from("payments")
        .select("order_id, id")
        .eq("id", paymentId)
        .single();

      if (payment) {
        const orderId = payment.order_id;

        const { data: order } = await db
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        const { data: items } = await db
          .from("order_items")
          .select("*")
          .eq("order_id", orderId);

        if (order && items) {
          await db
            .from("payments")
            .update({ status: "approved", paid_at: new Date().toISOString() })
            .eq("id", paymentId);

          await db
            .from("orders")
            .update({ status: "approved" })
            .eq("id", orderId);

          await enqueueDiscordNotification(orderId, order, items);

          await db
            .from("payment_events")
            .update({
              processed: true,
              processed_at: new Date().toISOString(),
            })
            .eq("gateway_event_id", gatewayEventId);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("[WEBHOOK] Erro interno:", err);
    return new Response("Erro interno", { status: 500 });
  }
}
