import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { webPageSchema } from "@/lib/schema";

export const metadata = {
  title: "Privacy | i15pass",
  description: "How i15pass handles your information: no accounts, no ads, aggregate analytics only, and what to write to us about.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/privacy", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Privacy</h1>
      <div className="mt-6 max-w-3xl space-y-4">
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          This site has no accounts, no sign in, no comments, and no forms that collect personal information. You
          can read every verdict and camera here without giving us anything.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          We use aggregate analytics to understand which pages get used and whether the site is fast, the same
          kind of counting every small publisher runs. Analytics are aggregate: they tell us a page was visited,
          not who visited it. This site carries no advertising and sells no data.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Camera images are served by Nevada 511 and weather data by the National Weather Service; loading those
          images connects your browser to those public services, as it would on their own sites. If you email us,
          we keep the email to answer it and for no other purpose.
        </p>
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Questions about any of this: write to {SITE.contactEmail}.
        </p>
      </div>
    </main>
  );
}
