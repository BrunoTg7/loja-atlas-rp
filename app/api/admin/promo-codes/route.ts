import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isStaffMember(session.steamId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ promoCodes: [] });
  }

  const { getSupabaseServer } = await import("@/lib/supabase-server");
  const db = getSupabaseServer();

  const { data, error } = await db
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message?.includes("does not exist") || error.code === "42P01") {
      return NextResponse.json({ error: "Tabela promo_codes não existe. Execute o SQL do schema.sql no Supabase.", promoCodes: [] }, { status: 200 });
    }
    return NextResponse.json({ error: error.message, promoCodes: [] }, { status: 200 });
  }
  return NextResponse.json({ promoCodes: data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isStaffMember(session.steamId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const body = await req.json();
  const { code, discount_type, discount_value, min_order_cents, max_uses_total, max_uses_per_user, starts_at, ends_at } = body;

  if (!code || typeof code !== "string" || code.trim().length < 3) {
    return NextResponse.json({ error: "Código do cupom deve ter pelo menos 3 caracteres." }, { status: 400 });
  }

  if (!discount_value || discount_value <= 0) {
    return NextResponse.json({ error: "Valor do desconto deve ser maior que 0." }, { status: 400 });
  }

  if (discount_type === "percentage" && discount_value > 100) {
    return NextResponse.json({ error: "Desconto percentual não pode exceder 100%." }, { status: 400 });
  }

  const { getSupabaseServer } = await import("@/lib/supabase-server");
  const db = getSupabaseServer();

  const { data: existing } = await db
    .from("promo_codes")
    .select("id")
    .ilike("code", code.trim())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Já existe um cupom com este código." }, { status: 409 });
  }

  const id = `PROMO-${crypto.randomUUID()}`;
  const { error } = await db.from("promo_codes").insert({
    id,
    code: code.trim().toUpperCase(),
    discount_type: discount_type || "percentage",
    discount_value,
    min_order_cents: min_order_cents || 0,
    max_uses_total: max_uses_total || null,
    max_uses_per_user: max_uses_per_user || 1,
    active: true,
    starts_at: starts_at || new Date().toISOString(),
    ends_at: ends_at || null,
    created_by: session.steamId,
  });

  if (error) {
    if (error.message?.includes("does not exist") || error.code === "42P01") {
      return NextResponse.json({ error: "Tabela promo_codes não existe. Execute o SQL do schema.sql no Supabase." }, { status: 500 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, id });
}
