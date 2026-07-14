import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { sendSignedToDiscord } from "@/lib/discord";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getSupabaseServer();

  const { data: pending, error } = await db
    .from("discord_queue")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", 5)
    .order("created_at", { ascending: true })
    .limit(20);

  if (error || !pending) {
    return NextResponse.json({ error: "Erro ao buscar fila" }, { status: 500 });
  }

  let processed = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const { signature, ...payloadWithoutSig } = item.payload;
      await sendSignedToDiscord(payloadWithoutSig);

      await db
        .from("discord_queue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", item.id);

      processed++;
    } catch (err: any) {
      const nextAttempts = item.attempts + 1;
      await db
        .from("discord_queue")
        .update({
          attempts: nextAttempts,
          last_error: err.message || String(err),
          status: nextAttempts >= 5 ? "failed" : "pending",
        })
        .eq("id", item.id);

      failed++;
    }
  }

  return NextResponse.json({ processed, failed, total: pending.length });
}
