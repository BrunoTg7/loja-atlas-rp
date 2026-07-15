import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSession } from "@/lib/session";
import { isStaffMember } from "@/lib/whitelistApi";

export async function GET(
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

    const { data, error } = await supabase
      .from("event_participants")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ participants: data || [] });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.steamId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { participant_name, participant_data } = body;

    if (!participant_name) {
      return NextResponse.json({ error: "Nome do participante é obrigatório" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, is_enabled, end_date")
      .eq("id", id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    if (!event.is_enabled) {
      return NextResponse.json({ error: "Este evento não está disponível" }, { status: 400 });
    }

    if (new Date(event.end_date) < new Date()) {
      return NextResponse.json({ error: "Este evento já encerrou" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", id)
      .eq("steam_id", session.steamId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Você já está inscrito neste evento" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("event_participants")
      .insert({
        event_id: id,
        steam_id: session.steamId,
        participant_name,
        participant_data: participant_data || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ participant: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
