import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import StatusBanner from "@/components/StatusBanner";
import { getCorridor } from "@/lib/corridors";
import { getCorridorStatus } from "@/lib/ndot";
import { getAllCaltransCameras } from "@/lib/caltrans";
import { webPageSchema, breadcrumbSchema, cameraListSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCaltransCameras().map((cam) => ({ id: cam.views[0].id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const cam = getAllCaltransCameras().find((c) => c.views[0].id === id);
  if (!cam) return {};
  return {
    title: `I-15 Camera at ${cam.location} | Cajon Pass Live`,
    description: `Live Caltrans traffic camera on I-15 at ${cam.location} in Cajon Pass, California, with the live Cajon Pass verdict, chain control status, and the neighboring cameras in driving order.`,
    alternates: { canonical: `/camera/${id}` },
  };
}

function zoneNote(position, total, location) {
  const third = position < total / 3 ? "top" : position >= (2 * total) / 3 ? "bottom" : "middle";
  if (third === "top") {
    return `This frame sits in the upper third of the pass, on the high desert side around ${location}. Up here the road is at its highest and coldest, and this is where snow, ice, and chain controls show first in a winter storm. Read this camera as the early warning for the whole pass: if the road is white or the queue is forming here, the descent below will not be easier.`;
  }
  if (third === "middle") {
    return `This frame sits in the middle of the pass, around ${location}, on the committed part of the grade where the two directions split onto their own alignments and the runaway truck ramps serve the downhill lanes. Mid pass frames carry the transition: basin fog gives up and summit weather takes over right about here, and wind events show as leaning trucks and debris before they show anywhere else.`;
  }
  return `This frame sits in the lower third of the pass, around ${location}, where the grade meets the basin floor at Devore and the I-215 split. Down here the weather is usually the mildest on the corridor, which is exactly why this camera matters as a traffic check: on a peak Sunday or a commute morning, a full frame at the bottom of the grade tells you the climb starts with a queue, whatever the summit is doing.`;
}

export default async function CameraDetailPage({ params }) {
  const { id } = await params;
  const cameras = getAllCaltransCameras();
  const idx = cameras.findIndex((c) => c.views[0].id === id);
  if (idx < 0) notFound();
  const cam = cameras[idx];
  const corridor = getCorridor("cajon-pass");
  const status = await getCorridorStatus(corridor);
  const prev = idx > 0 ? cameras[idx - 1] : null;
  const next = idx < cameras.length - 1 ? cameras[idx + 1] : null;
  const neighbors = cameras.filter((c, i) => i !== idx && Math.abs(i - idx) <= 2);
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: `/camera/${id}`, title: `I-15 camera at ${cam.location}`, description: metadataDescription(cam) }),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Cajon Pass", path: "/cajon-pass" },
          { name: "Cajon Pass cameras", path: "/cameras" },
          { name: cam.location, path: `/camera/${id}` },
        ]),
        cameraListSchema([cam], "Cajon Pass"),
      ]} />
      <p className="text-label-md text-primary font-bold uppercase tracking-wide">I-15 | Cajon Pass camera {idx + 1} of {cameras.length}</p>
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface mt-1">{cam.location}</h1>
      <div className="mt-5">
        <StatusBanner corridor={corridor} status={status} heading="Cajon Pass right now" />
      </div>
      <figure className="glass-card rounded-2xl overflow-hidden mt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cam.views[0].url} alt={`I-15 traffic camera at ${cam.location} in Cajon Pass, California, showing current road conditions`} width="640" height="480" className="w-full aspect-[4/3] object-cover bg-surface-container" />
        <figcaption className="p-4 text-sm text-secondary leading-relaxed">
          Live still from the Caltrans CCTV camera at {cam.location} on I-15 in Cajon Pass. Stills refresh with
          the state feed; in fast weather the corridor verdict above is the authority. Camera image: Caltrans.
        </figcaption>
      </figure>
      <div className="mt-8 space-y-4 max-w-3xl">
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          This is camera {idx + 1} of {cameras.length} on the Cajon Pass strip, listed in driving order from
          Hesperia at the top of the pass down to Devore at the bottom. The frame is the official Caltrans CCTV
          still for this point on the road, at latitude {cam.lat.toFixed(4)}, longitude {cam.lon.toFixed(4)},
          and it refreshes with the state feed.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">{zoneNote(idx, cameras.length, cam.location)}</p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Use this page as one instrument, not the whole panel. The live Cajon Pass verdict at the top folds
          this stretch of road together with the Caltrans chain control checkpoint, the closure feed, and the
          summit forecast into one answer, and the neighboring cameras below let you walk the rest of the road
          in stills before you drive it.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 mt-8">
        {prev && (
          <Link href={`/camera/${prev.views[0].id}`} className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">Previous camera: {prev.location}</Link>
        )}
        {next && (
          <Link href={`/camera/${next.views[0].id}`} className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">Next camera: {next.location}</Link>
        )}
        <Link href="/cameras" className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">All Cajon Pass cameras</Link>
        <Link href="/cajon-pass" className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">Cajon Pass conditions</Link>
      </div>
      {neighbors.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-on-surface mb-3">Neighboring cameras in the strip</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {neighbors.map((n) => (
              <Link key={n.id} href={`/camera/${n.views[0].id}`} className="glass-card rounded-2xl overflow-hidden block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={n.views[0].url} alt={`${n.location} live still`} loading="lazy" width="320" height="240" className="w-full aspect-[4/3] object-cover bg-surface-container" />
                <div className="p-3">
                  <p className="text-sm font-bold text-on-surface leading-snug">{n.location}</p>
                  <p className="text-xs text-secondary mt-0.5">I-15 | Live still, Caltrans</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function metadataDescription(cam) {
  return `Live Caltrans traffic camera on I-15 at ${cam.location} in Cajon Pass, California.`;
}
