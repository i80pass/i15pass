import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBanner from "@/components/StatusBanner";
import CameraGrid from "@/components/CameraGrid";
import FaqBlock from "@/components/FaqBlock";
import EditorialSections from "@/components/EditorialSections";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { TOWNS, getTown } from "@/lib/towns";
import { ROUTES, getRoute } from "@/lib/routes-data";
import { COMPARES, getCompare } from "@/lib/compare";
import { getCorridorStatus, getCorridorCameras, getWeatherStations, corridorStations, parseF, cleanEvent } from "@/lib/ndot";
import { getTownWeather, getWeatherAlerts, getPointWeather, getPointAlerts } from "@/lib/weather";
import { webPageSchema, faqSchema, roadConditionSchema, cameraListSchema, placeSchema, breadcrumbSchema } from "@/lib/schema";

export const revalidate = 120;
export const dynamicParams = false;

function resolve(slug) {
  const corridor = CORRIDORS.find((c) => c.slug === slug);
  if (corridor) return { kind: "corridor", corridor };
  if (slug.endsWith("-cameras")) {
    const c = CORRIDORS.find((x) => x.slug === slug.slice(0, -"-cameras".length));
    if (c) return { kind: "strip", corridor: c };
  }
  if (slug.endsWith("-weather")) {
    const t = getTown(slug.slice(0, -"-weather".length));
    if (t) return { kind: "town", town: t };
  }
  const route = getRoute(slug);
  if (route) return { kind: "route", route };
  const compare = getCompare(slug);
  if (compare) return { kind: "compare", compare };
  return null;
}

export function generateStaticParams() {
  return [
    ...CORRIDORS.map((c) => ({ slug: c.slug })),
    ...CORRIDORS.map((c) => ({ slug: `${c.slug}-cameras` })),
    ...TOWNS.map((t) => ({ slug: `${t.slug}-weather` })),
    ...ROUTES.map((r) => ({ slug: r.slug })),
    ...COMPARES.map((c) => ({ slug: c.slug })),
  ];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) return {};
  if (r.kind === "corridor") {
    const c = r.corridor;
    return {
      title: `${c.name} Road Conditions and Cameras | ${c.routeLabel} Live`,
      description: `Live ${c.name} (${c.routeLabel}) road conditions, Nevada 511 cameras in driving order, posted restrictions, and weather from ${c.fromTo}.`,
      alternates: { canonical: `/${c.slug}` },
    };
  }
  if (r.kind === "strip") {
    const c = r.corridor;
    return {
      title: `${c.name} Cameras in Driving Order | ${c.routeLabel}`,
      description: `Every Nevada 511 camera on ${c.name} (${c.routeLabel}), sequenced in driving order, each with its own page.`,
      alternates: { canonical: `/${c.slug}-cameras` },
    };
  }
  if (r.kind === "town") {
    return {
      title: `${r.town.name} Weather and Road Conditions`,
      description: `${r.town.name} weather forecast from the National Weather Service, plus the live I-15 conditions that decide the drive from here.`,
      alternates: { canonical: `/${r.town.slug}-weather` },
    };
  }
  if (r.kind === "route") {
    return {
      title: `${r.route.name} Road Conditions and Drive Guide`,
      description: `Live conditions for the ${r.route.name} drive: stretch by stretch verdicts, cameras in driving order, and a segment by segment guide. ${r.route.miles} miles, ${r.route.driveTime.toLowerCase()}.`,
      alternates: { canonical: `/${r.route.slug}` },
    };
  }
  return {
    title: `${r.compare.title} | Live Comparison`,
    description: r.compare.intro,
    alternates: { canonical: `/${r.compare.slug}` },
  };
}

