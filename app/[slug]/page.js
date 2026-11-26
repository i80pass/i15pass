import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import StatusBanner from "@/components/StatusBanner";
import CameraGrid from "@/components/CameraGrid";
import FaqBlock from "@/components/FaqBlock";
import AdSlot from "@/components/AdSlot";
import EditorialSections from "@/components/EditorialSections";
import StormAlerts from "@/components/StormAlerts";
import { CORRIDORS, getCorridor } from "@/lib/corridors";
import { TOWNS } from "@/lib/towns";
import { ROUTES } from "@/lib/routes-data";
import { COMPARES } from "@/lib/compare";
import {
  getCorridorStatus,
  getCorridorCameras,
  statusSentence,
} from "@/lib/caltrans";
import { getTownWeather, getWeatherAlerts } from "@/lib/weather";
import {
  webPageSchema,
  roadConditionSchema,
  faqSchema,
  cameraListSchema,
  placeSchema,
  breadcrumbSchema,
} from "@/lib/schema";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = [];
  for (const c of CORRIDORS) {
    slugs.push({ slug: c.slug });
    slugs.push({ slug: `${c.slug}-cameras` });
  }
  for (const t of TOWNS) slugs.push({ slug: `${t.slug}-weather` });
  for (const r of ROUTES) slugs.push({ slug: r.slug });
  for (const c of COMPARES) slugs.push({ slug: c.slug });
  return slugs;
}

function resolve(slug) {
  const corridor = getCorridor(slug);
  if (corridor) return { type: "corridor", corridor };
  if (slug.endsWith("-cameras")) {
    const c = getCorridor(slug.slice(0, -"-cameras".length));
    if (c) return { type: "strip", corridor: c };
  }
  if (slug.endsWith("-weather")) {
    const town = TOWNS.find((t) => t.slug === slug.slice(0, -"-weather".length));
    if (town) return { type: "town", town };
  }
  const route = ROUTES.find((r) => r.slug === slug);
  if (route) return { type: "route", route };
  const compare = COMPARES.find((c) => c.slug === slug);
  if (compare) return { type: "compare", compare };
  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) return {};
  if (r.type === "corridor") {
    const c = r.corridor;
    return {
      title: `${c.name} Conditions: Is ${c.routeLabel} Open? Cameras, Chains & Closures`,
      description: `Live ${c.name} (${c.routeLabel}, ${c.fromTo}) conditions from Caltrans: open or closed, chain controls, lane closures, traffic cameras and ${c.summit.name} weather at ${c.summit.elevation.toLocaleString()} feet.`,
      alternates: { canonical: `/${c.slug}` },
    };
  }
  if (r.type === "strip") {
    const c = r.corridor;
    return {
      title: `${c.name} Cameras: ${c.routeLabel} Camera Strip in Driving Order`,
      description: `Every Caltrans traffic camera on ${c.routeLabel} through ${c.name}, in driving order, each with its own page: ${c.fromTo}.`,
      alternates: { canonical: `/${c.slug}-cameras` },
    };
  }
  if (r.type === "town") {
    const t = r.town;
    return {
      title: `${t.name} Weather & Road Conditions`,
      description: `Live weather for ${t.name}, California (${t.elevation.toLocaleString()} ft) with the current pass verdict for the corridor it serves, from the National Weather Service and Caltrans.`,
      alternates: { canonical: `/${t.slug}-weather` },
    };
  }
  if (r.type === "route") {
    return {
      title: `${r.route.name}: Live Pass Conditions & Drive Guide`,
      description: `${r.route.name} (${r.route.miles} miles, ${r.route.driveTime.toLowerCase()}): live pass verdicts, cameras in driving order, and a segment by segment guide.`,
      alternates: { canonical: `/${r.route.slug}` },
    };
  }
  if (r.type === "compare") {
    return {
      title: `${r.compare.title}: Live Conditions, Side by Side`,
      description:
        "Grapevine vs Tehachapi Pass with both live Caltrans verdicts side by side: elevation, closures, chain controls, wind, cameras, and which pass to take today.",
      alternates: { canonical: `/${r.compare.slug}` },
    };
  }
  return {};
}

