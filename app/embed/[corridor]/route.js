import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { SITE } from "@/lib/site-config";
import { getCorridorStatus, statusSentence } from "@/lib/ndot";

// Bare embeddable widget: a self contained HTML document partners iframe.
// No site chrome, auto refresh, NDOT credited, links back to the corridor
// page. Same contract as the sibling sites' embed routes. Embeds are
// deliberately kept out of the sitemap and carry a noindex meta.
export async function GET(request, { params }) {
  const { corridor: corridorSlug } = await params;
  const corridor = CORRIDORS.find((c) => c.slug === corridorSlug);
  if (!corridor) return new Response("Not found", { status: 404 });
  const status = await getCorridorStatus(statusCorridor(corridor));
  const sentence = statusSentence(corridor, status);
  const chip = !status.live
    ? `<span style="background:#e0e3e5;color:#505f76;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700">FEED PENDING</span>`
    : status.closed
      ? `<span style="background:#ba1a1a;color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700">CLOSED</span>`
      : `<span style="background:#047857;color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700">OPEN</span>`;
  const restriction = status.live && status.traction?.inEffect
    ? `<p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#b45309">Restriction posted: ${status.traction.kind}</p>`
    : "";
  const base = SITE.baseUrl || "";
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="180">
<title>${corridor.name} live conditions</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fff;color:#191c1e">
<div style="border:1px solid #e2e8f0;border-radius:14px;padding:14px;max-width:520px">
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
<strong style="font-size:15px">${corridor.routeLabel} ${corridor.name}</strong>${chip}
</div>
<p style="margin:8px 0 0;font-size:14px;line-height:1.5">${sentence}</p>
${restriction}
<p style="margin:10px 0 0;font-size:12px;color:#505f76">Live from Nevada 511 via <a href="${base}/${corridor.slug}" style="color:#005288;font-weight:700">${SITE.name}</a>. Data: Nevada 511 / NDOT.</p>
</div></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=120" },
  });
}
