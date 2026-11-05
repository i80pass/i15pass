import Link from "next/link";

// Camera cards in the order given (callers pass driving order). The grid
// follows the network camera grid rule: 1 column on phones, 2 across on
// small tablets, 3 across on iPad and desktop, gap 4, every still in a
// 4:3 frame with object-cover, and every card a real link to its per
// camera page. Stills are Nevada 511 frames, loaded live from the NDOT
// service exactly as the API publishes them, with NDOT credited on
// every page that renders this grid.
export default function CameraGrid({ cameras, showCorridor = false }) {
  if (!cameras?.length) {
    return (
      <div className="glass-card rounded-2xl p-4 text-sm text-secondary leading-relaxed">
        Camera listings for this stretch load from the Nevada 511 feed. The feed connection is pending, so no camera
        frames are shown yet rather than showing you stale or borrowed pictures. Check back once the live feed is
        connected, or see the cameras now at Nevada 511.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {cameras.flatMap((cam) =>
        cam.views.map((view) => (
          <Link key={view.id} href={`/camera/${view.id}`} className="glass-card rounded-2xl overflow-hidden aura-shadow-hover block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={view.url} alt={`${cam.location || "Nevada 511 camera"} live still`} loading="lazy" width="320" height="240" className="w-full aspect-[4/3] object-cover bg-surface-container" />
            <div className="p-3">
              <p className="text-sm font-bold text-on-surface leading-snug">{cam.location || `Camera ${view.id}`}</p>
              <p className="text-xs text-secondary mt-0.5">
                {showCorridor && cam.roadway ? `${cam.roadway} | ` : ""}{cam.direction || ""} Live still, Nevada 511
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
