import fs from "node:fs";
import path from "node:path";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { webPageSchema } from "@/lib/schema";

export const metadata = {
  title: "Status History | Every I-15 Corridor Change, On the Record",
  description: "The public record of status and restriction changes on I-15 through Las Vegas, Primm, the Mountain Pass approach, and Mesquite, logged automatically the hour they happen.",
  alternates: { canonical: "/status-history" },
};

function loadHistory() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "lib", "status-history.json"), "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

export default function StatusHistoryPage() {
  const entries = loadHistory().slice().reverse();
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/status-history", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Status history</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        Every status and restriction change on the four stretches of this corridor, logged automatically when it
        happens and kept here permanently. This is the public record behind the verdicts: if the road over
        Mountain Pass carried a chain posting at 6 AM on a storm Tuesday, or the Gorge closed on a flood night,
        it says so here, with the posting that caused it.
      </p>
      <p className="text-sm text-secondary mt-2">{SITE.dataCreditShort}. Entries are written by an hourly change based logger; nothing is backfilled or edited by hand.</p>
      {entries.length ? (
        <div className="glass-card rounded-2xl divide-y divide-outline-variant/20 overflow-hidden mt-7">
          {entries.map((e, i) => (
            <div key={i} className="px-4 py-3">
              <p className="text-sm font-bold text-on-surface">
                {e.corridorName} : {e.change}
              </p>
              <p className="text-sm text-secondary">
                {new Date(e.at).toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })} PT
                {e.detail ? ` : ${e.detail}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-4 text-sm text-secondary leading-relaxed mt-7">
          The record starts the day the logger starts. From then on, every opening, closing, and restriction change
          on the four stretches is written here the hour it happens, and nothing is ever removed.
        </div>
      )}
    </main>
  );
}
