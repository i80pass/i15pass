// Camera snapshot builder for the I-15 site.
//
// Pulls the full Nevada 511 camera list once and writes lib/ndot-cameras.json
// with the cameras that belong to this corridor's segments, each tagged with
// its segment slug and a sort key so pages can sequence them in driving
// order. Key comes from NDOT_API_KEY in .env.local (or the environment).
// The throttle on the NDOT account is 10 calls per 60 seconds; this script
// makes exactly one call. The key is never printed.
//
// Usage: node scripts/refresh-camera-snapshot.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envText = fs.existsSync(path.join(root, ".env.local"))
  ? fs.readFileSync(path.join(root, ".env.local"), "utf8")
  : "";
const KEY = (envText.match(/NDOT_API_KEY=(.*)/) || [])[1]?.trim() || process.env.NDOT_API_KEY;
if (!KEY) {
  console.error("NDOT_API_KEY missing: add it to .env.local before running the snapshot refresh.");
  process.exit(1);
}

const CORRIDORS = [
  { slug: "las-vegas", roadwayIncludes: ["i-15", "215", "515", "93", "95"], bbox: { south: 35.98, north: 36.32, west: -115.32, east: -114.98 } },
  { slug: "primm-state-line", roadwayIncludes: ["i-15"], bbox: { south: 35.585, north: 35.99, west: -115.6, east: -115.1 } },
  { slug: "mesquite-virgin-river-gorge", roadwayIncludes: ["i-15"], bbox: { south: 36.72, north: 37.02, west: -114.2, east: -113.9 } },
];

const inBbox = (lat, lon, b) => lat >= b.south && lat <= b.north && lon >= b.west && lon <= b.east;
const named = (name, pats) => name && pats.some((p) => String(name).toLowerCase().includes(p));

const res = await fetch(`https://www.nvroads.com/api/v2/get/cameras?key=${encodeURIComponent(KEY)}&format=json`);
if (!res.ok) {
  console.error(`NDOT cameras HTTP ${res.status}`);
  process.exit(1);
}
const all = await res.json();

const cameras = [];
for (const raw of all) {
  const roadway = raw.Roadway || "I-15";
  const corridor = CORRIDORS.find(
    (c) => named(roadway, c.roadwayIncludes) && inBbox(raw.Latitude, raw.Longitude, c.bbox)
  );
  if (!corridor) continue;
  const views = (raw.Views || [])
    .filter((v) => !v.Status || String(v.Status).toLowerCase() === "enabled")
    .map((v) => ({
      id: String(v.Id),
      url: v.Url,
      description: v.Description || null,
    }));
  if (!views.length) continue;
  cameras.push({
    id: String(raw.Id),
    location: raw.Location || `${roadway} ${raw.Direction || ""}`.trim(),
    roadway,
    direction: raw.Direction || null,
    lat: raw.Latitude,
    lon: raw.Longitude,
    sortOrder: raw.SortOrder ?? null,
    corridorSlug: corridor.slug,
    views,
  });
}

cameras.sort((a, b) => a.lat - b.lat);

const out = {
  note: "NDOT camera snapshot for the I-15 corridor segments, written by scripts/refresh-camera-snapshot.mjs. Pages fall back to this list when the live API is unavailable or the key is not set.",
  refreshedAt: new Date().toISOString(),
  cameras,
};
fs.writeFileSync(path.join(root, "lib", "ndot-cameras.json"), JSON.stringify(out, null, 2));
const byCorridor = {};
for (const c of cameras) byCorridor[c.corridorSlug] = (byCorridor[c.corridorSlug] || 0) + c.views.length;
console.log(`Snapshot written: ${cameras.length} cameras, ${cameras.reduce((n, c) => n + c.views.length, 0)} views.`, byCorridor);