export default async function SlugPage({ params }) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) notFound();
  if (r.type === "corridor") return <CorridorPage corridor={r.corridor} />;
  if (r.type === "strip") return <StripPage corridor={r.corridor} />;
  if (r.type === "town") return <TownPage town={r.town} />;
  if (r.type === "route") return <RoutePage route={r.route} />;
  if (r.type === "compare") return <ComparePage compare={r.compare} />;
  notFound();
}

/* ---------------------------------- corridor --------------------------------- */

async function CorridorPage({ corridor }) {
  const [status, cameras] = await Promise.all([
    getCorridorStatus(corridor),
    getCorridorCameras(corridor),
  ]);
  const sentence = statusSentence(corridor, status);
  const events = [
    ...(status.fullClosures || []).map((c) => ({ ...c, kind: "Full closure" })),
    ...(status.laneClosures || []).map((c) => ({ ...c, kind: "Lane closure" })),
  ];
  return (
    <main className="max-w-[1200px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-8 space-y-8">
      <JsonLd
        data={[
          webPageSchema({
            name: `${corridor.name} conditions`,
            description: sentence,
            path: `/${corridor.slug}`,
          }),
          roadConditionSchema(corridor, status, sentence),
          faqSchema(corridor.faqs),
          cameraListSchema(corridor, cameras),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: corridor.name, path: `/${corridor.slug}` },
          ]),
        ]}
      />
      <section>
        <div className="text-label-md font-bold tracking-widest text-primary uppercase mb-2">
          {corridor.routeName}, {corridor.fromTo}
        </div>
        <h1 className="text-xl font-black uppercase tracking-wide leading-snug">
          {corridor.name}: is {corridor.routeLabel} open?
        </h1>
      </section>

      <StatusBanner corridor={corridor} status={status} sentence={sentence} compact />

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-headline-sm font-bold text-primary">Live cameras</h2>
          <Link href={`/${corridor.slug}-cameras`} className="font-semibold text-primary hover:underline text-sm">
            Open the full strip
          </Link>
        </div>
        <CameraGrid cameras={cameras} limit={cameras.length > 5 ? 3 : undefined} />
        {cameras.length > 5 && (
          <Link
            href={`/${corridor.slug}-cameras`}
            className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-nav-dark text-sm font-bold uppercase tracking-wide active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            SEE ALL WEBCAMS
          </Link>
        )}
        <p className="text-xs text-on-surface-variant mt-3">
          Official Caltrans CCTV stills, refreshed by the state. Cameras shown in driving order.
        </p>
      </section>

      {/* Ad slot 1 of 2: below the webcams.
          Renders nothing until AdSense is activated (AdSlot gate). */}
      <AdSlot slot="belowCameras" />

      {corridor.intro.map((p, i) => (
        <p key={i} className="text-lg text-on-surface-variant leading-relaxed max-w-3xl">{p}</p>
      ))}

      <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
        <h2 className="text-title-lg font-bold text-primary mb-2">Pass conditions</h2>
        <p className="text-on-surface-variant mb-4">
          {corridor.miles} miles, {corridor.driveTime.toLowerCase()}, summit {corridor.summit.name},{" "}
          {corridor.summit.elevation.toLocaleString()} ft
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-label-md text-on-surface-variant uppercase tracking-wide">Summit</div>
            <div className="font-bold text-on-surface">
              {corridor.summit.name}, {corridor.summit.elevation.toLocaleString()} ft
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-label-md text-on-surface-variant uppercase tracking-wide">Summit temp</div>
            <div className="font-bold text-on-surface">
              {status.summitTempF != null ? `${status.summitTempF}°F` : "See forecast"}
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-label-md text-on-surface-variant uppercase tracking-wide">Chain control</div>
            <div className="font-bold text-on-surface">
              {status.chain && status.chain.level > 0 ? `R${status.chain.level} in effect` : "None posted"}
            </div>
          </div>
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-label-md text-on-surface-variant uppercase tracking-wide">Active lane closures</div>
            <div className="font-bold text-on-surface">{status.laneClosures?.length || 0}</div>
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
          <h2 className="text-title-lg font-bold text-primary mb-4">Active closures on {corridor.routeLabel}</h2>
          <ul className="space-y-3">
            {events.map((e, i) => (
              <li key={i} className="border-b border-outline-variant/30 pb-3 last:border-0">
                <span className={`text-label-md font-bold px-2 py-0.5 rounded-full mr-2 ${e.kind === "Full closure" ? "bg-red-700 text-white" : "bg-amber-500 text-black"}`}>
                  {e.kind.toUpperCase()}
                </span>
                <span className="font-semibold text-on-surface">
                  {e.direction ? `${e.direction} ` : ""}{e.route} near {e.place || e.name}
                </span>
                <div className="text-sm text-on-surface-variant mt-1">
                  {e.work || "Closure"}
                  {e.lanesClosed ? `, ${e.lanesClosed} of ${e.totalLanes || "?"} lanes closed` : ""}
                  {e.delay && e.delay !== "No Delay" && e.delay !== "0" ? `, delay: ${e.delay}` : ""}
                  {!e.endEpoch ? ", no posted end time" : ""}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
        <h2 className="text-title-lg font-bold text-primary mb-4">The drive, checkpoint by checkpoint</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {corridor.checkpoints.map((cp, i) => (
            <div key={i} className="bg-surface-container rounded-lg p-4">
              <div className="font-bold text-on-surface">{cp.name}</div>
              <p className="text-sm text-on-surface-variant leading-relaxed mt-1">{cp.note}</p>
            </div>
          ))}
        </div>
      </section>

      <StormAlerts />

      <EditorialSections sections={corridor.sections} />

      <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
        <h2 className="text-title-lg font-bold text-primary mb-3">Towns on this corridor</h2>
        <div className="flex flex-wrap gap-2">
          {corridor.towns.map((ts) => {
            const t = TOWNS.find((x) => x.slug === ts);
            if (!t) return null;
            return (
              <Link key={ts} href={`/${ts}-weather`} className="bg-surface-container hover:bg-surface-container-high rounded-full px-4 py-2 text-sm font-semibold">
                {t.name} weather
              </Link>
            );
          })}
          <Link href={`/${corridor.slug}-cameras`} className="bg-surface-container hover:bg-surface-container-high rounded-full px-4 py-2 text-sm font-semibold">
            {corridor.name} cameras
          </Link>
          <Link href="/chains" className="bg-surface-container hover:bg-surface-container-high rounded-full px-4 py-2 text-sm font-semibold">
            Chain control levels
          </Link>
        </div>
      </section>

      <FaqBlock faqs={corridor.faqs} />

      {/* Ad slot 2 of 2: lower page, above the footer.
          Renders nothing until AdSense is activated (AdSlot gate). */}
      <AdSlot slot="lowerPage" />
    </main>
  );
}

/* ------------------------------------ strip ---------------------------------- */

async function StripPage({ corridor }) {
  const cameras = await getCorridorCameras(corridor);
  const status = await getCorridorStatus(corridor);
  const sentence = statusSentence(corridor, status);
  return (
    <main className="max-w-[1200px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-8 space-y-8">
      <JsonLd
        data={[
          webPageSchema({
            name: `${corridor.name} cameras`,
            description: `Every Caltrans camera on ${corridor.routeLabel} through ${corridor.name}, in driving order.`,
            path: `/${corridor.slug}-cameras`,
          }),
          cameraListSchema(corridor, cameras),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: corridor.name, path: `/${corridor.slug}` },
            { name: "Cameras", path: `/${corridor.slug}-cameras` },
          ]),
        ]}
      />
      <section>
        <div className="text-label-md font-bold tracking-widest text-primary uppercase mb-2">
          {corridor.routeName}, camera strip
        </div>
        <h1 className="text-xl font-black uppercase tracking-wide leading-snug">
          {corridor.name} cameras, in driving order
        </h1>
     </section>
      <CameraGrid cameras={cameras} />
      <p className="answer-first text-lg text-on-surface-variant leading-relaxed mt-3 max-w-3xl">
          {sentence} Below are all {cameras.length} Caltrans cameras on this corridor in the order you
          pass them driving {corridor.directions[0].toLowerCase()}bound, each with its own page. Read
          them like a story: the bottom of the grade, the climb, the top country, the descent.
        </p>
      <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
        Still images are the official Caltrans CCTV frames for each location, served by the state and
        refreshed continuously. A frame can lag reality in fast weather; the corridor verdict at the top
        of the {corridor.name} page is the authority, and the cameras are the pictures behind it.
      </p>
      <StormAlerts />
      <div className="flex flex-wrap gap-3">
        <Link href={`/${corridor.slug}`} className="bg-primary text-white font-bold rounded-full px-5 py-2.5">
          {corridor.name} conditions and verdict
        </Link>
        <Link href="/cameras" className="bg-surface-container font-bold rounded-full px-5 py-2.5 text-primary">
          Cameras on both passes
        </Link>
      </div>
    </main>
  );
}

