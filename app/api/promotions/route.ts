import { NextResponse } from "next/server";
import { getActiveProductPromotions } from "@/lib/services/promotion.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const promos = await getActiveProductPromotions();
    return NextResponse.json({ promotions: promos });
  } catch {
    return NextResponse.json({ promotions: [] });
  }
}
