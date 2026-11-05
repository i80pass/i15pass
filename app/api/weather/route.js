import { NextResponse } from "next/server";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { getWeatherStations, corridorStations } from "@/lib/ndot";

export const revalidate = 300;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const only = searchParams.get("corridor");
  const stations = (await getWeatherStations()) || [];
  const corridor = only ? CORRIDORS.find((c) => c.slug === only) : null;
  const list = corridor ? corridorStations(stations, statusCorridor(corridor)) : stations;
  return NextResponse.json({
    stations: list.map((s) => ({
      name: s.DeviceName || s.StationName,
      airTemperatureF: s.AirTemperature,
      dewpointF: s.Dewpoint,
      humidity: s.RelativeHumidity,
      windMph: s.Wind,
      windGustMph: s.WindGust,
      windDirection: s.WindDirection,
    })),
    units: "Fahrenheit, miles per hour, as NDOT reports them",
    source: "Nevada 511 / NDOT weather stations",
    fetchedAt: new Date().toISOString(),
  });
}
