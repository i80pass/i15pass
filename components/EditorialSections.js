// The deep editorial sections of a corridor page, rendered in the
// master rhythm: bold headline, relaxed body copy, generous spacing.
export default function EditorialSections({ sections }) {
  return (
    <div className="mt-10 space-y-9">
      {sections.map((s) => (
        <section key={s.heading}>
          <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-3">{s.heading}</h2>
          {s.body.map((p, i) => (
            <p key={i} className="text-sm md:text-base text-secondary leading-relaxed mb-4">{p}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
