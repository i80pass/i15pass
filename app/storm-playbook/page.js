import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { webPageSchema } from "@/lib/schema";

export const metadata = {
  title: "Storm Playbook | Driving I-15 Through Snow, Flood, and Wind",
  description: "The decisions that matter on I-15 in bad weather: Mountain Pass chain postings and closures, monsoon flash floods, desert wind, and where to wait each one out.",
  alternates: { canonical: "/storm-playbook" },
};

const SECTIONS = [
  {
    heading: "The Mountain Pass snow day",
    body: "Snow on this corridor means one place: Mountain Pass, at about 4,730 feet on the California side. The playbook is simple. Read the Primm to State Line verdict before you leave Las Vegas, because the posting that governs the summit is filed on that stretch the moment California posts it. If chains are posted, the decision is made at the chain install areas near the summit, not at 70 miles an hour on the grade; carry them from November through March if this drive is yours. If the road closes, it closes between Primm and Baker with nothing in between, so the waiting happens in Primm or Las Vegas, never on the shoulder of the grade. The February 2023 storms are the standing lesson: drivers who checked at Primm slept in a casino; drivers who did not slept in their cars.",
  },
  {
    heading: "The monsoon flood night",
    body: "Summer storms on this corridor are water events, not snow events. A cell over the Spring Mountains can put water across the valley freeway in underpasses and washes, a cell over the Virgin River raises the river through the Gorge, and a cell over the Muddy River flats does the same at Mesquite. The rule is absolute: never drive into water you cannot see the bottom of, at any depth, in any vehicle. Turn around at the first flooded dip. The cameras before the wash crossings are the honest preview, and a flooded road reopens on NDOT's inspection, not on the rain stopping, so watch the verdict, not the sky.",
  },
  {
    heading: "The desert wind day",
    body: "Wind is this corridor's most common restriction and its most ignored. Gusts that a sedan shrugs off will lay a high profile vehicle over on the exposed grades: the drop from Mountain Pass, the Ivanpah flats, the Gorge rim, and the open run north of Las Vegas. When NDOT posts a wind restriction, it applies to high profile and light vehicles first, and the posting is written from measured gusts, not forecasts. Truck drivers: the Primm and Jean truck parking, the Mesquite lots, and the Las Vegas truck stops are the wait it out spots. Everyone else: slow down on the grades, keep both hands on the wheel through the canyon gusts, and expect the strongest blasts exactly where the road cuts through a ridge.",
  },
  {
    heading: "The dust storm",
    body: "The Mojave raises dust walls that drop visibility to zero in seconds on the Primm to Baker run. The playbook when one catches you: pull completely off the pavement, as far right as the ground allows, turn the lights off so the driver behind you does not follow your taillights off the road, take your foot off the brake, and wait. Dust passes in minutes. The summit and Jean cameras often show the wall coming before it reaches the road, which makes the camera check part of the storm routine, not a curiosity.",
  },
  {
    heading: "The standing routine",
    body: "Whatever the season, the routine is the same five minutes: corridor verdict first, cameras in driving order second, the rules page if any posting is up, and the status history if you want to know whether conditions are improving or getting worse. Every one of those lives on this site, read from the same Nevada 511 feed NDOT itself publishes.",
  },
];

export default function StormPlaybookPage() {
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/storm-playbook", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">The storm playbook</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        Desert weather is not gentle weather. This is the playbook the corridor's regulars run by: what to check,
        where the decisions get made, and where to wait when the road says no. Start with the{" "}
        <Link href="/closures" className="font-bold text-primary">closures page</Link> and the{" "}
        <Link href="/alerts" className="font-bold text-primary">alerts page</Link>, then come back here for the why.
      </p>
      <div className="mt-9 space-y-9">
        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-3">{s.heading}</h2>
            <p className="text-sm md:text-base text-secondary leading-relaxed max-w-3xl">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
