// Nevada 511 (NDOT) data layer.
//
// Source: the public Nevada 511 website list endpoints at
// www.nvroads.com/List/GetData/{type}, the same data the nvroads.com
// lists render. No developer key is used or needed: the keyed developer
// API (NDOT_API_KEY) never became usable, and this layer reads the
// public lists instead (integration switched Nov 25, 2026).
//
// API USAGE DISCIPLINE (Gold Standard standing section, Nov 5, 2026):
// server side calls only; every list resource is cached for 600
// seconds in a module level cache that also dedupes in flight requests,
// so concurrent renders share one outbound call set per resource; a
// negative result is cached only briefly and pages render their honest
// no data state; and the camera inventory comes only from the bundled
// snapshot, refreshed by scripts/refresh-camera-snapshot.mjs, never
// from a live call during a render or a build.
//
// FIELD MAPPINGS (read live from the public lists, Nov 25, 2026):
// - Road conditions: GET List/GetData/RoadConditions with a per column
//   filter on roadway = "I-15". Fields: id, area, roadway, description
//   ("From X to Y"), primaryCondition (Dry, Wet, Snowy, Icy, No Report,
//   Closed), secondaryConditions (array), stale, lastUpdated (string).
//   No coordinates or polylines are published, so each segment is
//   assigned to a corridor zone by keyword rules on its description
//   (see zoneFor below). I-15 carries 9 segments statewide.
// - Traffic events: GET List/GetData/traffic with a per column filter
//   on roadwayName ("I-15", plus the Northbound and Southbound variants
//   so directional records are not missed; results deduped by id).
//   Fields: roadwayName (may carry a direction suffix), type,
//   eventSubType, description, comment, locationDescription,
//   laneDescription, isFullClosure, region, direction, severity.
//   No coordinates are published, so events are zoned by keyword rules
//   on location and description text.
// - Weather stations: GET List/GetData/WeatherStations, paginated at
//   the server maximum of 100 per page (two pages cover the state).
//   Fields: name, area, city, county, region, airTemperature (string
//   with unit), dewPoint, relativeHumidity, windSpeedAverage,
//   windSpeedGust, windDirectionAverage, lastUpdated. No coordinates
//   are published, so stations match corridors by name. The only I-15
//   stations in the feed are the northern ones near Moapa and US-93.
// - Alerts: the public lists publish no alerts resource this layer can
//   read, so getAlerts returns null and the alerts page renders its
//   honest no data state for the NDOT stream.
//
// UNITS: NDOT weather station temperatures are Fahrenheit and wind is
// in miles per hour. Values are parsed and labeled as they arrive.
// Nothing is converted, ever.
//
// TEXT SANITIZER: every agency string passes through cleanText before it
// can render, so a live feed can never put a banned character (em dash,
// en dash, or their HTML entities) on a page. See the Gold Standard,
// Phase 12.

import snapshot from "./ndot-cameras.json";
import {
  getCaltransCorridorStatus,
  caltransStatusSentence,
  getCaltransCorridorCameras,
  getAllCaltransCameras,
} from "./caltrans";

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
  // Kept for existing imports. The public list endpoints need no key,
  // so the conditions data source is live unconditionally.
  return true;
}

// Module level cache and in flight dedupe. One entry per resource:
// concurrent renders share the same promise, and the settled result is
// served from cache until the TTL expires. The TTL is 600 seconds
// everywhere for the public lists. Next's own fetch cache (the
// revalidate option, also 600) is a second layer underneath this one.
//
// ISR rework (Nov 14, 2026, the i80pass pattern): the cache now keeps the
// settled VALUE, not only the promise, with stale-while-revalidate
// semantics. Once a resource has any settled result, a render NEVER
// blocks on the live NDOT read: it answers instantly with the settled
// result and refreshes behind the scenes. Only the very first read in a
// fresh process blocks. A render that awaits a live fetch inside the
// page revalidation is one slow agency response away from hanging the
// page, the failure that took i80pass down on Nov 14, 2026; on several
// sibling sites those blocking revalidations also never persisted on
// the production host, leaving pages permanently stale with
// Cache-Control no-store. A failed refresh (null here) never displaces
// a good settled result; the stale copy keeps serving and the retry
// waits for the next window.
const resourceCache = new Map();

const NV_LIST_BASE = "https://www.nvroads.com/List/GetData";
const NV_TTL_MS = 600_000;

function nvFilterColumn(name, value) {
  return [{ name, searchable: true, search: { value, regex: false } }];
}

