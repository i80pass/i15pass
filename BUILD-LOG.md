# i15pass.com Build Log

Gold Standard build, started Nov 5, 2026. Market: I-15 Las Vegas corridor, research gate passed Nov 4, 2026 (74/100, GO with one condition). Condition: NDOT commercial terms confirmed at developer signup. Cleared Nov 5, 2026, 12:07 AM, when Tracy read the NDOT terms himself and agreed to them. Site owner: Bright Red Design LLC (parent company, owns all network digital assets). No ads anywhere on this site, per the standing network rule.

## Scope as built

Four corridor segments, all route label I-15:

1. las-vegas (flagship): the valley freeway system, bbox south 35.98, north 36.32, west -115.32, east -114.98. Summit entry: Las Vegas valley floor, 2001 ft. 22 miles.
2. primm-state-line: Las Vegas to Primm and the California line, bbox south 35.585, north 35.99, west -115.60, east -115.10. Summit entry: Jean, 2841 ft. 41 miles.
3. mountain-pass: the California side, Primm to Baker, 63 miles, summit 4730 ft. bbox null, cameraRoadways empty, statusFrom primm-state-line, weatherPoint 35.472, -115.543 (Mountain Pass summit). Honest coverageNote on the page: NDOT covers only the Nevada approach; the page pairs the Primm posting with the National Weather Service forecast for the summit point itself. No second Caltrans data layer was built; the law page covers the California chain control handoff in text.
4. mesquite-virgin-river-gorge: Mesquite to the Gorge, bbox south 36.72, north 37.02, west -114.20, east -113.90. Summit entry: Virgin River Gorge, 2800 ft. 37 miles. weatherPoint 36.953, -113.819 (Virgin River Gorge, Cedar Pocket). Same honest treatment: NDOT covers to the Mesquite line, the Gorge itself is in Arizona, and the page says so.

Eight towns: Las Vegas, Henderson, North Las Vegas, Primm, Jean, Mesquite (Nevada), Barstow (California), St. George (Utah). Each has a weather page, two original body paragraphs, and a drive note. St. George renders times in America/Denver; all others America/Los_Angeles.

Three route pages: las-vegas-to-barstow (158 mi), las-vegas-to-st-george (119 mi), las-vegas-to-los-angeles (270 mi). No separate Mesquite route page (cannibalization guard; Mesquite is covered as a town page and a segment page). One comparison page (mountain-pass-vs-virgin-river-gorge) plus the /compare hub. No ski pages: there are no ski areas on this corridor, which is the recorded exception; the market's specialty page is the Strip camera tour instead.

Law page: /nevada-chain-law (SITE.lawPath). Built only from verified official sources (Nevada Legislature, NDOT, Caltrans). Nevada has no numbered chain ladder; NDOT posts restriction language directly. Verified citations used: NRS 484D.515, 484D.520, 484D.525; NAC 484D.220, 484D.225, 484D.230; the 2018 NDOT Tahoe area rule (SR-431, SR-207, US-50); Caltrans R-1, R-2, R-3 shorthand explained as shorthand, with signs carrying the requirement itself.

Strip camera tour: /las-vegas-strip-camera-tour. One quarantined page, tour down Las Vegas Boulevard south to north in six stops with original copy. Backbone: Nevada 511 Boulevard stills selected by name patterns and a tight Strip bounding box, sorted by latitude ascending, lazy loaded, linking to per camera pages. No iframes, no video players, no unverified YouTube IDs embedded. Decision logged in STRIP-TOUR.md (Nov 4).

## Clone source and logged ports

Clone source: the i80pass master only (GitHub repo i80pass/i80), taken from the pristine master download kept at ~/workspace/utah-wasatch-master-reference. app/globals.css diff verified identical to the master's. Configs (jsconfig, next.config with standalone output, postcss, eslint) follow the master pattern. Next 16.2.10, React 19.2.7.

Logged ports from sibling builds (each deliberate, per the clone source rule):

