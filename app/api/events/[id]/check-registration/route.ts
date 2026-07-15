import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSession } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.steamId) {
      return NextResponse.json({ registered: false });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", id)
      .eq("steam_id", session.steamId)
      .maybeSingle();

    return NextResponse.json({ registered: !!data });
  } catch {
    return NextResponse.json({ registered: false });
  }
}
