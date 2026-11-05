import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { getCorridorStatus, cleanEvent } from "@/lib/ndot";
import { webPageSchema } from "@/lib/schema";

export const revalidate = 120;

export const metadata = {
  title: "I-15 Road Closures | Las Vegas to Barstow and St. George",
  description: "Current full closures on I-15 between Las Vegas, Primm, Mountain Pass, Mesquite, and the Virgin River Gorge, read live from Nevada 511, with the alternatives that actually work.",
  alternates: { canonical: "/closures" },
};

export default async function ClosuresPage() {
  const statuses = await Promise.all(CORRIDORS.map((c) => getCorridorStatus(statusCorridor(c))));
  const rows = CORRIDORS.map((c, i) => {
    const s = statuses[i];
    const closures = (s.events || []).map(cleanEvent).filter((e) => e.fullClosure);
    return { corridor: c, status: s, closures };
  });
  const anyClosure = rows.some((r) => r.status.live && (r.status.closed || r.closures.length));
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/closures", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">I-15 closures</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        {anyClosure
          ? "Nevada 511 is reporting at least one full closure on this corridor right now. The closed stretches are listed first, in NDOT's own words."
          : "No full closure is reported on any stretch of this corridor right now. Each stretch below carries its live verdict, so a closure appears here the moment NDOT posts it."}
      </p>
      <p className="text-sm text-secondary mt-2">{SITE.dataCredit}</p>
      <div className="grid gap-4 mt-7">
        {rows.map(({ corridor, status, closures }) => (
          <section key={corridor.slug} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-headline-sm text-on-surface">{corridor.routeLabel} {corridor.name}</h2>
              {!status.live ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-secondary">LIVE FEED PENDING</span>
              ) : status.closed || closures.length ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-error text-on-error">CLOSED</span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container">OPEN</span>
              )}
            </div>
            {closures.length ? (
              <div className="mt-3 space-y-2">
                {closures.map((e, i) => (
                  <p key={i} className="text-sm text-secondary leading-relaxed"><strong className="text-on-surface">{e.type}:</strong> {e.comment}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary mt-2 leading-relaxed">
                {status.live
                  ? "No full closure posted for this stretch. Lane closures and slowdowns still show on the corridor page."
                  : "The live verdict for this stretch appears here the moment the Nevada 511 feed is connected."}
              </p>
            )}
            <p className="mt-3 text-sm">
              <Link href={`/${corridor.slug}`} className="font-bold text-primary">{corridor.name} conditions and cameras</Link>
            </p>
          </section>
        ))}
      </div>
      <section className="mt-10 max-w-3xl space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface">When this road closes, the honest alternatives</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          South toward California, there is no parallel freeway. A full closure between Primm and Barstow means
          waiting it out or the long way around through US-95 and I-40, hours longer; the Jean and Primm exits are
          the last services before the desert either way. North toward Utah, a Gorge closure has no detour at all
          inside the canyon: the old road through Littlefield and Beaver Dam is the way around when it is passable,
          and St. George traffic can also leave I-15 at Mesquite. In both directions, the cameras on the corridor
          pages show the queue before you are in it.
        </p>
      </section>
    </main>
  );
}
