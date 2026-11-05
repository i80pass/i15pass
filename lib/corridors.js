// Corridor content for the four I-15 segments this site covers, in
// flagship order: the Las Vegas valley, the run south to Primm and the
// state line, Mountain Pass on the California side, and Mesquite with
// the Virgin River Gorge. Editorial copy is original to this site and
// written for the searches each page has to win. Live values never live
// here; they come from lib/ndot.js at render time.
//
// The segment data lives in two files (corridors-a.js for the Nevada
// valley and south run, corridors-b.js for Mountain Pass and the
// Gorge) and is merged here so every consumer imports one CORRIDORS
// list, the network pattern.

import { CORRIDORS_A } from "./corridors-a";
import { CORRIDORS_B } from "./corridors-b";

export const CORRIDORS = [...CORRIDORS_A, ...CORRIDORS_B];

export function getCorridor(slug) {
  return CORRIDORS.find((c) => c.slug === slug) || null;
}

// The corridor whose live NDOT status a page should read: segments
// with a statusFrom field (Mountain Pass, whose summit is in
// California) ride on their Nevada approach segment's live status.
export function statusCorridor(corridor) {
  if (!corridor?.statusFrom) return corridor;
  return getCorridor(corridor.statusFrom) || corridor;
}
