import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sanitizeInput } from "@/lib/sanitize";
import { getGatewayProvider } from "@/lib/gateway/factory";
import { applyPromotion, recordPromoUse } from "@/lib/services/promotion.service";
import type { OrderItemInput } from "@/lib/services/promotion.service";

interface CartItemPayload {
  id: string;
  name: string;
  price: number;
  amount: number;
  type: string;
}

interface CardData {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
  cpf: string;
}

interface CheckoutBody {
  char_id: string;
  discord_id?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  terms_accepted: boolean;
  payment_method: "pix" | "credit_card";
  installments?: number;
  card_data?: CardData;
  items: CartItemPayload[];
  promo_code?: string;
}

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Faça login para continuar." },
        { status: 401 }
      );
    }

    const body: CheckoutBody = await req.json();
    const { char_id, discord_id, contact_name, contact_email, contact_phone, terms_accepted, payment_method, installments, card_data, items, promo_code } = body;

    if (!terms_accepted) {
      return NextResponse.json(
        { error: "Você precisa aceitar os Termos de Uso e Política de Privacidade." },
        { status: 400 }
      );
    }

    if (!char_id || char_id.trim().length === 0) {
      return NextResponse.json(
        { error: "Informe o ID do personagem." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(char_id.trim())) {
      return NextResponse.json(
        { error: "ID do personagem contém caracteres inválidos." },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Carrinho vazio." },
        { status: 400 }
      );
    }

    if (!payment_method || !["pix", "credit_card"].includes(payment_method)) {
      return NextResponse.json(
        { error: "Método de pagamento inválido." },
        { status: 400 }
      );
    }

    if (payment_method === "credit_card") {
      if (!card_data?.name || !card_data?.number || !card_data?.expiry || !card_data?.cvv || !card_data?.cpf) {
        return NextResponse.json(
          { error: "Dados do cartão incompletos." },
          { status: 400 }
        );
      }
      const cleanNumber = card_data.number.replace(/\s/g, "");
      if (cleanNumber.length < 16 || !/^\d+$/.test(cleanNumber)) {
        return NextResponse.json(
          { error: "Número do cartão inválido." },
          { status: 400 }
        );
      }
      if (card_data.cpf.replace(/\D/g, "").length < 11) {
        return NextResponse.json(
          { error: "CPF inválido." },
          { status: 400 }
        );
      }
    }

    for (const item of items) {
      if (!item.id || !item.name || item.price <= 0 || item.amount <= 0) {
        return NextResponse.json(
          { error: "Item do carrinho inválido." },
          { status: 400 }
        );
      }
    }

    const cleanCharId = sanitizeInput(char_id.trim());

    // ─── Cálculo de promoções (backend, nunca confiar no client) ──
    const orderItems: OrderItemInput[] = items.map((item) => ({
      product_id: item.id,
      name: item.name,
      price_cents: Math.round(item.price * 100),
      amount: item.amount,
      type: item.type,
    }));

    const subtotalCents = orderItems.reduce(
      (sum, item) => sum + item.price_cents * item.amount,
      0
    );

    let promotionResult;
    try {
      promotionResult = await applyPromotion({
        items: orderItems,
        promoCode: promo_code,
        userSteamId: session.steamId,
        paymentMethod: payment_method,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao validar promoção.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    let totalCents = promotionResult.totalCents;
    const discountCents = promotionResult.discountCents;

    // PIX: 10% OFF adicional se total >= R$99.90 (sobre o valor já com desconto de promoção)
    const pixDiscount = payment_method === "pix" && totalCents >= 9990;
    if (pixDiscount) {
      totalCents = Math.round(totalCents * 0.9);
    }

    const orderId = generateId("ORD");
    const paymentId = generateId("PAY");
    const customerIp = getClientIp(req);
    const termsVersion = "v1.0";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      const gateway = getGatewayProvider();
      const gatewayResult = await gateway.createPayment({
        orderId,
        amountCents: totalCents,
        currency: "BRL",
        method: payment_method,
        customerName: session.personaName,
        description: `Pedido ${orderId} - ${items.map((i) => i.name).join(", ")}`,
        installments,
        callbackUrl: `${baseUrl}/api/webhook`,
        cardData: card_data,
      });

      if (payment_method === "pix") {
        return NextResponse.json({
          success: true,
          orderId,
          paymentId: gatewayResult.paymentId,
          pixCode: gatewayResult.pixCode,
          pixQrCode: gatewayResult.pixQrCode,
          totalCents,
          subtotalCents,
          discountCents,
          pixDiscount,
          status: gatewayResult.status,
          mock: true,
        });
      }

      return NextResponse.json({
        success: gatewayResult.success,
        orderId,
        paymentId: gatewayResult.paymentId,
        status: gatewayResult.status,
        error: gatewayResult.error,
        mock: true,
      });
    }

    const { getSupabaseServer } = await import("@/lib/supabase-server");
    const db = getSupabaseServer();

    const itemsJson = orderItems.map((item) => ({
      id: `ITEM-${crypto.randomUUID()}`,
      product_id: item.product_id,
      name: item.name,
      amount: item.amount,
      price_cents: item.price_cents,
      type: item.type,
    }));

    const { error } = await db.rpc("create_order_with_payment", {
      p_order_id: orderId,
      p_user_steam_id: session.steamId,
      p_steam_hex: session.steamIdFormatted,
      p_char_id: cleanCharId,
      p_total_cents: totalCents,
      p_currency: "BRL",
      p_customer_name: contact_name?.trim() || session.personaName,
      p_customer_email: contact_email?.trim() || null,
      p_terms_accepted: terms_accepted,
      p_terms_version: termsVersion,
      p_customer_ip: customerIp,
      p_items: itemsJson,
      p_payment_id: paymentId,
      p_gateway: process.env.GATEWAY_PROVIDER || "mock",
      p_discord_id: discord_id || null,
      p_contact_name: contact_name?.trim() || null,
      p_contact_email: contact_email?.trim() || null,
      p_contact_phone: contact_phone?.trim() || null,
    });

    if (error) {
      console.error("[CHECKOUT-DB] Erro ao criar pedido:", error);
      return NextResponse.json(
        { error: "Erro ao processar pedido. Tente novamente." },
        { status: 500 }
      );
    }

    // Atualizar orders com dados de desconto
    await db
      .from("orders")
      .update({
        discount_cents: discountCents,
        subtotal_cents: subtotalCents,
        promo_code_id: promotionResult.appliedPromoCodeId,
      })
      .eq("id", orderId);

    // Registrar uso do cupom
    if (promotionResult.appliedPromoCodeId) {
      await recordPromoUse(
        promotionResult.appliedPromoCodeId,
        orderId,
        session.steamId,
        discountCents
      );
    }

    const gateway = getGatewayProvider();
    const gatewayResult = await gateway.createPayment({
      orderId,
      amountCents: totalCents,
      currency: "BRL",
      method: payment_method,
      customerName: session.personaName,
      description: `Pedido ${orderId} - ${items.map((i) => i.name).join(", ")}`,
      installments,
      callbackUrl: `${baseUrl}/api/webhook`,
      cardData: card_data,
    });

    if (!gatewayResult.success) {
      return NextResponse.json(
        { error: gatewayResult.error || "Erro ao criar pagamento." },
        { status: 500 }
      );
    }

    await db
      .from("payments")
      .update({
        gateway_id: gatewayResult.paymentId,
        pix_code: gatewayResult.pixCode || null,
        pix_qr_code: gatewayResult.pixQrCode || null,
        method: payment_method,
      })
      .eq("id", paymentId);

    if (payment_method === "credit_card" && gatewayResult.status === "approved") {
      await db
        .from("payments")
        .update({ status: "approved", paid_at: new Date().toISOString() })
        .eq("id", paymentId);

      await db
        .from("orders")
        .update({ status: "approved" })
        .eq("id", orderId);
    }

    if (payment_method === "pix") {
      return NextResponse.json({
        success: true,
        orderId,
        paymentId: gatewayResult.paymentId,
        pixCode: gatewayResult.pixCode,
        pixQrCode: gatewayResult.pixQrCode,
        totalCents,
        subtotalCents,
        discountCents,
        pixDiscount,
        status: gatewayResult.status,
      });
    }

    return NextResponse.json({
      success: gatewayResult.success,
      orderId,
      paymentId: gatewayResult.paymentId,
      status: gatewayResult.status,
      totalCents,
      subtotalCents,
      discountCents,
    });
  } catch (err: unknown) {
    console.error("[CHECKOUT] Erro interno:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
