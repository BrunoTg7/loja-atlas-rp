import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isStaffMember(session.steamId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { getSupabaseServer } = await import("@/lib/supabase-server");
  const db = getSupabaseServer();

  const { data, error } = await db
    .from("product_promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Erro ao buscar promoções." }, { status: 500 });
  return NextResponse.json({ productPromotions: data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isStaffMember(session.steamId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const body = await req.json();
  const { product_id, discount_type, discount_value, min_order_cents, payment_methods, starts_at, ends_at } = body;

  if (!product_id || typeof product_id !== "string") {
    return NextResponse.json({ error: "ID do produto é obrigatório." }, { status: 400 });
  }

  if (!discount_value || discount_value <= 0) {
    return NextResponse.json({ error: "Valor do desconto deve ser maior que 0." }, { status: 400 });
  }

  if (discount_type === "percentage" && discount_value > 100) {
    return NextResponse.json({ error: "Desconto percentual não pode exceder 100%." }, { status: 400 });
  }

  const { getSupabaseServer } = await import("@/lib/supabase-server");
  const db = getSupabaseServer();

  // Verificar duplicata apenas para produto específico (não para ALL)
  if (product_id !== "ALL") {
    const { data: existing } = await db
      .from("product_promotions")
      .select("id")
      .eq("product_id", product_id)
      .eq("active", true)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma promoção ativa para este produto. Desative a anterior primeiro." },
        { status: 409 }
      );
    }
  }

  const id = `PPROMO-${crypto.randomUUID()}`;
  const { error } = await db.from("product_promotions").insert({
    id,
    product_id,
    discount_type: discount_type || "percentage",
    discount_value,
    min_order_cents: min_order_cents || 0,
    payment_methods: payment_methods || null,
    active: true,
    starts_at: starts_at || new Date().toISOString(),
    ends_at: ends_at || null,
    created_by: session.steamId,
  });

  if (error) return NextResponse.json({ error: "Erro ao criar promoção." }, { status: 500 });
  return NextResponse.json({ success: true, id });
}
