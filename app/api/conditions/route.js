import { NextResponse } from "next/server";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { getCorridorStatus, statusSentence } from "@/lib/ndot";

export const revalidate = 120;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const only = searchParams.get("corridor");
  const list = only ? CORRIDORS.filter((c) => c.slug === only) : CORRIDORS;
  const out = await Promise.all(
    list.map(async (c) => {
      const status = await getCorridorStatus(statusCorridor(c));
      return {
        corridor: c.slug,
        name: c.name,
        road: c.routeLabel,
        live: status.live,
        closed: status.closed,
        restriction: status.traction,
        sentence: statusSentence(c, status),
        updatedAt: status.updatedAt,
        source: "Nevada 511 / NDOT",
      };
    })
  );
  return NextResponse.json({ corridors: out, fetchedAt: new Date().toISOString() });
}
