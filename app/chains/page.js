import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import StatusBanner from "@/components/StatusBanner";
import { SITE } from "@/lib/site-config";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { getCorridorStatus } from "@/lib/ndot";
import { webPageSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Chains Required on I-15? I-15 Chain Control Today | i15pass.com",
  description: "Live chain control status for I-15 today, zone by zone: Caltrans chain levels at Cajon Pass, Nevada 511 postings for Las Vegas, Primm, and Mesquite, and the live condition status for the Virgin River Gorge and the Utah stretch to St. George.",
  alternates: { canonical: "/chains" },
};

// Plain language note per zone, stating honestly what kind of chain
// signal exists there. California runs a numbered chain control
// program at Cajon Pass. Nevada posts restrictions situationally in
// plain language. Arizona and Utah run no chain control program on
// the Gorge stretch, so that zone shows its live condition status.
const ZONE_NOTES = {
  "cajon-pass":
    "California runs a numbered chain control program on this stretch, and this is the one place on I-15 where a chain ladder applies. Caltrans posts R1, R2, or R3 at the Cajon checkpoint, which covers I-15 from the I-215 junction at Devore to Main Street in Hesperia. R1 means chains or snow tires are required. R2 means chains are required on all vehicles except four wheel drive vehicles with snow tires on all four wheels. R3 means chains are required on all vehicles, with no exceptions. The live verdict above reads the Caltrans chain control feed, and the posted segments below carry the current level in Caltrans' own words when one is in effect.",
  "las-vegas":
    "Nevada runs no numbered chain control ladder. NDOT posts chain or snow tire requirements only when conditions require them, in plain language on the road conditions feed, and valley snow is rare enough that a posting here is an event. The live verdict above is that posting: when it shows no chain restriction, NDOT has not posted one for this stretch right now. That is a statement about the live feed, not a promise about the road, so the posted segments below are worth a read on any winter morning.",
  "primm-state-line":
    "Nevada runs no numbered chain control ladder on this stretch either. NDOT posts chain, snow tire, or wind restrictions only when conditions require them, and wind is the restriction this open desert stretch actually sees. The live verdict above carries any posting in NDOT's own words. If no restriction is shown, none is posted right now. The climb that starts at the state line is in California, and the Mountain Pass zone below covers what this site can and cannot see there.",
  "mountain-pass":
    "The Mountain Pass summit is in California, and it is the one climb on the Las Vegas to California drive where winter snow and ice are a genuine factor. This site has no Caltrans chain control feed wired for the summit itself, so there is no chain specific live signal to show for the top of the climb. The live verdict above is the Nevada approach to the state line, read live from Nevada 511, paired on the Mountain Pass page with the National Weather Service forecast at the summit. Treat the two together as your signal, and check Caltrans QuickMap for any California posting before you climb in a storm.",
  "mesquite-virgin-river-gorge":
    "Arizona runs no chain control program on the Virgin River Gorge stretch, and Utah posts no chain control on the run from the state line to St. George, so there is no chain specific live feed for this zone. The live verdict above is the condition status for the stretch, read from Nevada 511 for the Mesquite approach, which is the last live signal before the canyon. The hazards that actually close this stretch are rain, water and rock on the roadway, and flash flood risk in the river corridor, and those show in the verdict and the posted segments below when they are reported.",
};

export default async function ChainsPage() {
  const statuses = await Promise.all(CORRIDORS.map((c) => getCorridorStatus(statusCorridor(c))));
  const zones = CORRIDORS.map((c, i) => ({ corridor: c, status: statuses[i] }));
  const anyChains = zones.some((z) => z.status.live && z.status.traction?.inEffect && z.status.traction?.kind !== "wind");
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/chains", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Chain Controls on I-15 Today</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        {anyChains
          ? "A chain control or chain restriction is posted on at least one zone of I-15 right now. The zones below carry the live posting for each stretch, in the posting agency's own words."
          : "No chain control is posted on any zone of I-15 right now. Each zone below carries its live status, so a posting appears here the moment an agency puts one up."}
      </p>
      <p className="text-sm text-secondary mt-2">Live data: Caltrans for Cajon Pass, Nevada 511 for the Nevada zones.</p>
      <div className="grid gap-6 mt-7">
        {zones.map(({ corridor, status }) => (
          <section key={corridor.slug} className="glass-card rounded-2xl p-4 md:p-5">
            <StatusBanner corridor={corridor} status={status} heading={`${corridor.routeLabel} ${corridor.name}`} href={`/${corridor.slug}`} />
            {status.live && status.traction?.inEffect && status.traction?.raw ? (
              <p className="text-sm text-on-surface font-semibold mt-4 leading-relaxed">Posted now: {status.traction.raw}</p>
            ) : (
              <p className="text-sm text-secondary mt-4 leading-relaxed">
                {status.live
                  ? "No chain restriction is posted for this zone in the live feed right now."
                  : "The live feed for this zone is not answering right now, so no chain status can be shown. Check the official source for this stretch before you drive."}
              </p>
            )}
            {status.live && status.segments?.length ? (
              <div className="mt-3 space-y-2">
                {status.segments.slice(0, 4).map((s, i) => (
                  <p key={i} className="text-sm text-secondary leading-relaxed">
                    <strong className="text-on-surface">{s.LocationDescription || s.RoadwayName}:</strong> {s.statusText || "No special posting"}
                    {s.secondary?.length ? ` | ${s.secondary.join("; ")}` : ""}
                  </p>
                ))}
              </div>
            ) : null}
            <p className="text-sm md:text-base text-secondary leading-relaxed mt-4 max-w-3xl">{ZONE_NOTES[corridor.slug]}</p>
          </section>
        ))}
      </div>
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface">How chain control works on this corridor</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          I-15 crosses three states, and chain control means something different in each one. In California, at
          Cajon Pass, it is a formal program with numbered levels, checkpoints, and enforcement, and it is the
          only chain ladder on this road. In Nevada, there is no ladder: NDOT watches conditions and posts a
          requirement in plain language only when a storm actually calls for one, which on this desert corridor
          is uncommon outside the high country approaches. In Arizona and Utah, on the Virgin River Gorge and
          the St. George stretch, there is no chain control program at all, and winter driving there is governed
          by the live conditions themselves.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          The legal detail for Nevada, including what a posted chain or snow tire requirement obliges you to
          carry and when wind restrictions apply to high profile vehicles, is on the{" "}
          <Link href={SITE.lawPath} className="font-bold text-primary">{SITE.lawLabel}</Link> page. For the
          Cajon Pass levels in full, with the pass cameras in driving order, see the{" "}
          <Link href="/cajon-pass" className="font-bold text-primary">Cajon Pass</Link> page and the{" "}
          <Link href="/cameras" className="font-bold text-primary">Cajon Pass cameras</Link>. Full closures,
          as opposed to restrictions, are tracked on the{" "}
          <Link href="/closures" className="font-bold text-primary">closures</Link> page.
        </p>
      </section>
    </main>
  );
}
