import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  }

  const db = getSupabaseServer();

  const { data: order, error } = await db
    .from("orders")
    .select("id, status, total_cents, currency, created_at")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const createdAt = new Date(order.created_at).getTime();
  const now = Date.now();
  const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);

  if (order.status === "created" || order.status === "pending") {
    if (hoursElapsed >= 24) {
      await db
        .from("orders")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", id);

      await db
        .from("payments")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("order_id", id)
        .eq("status", "created");

      return NextResponse.json({
        orderId: order.id,
        status: "expired",
        totalCents: order.total_cents,
        currency: order.currency,
      });
    }

    const { data: payment } = await db
      .from("payments")
      .select("status")
      .eq("order_id", id)
      .single();

    if (payment?.status === "approved") {
      await db
        .from("orders")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", id);

      return NextResponse.json({
        orderId: order.id,
        status: "approved",
        totalCents: order.total_cents,
        currency: order.currency,
      });
    }
  }

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    totalCents: order.total_cents,
    currency: order.currency,
    createdAt: order.created_at,
    expiresIn: Math.max(0, Math.floor(24 * 60 * 60 - (now - createdAt) / 1000)),
  });
}
