// Nevada 511 (NDOT) data layer.
//
// Source: Nevada 511 developer API (Arcadis Travel-IQ 511 platform, the
// same platform family as UDOT Traffic and Idaho 511), documentation at
// https://www.nvroads.com/developers/doc.
// Auth: the developer key rides as a "key" query parameter on every call.
// Throttle: 10 calls per 60 seconds per key, so every getter below fetches
// the statewide list once and filters in memory; Next's fetch cache holds
// each resource for its revalidate window, which keeps the whole site far
// inside the limit.
//
// KEY STATUS (Nov 5, 2026): the NDOT developer signup is a browser step
// that has not run yet. While NDOT_API_KEY is empty every getter returns
// null and pages render their honest "feed pending" state. Nothing in
// this layer invents a status: no key, no live claims. Drop the key into
// NDOT_API_KEY (local .env.local and the hosting env vars, app level AND
// branch level) and run scripts/refresh-camera-snapshot.mjs, and every
// page goes live with no code changes.
//
// FIELD MAPPINGS (read from the NDOT endpoint documentation, Nov 5, 2026):
// - Road conditions: GET /api/v3/get/roadconditions. Fields: Id,
//   LocationDescription, "Overall Status" (the primary winter status
//   text, for example "Chains Required, All Vehicles except 4-wheel
//   drive with Snow tires"), "Secondary Conditions" (array of strings,
//   wind alerts live here), AreaName, RoadwayName, EncodedPolyline
//   (array holding one string), LastUpdated (unix seconds).
// - Cameras: GET /api/v2/get/cameras. Fields: Id, Source, SourceId,
//   Roadway, Direction, Latitude, Longitude, Location (often null on
//   this feed; Roadway carries the intersection name), SortOrder,
//   Views[] with Id, Url (https://www.nvroads.com/map/Cctv/{viewId}),
//   Status, Description, VideoUrl.
// - Weather stations: GET /api/v2/get/weatherstations. Fields: Id,
//   Latitude, Longitude, StationName, DeviceName, AirTemperature,
//   Dewpoint, RelativeHumidity, Wind, WindGust, WindDirection,
//   LastUpdated.
// - Events: GET /api/v2/get/event (falls back to /events). Same platform
//   shape as UDOT: RoadwayName, EncodedPolyline, EventType, Comment,
//   Description, IsFullClosure where published.
// - Alerts: GET /api/v2/get/alerts (falls back to /advisories).
//
// UNITS: NDOT weather station temperatures are Fahrenheit natively
// (documented on the weather stations endpoint: "The temperature in
// fahrenheit"), and wind is in miles per hour. Values are parsed and
// labeled as they arrive. Nothing is converted, ever.
//
// TEXT SANITIZER: every agency string passes through cleanText before it
// can render, so a live feed can never put a banned character (em dash,
// en dash, or their HTML entities) on a page. See the Gold Standard,
// Phase 12.

import snapshot from "./ndot-cameras.json";

const API_BASE = "https://www.nvroads.com/api";