async function nvList(type, columns, start = 0, length = 100) {
  const query = { columns: columns || [], order: [{ column: 0, dir: "asc" }], start, length };
  const url = `${NV_LIST_BASE}/${type}?query=${encodeURIComponent(JSON.stringify(query))}&lang=en`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : null;
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function parseNvDate(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const ms = Date.parse(String(value));
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
}

// Corridor zone assignment for records that carry no coordinates.
// Ordered keyword rules on the lowercased text: the Primm and state
// line keywords win first, then the Apex, Arizona, and US-93 keywords
// for the Mesquite and Gorge end, and everything else is the Las Vegas
// valley. Mountain Pass resolves through statusCorridor to the Primm
// zone already, so it needs no rule of its own.
function zoneFor(text) {
  const t = String(text || "").toLowerCase();
  if (t.includes("jean") || t.includes("california border") || t.includes("mile marker 9")) return "primm-state-line";
  if (t.includes("apex") || t.includes("arizona") || t.includes("us-93")) return "mesquite-virgin-river-gorge";
  return "las-vegas";
}

async function fetchRoadConditionsList() {
  const recs = await nvList("RoadConditions", nvFilterColumn("roadway", "I-15"));
  if (!recs) return null;
  return recs.map((r) => ({
    RoadwayName: "I-15",
    LocationDescription: stripHtml(r.description || ""),
    "Overall Status": r.primaryCondition || "",
    "Secondary Conditions": Array.isArray(r.secondaryConditions) ? r.secondaryConditions : [],
    AreaName: r.area || "",
    LastUpdated: r.lastUpdated || "",
    EncodedPolyline: null,
    _zone: zoneFor(r.description || ""),
  }));
}

function normalizeEventRecord(r) {
  const roadway = String(r.roadwayName || "").replace(/\s+(northbound|southbound|eastbound|westbound)\s*$/i, "").trim();
  return {
    RoadwayName: roadway,
    EventType: r.type || "",
    EventSubType: r.eventSubType || "",
    Comment: stripHtml(r.comment || r.description || ""),
    Description: stripHtml(r.description || ""),
    LanesAffected: r.laneDescription || "",
    IsFullClosure: r.isFullClosure === true,
    EncodedPolyline: null,
    _zone: zoneFor(`${r.locationDescription || ""} ${r.description || ""}`),
  };
}

async function fetchTrafficList() {
  const variants = ["I-15", "I-15 Northbound", "I-15 Southbound"];
  const lists = await Promise.all(variants.map((v) => nvList("traffic", nvFilterColumn("roadwayName", v))));
  if (lists.every((l) => l === null)) return null;
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const r of list || []) {
      const id = r.id ?? r.DT_RowId;
      if (id !== null && id !== undefined) {
        if (seen.has(id)) continue;
        seen.add(id);
      }
      out.push(normalizeEventRecord(r));
    }
  }
  return out;
}

function normalizeStationRecord(r) {
  const name = String(r.name || "").trim();
  return {
    DeviceName: name,
    StationName: name,
    AirTemperature: parseF(r.airTemperature),
    Dewpoint: parseF(r.dewPoint),
    RelativeHumidity: parseF(r.relativeHumidity),
    Wind: parseF(r.windSpeedAverage),
    WindGust: parseF(r.windSpeedGust),
    WindDirection: String(r.windDirectionAverage || "").trim(),
  };
}

async function fetchWeatherList() {
  const pages = await Promise.all([
    nvList("WeatherStations", [], 0, 100),
    nvList("WeatherStations", [], 100, 100),
  ]);
  if (pages.every((pg) => pg === null)) return null;
  const out = [];
  for (const pg of pages) for (const r of pg || []) out.push(normalizeStationRecord(r));
  return out;
}

const RESOURCE_FETCHERS = {
  roadconditions: fetchRoadConditionsList,
  event: fetchTrafficList,
  weatherstations: fetchWeatherList,
};

function startNdotFetch(cacheKey, fetcher) {
  const existing = resourceCache.get(cacheKey);
  if (existing && existing.promise) return existing.promise;
  const staleValue = existing ? existing.value : undefined;
  const promise = (async () => {
    try {
      return await fetcher();
    } catch {
      return null;
    }
  })();
  promise.then((v) => {
    if (v !== null) {
      resourceCache.set(cacheKey, { value: v, expiresAt: Date.now() + NV_TTL_MS });
    } else if (staleValue !== undefined && staleValue !== null) {
      resourceCache.set(cacheKey, { value: staleValue, expiresAt: Date.now() + NV_TTL_MS });
    } else {
      // No settled value yet: hold the failure only briefly (the
      // Nov 14, 2026 lesson from the sibling sites: a full window
      // error memo lets one failed cold settle poison every render,
      // and the banner-less renders it produced were then ISR
      // cached). Fifteen seconds still dedupes a burst of
      // simultaneous renders; after that the next render retries.
      resourceCache.set(cacheKey, { value: null, expiresAt: Date.now() + 15_000 });
    }
  });
  resourceCache.set(cacheKey, {
    promise,
    value: staleValue,
    expiresAt: existing ? existing.expiresAt : 0,
  });
  return promise;
}

