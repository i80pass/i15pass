// Caltrans camera snapshot builder for the Cajon Pass corridor.
//
// Pulls the Caltrans District 8 CCTV list once and writes
// lib/caltrans-cameras.json with the in-service I-15 cameras inside the
// Cajon Pass corridor box (Devore to Hesperia), sorted north to south,
// which is driving order for the corridor's fromTo. Caltrans CCTV data is
// public and needs no key. The camera inventory is snapshot only, the
// same discipline as the Nevada 511 snapshot: pages never call the live
// feed for inventory during a render or a build.
//
// Usage: node scripts/refresh-caltrans-cameras.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// The Cajon Pass corridor box: the I-215 junction at Devore (south) to
// Main Street in Hesperia (north), the exact stretch the Caltrans chain
// control checkpoint for the pass covers.
const BBOX = { south: 34.19, north: 34.44, west: -117.5, east: -117.36 };
const inBbox = (lat, lon, b) => lat >= b.south && lat <= b.north && lon >= b.west && lon <= b.east;

const res = await fetch("https://cwwp2.dot.ca.gov/data/d8/cctv/cctvStatusD08.json");
if (!res.ok) {
  console.error(`Caltrans CCTV HTTP ${res.status}`);
  process.exit(1);
}
const data = await res.json();
const records = Array.isArray(data?.data) ? data.data : [];

const cameras = [];
for (const r of records) {
  const c = r?.cctv;
  if (!c) continue;
  const loc = c.location || {};
  if (loc.route !== "I-15") continue;
  if (String(c.inService).toLowerCase() !== "true") continue;
  const lat = parseFloat(loc.latitude);
  const lon = parseFloat(loc.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !inBbox(lat, lon, BBOX)) continue;
  const imageUrl = c.imageData?.static?.currentImageURL || "";
  if (!imageUrl) continue;
  cameras.push({
    index: String(c.index),
    name: loc.locationName || `I-15 camera ${c.index}`,
    lat,
    lon,
    imageUrl,
  });
}
// North to south: Hesperia down to Devore, the corridor's driving order.
cameras.sort((a, b) => b.lat - a.lat);

const out = {
  generatedAt: new Date().toISOString(),
  source: "Caltrans District 8 CCTV (cwwp2.dot.ca.gov), snapshot for the Cajon Pass corridor box",
  cameras,
};
fs.writeFileSync(path.join(root, "lib", "caltrans-cameras.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote lib/caltrans-cameras.json with ${cameras.length} cameras.`);
