import Link from "next/link";
import { SITE } from "@/lib/site-config";
import { CORRIDORS } from "@/lib/corridors";
import { TOWNS } from "@/lib/towns";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white mt-16">
      <div className="px-container-padding-mobile md:px-container-padding-desktop py-10 grid gap-8 md:grid-cols-4">
        <div>
          <p className="font-extrabold text-lg">{SITE.name}.com</p>
          <p className="text-sm text-white/70 mt-2 leading-relaxed">{SITE.tagline}</p>
          <p className="text-sm text-white/70 mt-3 leading-relaxed">{SITE.dataCredit}</p>
          <p className="text-xs text-white/50 mt-3 leading-relaxed">
            {SITE.domain} is not an official NDOT site. Always check {SITE.officialSourceName} for official closures and restrictions before you drive.
          </p>
        </div>
        <nav>
          <p className="font-bold mb-3 text-sm uppercase tracking-wide">The corridor</p>
          <ul className="space-y-2 text-sm text-white/80">
            {CORRIDORS.map((c) => (
              <li key={c.slug}><Link href={`/${c.slug}`} className="hover:text-white">{c.routeLabel} {c.name}</Link></li>
            ))}
            <li><Link href="/las-vegas-strip-camera-tour" className="hover:text-white">Las Vegas Strip camera tour</Link></li>
            <li><Link href={SITE.lawPath} className="hover:text-white">{SITE.lawLabel}</Link></li>
            <li><Link href="/storm-archive" className="hover:text-white">Storm archive</Link></li>
            <li><Link href="/storm-playbook" className="hover:text-white">Storm day playbook</Link></li>
          </ul>
        </nav>
        <nav>
          <p className="font-bold mb-3 text-sm uppercase tracking-wide">Weather by town</p>
          <ul className="space-y-2 text-sm text-white/80">
            {TOWNS.slice(0, 8).map((t) => (
              <li key={t.slug}><Link href={`/${t.slug}-weather`} className="hover:text-white">{t.name} weather</Link></li>
            ))}
          </ul>
        </nav>
        <nav>
          <p className="font-bold mb-3 text-sm uppercase tracking-wide">Site</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/cameras" className="hover:text-white">All cameras</Link></li>
            <li><Link href="/live-feed" className="hover:text-white">Live feed</Link></li>
            <li><Link href="/alerts" className="hover:text-white">Alerts</Link></li>
            <li><Link href="/widget" className="hover:text-white">Get the live widget</Link></li>
            <li><Link href="/for-media" className="hover:text-white">For news and radio</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
            <li><Link href="/site-map" className="hover:text-white">Sitemap</Link></li>
            <li><a href={SITE.networkUrl} className="hover:text-white">{SITE.networkLabel}</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 px-container-padding-mobile md:px-container-padding-desktop py-4 text-xs text-white/50 flex flex-wrap gap-3 justify-between">
        <span>{SITE.name} is a {SITE.parentName} site.</span>
        <span>{SITE.dataCreditShort} | Weather: National Weather Service</span>
      </div>
    </footer>
  );
}
