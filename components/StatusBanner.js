import Link from "next/link";
import { SITE } from "@/lib/site-config";
import { statusSentence } from "@/lib/ndot";

// The verdict block in the master (i80pass) treatment: a full width
// colored verdict box (emerald when open, amber when a restriction is
// posted, red when closed, slate when the feed is not reporting), the
// status in the largest type on the page, the answer first sentence as
// the status line inside the box, and the agency timestamp under the
// box. Used on the homepage, corridor pages, town pages, route pages,
// and comparison pages so the verdict reads the same everywhere, the
// way the master does it. (Before Nov 14, 2026 this was a text card
// with small status chips; the network standard is the colored box.)
export default function StatusBanner({ corridor, status, heading, href = null }) {
  const sentence = statusSentence(corridor, status);
  const updated = status.updatedAt
    ? new Date(status.updatedAt * 1000).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;
  const verified = status.verifiedAt
    ? new Date(status.verifiedAt * 1000).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;
  const bannerBg = !status.live
    ? "bg-slate-600"
    : status.closed
      ? "bg-red-700"
      : status.traction?.inEffect
        ? "bg-amber-500"
        : "bg-emerald-600";
  const statusText = !status.live ? "STATUS UNAVAILABLE" : status.closed ? "CLOSED" : "OPEN";
  const tractionLine =
    status.live && status.traction?.inEffect
      ? status.traction.kind === "wind"
        ? "WIND RESTRICTION POSTED"
        : status.traction.kind === "chains"
          ? "CHAIN CONTROL POSTED"
          : "RESTRICTION POSTED"
      : null;
  const box = (
    <div className={`flex items-center gap-5 p-5 rounded-2xl aura-shadow ${bannerBg}`}>
      <div className="w-16 h-16 shrink-0 bg-white rounded-xl flex items-center justify-center drop-shadow-lg">
        <span className="text-[15px] font-black text-slate-900 text-center leading-tight px-1">{corridor.routeLabel}</span>
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-black text-white leading-tight">{statusText}</p>
        {tractionLine && <p className="text-white font-bold text-sm mt-1">{tractionLine}</p>}
        <p className="answer-first text-white/80 font-semibold text-sm mt-1 leading-relaxed">{sentence}</p>
      </div>
      {href && (
        <span aria-hidden="true" className="ml-auto pl-2 text-white/70 text-3xl font-black leading-none">›</span>
      )}
    </div>
  );
  return (
    <section>
      <h2 className="text-headline-sm text-on-surface mb-2">{heading || `${corridor.routeLabel} ${corridor.name}`}</h2>
      {href ? (
        <Link href={href} className="block rounded-2xl">{box}</Link>
      ) : (
        box
      )}
      <p className="text-[11px] text-secondary mt-2 font-mono uppercase tracking-wide">
        {corridor.dataCreditShort || SITE.dataCreditShort}{updated ? ` | ${corridor.statusSource === "caltrans" ? "Caltrans" : "Nevada 511"} report ${updated} PT` : ""}{verified ? ` | Verified ${verified} PT` : ""}
      </p>
      {corridor.coverageNote && (
        <p className="text-sm text-secondary leading-relaxed mt-2">{corridor.coverageNote}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-label-md text-secondary">
        <Link href={`/${corridor.slug}`} className="inline-flex items-center min-h-[48px] text-primary font-semibold">Full corridor page</Link>
        {!corridor.hideLawLink && (
          <Link href={SITE.lawPath} className="inline-flex items-center min-h-[48px] text-primary font-semibold">{SITE.lawLabel}</Link>
        )}
      </div>
    </section>
  );
}