- The Nov 4 SEO tactics package (answer first hero order, full schema set with RoadCondition and Speakable, FAQ blocks, canonical discipline), ported from the i90live and i5pass pattern.
- The camera snapshot mechanism from idahopass (lib/ndot-cameras.json plus scripts/refresh-camera-snapshot.mjs), with one correction: the sitemap EXCLUDES the noindex /embed/ routes, fixing the idahopass sitemap defect rather than copying it.
- The status history pattern from the Utah build (lib/status-history.json plus scripts/log-status.mjs, change only appends, baseline on first run).
- dynamicParams = false on the [slug] and camera routes, from the Utah build.
- The amplify.yml env fix from idahopass, extended with the Wasatch lesson: the build phase writes NDOT_API_KEY and NEXT_PUBLIC_GA_ID into .env.production, AND the console env var must be set at both app level and branch level, because app level alone did not reach the Wasatch runtime. This is recorded in a comment in amplify.yml itself.
- The subset Material Symbols font approach (app/fonts/material-symbols-outlined.woff2, 126 glyphs, from the master). The proven icon set is home, photo_camera, sensors, warning, ac_unit. An unproven gavel glyph was replaced with ac_unit in BottomNav for that reason.

## Data layer (lib/ndot.js)

Nevada 511 (NDOT, Travel-IQ platform, same vendor as UDOT and Idaho 511). Key as query parameter "key". Env var NDOT_API_KEY. Endpoints verified against the official developer documentation at nvroads.com:

