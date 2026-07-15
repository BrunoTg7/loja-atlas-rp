import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const all = request.nextUrl.searchParams.get("all");

    if (all) {
      const session = await getSession();
      if (!session?.steamId || !isStaffMember(session.steamId)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ events: data || [] });
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_enabled", true)
      .gte("end_date", cutoff)
      .order("start_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data || [] });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.steamId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!isStaffMember(session.steamId)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

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
      .insert({
        name,
        description: description || null,
        image_url: image_url || null,
        form_fields: form_fields || [],
        start_date,
        end_date,
        is_enabled: is_enabled !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
