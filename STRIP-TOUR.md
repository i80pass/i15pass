# Las Vegas Strip camera tour page

Decision (Scout, Nov 4, 2026): build this page as part of i15pass.com if the data terms and the speed tests pass. Tracy delegated the decisions on this page to Scout. He wants the outcome only: a fun Las Vegas Blvd page, and only if it is possible and in the network's best interest.

## Page shape

- One quarantined page on i15pass.com, a tour down Las Vegas Blvd from south to north.
- Backbone: Nevada 511 Boulevard camera stills, lazy loaded, each with a real caption and original tour copy.
- Landmark stops: YouTube streams behind click facades only (Sphere official stream, Bellagio fountains via YouTube, street level Boulevard cams, airport cam). A still picture shows first; the player loads only when a visitor taps.
- Every camera gets real written copy, so the page is a tour, not a wall of embeds.

## Sources not allowed

- EarthCam native player (heavy, no search value, license required).
- News station sky cams and casino players (no public embed rights found).
- Aggregator iframes or hotlinked raw playlists from other sites.

## Gates before launch

1. NDOT signup terms must not block displaying 511 camera stills on a website. If they do, the 511 backbone comes out and the page is judged on what remains.
2. PageSpeed check on the finished page. No eager video iframes, ever.
3. If the page cannot stay fast, or too few lawful Boulevard views remain, cut the page. The corridor pages come first.
