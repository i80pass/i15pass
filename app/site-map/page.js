import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site-config";
import { CORRIDORS } from "@/lib/corridors";
import { TOWNS } from "@/lib/towns";
import { ROUTES } from "@/lib/routes-data";
import { COMPARES } from "@/lib/compare";
import { webPageSchema } from "@/lib/schema";
import snapshot from "@/lib/ndot-cameras.json";

export const metadata = {
  title: "Sitemap | i15pass",
  description:
    "Every page on i15pass.com in one place: live I-15 conditions and cameras for the Las Vegas corridor, weather by town, drives, guides, and legal pages.",
  alternates: { canonical: "/site-map" },
  robots: { index: false, follow: true },
};

function Section({ title, links }) {
  if (!links.length) return null;
  return (
    <section>
      <h2 className="text-lg md:text-xl font-bold text-on-surface mt-10 mb-3">{title}</h2>
      <ul className="space-y-2 text-sm md:text-base">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="font-semibold text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SitemapPage() {
  const cameraLinks = (snapshot.cameras || []).flatMap((cam) =>
    (cam.views || []).map((v) => ({
      href: `/camera/${v.id}`,
      label: cam.name || v.name || `Camera ${v.id}`,
    }))
  );

  return (
    <main className="px-container-padding-mobile md:px-container-padding-desktop pb-20 md:pb-12">
      <JsonLd data={webPageSchema({ path: "/site-map", title: metadata.title, description: metadata.description })} />
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface">Sitemap</h1>
      <div className="mt-6 max-w-3xl">
        <p className="text-sm md:text-base text-secondary leading-relaxed">
          Every page on this site, in one place. Live conditions and cameras first, then the corridor, drives,
          weather by town, guides, and legal pages.
        </p>
      </div>

      <Section
        title="Start Here"
        links={[
          { href: "/", label: "Home" },
          { href: "/cameras", label: "All cameras" },
          { href: "/live-feed", label: "Live feed" },
          { href: "/alerts", label: "Alerts" },
          { href: "/closures", label: "Closures" },
          { href: "/status-history", label: "Status history" },
        ]}
      />

      <Section
        title="The I-15 Corridor"
        links={[
          ...CORRIDORS.map((c) => ({ href: `/${c.slug}`, label: `${c.routeLabel} ${c.name}` })),
          ...CORRIDORS.map((c) => ({ href: `/${c.slug}-cameras`, label: `${c.name} cameras` })),
          { href: "/las-vegas-strip-camera-tour", label: "Las Vegas Strip camera tour" },
          { href: SITE.lawPath, label: SITE.lawLabel },
        ]}
      />

      <Section title="Drives" links={ROUTES.map((r) => ({ href: `/${r.slug}`, label: r.name }))} />

      <Section
        title="Head to Head"
        links={[
          { href: "/compare", label: "Compare the passes" },
          ...COMPARES.map((c) => ({ href: `/${c.slug}`, label: c.title })),
        ]}
      />

      <Section
        title="Weather by Town"
        links={TOWNS.map((t) => ({ href: `/${t.slug}-weather`, label: `${t.name} weather` }))}
      />

      <Section title="Cameras" links={cameraLinks} />

      <Section
        title="Guides and More"
        links={[
          { href: "/storm-archive", label: "Storm archive" },
          { href: "/storm-playbook", label: "Storm day playbook" },
          { href: "/widget", label: "Get the live widget" },
          { href: "/for-media", label: "For news and radio" },
          { href: "/about", label: "About" },
        ]}
      />

      <Section title="Legal" links={[{ href: "/privacy", label: "Privacy" }]} />
    </main>
  );
}
