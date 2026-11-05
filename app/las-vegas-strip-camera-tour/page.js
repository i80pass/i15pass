import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { getStripCameras } from "@/lib/ndot";
import { webPageSchema, cameraListSchema } from "@/lib/schema";

export const revalidate = 300;

export const metadata = {
  title: "Las Vegas Strip Camera Tour | Walk the Boulevard by Live Camera",
  description: "A walking tour of the Las Vegas Strip told through its live traffic cameras: from the Welcome to Fabulous Las Vegas sign to downtown, one Nevada 511 frame at a time, south to north.",
  alternates: { canonical: "/las-vegas-strip-camera-tour" },
};

// Original tour copy for the stops along the walk. Cameras attach to a stop
// by order along the boulevard; the copy stands on its own if a given stop
// has no live frame right now.
const STOPS = [
  {
    name: "The Welcome sign and the south Strip",
    body: "The walk starts where the pilgrimages do, at the Welcome to Fabulous Las Vegas sign in the median of Las Vegas Boulevard, south of Russell Road. The cameras here frame the south Strip's working edge: the airport connectors, the stadium district across the freeway, and the first of the resort towers rising out of the desert floor. On event nights this is the frame that tells you whether the south end is breathing or gridlocked before you commit to it.",
  },
  {
    name: "Tropicana Avenue",
    body: "Tropicana is the Strip's southern crossroads, where the boulevard meets the avenue that runs to the airport and the university. The corner carries four resort towers and one of the busiest pedestrian crossings in the country. The camera here reads the whole intersection honestly: when the crosswalks surge between show lettings out, the boulevard slows to a walk itself, and the frame shows it.",
  },
  {
    name: "The center Strip: Flamingo and the Bellagio corner",
    body: "Flamingo Road is the historic heart of the Strip, the corner the modern boulevard grew around. This is the densest camera ground on the walk: fountains across the street, the oldest name on the boulevard on the corner, and traffic that moves in pulses set by the pedestrian bridges. If you only check one frame before driving the center Strip, this is the one; it has been telling the truth about this intersection for as long as there have been cameras.",
  },
  {
    name: "Spring Mountain and Fashion Show",
    body: "North of Flamingo the boulevard changes character: the mega resorts give way to the shopping district, the convention traffic from Sands Avenue, and the crossing to the west side's Asian dining corridors on Spring Mountain. The cameras here catch the day trade the night frames miss, delivery trucks, convention surges, and the lunch rush crossing the boulevard on foot.",
  },
  {
    name: "Sahara Avenue and the north Strip",
    body: "Sahara marks the old north end of the classic Strip, where the boulevard passes the newest tower on the walk, the STRAT's needle on the horizon, and the locals' cross streets. Traffic thins here, speeds come back, and the frame shows the Strip returning to being a city street again, with the downtown towers ahead.",
  },
  {
    name: "Downtown and Fremont Street",
    body: "The walk ends where Las Vegas began, under the downtown canopy a few blocks east of the boulevard's north end. The cameras here frame a different city: the old casinos, the courts, and the morning traffic of a working downtown. Stand here at the end of the tour and the whole boulevard you just walked is behind you, four miles of it, every frame of it live.",
  },
];

export default async function StripTourPage() {
  const cameras = await getStripCameras();
  const flat = cameras.flatMap((cam) => cam.views.map((v) => ({ cam, v })));
  // Cameras distributed across the stops in boulevard order.
  const perStop = STOPS.map((_, i) => {
    const start = Math.floor((flat.length * i) / STOPS.length);
    const end = Math.floor((flat.length * (i + 1)) / STOPS.length);
    return flat.slice(start, end);
  });
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: "/las-vegas-strip-camera-tour", title: metadata.title, description: metadata.description }),
        cameraListSchema(cameras, "Las Vegas Strip"),
      ]} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">The Strip, by camera</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        Las Vegas Boulevard has a camera at nearly every corner, and read in order they tell the Strip's story
        better than any single view of it. This tour walks the boulevard from the Welcome sign to downtown, south
        to north, one live frame at a time, with the story of each stop alongside. It is the one page on this site
        built for looking rather than driving.
      </p>
      <p className="text-sm text-secondary mt-2">{SITE.dataCredit}. Stills load as you scroll; nothing on this page plays video.</p>

      {flat.length === 0 && (
        <div className="glass-card rounded-2xl p-4 text-sm text-secondary leading-relaxed mt-8">
          The Boulevard cameras join this tour the moment the Nevada 511 feed is connected. The walk itself is
          written below so the route is ready; each stop takes its live frames in boulevard order as they arrive.
        </div>
      )}

      <div className="mt-10 space-y-12">
        {STOPS.map((stop, i) => (
          <section key={stop.name}>
            <p className="text-label-md text-primary font-bold uppercase tracking-wide">Stop {i + 1} of {STOPS.length}</p>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface mt-1">{stop.name}</h2>
            <p className="text-sm md:text-base text-secondary leading-relaxed max-w-3xl mt-3">{stop.body}</p>
            {perStop[i].length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {perStop[i].slice(0, 3).map(({ cam, v }) => (
                  <Link key={v.id} href={`/camera/${v.id}`} className="glass-card rounded-2xl overflow-hidden block aura-shadow-hover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.url} alt={`${cam.location} live still`} loading="lazy" width="320" height="240" className="w-full aspect-[4/3] object-cover bg-surface-container" />
                    <p className="p-3">
                      <span className="block text-sm font-bold text-on-surface leading-snug">{cam.location}</span>
                      <span className="block text-xs text-secondary mt-0.5">{cam.roadway}{cam.direction ? ` | ${cam.direction}` : ""}</span>
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="mt-12 glass-card rounded-2xl p-4 md:p-5">
        <h2 className="text-headline-sm text-on-surface mb-2">Driving it instead?</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          The Strip parallels I-15 for its whole length, and on event nights the freeway is how the boulevard
          breathes. The <Link href="/las-vegas" className="font-bold text-primary">Las Vegas corridor page</Link> carries
          the live verdict and the freeway cameras in driving order, and the{" "}
          <Link href="/las-vegas-to-los-angeles" className="font-bold text-primary">Las Vegas to Los Angeles page</Link> covers
          the drive home.
        </p>
      </section>
    </main>
  );
}
