import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { webPageSchema } from "@/lib/schema";

export const metadata = {
  title: "About i15pass | Live I-15 Conditions for the Las Vegas Corridor",
  description: "What i15pass is, where its data comes from, and how the verdicts are built: Nevada 511 conditions and cameras for I-15, organized the way drivers actually use them.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/about", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">About {SITE.name}</h1>
      <div className="mt-6 max-w-3xl space-y-4">
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          {SITE.name}.com answers one question well: what is I-15 doing right now, between Las Vegas and the two
          state lines that define its working life. South, the road runs through Primm to the California line and
          climbs Mountain Pass toward Barstow and Los Angeles. North, it runs through Mesquite and the Virgin
          River Gorge toward St. George and Utah. Those drives carry the region's weekends, its freight, and its
          evacuations, and they deserved a page each, built around the answer.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Every verdict, posting, and camera on this site comes from Nevada 511, the Nevada Department of
          Transportation's traveler information service, read live from NDOT's developer feed and credited on
          every page. The weather comes from the National Weather Service. What this site adds is organization:
          the corridor cut into the stretches drivers actually think in, cameras sequenced in driving order,
          postings carried in NDOT's own words next to plain English explanations, alerts from both agencies side
          by side, and a public status history that never edits itself.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          This is not an official NDOT site, and in an emergency it is not a source: call 911, and for the
          official word go to {SITE.officialSourceName} at nvroads.com. For corrections, camera problems, or the
          free conditions widget for your own site, write to {SITE.contactEmail}.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          {SITE.name} is part of a small network of pass and corridor condition sites run by Bright Red Design.
          The whole family is listed on the <a href={SITE.networkUrl} className="font-bold text-primary">Our pass network</a> page.
          Start anywhere: the <Link href="/" className="font-bold text-primary">homepage verdicts</Link>, the{" "}
          <Link href="/cameras" className="font-bold text-primary">camera index</Link>, or the{" "}
          <Link href="/las-vegas-strip-camera-tour" className="font-bold text-primary">Strip camera tour</Link>.
        </p>
      </div>
    </main>
  );
}
