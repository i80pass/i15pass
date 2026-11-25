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
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 px-container-padding-mobile md:px-container-padding-desktop py-4 text-xs text-white/50 flex flex-wrap gap-3 justify-between">
        <span>{SITE.name} is a {SITE.parentName} site.</span>
        <a href="https://brightreddesign.com/family" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Our Family of Companies</a>
        <span>{SITE.dataCreditShort} | Weather: National Weather Service</span>
      </div>
      <div className="px-container-padding-mobile md:px-container-padding-desktop pb-6">
        <div className="border-t border-white/10 pt-4">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.13em] text-white/40 mb-3">Our pass network</p>
          <div className="grid grid-cols-2 gap-x-8 max-w-[318px] mx-auto">
            <a href="https://i80pass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">i80pass.com</a>
            <a href="https://i90live.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">i90live.com</a>
            <a href="https://i5pass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">i5pass.com</a>
            <a href="https://idahopass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">idahopass.com</a>
            <a href="https://us2pass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">us2pass.com</a>
            <a href="https://wasatchpasses.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">wasatchpasses.com</a>
            <a href="https://grapevinepass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">grapevinepass.com</a>
            <a href="https://bigbearroads.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">bigbearroads.com</a>
            <a href="https://395live.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">395live.com</a>
            <a href="https://mammothpass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">mammothpass.com</a>
            <a href="https://coquihallalive.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">coquihallalive.com</a>
            <a href="https://i17pass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">i17pass.com</a>
            <a href="https://thruwaypass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">thruwaypass.com</a>
            <a href="https://i40pass.com" className="block text-[13px] leading-5 py-1.5 text-white/50 hover:text-white transition-colors border-b border-white/10 [&:nth-last-child(-n+2)]:border-b-0">i40pass.com</a>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", fontSize: "12px", opacity: 0.75, padding: "10px 16px 14px" }}>
        Bright Red Design LLC &middot; Nevada Business License NV20260015334
      </div>
    </footer>
  );
}
