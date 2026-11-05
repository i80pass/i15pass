import { NextResponse } from "next/server";
import { CORRIDORS } from "@/lib/corridors";
import { getAllCameras, getCorridorCameras } from "@/lib/ndot";

export const revalidate = 300;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const only = searchParams.get("corridor");
  const corridor = only ? CORRIDORS.find((c) => c.slug === only) : null;
  const cameras = corridor ? await getCorridorCameras(corridor) : await getAllCameras();
  return NextResponse.json({
    cameras: cameras.map((cam) => ({
      id: cam.id,
      location: cam.location,
      roadway: cam.roadway,
      direction: cam.direction,
      corridor: cam.corridorSlug,
      views: cam.views.map((v) => ({ id: v.id, url: v.url, description: v.description })),
    })),
    source: "Nevada 511 / NDOT",
    fetchedAt: new Date().toISOString(),
  });
}
