import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBanner from "@/components/StatusBanner";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { getCameraByViewId, getAllCameraViews, getCorridorStatus, getCorridorCameras } from "@/lib/ndot";
import { webPageSchema, breadcrumbSchema } from "@/lib/schema";

export const revalidate = 300;
export const dynamicParams = false;

export async function generateStaticParams() {
  const views = await getAllCameraViews();
  return views.map(({ view }) => ({ id: view.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const found = await getCameraByViewId(id);
  if (!found) return {};
  const { camera } = found;
  return {
    title: `${camera.location || `Camera ${id}`} Live Camera | ${camera.roadway}`,
    description: `Live Nevada 511 still from ${camera.location || "this camera"} on ${camera.roadway}, with the corridor verdict, neighboring cameras, and the local notes for this spot.`,
    alternates: { canonical: `/camera/${id}` },
  };
}

// Per camera pages carry real local writing: where the camera sits in the
// corridor sequence, what its frame can and cannot tell you, and which
// corridor decisions it feeds. Written from the corridor data, not filler.
function localNotes(corridor, cameras, index) {
  const total = cameras.length;
  const pos = index + 1;
  const frac = total > 1 ? pos / total : 1;
  const zone = frac <= 0.34 ? "first" : frac <= 0.67 ? "middle" : "last";
  const next = cameras[index + 1];
  const prev = cameras[index - 1];
  return [
    `This camera sits in the ${zone} third of the ${corridor.name} sequence, frame ${pos} of ${total} in driving order. Read it as one frame of a film: the frames ${prev ? "behind you" : "at the start of the stretch"} and ${next ? "ahead of you" : "at the end of the stretch"} bracket it, and the change between them is the real information. A single frame tells you about a spot; the sequence tells you about the drive.`,
    `${corridor.name} runs ${corridor.fromTo.toLowerCase()}. In the ${zone} third the story is usually ${zone === "first" ? "whether you are leaving free flowing road or entering the queue; this is the frame that decides go or wait" : zone === "middle" ? "the committed middle of the drive, where the pattern set at the start either holds or breaks down; what you see here is what the next twenty minutes look like" : "the arrival picture, the closest thing to a promise about what you will pull into"}. When this frame disagrees with the first frame of the stretch, believe this one for the road around it and the sequence as a whole for the drive.`,
    `The still refreshes about every minute at NDOT's source and shows the road surface and the traffic on it, not the air above. At night the frame still reads lane occupancy and brake lights honestly, which is most of what this corridor asks of a camera. Pair this frame with the corridor verdict at the top of the page, which carries any posted restriction and any closure NDOT is reporting for ${corridor.routeLabel}.`,
  ];
}

export default async function CameraPage({ params }) {
  const { id } = await params;
  const found = await getCameraByViewId(id);
  if (!found) notFound();
  const { camera, view } = found;
  const corridor = CORRIDORS.find((c) => c.slug === camera.corridorSlug) || CORRIDORS[0];
  const [status, corridorCameras] = await Promise.all([
    getCorridorStatus(statusCorridor(corridor)),
    getCorridorCameras(corridor),
  ]);
  const flat = corridorCameras.flatMap((cam) => cam.views.map((v) => ({ cam, v })));
  const index = flat.findIndex((x) => x.v.id === view.id);
  const notes = localNotes(corridor, flat, Math.max(index, 0));
  const neighbors = flat.slice(Math.max(0, index - 2), index + 3).filter((x) => x.v.id !== view.id);

  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: `/camera/${view.id}`, title: `${camera.location} camera`, description: `Live Nevada 511 still, ${camera.location}, ${camera.roadway}.` }),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: `${corridor.name} cameras`, path: `/${corridor.slug}-cameras` },
          { name: camera.location || `Camera ${view.id}`, path: `/camera/${view.id}` },
        ]),
      ]} />
      <p className="text-label-md text-primary font-bold uppercase tracking-wide">{camera.roadway} | Nevada 511 camera</p>
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface mt-1">{camera.location || `Camera ${view.id}`}</h1>
      <div className="mt-5">
        <StatusBanner corridor={corridor} status={status} heading={`${corridor.name} right now`} />
      </div>
      <figure className="mt-6 glass-card rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={view.url} alt={`${camera.location || "Nevada 511 camera"} live still`} className="w-full aspect-[4/3] object-cover bg-surface-container" />
        <figcaption className="px-4 py-3 text-sm text-secondary">
          {camera.location} {camera.direction ? `| ${camera.direction}` : ""} | Live still, {SITE.dataCreditShort}. Images refresh about every minute at the source.
        </figcaption>
      </figure>
      <div className="mt-8 space-y-4 max-w-3xl">
        {notes.map((p, i) => (
          <p key={i} className="text-sm md:text-base text-secondary leading-relaxed">{p}</p>
        ))}
      </div>
      {neighbors.length > 0 && (
        <section className="mt-9">
          <h2 className="text-xl font-bold text-on-surface mb-3">Neighboring cameras in driving order</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {neighbors.map(({ cam, v }) => (
              <Link key={v.id} href={`/camera/${v.id}`} className="glass-card rounded-2xl overflow-hidden block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.url} alt={`${cam.location} live still`} loading="lazy" className="w-full aspect-[4/3] object-cover bg-surface-container" />
                <p className="p-3 text-sm font-bold text-on-surface leading-snug">{cam.location}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <p className="mt-8 text-sm">
        <Link href={`/${corridor.slug}-cameras`} className="font-bold text-primary">See the full {corridor.name} strip in driving order</Link>
      </p>
    </main>
  );
}
