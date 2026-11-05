import Link from "next/link";
import { SITE } from "@/lib/site-config";
import { statusSentence } from "@/lib/ndot";

// The verdict block: answer first sentence (Speakable target), status
// chips, and the data credit. Used on the homepage, corridor pages,
// town pages, route pages, and comparison pages so the verdict reads
// the same everywhere, the way the master does it.
export default function StatusBanner({ corridor, status, heading }) {
  const sentence = statusSentence(corridor, status);
  const updated = status.updatedAt
    ? new Date(status.updatedAt * 1000).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;
  return (
    <section className="glass-card rounded-2xl p-4 md:p-5 aura-shadow">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h2 className="text-headline-sm text-on-surface mr-1">{heading || `${corridor.routeLabel} ${corridor.name}`}</h2>
        {!status.live && (
          <span className="text-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary">LIVE FEED PENDING</span>
        )}
        {status.live && status.closed && (
          <span className="text-label-sm px-2 py-0.5 rounded-full bg-error text-on-error">CLOSED</span>
        )}
        {status.live && !status.closed && (
          <span className="text-label-sm px-2 py-0.5 rounded-full bg-emerald-600 text-white">OPEN</span>
        )}
        {status.live && status.traction?.inEffect && (
          <span className="text-label-sm px-2 py-0.5 rounded-full bg-amber-500 text-white">
            {status.traction.kind === "wind" ? "WIND RESTRICTION POSTED" : status.traction.kind === "chains" ? "CHAIN CONTROL POSTED" : "RESTRICTION POSTED"}
          </span>
        )}
      </div>
      <p className="answer-first text-body-md text-on-surface leading-relaxed">{sentence}</p>
      {corridor.coverageNote && (
        <p className="text-sm text-secondary leading-relaxed mt-2">{corridor.coverageNote}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-label-md text-secondary">
        <Link href={`/${corridor.slug}`} className="text-primary font-semibold">Full corridor page</Link>
        <Link href={`/${corridor.slug}-cameras`} className="text-primary font-semibold">Cameras in driving order</Link>
        <Link href={SITE.lawPath} className="text-primary font-semibold">{SITE.lawLabel}</Link>
      </div>
      <p className="text-xs text-secondary/80 mt-3">
        {SITE.dataCreditShort}{updated ? ` | Nevada 511 report ${updated} PT` : ""}
      </p>
    </section>
  );
}
