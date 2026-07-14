import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ event: data });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.steamId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!isStaffMember(session.steamId)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, image_url, form_fields, start_date, end_date, is_enabled } = body;

    if (!name || !start_date || !end_date) {
      return NextResponse.json({ error: "Nome, data de início e data de fim são obrigatórios" }, { status: 400 });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return NextResponse.json({ error: "Data de fim não pode ser anterior à data de início" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("events")
      .update({
        name,
        description: description || null,
        image_url: image_url || null,
        form_fields: form_fields || [],
        start_date,
        end_date,
        is_enabled,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.steamId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!isStaffMember(session.steamId)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
