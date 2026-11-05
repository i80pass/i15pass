// SITE CONFIG: the single source of truth for every brand string on this
// site. Name and domain set by Tracy on Nov 4, 2026: i15pass.com, the
// I-15 Las Vegas corridor site in the Bright Red Design pass network.
// Every page, component, schema block, and title reads from this module.
//
// LOGO: the confirmed family master for this site was supplied by Tracy
// on Nov 5, 2026 and is vaulted at
// ~/workspace/your_files/logo-vault/i15pass-logo.png (transparent PNG,
// 587x422). It is served from SITE.logoPath (public/i15pass-logo.png)
// and used in the header, the web manifest, and the OG image.

export const SITE = {
  name: "i15pass",
  domain: "i15pass.com",
  get baseUrl() {
    return this.domain ? `https://www.${this.domain}` : "";
  },
  get contactEmail() {
    return this.domain ? `contact@${this.domain}` : "contact@brightreddesign.com";
  },
  // GA4 measurement id, set through the NEXT_PUBLIC_GA_ID env var at
  // launch (same pattern as the sibling sites). Null means no tag ships.
  gaId: process.env.NEXT_PUBLIC_GA_ID || null,
  // The confirmed family master logo, vaulted Nov 5, 2026.
  logoPath: "/i15pass-logo.png",
  // Data credit shown on every conditions and camera surface.
  dataCredit: "Road, weather, and camera data: Nevada 511, the traveler information service of the Nevada Department of Transportation (NDOT).",
  dataCreditShort: "Data: Nevada 511 / NDOT",
  officialSourceName: "Nevada 511",
  officialSourceUrl: "https://www.nvroads.com",
  // The law page for this market (Nevada posts restrictions situationally;
  // there is no numbered class ladder).
  lawPath: "/nevada-chain-law",
  lawLabel: "Nevada chain and wind rules",
  // Network link carried in the footer of every network site.
  networkUrl: "https://brightreddesign.com/our-companies",
  networkLabel: "Our pass network",
  parentName: "Bright Red Design",
  regionLabel: "Las Vegas and the I-15 corridor",
  tagline: "Live I-15 conditions, cameras, and restrictions for Las Vegas, Primm, Mountain Pass, Mesquite, and the Virgin River Gorge.",
};

export function siteUrl(pathname) {
  if (!SITE.baseUrl) return pathname;
  return `${SITE.baseUrl}${pathname === "/" ? "" : pathname}`;
}