async function ndotGet(resource) {
  const fetcher = RESOURCE_FETCHERS[resource];
  if (!fetcher) return null;
  const hit = resourceCache.get(resource);
  if (hit && hit.value !== undefined) {
    if (Date.now() >= (hit.expiresAt || 0)) {
      if (hit.value === null) {
        // A settled failure past its brief hold: retry live, like
        // the first read, instead of serving the null while
        // refreshing behind the scenes.
        return startNdotFetch(resource, fetcher);
      }
      // Stale-while-revalidate: serve the settled result now, refresh
      // behind the scenes.
      startNdotFetch(resource, fetcher);
    }
    return hit.value;
  }
  return startNdotFetch(resource, fetcher);
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
  // Snapshot only (discipline item 6): the camera inventory is a slow
  // changing list, served from the bundled snapshot that
  // scripts/refresh-camera-snapshot.mjs refreshes. No live agency call
  // ever fires during a page render or a build for inventory.
  // The Caltrans snapshot for Cajon Pass rides along in the same shape
  // (its view ids are prefixed ct- so they can never collide with
  // Nevada 511 view ids).
  const ndot = snapshotCameras().map(normalizeCamera).filter((c) => c.views.length);
  return [...ndot, ...getAllCaltransCameras()];
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
  if (corridor?.statusSource === "caltrans") return getCaltransCorridorCameras(corridor);
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
    LastUpdated: parseNvDate(s.LastUpdated),
    EncodedPolyline: s.EncodedPolyline ?? null,
    _zone: s._zone || null,
  };
}

export async function getRoadConditions() {
  const raw = await ndotGet("roadconditions");
  return raw ? raw.map(normalizeSegment) : null;
}

function segmentMatches(s, corridor) {
  if (!nameMatches(s.RoadwayName, corridor.roadwayIncludes)) return false;
  // Public list segments carry no polyline; the zone assigned at
  // fetch time decides corridor membership when it is present. The
  // polyline and bbox logic stays as a fallback if a polyline ever
  // exists on a record again.
  if (s._zone) return s._zone === corridor.slug;
  if (!corridor?.bbox) return false;
  return inBbox(midpoint(decodePolyline(s.EncodedPolyline)), corridor.bbox);
}

export function corridorSegments(conditions, corridor) {
  if (!conditions) return [];
  return conditions.filter((s) => segmentMatches(s, corridor));
}

// ---- Weather stations ------------------------------------------------------
// Temperatures arrive as Fahrenheit numbers or strings; parse, never convert.

export async function getWeatherStations() {
  return ndotGet("weatherstations");
}

export function parseF(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

const MESQUITE_STATION_KEYWORDS = ["moapa", "us-93", "mm 119", "mesquite", "apex"];

export function corridorStations(stations, corridor) {
  if (!stations) return [];
  const byName = stations.filter((s) => {
    // A station whose name carries a Mesquite end keyword belongs
    // only to the Mesquite and Gorge corridor, even when another
    // corridor's includes would also match its name (the Las Vegas
    // corridor includes "i-15", and every I-15 station in the feed is
    // a northern one). Stations with no zone keyword match by
    // includes as before.
    const nm = `${s.DeviceName || ""} ${s.StationName || ""}`.toLowerCase();
    const includesMatch =
      nameMatches(s.DeviceName, corridor.stationIncludes) || nameMatches(s.StationName, corridor.stationIncludes);
    if (MESQUITE_STATION_KEYWORDS.some((k) => nm.includes(k))) {
      return corridor.slug === "mesquite-virgin-river-gorge" && includesMatch;
    }
    return includesMatch;
  });
  if (byName.length) return byName;
  if (!corridor?.bbox) return [];
  return stations.filter((s) => inBbox({ lat: s.Latitude, lon: s.Longitude }, corridor.bbox));
}

// ---- Events and alerts -----------------------------------------------------

export async function getEvents() {
  return ndotGet("event");
}

export async function getAlerts() {
  // The public lists publish no alerts resource this layer can read,
  // so the NDOT alerts stream stays honestly empty.
  return null;
}

export function corridorEvents(events, corridor) {
  if (!events) return [];
  return events.filter((e) => {
    if (!nameMatches(e.RoadwayName, corridor.roadwayIncludes)) return false;
    // Public list events carry no polyline; the zone assigned at
    // fetch time decides when present, with the bbox logic kept as
    // the fallback for any record that ever carries a polyline.
    if (e._zone) return e._zone === corridor.slug;
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
  // California corridors (Cajon Pass) read from Caltrans. The Nevada
  // corridors read the public Nevada 511 lists, which need no key.
  if (corridor?.statusSource === "caltrans") return getCaltransCorridorStatus(corridor);
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
  if (corridor?.statusSource === "caltrans") return caltransStatusSentence(corridor, status);
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
