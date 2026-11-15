// Caltrans District 8 data layer for the Cajon Pass corridor.
//
// Cajon Pass is a California corridor on a Nevada 511 site. Its verdict,
// chain controls, lane closures, and cameras come from Caltrans, not
// NDOT, and this layer translates them into the same internal shapes
// lib/ndot.js returns, so every page component renders a Cajon verdict
// exactly the way it renders a Nevada one. Agency credit follows the
// corridor (corridor.dataCreditShort), never the site default.
//
// Sources (public, no key): the District 8 JSON feeds on
// cwwp2.dot.ca.gov: cc (chain controls), lcs (lane closures), cctv
// (camera inventory). Camera inventory is snapshot only, from
// lib/caltrans-cameras.json, refreshed by
// scripts/refresh-caltrans-cameras.mjs; no live call fires for
// inventory during a render or a build.
//
// Caching follows the site standard set Nov 14, 2026: the fetch cache
// (revalidate 120) plus a per process settled value cache with stale
// while revalidate semantics, so a render never blocks on a slow agency
// response once any result has settled, and a failed first settle is
// memoized for only 15 seconds. Feed timestamps in these files are
// Pacific local date and time with no timezone field; pacificEpoch
// converts them honestly, the way the sister Caltrans site does.
//
// CHAIN TRUTH RULE: the traction verdict is built from the parsed chain
// control level (R-0 to R-3), never from a text scan. The standing R-0
// posting literally reads "No chain controls are in effect at this
// time," which contains the word "chain"; a text scan would report
// chains in effect on a clear day.

import snapshot from "./caltrans-cameras.json";

const FEED_BASE = "https://cwwp2.dot.ca.gov/data/d8";

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
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function inBbox(lat, lon, bbox) {
  if (!bbox || lat === null || lat === undefined || lon === null || lon === undefined) return false;
  return lat >= bbox.south && lat <= bbox.north && lon >= bbox.west && lon <= bbox.east;
}

// ---- Feed loading ---------------------------------------------------------

const feedCache = new Map();

