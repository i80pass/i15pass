// Status change logger for the I-15 site.
//
// Reads the live NDOT road conditions and events for the corridor segments
// and appends an entry to lib/status-history.json whenever a segment's
// derived status changes: opened or closed state flipped, or the posted
// restriction (chains, wind, or both) changed. Same contract as the sibling
// loggers: change based, first run per segment writes a BASELINE entry,
// unchanged runs leave the file byte identical, and the key is read from
// .env.local and never printed. Mountain Pass has no NDOT segment of its
// own; its page rides on the Primm posting, so it shares the Primm entry.
// Run hourly from a host that has NDOT_API_KEY in .env.local; commit and
// push the JSON to publish new entries.
//
// Usage: node scripts/log-status.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envText = fs.existsSync(path.join(root, ".env.local"))
  ? fs.readFileSync(path.join(root, ".env.local"), "utf8")
  : "";
const KEY = (envText.match(/NDOT_API_KEY=(.*)/) || [])[1]?.trim() || process.env.NDOT_API_KEY;
if (!KEY) {
  console.error("NDOT_API_KEY missing from .env.local; logger cannot run.");
  process.exit(1);
}

const CORRIDORS = [
  { slug: "las-vegas", name: "Las Vegas", roadwayIncludes: ["i-15"], bbox: { south: 35.98, north: 36.32, west: -115.32, east: -114.98 } },
  { slug: "primm-state-line", name: "Primm and the State Line", roadwayIncludes: ["i-15"], bbox: { south: 35.585, north: 35.99, west: -115.6, east: -115.1 } },
  { slug: "mesquite-virgin-river-gorge", name: "Mesquite and the Virgin River Gorge", roadwayIncludes: ["i-15"], bbox: { south: 36.72, north: 37.02, west: -114.2, east: -113.9 } },
];

async function get(resource, version) {
  const res = await fetch(`https://www.nvroads.com/api/${version}/get/${resource}?key=${encodeURIComponent(KEY)}&format=json`);
  if (!res.ok) throw new Error(`${resource} HTTP ${res.status}`);
  return res.json();
}

function decodePolyline(encoded) {
  const str = Array.isArray(encoded) ? encoded[0] : encoded;
  if (!str) return [];
  let index = 0, lat = 0, lng = 0;
  const points = [];
  while (index < str.length) {
    let b, shift = 0, result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ lat: lat / 1e5, lon: lng / 1e5 });
  }
  return points;
}
const mid = (pts) => (pts.length ? pts[Math.floor(pts.length / 2)] : null);
const inBbox = (p, b) => p && p.lat >= b.south && p.lat <= b.north && p.lon >= b.west && p.lon <= b.east;
const named = (name, pats) => name && pats.some((p) => String(name).toLowerCase().includes(p));
const text = (v) => String(v == null ? "" : v).replace(/\u2014|\u2013/g, ", ");

function restrictionOf(segments) {
  const all = segments
    .map((s) => `${text(s["Overall Status"])} ${text((s["Secondary Conditions"] || []).join(" "))}`)
    .join(" ")
    .toLowerCase();
  const chains = /chain|snow tire|traction/.test(all);
  const wind = /wind/.test(all);
  if (chains && wind) return "chains and wind";
  if (chains) return "chains";
  if (wind) return "wind";
  return null;
}

const [conditions, eventsRaw] = await Promise.all([
  get("roadconditions", "v3"),
  get("event", "v2").catch(() => []),
]);

const historyPath = path.join(root, "lib", "status-history.json");
let history = { entries: [] };
try {
  history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
  if (!Array.isArray(history.entries)) history.entries = [];
} catch { /* first run */ }

let changed = false;
for (const c of CORRIDORS) {
  const segments = (conditions || []).filter((s) => {
    const m = mid(decodePolyline(s.EncodedPolyline));
    return named(s.RoadwayName || "", c.roadwayIncludes) && inBbox(m, c.bbox);
  });
  const events = (eventsRaw || []).filter((e) => inBbox({ lat: e.Latitude, lon: e.Longitude }, c.bbox));
  const closed =
    segments.some((s) => /closed/i.test(text(s["Overall Status"]))) ||
    events.some((e) => e.IsFullClosure === true || /full closure/i.test(text(e.EventType)));
  const restriction = restrictionOf(segments);
  const stateKey = `${closed ? "closed" : "open"}|${restriction || "none"}`;
  const prev = [...history.entries].reverse().find((e) => e.corridor === c.slug);
  if (!prev) {
    history.entries.push({
      corridor: c.slug,
      corridorName: c.name,
      change: "BASELINE",
      detail: closed ? "Closed at first log" : restriction ? `Open, restriction posted: ${restriction}` : "Open, no restriction posted",
      at: new Date().toISOString(),
    });
    changed = true;
  } else {
    const prevKey = `${prev.closed ? "closed" : "open"}|${prev.restriction || "none"}`;
    if (prevKey !== stateKey) {
      const change = closed ? "CLOSED" : prev.closed ? "REOPENED" : restriction ? "RESTRICTION POSTED" : "RESTRICTION CLEARED";
      const posting = segments.map((s) => text(s["Overall Status"])).filter(Boolean)[0] || "";
      history.entries.push({
        corridor: c.slug,
        corridorName: c.name,
        change,
        closed,
        restriction,
        detail: posting,
        at: new Date().toISOString(),
      });
      changed = true;
    }
  }
  // Keep the latest derived state on the baseline entries consistent for
  // future comparisons: store state fields on every new entry.
  const last = history.entries[history.entries.length - 1];
  if (last && last.corridor === c.slug && last.closed === undefined) {
    last.closed = closed;
    last.restriction = restriction;
  }
}

if (changed) {
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log("Status history updated.");
} else {
  console.log("No changes.");
}
