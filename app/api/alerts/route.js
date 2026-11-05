import { NextResponse } from "next/server";
import { getAlerts, cleanText } from "@/lib/ndot";

export const revalidate = 300;

export async function GET() {
  const alerts = await getAlerts();
  return NextResponse.json({
    alerts: (alerts || []).map((a) => ({
      message: cleanText(a.Message || a.Title || a.Headline || ""),
      regions: a.Regions || a.AreaName || null,
    })),
    source: "Nevada 511 / NDOT",
    fetchedAt: new Date().toISOString(),
  });
}
