import Link from "next/link";
import CameraGrid from "@/components/CameraGrid";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS } from "@/lib/corridors";
import { getCorridorCameras } from "@/lib/ndot";
import { webPageSchema } from "@/lib/schema";

export const revalidate = 3600;

export const metadata = {
  title: "All I-15 Cameras | Las Vegas, Primm, Mountain Pass Approach, Mesquite",
  description: "Every Nevada 511 camera on I-15 in Nevada: the Las Vegas valley, Primm and the California line, the Mountain Pass approach, and Mesquite, grouped by stretch and sequenced in driving order.",
  alternates: { canonical: "/cameras" },
};

export default async function CamerasIndex() {
  const sets = await Promise.all(CORRIDORS.map((c) => getCorridorCameras(c)));
  const total = sets.flat().reduce((n, cam) => n + cam.views.length, 0);
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/cameras", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">I-15 cameras</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        {total > 0
          ? `${total} Nevada 511 camera views across the corridor, grouped by stretch and sequenced in driving order inside each strip.`
          : "Nevada 511 cameras for every stretch of this corridor will list here the moment the live feed is connected, grouped by stretch and sequenced in driving order."}{" "}
        The Las Vegas valley set is the doorstep check, Primm shows you the California line before you commit to the
        desert, and the Mesquite set ends at the mouth of the Virgin River Gorge, the one stretch with no cameras of
        its own. For the Boulevard itself, the Strip camera tour walks the cameras on Las Vegas Boulevard.
      </p>
      <p className="text-sm text-secondary mt-2">{SITE.dataCredit}</p>
      {CORRIDORS.map((c, i) => (
        <section key={c.slug} className="mt-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl font-bold text-on-surface">{c.routeLabel} {c.name}</h2>
            <Link href={`/${c.slug}-cameras`} className="text-sm font-bold text-primary">Driving order strip</Link>
          </div>
          <CameraGrid cameras={sets[i].slice(0, 6)} />
        </section>
      ))}
    </main>
  );
}
