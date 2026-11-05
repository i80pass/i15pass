import StatusBanner from "@/components/StatusBanner";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { getCorridorStatus, cleanEvent } from "@/lib/ndot";
import { webPageSchema } from "@/lib/schema";

export const revalidate = 120;

export const metadata = {
  title: "Live Feed | All I-15 Corridor Conditions in One Stream",
  description: "Every Nevada 511 condition posting, event, and corridor verdict for Las Vegas, Primm, the Mountain Pass approach, and Mesquite in one live stream.",
  alternates: { canonical: "/live-feed" },
};

export default async function LiveFeedPage() {
  const statuses = await Promise.all(CORRIDORS.map((c) => getCorridorStatus(statusCorridor(c))));
  const allEvents = statuses.flatMap((s, i) => s.events.map((e) => ({ e: cleanEvent(e), corridor: CORRIDORS[i] })));
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/live-feed", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Live feed</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        The whole corridor in one stream: a live verdict per stretch, then every NDOT event the feed is carrying for
        these roads. This is the page to leave open on a getaway Friday, a fight night, or a storm day.
      </p>
      <p className="text-sm text-secondary mt-2">{SITE.dataCredit}</p>
      <div className="grid gap-4 mt-7">
        {CORRIDORS.map((c, i) => (
          <StatusBanner key={c.slug} corridor={c} status={statuses[i]} />
        ))}
      </div>
      <section className="mt-10">
        <h2 className="text-xl font-bold text-on-surface mb-3">All current events on this corridor</h2>
        {allEvents.length ? (
          <div className="glass-card rounded-2xl divide-y divide-outline-variant/20 overflow-hidden">
            {allEvents.slice(0, 30).map(({ e, corridor }, i) => (
              <div key={i} className="px-4 py-3">
                <p className="text-sm font-bold text-on-surface">{corridor.routeLabel} {corridor.name} : {e.type}{e.fullClosure ? " : FULL CLOSURE" : ""}</p>
                <p className="text-sm text-secondary leading-relaxed">{e.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-4 text-sm text-secondary leading-relaxed">
            No events are showing for this corridor right now. When the live feed is connected, NDOT incidents,
            roadwork, and closures stream here as they are posted.
          </div>
        )}
      </section>
    </main>
  );
}
