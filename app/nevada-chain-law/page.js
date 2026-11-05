import StatusBanner from "@/components/StatusBanner";
import FaqBlock from "@/components/FaqBlock";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS, statusCorridor } from "@/lib/corridors";
import { getCorridorStatus } from "@/lib/ndot";
import { LAW_INTRO, LAW_SECTIONS, LAW_FAQS, LAW_SOURCES } from "@/lib/law";
import { webPageSchema, faqSchema } from "@/lib/schema";

export const revalidate = 120;

export const metadata = {
  title: "Nevada Chain and Wind Rules | What NDOT Postings Require on I-15",
  description: "Nevada chain, snow tire, and wind restriction rules in plain English: how NDOT posts requirements on I-15, what each posted phrase obliges you to do, and the live postings for every stretch.",
  alternates: { canonical: SITE.lawPath },
};

export default async function LawPage() {
  const statuses = await Promise.all(CORRIDORS.map((c) => getCorridorStatus(statusCorridor(c))));
  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={[
        webPageSchema({ path: SITE.lawPath, title: metadata.title, description: metadata.description }),
        faqSchema(LAW_FAQS),
      ]} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Nevada chain and wind rules</h1>
      {LAW_INTRO.map((p, i) => (
        <p key={i} className={`text-body-md text-secondary mt-3 max-w-3xl leading-relaxed ${i === 0 ? "answer-first" : ""}`}>{p}</p>
      ))}

      <section className="mt-8">
        <h2 className="text-xl font-bold text-on-surface mb-3">Live postings, stretch by stretch</h2>
        <div className="grid gap-4">
          {CORRIDORS.map((c, i) => (
            <StatusBanner key={c.slug} corridor={c} status={statuses[i]} />
          ))}
        </div>
      </section>

      <div className="mt-10 space-y-9">
        {LAW_SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-3">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-sm md:text-base text-secondary leading-relaxed max-w-3xl mt-3 first:mt-0">{p}</p>
            ))}
          </section>
        ))}
      </div>

      <FaqBlock faqs={LAW_FAQS} />

      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-bold text-on-surface mb-3">Sources</h2>
        <ul className="space-y-2">
          {LAW_SOURCES.map((s) => (
            <li key={s.url} className="text-sm text-secondary leading-relaxed">
              <a href={s.url} className="font-bold text-primary">{s.label}</a>{s.note ? ` : ${s.note}` : ""}
            </li>
          ))}
        </ul>
        <p className="text-xs text-secondary mt-4">
          This page explains the rules in plain English for trip planning. It is not legal advice, and the posted
          signs and NDOT's current postings govern on the road. {SITE.dataCreditShort}.
        </p>
      </section>
    </main>
  );
}
