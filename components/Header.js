import Link from "next/link";
import { SITE } from "@/lib/site-config";
import CorridorNav from "@/components/CorridorNav";

// Header in the i80pass master pattern: brand block, primary nav, and
// the corridor pill bar. LOGO: the confirmed family master for this
// site, supplied by Tracy and vaulted at
// ~/workspace/your_files/logo-vault/i15pass-logo.png, served from
// SITE.logoPath (public/i15pass-logo.png) with the same treatment as
// the other network sites: the logo image plus the site name.
// The corridor pill bar lives in components/CorridorNav.js (split
// out Nov 15, 2026 per the tap target spec), rendered inside this
// same fixed header element. Header tap targets: the brand link,
// the desktop primary nav links, and the mobile Live Feed link all
// carry a 48px minimum height per the roadside tap standard.
export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-primary text-on-primary shadow-md">
      <div className="px-container-padding-mobile md:px-container-padding-desktop">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center gap-3 min-w-0 min-h-[48px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE.logoPath}
              alt={`${SITE.name} logo`}
              className="h-10 w-auto shrink-0"
            />
            <span className="text-lg md:text-xl font-extrabold tracking-tight">{SITE.name}</span>
            <span className="hidden md:inline text-xs text-on-primary-container font-medium">{SITE.regionLabel}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
            <Link href="/cameras" className="inline-flex items-center min-h-[48px] hover:text-on-primary-container">Cameras</Link>
            <Link href="/las-vegas-strip-camera-tour" className="inline-flex items-center min-h-[48px] hover:text-on-primary-container">Strip Tour</Link>
            <Link href={SITE.lawPath} className="inline-flex items-center min-h-[48px] hover:text-on-primary-container">Chain Rules</Link>
            <Link href="/live-feed" className="inline-flex items-center min-h-[48px] hover:text-on-primary-container">Live Feed</Link>
            <Link href="/alerts" className="inline-flex items-center min-h-[48px] hover:text-on-primary-container">Alerts</Link>
            <Link href="/status-history" className="inline-flex items-center min-h-[48px] hover:text-on-primary-container">Status History</Link>
          </nav>
          <Link href="/live-feed" className="md:hidden inline-flex items-center min-h-[48px] px-2 text-sm font-semibold">Live Feed</Link>
        </div>
      </div>
      <CorridorNav />
    </header>
  );
}