- Road conditions: GET /api/v3/get/roadconditions. Fields used: Id, LocationDescription, "Overall Status" (the JSON key contains a space), "Secondary Conditions" (array of strings), AreaName, RoadwayName, EncodedPolyline (an array holding one string), LastUpdated (unix seconds).
- Cameras: GET /api/v2/get/cameras. Fields: Id, Source, SourceId, Roadway, Direction, Latitude, Longitude, Location (often null, so location falls back to Roadway plus Direction), SortOrder, Views (Id, Url of the form https://www.nvroads.com/map/Cctv/{viewId}, Status, Description, VideoUrl). Only Enabled views are kept.
- Weather stations: GET /api/v2/get/weatherstations. Fields: Id, Latitude, Longitude, StationName, DeviceName, AirTemperature, Dewpoint, RelativeHumidity, Wind, WindGust, WindDirection, LastUpdated.
- Events: GET /api/v2/get/event, with an events fallback. Alerts: GET /api/v2/get/alerts, with an advisories fallback.

Units, verified from the NDOT documentation: AirTemperature and Dewpoint are Fahrenheit natively; Wind and WindGust are mph. No conversion is applied (UDOT reports metric and converts; NDOT does not need it). This is the single easiest bug to reintroduce, so it is also recorded in the code header.

Matching rules: segment match requires roadway name match AND the decoded polyline midpoint inside the segment bounding box (AND, not the Utah OR, because all four segments share roadwayIncludes ["i-15"]). Camera match uses normalized roadway comparison (spaces and hyphens stripped, the SR 210 lesson) plus the bounding box. Stations match on StationName or DeviceName, with a bounding box fallback.

Throttle: 10 calls per 60 seconds on the account. The data layer fetches statewide once per resource and filters locally, with Next fetch cache revalidate windows, so the site stays well under the limit. The snapshot script makes exactly one call.

Sanitizer: agency strings pass through cleanText, which replaces em dash, en dash, and their HTML entities with commas before anything renders (Gold Standard Phase 12 rule for agency copy).

Honest states: with no key, every page renders a truthful no data state (LIVE FEED PENDING chips, written fallback copy). Nothing fabricates a verdict. Mountain Pass never pretends to have its own NDOT segment: its banner reads the Primm status via statusCorridor() and its sentence says the posting is the Nevada approach posting, paired with summit weather.

## Brand

Name and domain set by Tracy: i15pass.com. All brand strings live in lib/site-config.js.

LOGO, confirmed master: Tracy supplied the official i15pass logo on Nov 5, 2026 and confirmed it as the master for the site. It is vaulted at ~/workspace/your_files/logo-vault/i15pass-logo.png (transparent PNG, 587 by 422, RGBA). Wired into the reserved slot exactly as planned:

- public/i15pass-logo.png: byte copy of the vault file, served at SITE.logoPath.
- Header: logo image at h-10 with the site name and region label, the same treatment as the other network sites (pattern mirrored from the wasatchpasses and grapevinepass headers).
- Web manifest: icon entry pointing at /i15pass-logo.png with its true size, 587x422.
- OG image: public/og-image.png (1200x630) regenerated around the real logo (logo on a white rounded card on the network navy field, corridor town line below). The earlier PIL text placeholder is gone.
- Apple touch icon: regenerated from the logo's mountain mark on navy.
- Favicon: app/favicon.ico rebuilt from the logo mark on an RGBA canvas at 16, 32, and 48.

## Pages built (45 static pages at build time, 35 sitemap URLs before camera pages exist)

Homepage (verdict stack for all four segments, Las Vegas camera preview, routes, town weather chips, Strip tour card, rules summary, FAQs, WebSite and FAQPage and per segment RoadCondition schema). Per segment: corridor page, camera strip page. Per town: weather page. Per camera pages from the snapshot registry (0 until the key lands and the snapshot refreshes; real 404s meanwhile, verified). Plus: /cameras, /live-feed, /alerts, /closures, /status-history, /storm-archive, /storm-playbook, /compare hub, /widget, /for-media, /about, /privacy, /nevada-chain-law, /las-vegas-strip-camera-tour, /embed/{corridor} (noindex, excluded from the sitemap), and four API routes (/api/conditions, /api/cameras, /api/weather, /api/alerts). Sitemap, robots, manifest, custom 404, and loading state included.

Camera grid rule compliance: grid-cols-1, sm:grid-cols-2, md:grid-cols-3, gap-4, aspect-[4/3] frames, whole card links to per camera pages (the accepted family pattern). Hero order: H1, status banner with the answer sentence inside it, timestamp in the banner credit line, webcams below.

## Verification (local production build, Nov 5, 2026)

- npm run build passes clean (Next 16.2.10, 45 static pages).
- Smoke test on the production server: all 35 sitemap URLs return 200. All four API routes return 200. Both embed routes return 200. Unknown page, camera, and embed slugs return real 404s.
- One bug found and fixed during the smoke test: /api/weather returned 500 with no key (null stations list); the route now coerces to an empty array. Rebuilt and retested 200.
- Internal link audit: 43 unique internal links collected from every rendered page, all resolve 200, zero orphans, zero broken.
- Dash scan: zero em dash or en dash characters in source (outside the sanitizer regexes, where they belong) and zero in rendered HTML across the homepage, corridor pages, law page, Strip tour, and route and town pages.
- Ads scan: zero ad code anywhere.
- Header logo renders on every page (the logo file serves 200, as do the OG image, touch icon, and manifest). Canonicals verified per page. Footer carries the NDOT credit, the not an official NDOT site disclaimer, and the Our pass network link.

## Deliberate deviations, with reasons

- Mountain Pass rides on the Primm segment's status (statusFrom). NDOT has no segment in California; the alternative (a second Caltrans data layer) was out of scope for launch and the page is honest about the arrangement.
- No Mesquite route page (cannibalization guard).
- No ski pages (none exist on this corridor); the Strip tour is the specialty page instead.
- Camera counts are zero until the NDOT key lands. That is the honest state of the snapshot, not a defect: the registry seeds empty with the refresh script ready.

## What is NOT done (deploy chain, all browser or account steps)

The code is complete and verified locally. It is not deployed. The remaining steps need the signed in browser session or Tracy, and are batched in the completion report: NDOT developer signup and key, GitHub repo creation, Amplify app creation and env vars, domain association and Cloudflare DNS, contact email routing, Search Console and GA4, the snapshot refresh after the key lands, the hourly status logger scheduling, and the rendered tablet width QA after the first deploy.

## API usage discipline pass (Nov 5, 2026)
Per the Gold Standard standing API usage discipline (Phase 2, added Nov 5 after the UDOT usage limit notice; IBI 511 throttle is 10 calls per 60 seconds per key, recorded here before launch):
- lib/ndot.js now enforces a 300 second cache floor on every list resource (roadconditions, weatherstations, event, alerts), up from 120 on three of them.
- Module level cache with in flight dedupe added: concurrent renders share one outbound request per resource; negative results are cached for the window.
- Fallback chains removed: events read only /api/v2/get/event and alerts only /api/v2/get/alerts. No second endpoint fires on an empty or error result.
- Camera inventory is snapshot only in the data layer; the previous live cameras call during renders is gone. The snapshot script is the only inventory caller.
- scripts/log-status.mjs already complied (one call per resource, single hourly caller) and is unchanged. No test calls have been made on the NDOT key (it is still Pending Approval at NDOT).

## Stateline module and sample stills (Nov 10, 2026 evening, Tracy's direct order)

- /primm-state-line rebuilt around the approved Stateline mockup (components/StatelineBoard.js + stateline.css): sticky status bar, direction pills that flip the whole page, reader board with giant backup and wait numbers, instant tiles, speed by stretch, drive times board, hour chart, weekly pattern, advice board, readings log, why it backs up, worst backups, stops and services, Straight Answers FAQ, backup alert signup (client side). The same module renders on /las-vegas-to-los-angeles under the route page's own H1. All numbers are SAMPLES: the header chip and status bar say "Mockup readings", camera badges say CAM with a MOCKUP stamp, and the module footer states the production page will measure from live speeds once Nevada 511, Caltrans, and corridor speed feeds connect. No copy claims live measurement. The corridor's live NDOT StatusBanner, postings, stations, checkpoints, editorial sections, and towns render below the module; FAQ schema comes from lib/stateline-faqs.js, the same questions the module renders.
- Direction fix (was backwards): lib/corridors-a.js primm-state-line. The famous jam is Sunday and holiday Monday SOUTHBOUND out of Las Vegas into California, 12 to 26 mile backups from Stateline, caused by the 3 to 2 lane drop at the line plus the agricultural checkpoint near Mountain Pass; normal drive 4 to 4.5 hours, bad Sunday 7 to 8. Rewrote "The Sunday return queue problem" section, the matching FAQ (now "How bad is the Sunday drive from Las Vegas to California?"), the intro, the drive economy rhythm paragraph, and the cameras section example. Same fix applied to the homepage worst drive FAQ (app/page.js) and the Primm town page line (lib/towns.js). The Las Vegas to Los Angeles route copy already had it right and is unchanged.
- Sample stills sitewide (lib/sample-cameras.js + displayCameras): while the NDOT snapshot is empty, camera grids render labeled sample stills for real named locations instead of the text only pending card: Las Vegas valley 5 (Cheyenne, Spaghetti Bowl, Charleston, Tropicana, St. Rose), Primm stretch 3 (Sloan, Jean, Primm; the Stateline module stills), Mountain Pass 3 (Stateline CA side, Mountain Pass, Baker), Mesquite and Gorge 3 (Mesquite, Gorge entrance, in the Gorge), Strip tour 6 boulevard frames (Welcome sign, Tropicana, Flamingo, Spring Mountain, Sahara, Fremont). Every sample card carries a MOCKUP stamp on the frame and a "Sample still" caption and never links to a per camera page. Real cameras replace samples automatically per corridor the moment the snapshot fills; schema and counts keep using the real lists only. Real stills (none exist yet; Caltrans stills when they arrive) are never labeled.
- SEO check: no URL or slug changes, titles and canonicals unchanged, sitemap unchanged and still lists both pages, no noindex changes, internal links verified live, every sample image has location alt text, zero em or en dash characters in source and rendered HTML. npm run build clean; Amplify main jobs SUCCEED; live fetches verified on the real domain.
