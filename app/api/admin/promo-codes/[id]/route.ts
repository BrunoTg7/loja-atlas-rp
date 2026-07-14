import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isStaffMember(session.steamId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const { getSupabaseServer } = await import("@/lib/supabase-server");
  const db = getSupabaseServer();

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.code !== undefined) updateData.code = body.code.trim().toUpperCase();
  if (body.discount_type !== undefined) updateData.discount_type = body.discount_type;
  if (body.discount_value !== undefined) updateData.discount_value = body.discount_value;
  if (body.min_order_cents !== undefined) updateData.min_order_cents = body.min_order_cents;
  if (body.max_uses_total !== undefined) updateData.max_uses_total = body.max_uses_total;
  if (body.max_uses_per_user !== undefined) updateData.max_uses_per_user = body.max_uses_per_user;
  if (body.active !== undefined) updateData.active = body.active;
  if (body.starts_at !== undefined) updateData.starts_at = body.starts_at;
  if (body.ends_at !== undefined) updateData.ends_at = body.ends_at;

  const { error } = await db
    .from("promo_codes")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Erro ao atualizar cupom." }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!isStaffMember(session.steamId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { id } = await params;

  const { getSupabaseServer } = await import("@/lib/supabase-server");
  const db = getSupabaseServer();

  const { error } = await db
    .from("promo_codes")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Erro ao desativar cupom." }, { status: 500 });
  return NextResponse.json({ success: true });
}
