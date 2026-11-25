import { SITE } from "@/lib/site-config";
import { CORRIDORS } from "@/lib/corridors";
import { TOWNS } from "@/lib/towns";
import { ROUTES } from "@/lib/routes-data";
import { COMPARES } from "@/lib/compare";
import { getAllCaltransCameras } from "@/lib/caltrans";

// The sitemap lists every indexable page. Embed routes are deliberately
// excluded: they are noindex partner widgets (the idahopass lesson, where
// noindex embed routes shipped in the sitemap).
export default function sitemap() {
  const now = new Date();
  const paths = [
    "/",
    "/live-feed",
    "/alerts",
    "/closures",
    "/chains",
    "/cameras",
    ...getAllCaltransCameras().map((c) => `/camera/${c.views[0].id}`),
    "/status-history",
    "/storm-archive",
    "/storm-playbook",
    "/compare",
    "/widget",
    "/for-media",
    "/about",
    "/privacy",
    SITE.lawPath,
    "/las-vegas-strip-camera-tour",
    ...CORRIDORS.map((c) => `/${c.slug}`),
    ...TOWNS.map((t) => `/${t.slug}-weather`),
    ...ROUTES.map((r) => `/${r.slug}`),
    ...COMPARES.map((c) => `/${c.slug}`),
  ];
  return paths.map((p) => ({
    url: `${SITE.baseUrl}${p}`,
    lastModified: now,
    changeFrequency: p === "/" ? "hourly" : "daily",
    priority: p === "/" ? 1 : 0.7,
  }));
}