export function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&mdash;/gi, ",")
    .replace(/&ndash;/gi, ",")
    .replace(/&#[xX]2014;/g, ",")
    .replace(/&#[xX]2013;/g, ",")
    .replace(/&#8212;/g, ",")
    .replace(/&#8211;/g, ",")
    .replace(/—/g, ", ")
    .replace(/–/g, ", ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .trim();
}

export function ndotKeyPresent() {
  return Boolean(process.env.NDOT_API_KEY);
}

async function ndotGet(resource, version, revalidate) {
  const key = process.env.NDOT_API_KEY;
  if (!key) return null;
  const url = `${API_BASE}/${version}/get/${resource}?key=${encodeURIComponent(key)}&format=json`;
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

// Google encoded polyline decode, needed because Nevada 511 locates road
// condition segments and events by polyline, not by a place name.
export function decodePolyline(encoded) {
  if (!encoded) return [];
  const str = Array.isArray(encoded) ? encoded[0] : encoded;
  if (!str) return [];
  let index = 0, lat = 0, lng = 0;
  const points = [];
  while (index < str.length) {
    let b, shift = 0, result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0; result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push({ lat: lat / 1e5, lon: lng / 1e5 });
  }
  return points;
}

function midpoint(points) {
  if (!points?.length) return null;
  return points[Math.floor(points.length / 2)];
}

function inBbox(point, bbox) {
  if (!point || !bbox) return false;
  return point.lat >= bbox.south && point.lat <= bbox.north && point.lon >= bbox.west && point.lon <= bbox.east;
}

function nameMatches(name, patterns) {
  if (!name || !patterns?.length) return false;
  const n = String(name).toLowerCase();
  return patterns.some((p) => n.includes(String(p).toLowerCase()));
}

const normRoad = (s) => String(s || "").toUpperCase().replace(/[\s-]/g, "");

// ---- Cameras -------------------------------------------------------------

export function snapshotCameras() {
  const list = Array.isArray(snapshot.cameras) ? snapshot.cameras : [];
  return list.filter((c) => !c._seed);
}

export async function getAllCameras() {
  const live = await ndotGet("cameras", "v2", 3600);
  if (live) {
    return live.map(normalizeCamera).filter((c) => c.views.length);
  }
  return snapshotCameras().map(normalizeCamera).filter((c) => c.views.length);
}

function normalizeCamera(c) {
  const views = (c.Views || c.views || [])
    .filter((v) => (v.Status || v.status || "Enabled") === "Enabled")
    .map((v) => ({
      id: String(v.Id ?? v.id),
      url: v.Url || v.url || `https://www.nvroads.com/map/Cctv/${v.Id ?? v.id}`,
      description: cleanText(v.Description || v.description || ""),
    }));
  const roadway = cleanText(c.Roadway || c.roadway || "");
  const location = cleanText(c.Location || c.location || "") || roadway;
  return {
    id: String(c.Id ?? c.id),
    source: c.Source || c.source || "",
    roadway,
    direction: cleanText(c.Direction || c.direction || ""),
    location,
    lat: c.Latitude ?? c.lat ?? null,
    lon: c.Longitude ?? c.lon ?? null,
    sortOrder: c.SortOrder ?? c.sortOrder ?? 0,
    views,
  };
}

export async function getCorridorCameras(corridor) {
  if (!corridor?.cameraRoadways?.length) return [];
  const all = await getAllCameras();
  return all
    .filter((c) => {
      const roadwayOk = corridor.cameraRoadways.some((r) => normRoad(c.roadway).includes(normRoad(r)));
      const boxOk = inBbox({ lat: c.lat, lon: c.lon }, corridor.bbox);
      return roadwayOk && boxOk;
    })
    .sort((a, b) => (a.sortOrder - b.sortOrder) || ((a.lat ?? 0) - (b.lat ?? 0)));
}

export async function getCameraByViewId(viewId) {
  const all = await getAllCameras();
  for (const cam of all) {
    const view = cam.views.find((v) => v.id === String(viewId));
    if (view) return { camera: cam, view };
  }
  return null;
}

export async function getAllCameraViews() {
  const all = await getAllCameras();
  const out = [];
  for (const cam of all) for (const view of cam.views) out.push({ camera: cam, view });
  return out;
}

// Las Vegas Boulevard cameras for the Strip tour page. Selected by name
// (Boulevard intersections and landmarks) or by the tight Strip corridor
// box, then sorted south to north, the direction the tour walks.
const STRIP_PATTERNS = ["las vegas blvd", "the strip", "flamingo", "tropicana", "sahara", "spring mountain", "desert inn", "charleston blvd", "russell rd", "warm springs"];
const STRIP_BOX = { south: 36.06, north: 36.16, west: -115.19, east: -115.15 };

export async function getStripCameras() {
  const all = await getAllCameras();
  return all
    .filter((c) => {
      const hay = `${c.roadway} ${c.location}`.toLowerCase();
      return STRIP_PATTERNS.some((p) => hay.includes(p)) || inBbox({ lat: c.lat, lon: c.lon }, STRIP_BOX);
    })
    .sort((a, b) => (a.lat ?? 0) - (b.lat ?? 0));
}

// ---- Road conditions -----------------------------------------------------
// NDOT v3 records are normalized into one internal shape here so pages
// never read the raw "Overall Status" key (which carries a space).

function normalizeSegment(s) {
  const secondaryRaw = s["Secondary Conditions"] ?? s.SecondaryConditions ?? [];
  const secondary = (Array.isArray(secondaryRaw) ? secondaryRaw : [secondaryRaw]).map(cleanText).filter(Boolean);
  return {
    RoadwayName: cleanText(s.RoadwayName || ""),
    LocationDescription: cleanText(s.LocationDescription || ""),
    statusText: cleanText(s["Overall Status"] ?? s.OverallStatus ?? ""),
    secondary,
    AreaName: cleanText(s.AreaName || ""),
    LastUpdated: s.LastUpdated || 0,
    EncodedPolyline: s.EncodedPolyline,
  };
}

export async function getRoadConditions() {
  const raw = await ndotGet("roadconditions", "v3", 120);
  return raw ? raw.map(normalizeSegment) : null;
}

function segmentMatches(s, corridor) {
  if (!corridor?.bbox) return false;
  if (!nameMatches(s.RoadwayName, corridor.roadwayIncludes)) return false;
  return inBbox(midpoint(decodePolyline(s.EncodedPolyline)), corridor.bbox);
}

export function corridorSegments(conditions, corridor) {
  if (!conditions) return [];
  return conditions.filter((s) => segmentMatches(s, corridor));
}

// ---- Weather stations ------------------------------------------------------
// Temperatures arrive as Fahrenheit numbers or strings; parse, never convert.

export async function getWeatherStations() {
  return ndotGet("weatherstations", "v2", 300);
}

export function parseF(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

export function corridorStations(stations, corridor) {
  if (!stations) return [];
  const byName = stations.filter((s) =>
    nameMatches(s.DeviceName, corridor.stationIncludes) || nameMatches(s.StationName, corridor.stationIncludes)
  );
  if (byName.length) return byName;
  if (!corridor?.bbox) return [];
  return stations.filter((s) => inBbox({ lat: s.Latitude, lon: s.Longitude }, corridor.bbox));
}

// ---- Events and alerts -----------------------------------------------------

export async function getEvents() {
  const primary = await ndotGet("event", "v2", 120);
  if (primary) return primary;
  return ndotGet("events", "v2", 120);
}

export async function getAlerts() {
  const primary = await ndotGet("alerts", "v2", 120);
  if (primary) return primary;
  return ndotGet("advisories", "v2", 120);
}

export function corridorEvents(events, corridor) {
  if (!events) return [];
  return events.filter((e) => {
    if (!nameMatches(e.RoadwayName, corridor.roadwayIncludes)) return false;
    if (!corridor?.bbox) return false;
    const pts = decodePolyline(e.EncodedPolyline);
    if (!pts.length) return true;
    return inBbox(midpoint(pts), corridor.bbox);
  });
}

export function isFullClosure(event) {
  if (!event) return false;
  if (event.IsFullClosure === true) return true;
  const text = `${event.EventType || ""} ${event.EventSubType || ""}`.toLowerCase();
  return text.includes("closure");
}

export function cleanEvent(e) {
  return {
    type: cleanText([e.EventType, e.EventSubType].filter(Boolean).join(" : ")) || "Event",
    comment: cleanText(e.Comment || e.Description || e.RoadwayName || ""),
    fullClosure: isFullClosure(e),
  };
}

// ---- Posted restrictions ---------------------------------------------------
// Nevada has no numbered traction ladder. NDOT posts restriction language
// directly: the road conditions "Overall Status" carries chain and snow
// tire requirements, and "Secondary Conditions" carries wind alerts. This
// scans both, plus event text, and reports what NDOT posted in its own
// terms. Absence of a hit is reported as "no restriction posted in the
// feed", never as a legal conclusion.

export function readRestrictions(segments, events) {
  const texts = [];
  for (const s of segments || []) {
    if (s.statusText) texts.push(s.statusText);
    for (const t of s.secondary || []) texts.push(t);
  }
  for (const e of events || []) {
    if (e.Restrictions) texts.push(JSON.stringify(e.Restrictions));
    if (e.Comment) texts.push(String(e.Comment));
    if (e.Description) texts.push(String(e.Description));
  }
  const joined = cleanText(texts.join(" | "));
  const chains = /chain|snow tires|traction/i.test(joined);
  const wind = /wind|high profile/i.test(joined);
  if (!chains && !wind) {
    return { inEffect: false, kind: null, raw: null };
  }
  return {
    inEffect: true,
    kind: chains && wind ? "chains and wind" : chains ? "chains" : "wind",
    raw: joined.slice(0, 400),
  };
}

// ---- Corridor status roll-up --------------------------------------------------

export async function getCorridorStatus(corridor) {
  if (!ndotKeyPresent()) {
    return { live: false, closed: false, segments: [], events: [], traction: { inEffect: false, kind: null, raw: null }, updatedAt: null };
  }
  const [conditions, events] = await Promise.all([getRoadConditions(), getEvents()]);
  const segments = corridorSegments(conditions, corridor);
  const myEvents = corridorEvents(events, corridor);
  const closed = myEvents.some(isFullClosure) ||
    segments.some((s) => /closed/i.test(s.statusText));
  const updatedAt = segments.reduce((max, s) => Math.max(max, s.LastUpdated || 0), 0) || null;
  return {
    live: Boolean(conditions),
    closed,
    segments,
    events: myEvents,
    traction: readRestrictions(segments, myEvents),
    updatedAt,
  };
}

export function statusSentence(corridor, status) {
  // The answer first sentence. Wording tracks the live feed when the key
  // is in; before that it says plainly where the live answer will come
  // from. For corridors whose live status rides on an approach segment
  // (Mountain Pass is in California), the sentence says so on its face.
  if (!status.live) {
    return `${corridor.name} conditions, cameras, and posted restrictions will show live here from Nevada 511 the moment the feed is connected. Until then, check Nevada 511 for the official word before you drive.`;
  }
  const seg = status.segments[0];
  const posted = seg?.statusText ? ` NDOT posts: ${seg.statusText}.` : "";
  const secondary = seg?.secondary?.length ? ` Also posted: ${seg.secondary.join("; ")}.` : "";
  const restriction = status.traction.inEffect
    ? ` A ${status.traction.kind} restriction is posted on this corridor right now; the Nevada chain and wind rules page explains what the posted language requires.`
    : " No chain or wind restriction is posted for this corridor right now.";
  if (corridor.statusFrom) {
    return status.closed
      ? `The Nevada approach to ${corridor.name} is closed right now according to Nevada 511.${posted}${secondary}`
      : `The Nevada approach to ${corridor.name} is open according to Nevada 511.${posted}${secondary}${restriction}`;
  }
  if (status.closed) {
    return `${corridor.name} is closed right now according to Nevada 511. Do not start the drive; check the closures list below and Nevada 511 before you go.${posted}`;
  }
  return `${corridor.name} is open.${posted}${secondary}${restriction}`;
}
