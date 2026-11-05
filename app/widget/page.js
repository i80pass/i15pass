import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS } from "@/lib/corridors";
import { webPageSchema } from "@/lib/schema";

export const metadata = {
  title: "Get the Live Widget | Free I-15 Conditions Box for Your Site",
  description: "A free, live conditions box for hotels, casinos, truck stops, and community sites: I-15 conditions for Las Vegas, Primm, and Mesquite, updated automatically, NDOT data credited.",
  alternates: { canonical: "/widget" },
};

export default function WidgetPage() {
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/widget", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Put live I-15 conditions on your site</h1>
      <p className="answer-first text-body-md text-secondary mt-3 max-w-3xl leading-relaxed">
        If your guests, tenants, or customers drive I-15, this box answers their first question on your own pages:
        is the road open, and is anything posted today. It is free, it updates itself about every three minutes,
        and the data is Nevada 511, credited inside the box.
      </p>
      <section className="mt-8 grid gap-6">
        {CORRIDORS.map((c) => (
          <div key={c.slug} className="glass-card rounded-2xl p-4 md:p-5">
            <h2 className="text-headline-sm text-on-surface">{c.routeLabel} {c.name}</h2>
            <div className="mt-3 max-w-[540px]">
              <iframe title={`${c.name} live conditions widget`} src={`/embed/${c.slug}`} width="100%" height="170" style={{ border: 0 }} loading="lazy" />
            </div>
            <p className="text-sm text-secondary mt-3">Paste this where the box should appear:</p>
            <pre className="mt-2 text-xs bg-surface-container rounded-xl p-3 overflow-x-auto">{`<iframe src="${SITE.baseUrl}/embed/${c.slug}" width="100%" height="170" style="border:0" loading="lazy" title="${c.name} live conditions"></iframe>`}</pre>
          </div>
        ))}
      </section>
      <section className="mt-9 max-w-3xl space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface">The deal, in full</h2>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          No account, no key, no cost, no ads in the box, ever. The box carries a small credit line to this site and
          to Nevada 511, which is the whole arrangement. It works on any site that accepts an iframe, including the
          common website builders. If you would like the box styled to your brand or a combination we have not
          listed, write to {SITE.contactEmail} and we will set it up.
        </p>
      </section>
    </main>
  );
}
