import { SITE } from "@/lib/site-config";
import { CORRIDORS } from "@/lib/corridors";
import { TOWNS } from "@/lib/towns";
import { ROUTES } from "@/lib/routes-data";
import { COMPARES } from "@/lib/compare";
import snapshot from "@/lib/ndot-cameras.json";

// The sitemap lists every indexable page. Embed routes are deliberately
// excluded: they are noindex partner widgets (the idahopass lesson, where
// noindex embed routes shipped in the sitemap).
export default function sitemap() {
  const now = new Date();
  const paths = [
    "/",
    "/cameras",
    "/live-feed",
    "/alerts",
    "/closures",
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
    ...CORRIDORS.map((c) => `/${c.slug}-cameras`),
    ...TOWNS.map((t) => `/${t.slug}-weather`),
    ...ROUTES.map((r) => `/${r.slug}`),
    ...COMPARES.map((c) => `/${c.slug}`),
    ...(snapshot.cameras || []).flatMap((cam) => (cam.views || []).map((v) => `/camera/${v.id}`)),
  ];
  return paths.map((p) => ({
    url: `${SITE.baseUrl}${p}`,
    lastModified: now,
    changeFrequency: p === "/" ? "hourly" : "daily",
    priority: p === "/" ? 1 : 0.7,
  }));
}
