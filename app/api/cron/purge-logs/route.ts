import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const retentionDays = parseInt(process.env.PAYMENT_LOGS_RETENTION_DAYS || "180");
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const db = getSupabaseServer();

  const { data: oldLogs, error: countError } = await db
    .from("payment_logs")
    .select("id", { count: "exact", head: true })
    .lt("created_at", cutoff);

  if (countError) {
    return NextResponse.json({ error: "Erro ao contar logs" }, { status: 500 });
  }

  const { error: purgeError } = await db
    .from("payment_logs")
    .update({
      payload: {},
      headers: {},
      ip_address: null,
    })
    .lt("created_at", cutoff);

  if (purgeError) {
    console.error("[PURGE-LOGS] Erro ao anonimizar:", purgeError);
    return NextResponse.json({ error: "Falha ao purgar logs antigos" }, { status: 500 });
  }

  const { error: queueError } = await db
    .from("discord_queue")
    .delete()
    .lt("created_at", cutoff)
    .eq("status", "sent");

  if (queueError) {
    console.error("[PURGE-LOGS] Erro ao limpar fila:", queueError);
  }

  const { error: eventError } = await db
    .from("payment_events")
    .delete()
    .lt("created_at", cutoff)
    .eq("processed", true);

  if (eventError) {
    console.error("[PURGE-LOGS] Erro ao limpar eventos:", eventError);
  }

  return NextResponse.json({
    success: true,
    retentionDays,
    cutoff,
  });
}
