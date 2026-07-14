import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getSupabaseServer();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: expired, error } = await db
    .from("orders")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .in("status", ["created", "pending"])
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    return NextResponse.json({ error: "Erro ao expirar pedidos" }, { status: 500 });
  }

  if (expired && expired.length > 0) {
    for (const order of expired) {
      await db
        .from("payments")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("order_id", order.id)
        .in("status", ["created", "pending"]);
    }
  }

  return NextResponse.json({
    success: true,
    expired: expired?.length || 0,
  });
}
