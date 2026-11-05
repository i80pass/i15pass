import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { COMPARES } from "@/lib/compare";
import { webPageSchema } from "@/lib/schema";

export const metadata = {
  title: "Compare the Drives | I-15 North vs South From Las Vegas",
  description: "Side by side comparisons of the I-15 corridor's two mountain drives from Las Vegas: Mountain Pass toward California and the Virgin River Gorge toward Utah, with live verdicts for both.",
  alternates: { canonical: "/compare" },
};

export default function CompareHub() {
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/compare", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Compare the drives</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        Las Vegas sits between two very different mountain drives on the same freeway. These pages put them side
        by side, with the live verdict for each, so the choice between them is made on today's road, not on habit.
      </p>
      <div className="grid md:grid-cols-2 gap-3 mt-8">
        {COMPARES.map((c) => (
          <Link key={c.slug} href={`/${c.slug}`} className="glass-card rounded-2xl p-4 aura-shadow-hover block">
            <p className="font-bold text-on-surface">{c.title}</p>
            <p className="text-sm text-secondary mt-1 leading-relaxed">{c.intro}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
