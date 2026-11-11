// Sample camera stills, shown ONLY when a corridor has no real cameras
// from the Nevada 511 snapshot yet (the NDOT key is still pending, so
// today that is every corridor). Each entry is a realistic generated
// still for a real, named camera location on that stretch, in the same
// visual style as the Stateline module stills. Every sample renders
// with a MOCKUP stamp on the frame and a "Sample still" caption, and
// sample cards never link to per camera pages. The moment the real
// snapshot fills for a corridor, the real cameras replace these
// automatically (see displayCameras below); real Caltrans or NDOT
// stills are never labeled as samples.
//
// Shape matches normalizeCamera in lib/ndot.js, plus sample: true.

function sampleCam(id, location, roadway, direction, img, note) {
  return {
    id: "sample-" + id,
    source: "Sample",
    roadway,
    direction,
    location,
    lat: null,
    lon: null,
    sortOrder: 0,
    sample: true,
    note: note || "",
    views: [{ id: "sample-" + id, url: img, description: "" }],
  };
}

export const SAMPLE_CAMERAS = {
  "las-vegas": [
    sampleCam("cheyenne", "I-15 at Cheyenne Avenue", "I-15", "North Las Vegas", "/sample-cams/valley-cheyenne.jpg"),
    sampleCam("spaghetti-bowl", "I-15 at the Spaghetti Bowl (US-95)", "I-15", "Downtown Las Vegas", "/sample-cams/valley-spaghetti-bowl.jpg"),
    sampleCam("charleston", "I-15 at Charleston Boulevard", "I-15", "Downtown Las Vegas", "/sample-cams/valley-charleston.jpg"),
    sampleCam("tropicana", "I-15 at Tropicana Avenue", "I-15", "The Strip", "/sample-cams/valley-tropicana.jpg"),
    sampleCam("st-rose", "I-15 at St. Rose Parkway", "I-15", "Henderson", "/sample-cams/valley-strose.jpg"),
  ],
  "primm-state-line": [
    sampleCam("sloan", "I-15 at Sloan", "I-15", "Southbound", "/stateline-cams/cam-sloan-flow.jpg"),
    sampleCam("jean", "I-15 at Jean (NV-161)", "I-15", "Southbound", "/stateline-cams/cam-jean-flow.jpg"),
    sampleCam("primm", "I-15 at Primm, the state line", "I-15", "Southbound", "/stateline-cams/cam-primm-flow.jpg"),
  ],
  "mountain-pass": [
    sampleCam("stateline-ca", "I-15 at Stateline, California side", "I-15", "Southbound", "/stateline-cams/cam-stateline-flow.jpg"),
    sampleCam("mountain-pass", "I-15 at Mountain Pass, agricultural inspection", "I-15", "Southbound", "/stateline-cams/cam-mountainpass-flow.jpg"),
    sampleCam("baker", "I-15 at Baker", "I-15", "Southbound", "/stateline-cams/cam-baker-flow.jpg"),
  ],
  "mesquite-virgin-river-gorge": [
    sampleCam("mesquite", "I-15 at Mesquite (Exit 120)", "I-15", "Northeastbound", "/sample-cams/mesquite-town.jpg"),
    sampleCam("gorge-entrance", "I-15 at the Virgin River Gorge entrance", "I-15", "Northeastbound", "/sample-cams/gorge-entrance.jpg"),
    sampleCam("gorge-inside", "I-15 in the Virgin River Gorge", "I-15", "Northeastbound", "/sample-cams/gorge-inside.jpg"),
  ],
};

// Las Vegas Boulevard frames for the Strip tour, south to north, one
// per tour stop, used only while the real Boulevard inventory is empty.
export const SAMPLE_STRIP_CAMERAS = [
  sampleCam("strip-welcome", "Las Vegas Boulevard at the Welcome sign", "Las Vegas Blvd", "South Strip", "/sample-cams/strip-welcome.jpg"),
  sampleCam("strip-tropicana", "Las Vegas Boulevard at Tropicana Avenue", "Las Vegas Blvd", "South Strip", "/sample-cams/strip-tropicana.jpg"),
  sampleCam("strip-flamingo", "Las Vegas Boulevard at Flamingo Road", "Las Vegas Blvd", "Center Strip", "/sample-cams/strip-flamingo.jpg"),
  sampleCam("strip-spring-mountain", "Las Vegas Boulevard at Spring Mountain Road", "Las Vegas Blvd", "North Strip", "/sample-cams/strip-spring-mountain.jpg"),
  sampleCam("strip-sahara", "Las Vegas Boulevard at Sahara Avenue", "Las Vegas Blvd", "North Strip", "/sample-cams/strip-sahara.jpg"),
  sampleCam("strip-fremont", "Downtown, Fremont Street", "Las Vegas Blvd", "Downtown", "/sample-cams/strip-fremont.jpg"),
];

// Real cameras when the corridor has any; otherwise that corridor's
// labeled sample stills. Callers that build schema or counts from
// camera data must keep using the real list, not this display list.
export function displayCameras(corridor, realCameras) {
  if (realCameras?.length) return realCameras;
  return SAMPLE_CAMERAS[corridor?.slug] || [];
}

export function hasSampleCameras(cameras) {
  return Boolean(cameras?.length) && cameras.every((c) => c.sample);
}
