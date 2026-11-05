import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata = {
  title: "Storm Archive | The Corridor's Big Weather Days, On the Record",
  description: "The record of the I-15 corridor's storm days: Mountain Pass snow closures, monsoon flood nights, and wind events, drawn from the public status history.",
  alternates: { canonical: "/storm-archive" },
};

function loadEntries() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "lib", "status-history.json"), "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

export default function StormArchivePage() {
  const entries = loadEntries().slice().reverse();
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/storm-archive", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Storm archive</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        This corridor has three kinds of weather day: the rare winter storm that snows in Mountain Pass and closes
        the California run, the summer monsoon cell that floods a wash or the Virgin River and stops the Gorge, and
        the wind day that parks the trucks. The archive below is drawn from the public status history, so every
        entry is a real logged change, not a remembered one.
      </p>
      <div className="mt-8 max-w-3xl space-y-4">
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          The benchmark storm in living memory is the February 2023 sequence, when back to back Pacific storms
          snowed Mountain Pass hard enough to shut I-15 between California and Nevada, the one closure every
          regular on this road measures the rest against. The corridor also carries quieter archives: monsoon
          nights when the Virgin River ran high through the Gorge, and spring wind days when gusts over the passes
          and the open desert held high profile vehicles for hours.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          As the hourly logger records new changes, the storm days appear here in full. For what to do when one
          arrives, the <Link href="/storm-playbook" className="font-bold text-primary">storm playbook</Link> turns
          this archive into decisions, and the <Link href="/status-history" className="font-bold text-primary">status history</Link> keeps
          every change, storm or not.
        </p>
      </div>
      {entries.length ? (
        <div className="glass-card rounded-2xl divide-y divide-outline-variant/20 overflow-hidden mt-8">
          {entries.slice(0, 60).map((e, i) => (
            <div key={i} className="px-4 py-3">
              <p className="text-sm font-bold text-on-surface">{e.corridorName} : {e.change}</p>
              <p className="text-sm text-secondary">
                {new Date(e.at).toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })} PT
                {e.detail ? ` : ${e.detail}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-4 text-sm text-secondary leading-relaxed mt-8">
          No storm entries are on the record yet. The archive fills itself, one logged change at a time.
        </div>
      )}
    </main>
  );
}
