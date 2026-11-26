import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import StatusBanner from "@/components/StatusBanner";
import { getCorridor } from "@/lib/corridors";
import { getCorridorStatus } from "@/lib/ndot";
import { getAllCaltransCameras } from "@/lib/caltrans";
import { webPageSchema, cameraListSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cajon Pass Cameras | I-15 Traffic Cameras Live",
  description: "Every Caltrans traffic camera on I-15 through Cajon Pass in one grid, in driving order from Hesperia down to Devore, each camera with its own page, plus the live Cajon Pass verdict.",
  alternates: { canonical: "/cameras" },
};

export default async function CamerasPage() {
  const corridor = getCorridor("cajon-pass");
  const cameras = getAllCaltransCameras();
  const status = corridor ? await getCorridorStatus(corridor) : null;
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: "/cameras", title: metadata.title, description: metadata.description }),
        cameraListSchema(cameras, "Cajon Pass"),
      ]} />
      <p className="text-label-md text-primary font-bold uppercase tracking-wide">I-15 | Hesperia to Devore, California</p>
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface mt-1">Cajon Pass Cameras</h1>
      {corridor && status && (
        <div className="mt-5">
          <StatusBanner corridor={corridor} status={status} heading="Cajon Pass right now" />
        </div>
      )}
      <p className="answer-first text-body-md text-secondary mt-5 max-w-3xl leading-relaxed">
        All {cameras.length} Caltrans cameras on I-15 through Cajon Pass, in driving order from the high desert
        at Hesperia down the grade to Devore. Tap any camera for its own page, with the live pass verdict and
        its neighbors in the strip. These are California cameras only: this site carries no Nevada camera
        images, by NDOT policy.
      </p>
      <section className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cameras.map((cam) => (
            <Link key={cam.id} href={`/camera/${cam.views[0].id}`} className="glass-card rounded-2xl overflow-hidden block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cam.views[0].url} alt={`${cam.location || "Cajon Pass camera"} live still`} loading="lazy" width="320" height="240" className="w-full aspect-[4/3] object-cover bg-surface-container" />
              <div className="p-3">
                <p className="text-sm font-bold text-on-surface leading-snug">{cam.location}</p>
                <p className="text-xs text-secondary mt-0.5">I-15 | Live still, Caltrans</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface">Which camera should I check first?</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Start with the camera nearest the summit, at the Route 138 junction, because the top of the pass is
          where weather, chain controls, and closures begin. If the summit frame shows snow, fog, or a queue,
          that is your answer for the whole climb, whichever direction you are driving.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Driving northbound out of the Los Angeles basin, check the Kenwood and Glen Helen cameras at the
          bottom of the grade next: they show whether basin traffic and fog are already stacking up before the
          climb starts. Driving southbound from the high desert, check the Main Street and US-395 cameras at
          Hesperia first, then the Oak Hill Road frame, which is the last clear look at the road before the
          descent commits you to the steepest part of the grade.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          In wind, look at the Cleghorn Road and brake check frames midway down: leaning trucks and debris on
          those stills are the earliest visible sign that a Santa Ana event is working the canyon. And on a
          peak Sunday, the frames are a queue check as much as a weather check: if the bottom of the grade is
          already full, the cameras further up tell you how far the slowdown reaches.
        </p>
        <p className="text-sm text-secondary leading-relaxed">
          Camera images: Caltrans District 8 CCTV, the traveler information cameras of the California
          Department of Transportation. The full pass page, with the live verdict, chain controls, and
          checkpoints, is the <Link href="/cajon-pass" className="font-bold text-primary">Cajon Pass conditions</Link> page.
        </p>
      </section>
    </main>
  );
}
