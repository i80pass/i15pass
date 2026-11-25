// Camera cards in the order given (callers pass driving order). The grid
// follows the network camera grid rule: 1 column on phones, 2 across on
// small tablets, 3 across on iPad and desktop, gap 4, every still in a
// 4:3 frame with object-cover. Real stills only: agency frames loaded
// live from the source service, with the agency credited on every page
// that renders this grid. Callers render the grid only when a corridor
// actually has frames, so no placeholder or sample still ever appears.
export default function CameraGrid({ cameras, showCorridor = false }) {
  if (!cameras?.length) {
    return (
      <div className="glass-card rounded-2xl p-4 text-sm text-secondary leading-relaxed">
        No camera frames are listed for this stretch right now.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {cameras.flatMap((cam) =>
        cam.views.map((view) => (
          <div key={view.id} className="glass-card rounded-2xl overflow-hidden block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={view.url} alt={`${cam.location || "Road camera"} live still`} loading="lazy" width="320" height="240" className="w-full aspect-[4/3] object-cover bg-surface-container" />
            <div className="p-3">
              <p className="text-sm font-bold text-on-surface leading-snug">{cam.location || `Camera ${view.id}`}</p>
              <p className="text-xs text-secondary mt-0.5">
                {showCorridor && cam.roadway ? `${cam.roadway} | ` : ""}{cam.direction || ""} Live still, {cam.source === "Caltrans" ? "Caltrans" : "Nevada 511"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
