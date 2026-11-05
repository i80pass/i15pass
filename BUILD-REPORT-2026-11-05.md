# i15pass.com Completion Report, Nov 5, 2026

## Headline

The full Gold Standard build is complete in code and verified locally at ~/workspace/i15pass. It is NOT YET DEPLOYED. Every remaining step is a browser or account step (NDOT signup, GitHub repo creation, Amplify setup, DNS) that has to run in the signed in browser session; those are batched below, in order, with the single item that needs Tracy marked. Nothing is blocked on code.

## Pages built

45 static pages generate cleanly. 35 indexable URLs are in the sitemap today; per camera pages join automatically once the camera snapshot fills.

- Homepage with live verdict stack for all four segments, camera preview, routes, town weather, Strip tour card, rules summary, FAQs, and the full schema set (WebSite, WebPage with Speakable, FAQPage, RoadCondition per segment).
- 4 corridor pages and 4 camera strip pages: Las Vegas, Primm and the State Line, Mountain Pass, Mesquite and the Virgin River Gorge.
- 8 town weather pages: Las Vegas, Henderson, North Las Vegas, Primm, Jean, Mesquite, Barstow, St. George.
- 3 route pages: Las Vegas to Barstow, Las Vegas to St. George, Las Vegas to Los Angeles.
- 1 comparison page plus the /compare hub: Mountain Pass vs the Virgin River Gorge.
- Utility and trust pages: /cameras, /live-feed, /alerts, /closures, /status-history, /storm-archive, /storm-playbook, /widget, /for-media, /about, /privacy.
- /nevada-chain-law: Nevada chain and wind rules from verified official sources only (NRS 484D.515, 484D.520, 484D.525; NAC 484D.220 to 484D.230; the Tahoe area rule; the Caltrans handoff at Mountain Pass), with live postings per segment at the top.
- /las-vegas-strip-camera-tour: six stop walking tour of Las Vegas Boulevard, south to north, Nevada 511 stills lazy loaded in boulevard order, original copy, no iframes or players, quarantined to the one page.
- /embed/{corridor} partner widgets (noindex, kept out of the sitemap) and four API routes: /api/conditions, /api/cameras, /api/weather, /api/alerts.
- Sitemap, robots, web manifest, custom 404, loading state.

## Camera counts per segment

All counts are 0 today, by design and honestly reported: the camera registry (lib/ndot-cameras.json) seeds empty because no NDOT API key exists yet, and per camera pages generate from that registry. The moment the key lands, one run of scripts/refresh-camera-snapshot.mjs (a single API call, inside the 10 per minute throttle) fills the registry, and the rebuild generates every per camera page and the Strip tour frames. Expected once filled, from the prep research: a large valley set on the Las Vegas segment, a working set at Primm and Jean, and the Mesquite set ending at the Gorge mouth. Mountain Pass has no NDOT cameras (California side) and its pages say so.

## Data verification status

- API contract verified directly against the official NDOT developer documentation: endpoints, field names (including the space in "Overall Status" and the array wrapped EncodedPolyline), camera view URL shape, and units (Fahrenheit and mph natively, no conversion). Field mappings are recorded in the build log and in the lib/ndot.js header.
- Live data is NOT yet verified, because that requires the key. Every page renders an honest no data state until then (LIVE FEED PENDING chips, written fallback copy, no fabricated verdicts). /api/conditions confirms the shape live in the smoke test: live:false, with the honest sentence per segment.
- Spot checks that can be done without the key are done: NWS weather renders on town and summit pages (Mountain Pass and Gorge points), alerts plumbing returns 200, and the status logger and snapshot script both exit cleanly with a clear missing key message and print nothing else.

## Brand

The confirmed i15pass master logo (supplied by Tracy Nov 5, 2026, vaulted at ~/workspace/your_files/logo-vault/i15pass-logo.png) is wired in: served at public/i15pass-logo.png, shown in the header with the network treatment, referenced in the web manifest at its true size, and used to regenerate the OG image, the apple touch icon, and the favicon. Logged in the build log.

## Deploy and domain status

- Domain: i15pass.com is bought and held at Cloudflare in Tracy's account (Nov 4, 2026, $11.17, auto renew on). Not yet connected to hosting.
- Hosting: no Amplify app exists yet. amplify.yml is in the repo root of the local build, with the Wasatch lesson applied (env vars written into .env.production during the build, plus the note that NDOT_API_KEY must also be set at app level AND branch level in the console).
- GitHub: repo i80pass/i15pass does not exist yet. The connector cannot create repos in the personal account, so creation is a browser step; after that, one connector push of the text files and one browser batch upload of the binaries (font woff2, favicon.ico, i15pass-logo.png, og-image.png, apple-touch-icon.png).
- Local verification (production build on this machine): build passes; all 35 sitemap URLs 200; all API routes 200; embeds 200; unknown slugs real 404; 43 internal links audited, zero broken; zero em or en dash characters in source or rendered pages; zero ad code.

## Steps still needed, batched in order

For the parent agent (signed in browser session, standing permissions cover these):

1. NDOT developer signup at nvroads.com under contact@brightreddesign.com (name Tracy Vickrey), email verification from the Zoho studio mailbox in the same session, then request the key on the developer page. If any in flow terms prohibit commercial use or redistribution, stop before agreeing and report the exact text. Key goes only into ~/workspace/i15pass/.env.local and the Amplify env vars, never into chat or docs.
2. Create the GitHub repo i80pass/i15pass on the website, then push: one connector push of text files, one browser batch upload of the binary files listed above.
3. Create the Amplify app in eu-north-1 (name i15pass, Next.js SSR, repo amplify.yml). Set NDOT_API_KEY at app level AND branch level before the first build where possible.
4. After the first deploy: run scripts/refresh-camera-snapshot.mjs with the key, commit the filled snapshot, rebuild, and verify live verdicts on /api/conditions and the homepage, plus camera counts per segment.
5. Domain: Amplify domain association for i15pass.com, validation and branch records in Cloudflare with proxy OFF, apex to www, then verify the real domain and www (never the Amplify URL). Rendered tablet width QA of the camera grids with an expand and tap test is a launch blocker at this point.
6. Email routing: contact@i15pass.com set up to terminate in the Zoho studio mailbox.
7. After DNS is live: Google Search Console domain property with sitemap submitted, new GA4 property (set NEXT_PUBLIC_GA_ID in Amplify and rebuild, verify the tag in live HTML), Ahrefs project, IndexNow submission of all sitemap URLs.
8. Schedule the hourly status history runner (scripts/log-status.mjs) for the corridor segments.

For Tracy (one item only):

1. Set the password for the new Nevada 511 account (contact@brightreddesign.com) through the Secure Vault capture page when the signup step reaches it. One tap packet item; the password must be his, set on that page, never invented by an agent. If a Nevada 511 login already exists in the vault, this item disappears.

## Open items and risks

- NDOT alerts and events endpoint names have documented fallbacks coded in (event, then events; alerts, then advisories). First live run should confirm which resource names the account answers; a wrong name degrades to honest empty states, not errors.
- Mountain Pass coverage is deliberately honest but thinner than the Nevada segments: no NDOT segment or cameras in California, status inherited from Primm, summit weather from the NWS point forecast. A Caltrans data layer is the known future upgrade if the page earns it.
- The logo source is a 587 by 422 extraction from Tracy's style card. It is crisp at header size; if Tracy ever exports a larger transparent PNG from his tool, it drops into the same vault path and public path with no other edits.