/* ------------------------------------ town ----------------------------------- */

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

async function TownPage({ town }) {
  const [weather, alerts] = await Promise.all([
    getTownWeather(town),
    getWeatherAlerts(town.lat, town.lon),
  ]);
  const banners = [];
  for (const slug of town.corridors) {
    const corridor = getCorridor(slug);
    const status = await getCorridorStatus(corridor);
    banners.push({ corridor, status, sentence: statusSentence(corridor, status) });
  }
  const now = weather?.hourly?.[0];
  return (
    <main className="max-w-[1200px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-8 space-y-8">
      <JsonLd
        data={[
          webPageSchema({
            name: `${town.name} weather`,
            description: `Live weather and pass conditions for ${town.name}, California.`,
            path: `/${town.slug}-weather`,
          }),
          placeSchema(town),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: `${town.name} weather`, path: `/${town.slug}-weather` },
          ]),
        ]}
      />
      <section>
        <div className="text-label-md font-bold tracking-widest text-primary uppercase mb-2">
          {town.name}, California, {town.elevation.toLocaleString()} ft
        </div>
        <h1 className="text-xl font-black uppercase tracking-wide leading-snug">{town.name} weather</h1>
        <p className="answer-first text-lg md:text-xl text-on-surface-variant leading-relaxed mt-3 max-w-3xl">
          {now
            ? `Right now in ${town.name} it is ${now.temperature}°F and ${String(now.shortForecast || "").toLowerCase()}, with wind ${now.windDirection || ""} at ${now.windSpeed || "calm"}. The live pass verdict for the corridor ${town.name} serves is below.`
            : `The live pass verdict for the corridor ${town.name} serves is below; the forecast feed is refreshing.`}
        </p>
      </section>

      {banners.map(({ corridor, status, sentence }) => (
        <StatusBanner key={corridor.slug} corridor={corridor} status={status} sentence={sentence} compact />
      ))}

      {alerts.length > 0 && (
        <section className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-title-lg font-bold text-red-800 mb-3">Active weather alerts for {town.name}</h2>
          <ul className="space-y-3">
            {alerts.map((a, i) => (
              <li key={i}>
                <div className="font-bold text-red-900">{a.event}</div>
                <div className="text-sm text-red-800">{a.headline}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {weather && (
        <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
          <h2 className="text-title-lg font-bold text-primary mb-4">Next 24 hours</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {weather.hourly.slice(0, 24).map((h, i) => (
              <div key={i} className="min-w-[86px] bg-surface-container rounded-lg p-3 text-center">
                <div className="text-xs font-semibold text-on-surface-variant">{fmtTime(h.startTime)}</div>
                <div className="text-xl font-black text-on-surface my-1">{h.temperature}°</div>
                <div className="text-[11px] text-on-surface-variant leading-tight">{h.shortForecast}</div>
                <div className="text-[11px] font-semibold text-primary mt-1">{h.probabilityOfPrecipitation?.value || 0}% precip</div>
              </div>
            ))}
          </div>
          <h2 className="text-title-lg font-bold text-primary mt-6 mb-4">Day by day</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {weather.periods.map((p, i) => (
              <div key={i} className="bg-surface-container rounded-lg p-4">
                <div className="font-bold text-on-surface">{p.name}</div>
                <div className="text-2xl font-black text-primary my-1">{p.temperature}°{p.temperatureUnit}</div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{p.detailedForecast}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            Forecast: National Weather Service{weather.office ? ` (${weather.office} office)` : ""}. Times Pacific.
          </p>
        </section>
      )}

      <StormAlerts />

      {town.body.map((p, i) => (
        <p key={i} className="text-lg text-on-surface-variant leading-relaxed max-w-3xl">{p}</p>
      ))}

      <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
        <h2 className="text-title-lg font-bold text-primary mb-2">Driving note</h2>
        <p className="text-on-surface-variant leading-relaxed">{town.driveNote}</p>
      </section>
    </main>
  );
}

/* ------------------------------------ route ---------------------------------- */

async function RoutePage({ route }) {
  const banners = [];
  const cameras = [];
  for (const slug of route.corridors) {
    const corridor = getCorridor(slug);
    const status = await getCorridorStatus(corridor);
    banners.push({ corridor, status, sentence: statusSentence(corridor, status) });
    cameras.push(...(await getCorridorCameras(corridor)));
  }
  return (
    <main className="max-w-[1200px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-8 space-y-8">
      <JsonLd
        data={[
          webPageSchema({ name: route.name, description: route.intro, path: `/${route.slug}` }),
          faqSchema(route.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: route.name, path: `/${route.slug}` },
          ]),
        ]}
      />
      <section>
        <div className="text-label-md font-bold tracking-widest text-primary uppercase mb-2">
          {route.miles} miles, {route.driveTime}
        </div>
        <h1 className="text-xl font-black uppercase tracking-wide leading-snug">{route.name}</h1>
      </section>

      {banners.map(({ corridor, status, sentence }) => (
        <StatusBanner key={corridor.slug} corridor={corridor} status={status} sentence={sentence} compact />
      ))}

      <section>
        <h2 className="text-headline-sm font-bold text-primary mb-4">Cameras along this drive</h2>
        <CameraGrid cameras={cameras} limit={cameras.length > 5 ? 3 : undefined} />
        {cameras.length > 5 && (
          <Link
            href={route.corridors.length === 1 ? `/${route.corridors[0]}-cameras` : "/cameras"}
            className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-nav-dark text-sm font-bold uppercase tracking-wide active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            SEE ALL WEBCAMS
          </Link>
        )}
      </section>

      <StormAlerts />

      <p className="answer-first text-lg text-on-surface-variant leading-relaxed max-w-3xl">{route.intro}</p>

      <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
        <h2 className="text-title-lg font-bold text-primary mb-4">The drive, segment by segment</h2>
        <div className="space-y-5">
          {route.segments.map((s, i) => (
            <div key={i}>
              <h3 className="font-bold text-on-surface">{i + 1}. {s.heading}</h3>
              <p className="text-on-surface-variant leading-relaxed mt-1">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <FaqBlock faqs={route.faqs} />
    </main>
  );
}

/* ---------------------------------- compare ---------------------------------- */

async function ComparePage({ compare }) {
  const rows = [];
  for (const slug of compare.corridorSlugs) {
    const corridor = getCorridor(slug);
    const status = await getCorridorStatus(corridor);
    const cameras = await getCorridorCameras(corridor);
    rows.push({ corridor, status, sentence: statusSentence(corridor, status), cameraCount: cameras.length });
  }
  const [a, b] = rows;
  const table = [
    ["Route", a.corridor.routeName, b.corridor.routeName],
    ["Summit", `${a.corridor.summit.name}, ${a.corridor.summit.elevation.toLocaleString()} ft`, `${b.corridor.summit.name}, ${b.corridor.summit.elevation.toLocaleString()} ft`],
    ["Verdict now", a.status.closed ? "CLOSED" : a.status.partialClosure ? "CLOSED ONE DIRECTION" : "OPEN", b.status.closed ? "CLOSED" : b.status.partialClosure ? "CLOSED ONE DIRECTION" : "OPEN"],
    ["Chain control", a.status.chain.level > 0 ? `R${a.status.chain.level}` : "None posted", b.status.chain.level > 0 ? `R${b.status.chain.level}` : "None posted (no fixed checkpoints)"],
    ["Summit temp", a.status.summitTempF != null ? `${a.status.summitTempF}°F` : "See forecast", b.status.summitTempF != null ? `${b.status.summitTempF}°F` : "See forecast"],
    ["Signature hazard", "Snow and ice on a 6 percent interstate grade", "Wind on high profile vehicles, then snow"],
    ["Cameras on this site", `${a.cameraCount}, bracketing the summit`, `${b.cameraCount}, ends only, none on the mountain`],
    ["Detour role", "Detours via SR-14 and SR-58 (Tehachapi)", "Detours via SR-14 and I-5 (the Grapevine)"],
  ];
  return (
    <main className="max-w-[1200px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-8 space-y-8">
      <JsonLd
        data={[
          webPageSchema({ name: compare.title, description: compare.intro, path: `/${compare.slug}` }),
          faqSchema(compare.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare passes", path: "/compare" },
            { name: compare.title, path: `/${compare.slug}` },
          ]),
        ]}
      />
      <section>
        <div className="text-label-md font-bold tracking-widest text-primary uppercase mb-2">Live comparison</div>
        <h1 className="text-xl font-black uppercase tracking-wide leading-snug">{compare.title}</h1>
      </section>

      {rows.map(({ corridor, status, sentence }) => (
        <StatusBanner
          key={corridor.slug}
          corridor={corridor}
          status={status}
          sentence={sentence}
          compact
          href={`/${corridor.slug}`}
        />
      ))}

      <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30 overflow-x-auto">
        <h2 className="text-title-lg font-bold text-primary mb-4">Side by side</h2>
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="text-left border-b border-outline-variant/40">
              <th className="py-2 pr-4 text-on-surface-variant font-semibold"> </th>
              <th className="py-2 pr-4 font-bold text-on-surface">{a.corridor.name} ({a.corridor.routeLabel})</th>
              <th className="py-2 font-bold text-on-surface">{b.corridor.name} ({b.corridor.routeLabel})</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i} className="border-b border-outline-variant/20 last:border-0">
                <td className="py-2.5 pr-4 font-semibold text-on-surface-variant whitespace-nowrap">{row[0]}</td>
                <td className="py-2.5 pr-4 text-on-surface">{row[1]}</td>
                <td className="py-2.5 text-on-surface">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="answer-first text-lg text-on-surface-variant leading-relaxed max-w-3xl">{compare.intro}</p>

      {compare.body.map((p, i) => (
        <p key={i} className="text-lg text-on-surface-variant leading-relaxed max-w-3xl">{p}</p>
      ))}

      <FaqBlock faqs={compare.faqs} />
    </main>
  );
}