function startFeedFetch(kind) {
  const existing = feedCache.get(kind);
  if (existing && existing.promise) return existing.promise;
  const staleValue = existing ? existing.value : undefined;
  const url = `${FEED_BASE}/${kind}/${kind}StatusD08.json`;
  const promise = (async () => {
    try {
      const res = await fetch(url, {
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data?.data) ? data.data : null;
    } catch {
      return null;
    }
  })();
  promise.then((v) => {
    if (v !== null) {
      feedCache.set(kind, { value: v, expiresAt: Date.now() + 120_000 });
    } else if (staleValue !== undefined && staleValue !== null) {
      feedCache.set(kind, { value: staleValue, expiresAt: Date.now() + 120_000 });
    } else {
      feedCache.set(kind, { value: null, expiresAt: Date.now() + 15_000 });
    }
  });
  feedCache.set(kind, {
    promise,
    value: staleValue,
    expiresAt: existing ? existing.expiresAt : 0,
  });
  return promise;
}

async function feed(kind) {
  const hit = feedCache.get(kind);
  if (hit && hit.value !== undefined) {
    if (Date.now() >= (hit.expiresAt || 0)) {
      if (hit.value === null) return startFeedFetch(kind);
      startFeedFetch(kind);
    }
    return hit.value;
  }
  return startFeedFetch(kind);
}

// Caltrans timestamps are Pacific local "YYYY-MM-DD" plus "HH:MM:SS"
// with no offset. Convert through the America/Los_Angeles zone so the
// epoch is right in both standard and daylight time.
function pacificEpoch(dateStr, timeStr) {
  if (!dateStr || !timeStr) return 0;
  const m = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
  const t = String(timeStr).match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m || !t) return 0;
  const utcGuess = Date.UTC(+m[1], +m[2] - 1, +m[3], +t[1], +t[2], +(t[3] || 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(utcGuess));
  const p = {};
  for (const part of parts) p[part.type] = part.value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return Math.floor((utcGuess - (asUtc - utcGuess)) / 1000);
}

// ---- Chain controls ---------------------------------------------------------

function chainRecords(data) {
  if (!data) return [];
  const out = [];
  for (const r of data) {
    const c = r?.cc;
    // District 8 carries the posting under statusData (status,
    // statusDescription, statusTimestamp); currentCondition is the
    // District 7 naming and is kept as a fallback only.
    const cond = c?.statusData || c?.currentCondition;
    if (!cond) continue;
    if (String(c.inService).toLowerCase() === "false") continue;
    const ts = cond.statusTimestamp || cond.conditionTimestamp || {};
    out.push({
      route: c.location?.route || "",
      locationName: cleanText(c.location?.locationName || ""),
      nearbyPlace: cleanText(c.location?.nearbyPlace || ""),
      lat: parseFloat(c.location?.latitude),
      lon: parseFloat(c.location?.longitude),
      status: cond.status || "",
      description: cleanText(cond.statusDescription || ""),
      sinceEpoch: pacificEpoch(ts.statusDate || ts.conditionDate, ts.statusTime || ts.conditionTime),
    });
  }
  return out;
}

function chainLevel(rec) {
  const m = String(rec.status || "").match(/R-?(\d)/i);
  return m ? parseInt(m[1], 10) : 0;
}

export function corridorChainControls(records, corridor) {
  if (!records?.length || !corridor?.bbox) return [];
  return records.filter(
    (c) => c.route === "I-15" && inBbox(c.lat, c.lon, corridor.bbox)
  );
}

// ---- Lane closures ----------------------------------------------------------

function closureRecords(data) {
  if (!data) return [];
  const out = [];
  for (const r of data) {
    const l = r?.lcs;
    if (!l?.location || !l?.closure) continue;
    const begin = l.location.begin || {};
    const end = l.location.end || {};
    const ts = l.closure.closureTimestamp || {};
    out.push({
      beginRoute: begin.beginRoute || "",
      endRoute: end.endRoute || "",
      beginName: cleanText(begin.beginLocationName || ""),
      endName: cleanText(end.endLocationName || ""),
      beginLat: parseFloat(begin.beginLatitude),
      beginLon: parseFloat(begin.beginLongitude),
      endLat: parseFloat(end.endLatitude),
      endLon: parseFloat(end.endLongitude),
      direction: l.location.travelFlowDirection || "",
      typeOfClosure: l.closure.typeOfClosure || "",
      typeOfWork: cleanText(l.closure.typeOfWork || ""),
      lanesClosed: parseInt(l.closure.lanesClosed, 10) || 0,
      totalLanes: parseInt(l.closure.totalExistingLanes, 10) || 0,
      startEpoch: parseInt(ts.closureStartEpoch, 10) || 0,
      endEpoch: parseInt(ts.closureEndEpoch, 10) || 0,
      endIndefinite: String(ts.isClosureEndIndefinite).toLowerCase() === "true",
      recordEpoch: parseInt(r.recordTimestamp?.recordEpoch, 10) || 0,
    });
  }
  return out;
}

export function corridorClosures(records, corridor) {
  if (!records?.length || !corridor?.bbox) return [];
  const now = Math.floor(Date.now() / 1000);
  return records.filter((c) => {
    const routeOk =
      (c.beginRoute === "I-15" || c.endRoute === "I-15");
    if (!routeOk) return false;
    const inBox =
      inBbox(c.beginLat, c.beginLon, corridor.bbox) ||
      inBbox(c.endLat, c.endLon, corridor.bbox);
    if (!inBox) return false;
    if (c.startEpoch && c.startEpoch > now) return false;
    if (!c.endIndefinite && c.endEpoch && c.endEpoch < now) return false;
    return true;
  });
}

function isFullClosureRecord(c) {
  if (/^full/i.test(c.typeOfClosure || "")) return true;
  return c.totalLanes > 0 && c.lanesClosed >= c.totalLanes;
}

function closureEvent(c) {
  const full = isFullClosureRecord(c);
  const where =
    c.beginName && c.endName && c.beginName !== c.endName
      ? `from ${c.beginName} to ${c.endName}`
      : c.beginName
        ? `at ${c.beginName}`
        : "on this stretch";
  const lanes = full
    ? "All lanes are closed"
    : c.lanesClosed > 0
      ? `${c.lanesClosed} of ${c.totalLanes || "?"} lanes closed`
      : cleanText(c.typeOfClosure || "Lane closure");
  const comment = cleanText(
    `${lanes} ${where}${c.direction ? `, ${c.direction.toLowerCase()}bound,` : ""} for ${c.typeOfWork ? c.typeOfWork.toLowerCase() : "road work"}.`
  );
  return {
    RoadwayName: "I-15",
    EventType: full ? "Full Closure" : "Lane Closure",
    EventSubType: c.typeOfWork || "",
    Comment: comment,
    IsFullClosure: full,
    direction: c.direction || "",
  };
}

// ---- Corridor status roll-up (NDOT shape) -----------------------------------

export async function getCaltransCorridorStatus(corridor) {
  const [ccData, lcsData] = await Promise.all([feed("cc"), feed("lcs")]);
  const controls = corridorChainControls(chainRecords(ccData), corridor);
  const closures = corridorClosures(closureRecords(lcsData), corridor);
  const events = closures.map(closureEvent);

  const segments = controls.map((c) => ({
    RoadwayName: "I-15",
    LocationDescription: c.locationName,
    statusText: c.description,
    secondary: [],
    LastUpdated: c.sinceEpoch || 0,
  }));

  const maxLevel = controls.reduce((mx, c) => Math.max(mx, chainLevel(c)), 0);
  const traction =
    maxLevel > 0
      ? {
          inEffect: true,
          kind: "chains",
          raw: controls
            .filter((c) => chainLevel(c) > 0)
            .map((c) => `${c.locationName}: ${c.description}`)
            .join(" | ")
            .slice(0, 400),
        }
      : { inEffect: false, kind: null, raw: null };

  const fullDirs = new Set(
    events.filter((e) => e.IsFullClosure).map((e) => e.direction).filter(Boolean)
  );
  const closed =
    events.some((e) => e.IsFullClosure) &&
    (fullDirs.size >= 2 || fullDirs.size === 0);

  // The chain stamp is the last time the posted level CHANGED; the
  // standing R-0 posting for this pass has not changed in years, so an
  // ancient stamp is not a report time and is not shown as one. A fresh
  // stamp (a control actually posted or lifted) always shows.
  const nowSec = Math.floor(Date.now() / 1000);
  const chainStamp = controls.reduce((mx, c) => Math.max(mx, c.sinceEpoch || 0), 0);
  const closureStamp = closures.reduce((mx, c) => Math.max(mx, c.recordEpoch || 0), 0);
  const updatedAt =
    (chainStamp && nowSec - chainStamp < 7 * 86400 ? chainStamp : 0) ||
    (closureStamp && nowSec - closureStamp < 7 * 86400 ? closureStamp : 0) ||
    null;

  return {
    live: Boolean(ccData),
    closed,
    closedDirections: [...fullDirs],
    segments,
    events,
    traction,
    updatedAt,
  };
}

export function caltransStatusSentence(corridor, status) {
  if (!status.live) {
    return `${corridor.name} conditions, cameras, and chain controls will show live here from Caltrans the moment the feed answers. Until then, check Caltrans QuickMap for the official word before you drive.`;
  }
  const seg = status.segments[0];
  const posted = seg?.statusText ? ` Caltrans posts for the pass: ${seg.statusText}.` : "";
  const partial =
    !status.closed && status.closedDirections?.length === 1
      ? ` One direction is fully closed right now; the events list below carries the posted detail.`
      : "";
  if (status.closed) {
    return `${corridor.name} is closed right now according to Caltrans. Do not start the drive; check the closures list below and Caltrans QuickMap before you go.${posted}`;
  }
  const restriction = status.traction.inEffect
    ? ` Chain controls are in effect on this corridor right now. The chain law section below explains what California's R1, R2, and R3 levels require.`
    : " No chain controls are in effect on this corridor right now.";
  return `${corridor.name} is open.${posted}${restriction}${partial}`;
}

// ---- Cameras (snapshot only) --------------------------------------------------

function normalizeCaltransCamera(c, sortOrder) {
  const location = cleanText(String(c.name || "").replace(/^I-15\s*:\s*\(\d+\)\s*/, ""));
  return {
    id: `ct-${c.index}`,
    source: "Caltrans",
    roadway: "I-15",
    direction: "",
    location: location || `I-15 camera ${c.index}`,
    lat: c.lat,
    lon: c.lon,
    sortOrder,
    corridorSlug: "cajon-pass",
    views: [
      {
        id: `ct-${c.index}`,
        url: c.imageUrl,
        description: location,
      },
    ],
  };
}

export function getAllCaltransCameras() {
  const list = Array.isArray(snapshot.cameras) ? snapshot.cameras : [];
  return list.map((c, i) => normalizeCaltransCamera(c, i + 1));
}

export async function getCaltransCorridorCameras(corridor) {
  if (!corridor?.bbox) return [];
  return getAllCaltransCameras().filter((c) => inBbox(c.lat, c.lon, corridor.bbox));
}