function EventList({ events }) {
  if (!events?.length) return null;
  const cleaned = events.map(cleanEvent);
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-on-surface mb-3">NDOT is reporting</h2>
      <div className="glass-card rounded-2xl divide-y divide-outline-variant/20 overflow-hidden">
        {cleaned.slice(0, 10).map((e, i) => (
          <div key={i} className="px-4 py-3">
            <p className="text-sm font-bold text-on-surface">
              {e.type}{e.fullClosure ? " : FULL CLOSURE" : ""}
            </p>
            <p className="text-sm text-secondary leading-relaxed">{e.comment}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-secondary mt-2">{SITE.dataCreditShort}</p>
    </section>
  );
}

function SegmentsList({ segments }) {
  if (!segments?.length) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-on-surface mb-3">What NDOT posts on this stretch</h2>
      <div className="glass-card rounded-2xl divide-y divide-outline-variant/20 overflow-hidden">
        {segments.slice(0, 8).map((s, i) => (
          <div key={i} className="px-4 py-3">
            <p className="text-sm font-bold text-on-surface">{s.LocationDescription || s.RoadwayName}</p>
            <p className="text-sm text-secondary leading-relaxed">
              {s.statusText || "No special posting"}{s.secondary?.length ? ` | ${s.secondary.join("; ")}` : ""}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-secondary mt-2">Posted in NDOT's own words by Nevada 511. {SITE.dataCreditShort}.</p>
    </section>
  );
}

function StationTable({ stations }) {
  if (!stations?.length) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-on-surface mb-3">Roadside weather on this stretch</h2>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-secondary border-b border-outline-variant/30">
              <th className="px-4 py-2 font-semibold">Station</th>
              <th className="px-4 py-2 font-semibold">Air</th>
              <th className="px-4 py-2 font-semibold">Dewpoint</th>
              <th className="px-4 py-2 font-semibold">Wind</th>
            </tr>
          </thead>
          <tbody>
            {stations.slice(0, 4).map((s, i) => (
              <tr key={i} className="border-b border-outline-variant/10 last:border-0">
                <td className="px-4 py-2 font-semibold text-on-surface">{s.DeviceName || s.StationName}</td>
                <td className="px-4 py-2">{parseF(s.AirTemperature) !== null ? `${Math.round(parseF(s.AirTemperature))}°F` : "n/a"}</td>
                <td className="px-4 py-2">{parseF(s.Dewpoint) !== null ? `${Math.round(parseF(s.Dewpoint))}°F` : "n/a"}</td>
                <td className="px-4 py-2">{parseF(s.Wind) !== null ? `${Math.round(parseF(s.Wind))} mph ${s.WindDirection || ""}` : "n/a"}{parseF(s.WindGust) !== null ? `, gusting ${Math.round(parseF(s.WindGust))}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-secondary mt-2">Temperatures are Fahrenheit and wind is miles per hour, as NDOT reports them. {SITE.dataCreditShort}.</p>
    </section>
  );
}

async function SummitWeather({ corridor }) {
  if (!corridor.weatherPoint) return null;
  const [weather, alerts] = await Promise.all([
    getPointWeather(corridor.weatherPoint.lat, corridor.weatherPoint.lon),
    getPointAlerts(corridor.weatherPoint.lat, corridor.weatherPoint.lon),
  ]);
  const today = weather?.periods?.[0];
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-on-surface mb-3">Weather at {corridor.weatherPoint.label}</h2>
      {alerts.length > 0 && (
        <div className="space-y-2 mb-3">
          {alerts.map((a, i) => (
            <div key={i} className="rounded-2xl bg-error text-on-error px-4 py-3">
              <p className="font-bold text-sm">{a.event}</p>
              <p className="text-sm">{a.headline}</p>
            </div>
          ))}
        </div>
      )}
      <div className="glass-card rounded-2xl p-4 md:p-5">
        {today ? (
          <>
            <p className="text-body-md text-on-surface font-semibold">
              {corridor.weatherPoint.label} right now: {today.shortForecast}, {today.temperature}°{today.temperatureUnit}.
            </p>
            <p className="text-sm text-secondary leading-relaxed mt-2">{today.detailedForecast}</p>
          </>
        ) : (
          <p className="text-body-md text-secondary leading-relaxed">
            The National Weather Service forecast for {corridor.weatherPoint.label} is not loading right now. The live
            verdict above is the part of this page to trust until it returns.
          </p>
        )}
        <p className="text-xs text-secondary mt-3">Forecast: National Weather Service, for the point itself, not the valley floor.</p>
      </div>
    </section>
  );
}

async function CorridorPage({ corridor }) {
  const eff = statusCorridor(corridor);
  const [status, cameras, stations] = await Promise.all([
    getCorridorStatus(eff),
    getCorridorCameras(corridor),
    getWeatherStations(),
  ]);
  const myStations = corridorStations(stations, eff);
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: `/${corridor.slug}`, title: `${corridor.name} Road Conditions`, description: corridor.intro[0] }),
        roadConditionSchema(corridor, status),
        faqSchema(corridor.faqs),
        cameraListSchema(cameras, corridor.name),
        breadcrumbSchema([{ name: "Home", path: "/" }, { name: corridor.name, path: `/${corridor.slug}` }]),
      ]} />
      <p className="text-label-md text-primary font-bold uppercase tracking-wide">{corridor.routeLabel} | {corridor.fromTo}</p>
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface mt-1">{corridor.name} road conditions</h1>
      <div className="mt-5">
        <StatusBanner corridor={corridor} status={status} heading={`${corridor.name} right now`} />
      </div>
      {corridor.intro.map((p, i) => (
        <p key={i} className="text-sm md:text-base text-secondary leading-relaxed mt-5 max-w-3xl">{p}</p>
      ))}

      <section className="mt-8">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xl font-bold text-on-surface">Cameras in driving order</h2>
          <Link href={`/${corridor.slug}-cameras`} className="text-sm font-bold text-primary">Full camera strip</Link>
        </div>
        <CameraGrid cameras={cameras.slice(0, 6)} />
      </section>

      <SegmentsList segments={status.segments} />
      <StationTable stations={myStations} />
      <SummitWeather corridor={corridor} />
      <EventList events={status.events} />

      <section className="mt-10">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-4">Corridor checkpoints</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {corridor.checkpoints.map((cp) => (
            <div key={cp.name} className="glass-card rounded-2xl p-4">
              <p className="font-bold text-on-surface text-sm">{cp.name}</p>
              <p className="text-sm text-secondary leading-relaxed mt-1">{cp.note}</p>
            </div>
          ))}
        </div>
      </section>

      <EditorialSections sections={corridor.sections} />

      <section className="mt-10 glass-card rounded-2xl p-4 md:p-5">
        <h2 className="text-headline-sm text-on-surface mb-2">Towns on this stretch</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {corridor.towns.map((slug) => {
            const t = getTown(slug);
            return t ? (
              <Link key={slug} href={`/${slug}-weather`} className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">{t.name} weather</Link>
            ) : null;
          })}
          {corridor.slug === "las-vegas" && (
            <Link href="/las-vegas-strip-camera-tour" className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">Strip camera tour</Link>
          )}
          <Link href="/status-history" className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">Status history</Link>
        </div>
      </section>

      <FaqBlock faqs={corridor.faqs} />
    </main>
  );
}

async function StripPage({ corridor }) {
  const cameras = await getCorridorCameras(corridor);
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: `/${corridor.slug}-cameras`, title: `${corridor.name} Cameras`, description: `Every Nevada 511 camera on ${corridor.name}, in driving order.` }),
        cameraListSchema(cameras, corridor.name),
      ]} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">{corridor.name} cameras</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        Every Nevada 511 camera on {corridor.routeLabel} through {corridor.name}, sequenced in driving order from{" "}
        {corridor.fromTo.split(" to ")[0]} to {corridor.fromTo.split(" to ").slice(1).join(" to ") || corridor.summit.name}.
        Read them in sequence and you can watch traffic build, weather change, and queues form before you drive into them.
        Each frame opens its own page with the local notes for that spot.
      </p>
      <p className="text-sm text-secondary mt-2">{SITE.dataCredit}</p>
      <div className="mt-6">
        <CameraGrid cameras={cameras} />
      </div>
      <p className="mt-8 text-sm">
        <Link href={`/${corridor.slug}`} className="font-bold text-primary">Back to {corridor.name} conditions</Link>
      </p>
    </main>
  );
}

async function TownPage({ town }) {
  const [weather, alerts] = await Promise.all([getTownWeather(town), getWeatherAlerts(town)]);
  const corridors = CORRIDORS.filter((c) => town.corridors.includes(c.slug));
  const statuses = await Promise.all(corridors.map((c) => getCorridorStatus(statusCorridor(c))));
  const tz = town.state === "UT" ? "America/Denver" : "America/Los_Angeles";
  const today = weather?.periods?.[0];
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: `/${town.slug}-weather`, title: `${town.name} Weather`, description: town.body[0] }),
        placeSchema(town),
      ]} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">{town.name} weather</h1>
      <p className="text-sm text-secondary mt-2">Elevation about {town.elevation.toLocaleString()} feet | Forecast: National Weather Service</p>

      {alerts.length > 0 && (
        <div className="mt-5 space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="rounded-2xl bg-error text-on-error px-4 py-3">
              <p className="font-bold text-sm">{a.event}</p>
              <p className="text-sm">{a.headline}</p>
            </div>
          ))}
        </div>
      )}

      <section className="mt-6 glass-card rounded-2xl p-4 md:p-5">
        {today ? (
          <>
            <p className="answer-first text-body-lg text-on-surface font-semibold">
              {town.name} right now: {today.shortForecast}, {today.temperature}°{today.temperatureUnit}.
            </p>
            <p className="text-sm text-secondary leading-relaxed mt-2">{today.detailedForecast}</p>
          </>
        ) : (
          <p className="answer-first text-body-md text-secondary leading-relaxed">
            The National Weather Service forecast for {town.name} is not loading right now. The corridor verdicts below
            are the live part of this page; check weather.gov for the forecast until it returns.
          </p>
        )}
        {weather?.hourly?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-4">
            {weather.hourly.map((h, i) => (
              <div key={i} className="min-w-[76px] glass rounded-xl px-2 py-2 text-center">
                <p className="text-[11px] font-bold text-secondary">{new Date(h.startTime).toLocaleTimeString("en-US", { hour: "numeric", timeZone: tz })}</p>
                <p className="text-base font-extrabold text-on-surface">{h.temperature}°</p>
                <p className="text-[11px] text-secondary leading-tight">{h.shortForecast}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 mt-6">
        {corridors.map((c, i) => (
          <StatusBanner key={c.slug} corridor={c} status={statuses[i]} />
        ))}
      </div>

      <div className="mt-9 space-y-4 max-w-3xl">
        {town.body.map((p, i) => (
          <p key={i} className="text-sm md:text-base text-secondary leading-relaxed">{p}</p>
        ))}
        <p className="text-sm md:text-base text-secondary leading-relaxed"><strong className="text-on-surface">Getting around:</strong> {town.driveNote}</p>
      </div>

      {weather?.periods?.length > 1 && (
        <section className="mt-9">
          <h2 className="text-xl font-bold text-on-surface mb-3">The week ahead in {town.name}</h2>
          <div className="glass-card rounded-2xl divide-y divide-outline-variant/20 overflow-hidden">
            {weather.periods.slice(1, 9).map((p, i) => (
              <div key={i} className="px-4 py-3 flex gap-4">
                <p className="text-sm font-bold text-on-surface w-32 shrink-0">{p.name}</p>
                <p className="text-sm text-secondary leading-relaxed"><strong className="text-on-surface">{p.temperature}°{p.temperatureUnit}</strong> : {p.shortForecast}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

async function RoutePage({ route }) {
  const corridors = CORRIDORS.filter((c) => route.corridors.includes(c.slug));
  const statuses = await Promise.all(corridors.map((c) => getCorridorStatus(statusCorridor(c))));
  const camSets = await Promise.all(corridors.map((c) => getCorridorCameras(c)));
  const cameras = camSets.flat().slice(0, 9);
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: `/${route.slug}`, title: route.name, description: route.intro }),
        faqSchema(route.faqs),
      ]} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">{route.name}</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">{route.intro}</p>
      <p className="text-sm text-secondary mt-2">{route.miles} miles | {route.driveTime} | {SITE.dataCreditShort}</p>
      <div className="grid gap-4 mt-6">
        {corridors.map((c, i) => (
          <StatusBanner key={c.slug} corridor={c} status={statuses[i]} />
        ))}
      </div>
      <section className="mt-9">
        <h2 className="text-xl font-bold text-on-surface mb-3">Cameras along the way</h2>
        <CameraGrid cameras={cameras} showCorridor />
      </section>
      <div className="mt-10 space-y-9">
        {route.segments.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-3">{s.heading}</h2>
            <p className="text-sm md:text-base text-secondary leading-relaxed max-w-3xl">{s.body}</p>
          </section>
        ))}
      </div>
      <FaqBlock faqs={route.faqs} />
    </main>
  );
}

async function ComparePage({ compare }) {
  const corridors = CORRIDORS.filter((c) => compare.corridorSlugs.includes(c.slug));
  const statuses = await Promise.all(corridors.map((c) => getCorridorStatus(statusCorridor(c))));
  const camCounts = await Promise.all(corridors.map((c) => getCorridorCameras(c)));
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: `/${compare.slug}`, title: compare.title, description: compare.intro }),
        faqSchema(compare.faqs),
      ]} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">{compare.title}</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">{compare.intro}</p>
      <div className="grid gap-4 mt-7">
        {corridors.map((c, i) => (
          <StatusBanner key={c.slug} corridor={c} status={statuses[i]} />
        ))}
      </div>
      <section className="mt-9">
        <h2 className="text-xl font-bold text-on-surface mb-3">Side by side</h2>
        <div className="glass-card rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-secondary border-b border-outline-variant/30">
                <th className="px-4 py-2 font-semibold">Stretch</th>
                <th className="px-4 py-2 font-semibold">Road</th>
                <th className="px-4 py-2 font-semibold">High point</th>
                <th className="px-4 py-2 font-semibold">Cameras listed</th>
                <th className="px-4 py-2 font-semibold">Character</th>
              </tr>
            </thead>
            <tbody>
              {corridors.map((c, i) => (
                <tr key={c.slug} className="border-b border-outline-variant/10 last:border-0">
                  <td className="px-4 py-2 font-bold text-on-surface"><Link href={`/${c.slug}`} className="text-primary">{c.name}</Link></td>
                  <td className="px-4 py-2">{c.routeLabel}</td>
                  <td className="px-4 py-2">{c.summit.name}, {c.summit.elevation.toLocaleString()} ft</td>
                  <td className="px-4 py-2">{camCounts[i].reduce((n, cam) => n + cam.views.length, 0)}</td>
                  <td className="px-4 py-2">{c.character}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="mt-9 space-y-4 max-w-3xl">
        {compare.body.map((p, i) => (
          <p key={i} className="text-sm md:text-base text-secondary leading-relaxed">{p}</p>
        ))}
      </div>
      <FaqBlock faqs={compare.faqs} />
    </main>
  );
}

export default async function SlugPage({ params }) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) notFound();
  if (r.kind === "corridor") return <CorridorPage corridor={r.corridor} />;
  if (r.kind === "strip") return <StripPage corridor={r.corridor} />;
  if (r.kind === "town") return <TownPage town={r.town} />;
  if (r.kind === "route") return <RoutePage route={r.route} />;
  return <ComparePage compare={r.compare} />;
}
