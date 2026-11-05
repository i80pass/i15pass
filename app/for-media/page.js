import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { getCorridorStatus, statusSentence } from "@/lib/ndot";
import { webPageSchema } from "@/lib/schema";

export const revalidate = 120;

export const metadata = {
  title: "For Media | I-15 Conditions, Quotable Verdicts and Camera Use",
  description: "The media page for the I-15 Las Vegas corridor: live quotable verdicts per stretch, how to credit Nevada 511 and this site, and who to contact.",
  alternates: { canonical: "/for-media" },
};

export default async function ForMediaPage() {
  const statuses = await Promise.all(CORRIDORS.map((c) => getCorridorStatus(statusCorridor(c))));
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/for-media", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">For media</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        Covering a closure, a storm, or a getaway weekend gridlock on I-15? The verdicts below are live, quotable,
        and updated from Nevada 511 about every two minutes. Take the sentence, credit the data, and link the page
        it came from.
      </p>
      <section className="mt-8 grid gap-4">
        {CORRIDORS.map((c, i) => (
          <div key={c.slug} className="glass-card rounded-2xl p-4 md:p-5">
            <h2 className="text-headline-sm text-on-surface">{c.routeLabel} {c.name}</h2>
            <p className="text-sm md:text-base text-secondary leading-relaxed mt-2">{statusSentence(c, statuses[i])}</p>
            <p className="text-xs text-secondary mt-2">
              Source page: <Link href={`/${c.slug}`} className="font-bold text-primary">{SITE.domain}/{c.slug}</Link>
            </p>
          </div>
        ))}
      </section>
      <div className="mt-9 max-w-3xl space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface">Credit and camera use</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Conditions and camera images originate with Nevada 511, the Nevada Department of Transportation's
          traveler information service, and should be credited to Nevada 511 / NDOT. This site republishes them
          under NDOT's developer terms with credit on every surface; if you reuse a camera still from these pages,
          keep the Nevada 511 credit with it. Verdict sentences written by this site may be quoted with a link to
          the corridor page.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          For anything else, including the free embeddable conditions box for your own site, write to{" "}
          {SITE.contactEmail}. The <Link href="/widget" className="font-bold text-primary">widget page</Link> has
          the boxes ready to paste.
        </p>
      </div>
    </main>
  );
}
