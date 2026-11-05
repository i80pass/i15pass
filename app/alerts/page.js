import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { TOWNS } from "@/lib/towns";
import { getAlerts, cleanText } from "@/lib/ndot";
import { getWeatherAlerts } from "@/lib/weather";
import { webPageSchema } from "@/lib/schema";

export const revalidate = 300;

export const metadata = {
  title: "I-15 Alerts | Nevada 511 Alerts and Weather Warnings",
  description: "Active Nevada 511 alerts for the I-15 corridor and National Weather Service warnings for Las Vegas, Mesquite, Barstow, and St. George, in one place.",
  alternates: { canonical: "/alerts" },
};

export default async function AlertsPage() {
  const ndotAlerts = await getAlerts();
  const watchTowns = TOWNS.filter((t) => ["las-vegas", "mesquite", "barstow", "st-george"].includes(t.slug));
  const nws = await Promise.all(watchTowns.map(async (t) => ({ town: t, alerts: await getWeatherAlerts(t) })));
  const nwsWith = nws.filter((x) => x.alerts.length);
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/alerts", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Alerts</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        Two alert streams matter on this corridor: NDOT's own alerts for the road, and the National Weather Service
        warnings for the towns at both ends of it. Both are below, labeled, because a flash flood warning for the
        Virgin River and an NDOT alert for the Gorge are the same afternoon seen from two desks.
      </p>
      <section className="mt-8">
        <h2 className="text-xl font-bold text-on-surface mb-3">Nevada 511 alerts</h2>
        {ndotAlerts?.length ? (
          <div className="space-y-3">
            {ndotAlerts.map((a, i) => (
              <div key={i} className="rounded-2xl bg-amber-100 border border-amber-300 px-4 py-3">
                <p className="text-sm font-bold text-on-surface">{cleanText(a.Message || a.Title || a.Headline || "Nevada 511 alert")}</p>
                {(a.Regions || a.AreaName) && (
                  <p className="text-sm text-secondary">{cleanText(Array.isArray(a.Regions) ? a.Regions.join(", ") : a.Regions || a.AreaName)}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-4 text-sm text-secondary leading-relaxed">
            No Nevada 511 alerts are showing right now. When NDOT posts an alert that touches this corridor, it
            appears here.
          </div>
        )}
        <p className="text-xs text-secondary mt-2">{SITE.dataCreditShort}</p>
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-bold text-on-surface mb-3">Weather Service warnings</h2>
        {nwsWith.length ? (
          <div className="space-y-3">
            {nwsWith.flatMap(({ town, alerts }) =>
              alerts.map((a, i) => (
                <div key={town.slug + i} className="rounded-2xl bg-error text-on-error px-4 py-3">
                  <p className="font-bold text-sm">{town.name} : {a.event}</p>
                  <p className="text-sm">{a.headline}</p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-4 text-sm text-secondary leading-relaxed">
            No active National Weather Service alerts for Las Vegas, Mesquite, Barstow, or St. George right now.
          </div>
        )}
      </section>
    </main>
  );
}
