import Link from "next/link";
import StatusBanner from "@/components/StatusBanner";
import FaqBlock from "@/components/FaqBlock";
import StormAlerts from "@/components/StormAlerts";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { TOWNS } from "@/lib/towns";
import { ROUTES } from "@/lib/routes-data";
import { getCorridorStatus } from "@/lib/ndot";
import { webPageSchema, webSiteSchema, faqSchema, roadConditionSchema } from "@/lib/schema";

export const revalidate = 120;

export const metadata = {
  title: `I-15 Conditions and Cameras: Las Vegas, Primm, Mountain Pass, Mesquite | ${SITE.name}.com`,
  description: "Live I-15 road conditions, cameras, and posted restrictions for Las Vegas, Primm and the California line, Mountain Pass, Mesquite, and the Virgin River Gorge, from Nevada 511.",
};

const HOME_FAQS = [
  { q: "Is I-15 open right now?", a: "Each stretch of the corridor has its own live verdict at the top of this page, read from Nevada 511: Las Vegas, the run to Primm, the Mountain Pass approach, and Mesquite toward the Gorge. If a stretch is closed, its verdict says so plainly, with the NDOT posting behind it." },
  { q: "Do I need chains on I-15 today?", a: "Only where a posting says so. Nevada posts chain and snow tire requirements situationally rather than by a numbered ladder, and on this corridor the winter posting that matters is Mountain Pass, on the California side. The verdicts above carry any live posting in NDOT's own words, and the Nevada chain and wind rules page explains what the posted language requires." },
  { q: "Where do the cameras and conditions come from?", a: "Conditions come from Nevada 511, the Nevada Department of Transportation's traveler information service, and NDOT is credited on every conditions page. The only cameras on this site are the Caltrans cameras in Cajon Pass: NDOT does not license its camera images for use, so this site carries no Nevada camera stills. This site is not an official NDOT site." },
  { q: "What is the worst drive on this corridor?", a: "The Sunday afternoon drive southbound out of Las Vegas toward California is the corridor's famous queue, stacking back from the state line through Primm toward Jean, with Friday afternoon northbound into Las Vegas as the busy runner up. The Las Vegas to Los Angeles page tracks that drive with live verdicts for every stretch it crosses." },
];

export default async function HomePage() {
  const statuses = await Promise.all(CORRIDORS.map((c) => getCorridorStatus(statusCorridor(c))));
  const anyClosed = statuses.some((s) => s.live && s.closed);

  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webSiteSchema(),
        webPageSchema({ path: "/", title: metadata.title, description: metadata.description }),
        faqSchema(HOME_FAQS),
        ...CORRIDORS.map((c, i) => roadConditionSchema(c, statuses[i])),
      ]} />

      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface max-w-3xl">
        I-15 road conditions, live: Las Vegas to both state lines
      </h1>

      {/* Verdict first, the master order: the colored verdict boxes lead,
          directly under the H1; the intro paragraph and credit follow. */}
      <div className="grid gap-4 mt-6">
        {CORRIDORS.map((c, i) => (
          <StatusBanner key={c.slug} corridor={c} status={statuses[i]} href={`/${c.slug}`} />
        ))}
      </div>

      {/* Ad slot 1 of 2: below the webcams.
          Renders nothing until AdSense is activated (AdSlot gate). */}
      <AdSlot slot="belowCameras" />

      <section className="mt-12 glass-card rounded-2xl p-4 md:p-5">
        <h2 className="text-headline-sm text-on-surface mb-2">Walk the Strip by camera</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          The Las Vegas Strip runs parallel to I-15, and its Boulevard cameras tell the event night story the
          freeway cameras cannot. Our Strip camera tour walks Las Vegas Boulevard from the Welcome sign to
          downtown, one live frame at a time.
        </p>
        <Link href="/las-vegas-strip-camera-tour" className="inline-block mt-3 text-sm font-bold text-primary">Take the Strip camera tour</Link>
      </section>

      <section className="mt-12 glass-card rounded-2xl p-4 md:p-5">
        <h2 className="text-headline-sm text-on-surface mb-2">Cajon Pass cameras, live</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Every Caltrans camera on I-15 through Cajon Pass, in driving order from Hesperia down to Devore:
          the summit at Route 138, the brake check on the descent, and the bottom of the grade at Glen Helen.
          Check the frames before the climb, not in it.
        </p>
        <Link href="/cameras" className="inline-block mt-3 text-sm font-bold text-primary">See all Cajon Pass cameras</Link>
      </section>

      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-4">The drives</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {ROUTES.map((r) => (
            <Link key={r.slug} href={`/${r.slug}`} className="glass-card rounded-2xl p-4 aura-shadow-hover block">
              <p className="font-bold text-on-surface">{r.name}</p>
              <p className="text-sm text-secondary mt-1 leading-relaxed">{r.miles} miles | {r.driveTime}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 glass-card rounded-2xl p-4 md:p-5">
        <h2 className="text-headline-sm text-on-surface mb-2">Nevada chain and wind rules, in plain English</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Nevada does not run a numbered chain ladder. NDOT posts requirements in plain language, chains or
          snow tires where a storm demands it, and wind restrictions for high profile vehicles when the desert
          blows, and the posting itself is the law of the road for that stretch. Our rules page carries what
          each posted phrase requires, next to the live postings for every stretch of this corridor.
        </p>
        <Link href={SITE.lawPath} className="inline-block mt-3 text-sm font-bold text-primary">Read the Nevada rules page</Link>
      </section>

      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-4">Weather where you are</h2>
        <div className="flex flex-wrap gap-2">
          {TOWNS.map((t) => (
            <Link key={t.slug} href={`/${t.slug}-weather`} className="btn-nav-dark px-4 py-2 rounded-full text-sm font-semibold">
              {t.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <StormAlerts />
      </div>

      <p className="answer-first text-body-lg text-secondary mt-8 max-w-3xl leading-relaxed">
        {anyClosed
          ? "At least one stretch of I-15 on this corridor is closed right now according to Nevada 511. The verdicts above say which, and why, before you start the car."
          : "Las Vegas, the run south to Primm and the California line, the climb over Mountain Pass, and Mesquite into the Virgin River Gorge, each with a live verdict, its posted restrictions, and its cameras in driving order, all read from Nevada 511."}
      </p>
      <p className="text-sm text-secondary mt-2">{SITE.dataCredit}</p>

      <FaqBlock faqs={HOME_FAQS} />

      {/* Ad slot 2 of 2: lower page, above the footer.
          Renders nothing until AdSense is activated (AdSlot gate). */}
      <AdSlot slot="lowerPage" />
    </main>
  );
}
