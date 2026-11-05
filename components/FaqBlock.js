// Renders the "Questions drivers ask" block in the master pattern. The
// matching FAQPage schema is emitted by the page alongside this block.
export default function FaqBlock({ faqs, title = "Questions drivers ask" }) {
  if (!faqs?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-4">{title}</h2>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-outline-variant/20">
        {faqs.map((f) => (
          <div key={f.q} className="px-4 py-3">
            <p className="text-sm font-bold text-on-surface mb-1">{f.q}</p>
            <p className="text-sm text-secondary leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
