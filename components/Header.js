"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site-config";
import { CORRIDORS } from "@/lib/corridors";

// Header in the i80pass master pattern: brand block, primary nav, and
// the corridor pill bar. LOGO: the confirmed family master for this
// site, supplied by Tracy and vaulted at
// ~/workspace/your_files/logo-vault/i15pass-logo.png, served from
// SITE.logoPath (public/i15pass-logo.png) with the same treatment as
// the other network sites: the logo image plus the site name.
export default function Header() {
  const pathname = usePathname();
  // Corridor bar active state (Gold Standard pattern): the primary
  // corridor (Las Vegas, first in flagship order) lights on the
  // homepage, and each corridor page lights its own pill only.
  // Roadside tap standard (Grapevine round 2 pattern, Nov 15, 2026):
  // one horizontal sliding row at every width, 48px minimum tap
  // targets, plain anchors so a tap navigates natively before or
  // without hydration, touch-manipulation for no tap delay. Same
  // hrefs and labels as before, so no internal link changes.
  const pillClass = (active) =>
    `flex items-center shrink-0 min-h-[48px] px-4 py-3 rounded-full text-sm font-semibold whitespace-nowrap touch-manipulation select-none ${active ? "bg-white text-[#0f172a] shadow-sm" : "hover:bg-white/10"}`;
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-primary text-on-primary shadow-md">
      <div className="px-container-padding-mobile md:px-container-padding-desktop">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center gap-3 min-w-0">
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
            <Link href="/cameras" className="hover:text-on-primary-container">Cameras</Link>
            <Link href="/las-vegas-strip-camera-tour" className="hover:text-on-primary-container">Strip Tour</Link>
            <Link href={SITE.lawPath} className="hover:text-on-primary-container">Chain Rules</Link>
            <Link href="/live-feed" className="hover:text-on-primary-container">Live Feed</Link>
            <Link href="/alerts" className="hover:text-on-primary-container">Alerts</Link>
            <Link href="/status-history" className="hover:text-on-primary-container">Status History</Link>
          </nav>
          <Link href="/live-feed" className="md:hidden text-sm font-semibold">Live Feed</Link>
        </div>
      </div>
      <nav className="bg-[#0f172a] text-white">
        <div className="flex flex-nowrap gap-1.5 px-3 py-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          {CORRIDORS.map((c) => {
            const active =
              pathname === `/${c.slug}` || (pathname === "/" && c.slug === CORRIDORS[0].slug);
            return (
              <a
                key={c.slug}
                href={`/${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={pillClass(active)}
              >
                {c.routeLabel} {c.shortName}
              </a>
            );
          })}
          <a href="/closures" aria-current={pathname === "/closures" ? "page" : undefined} className={pillClass(pathname === "/closures")}>Closures</a>
          <a href="/compare" aria-current={pathname === "/compare" ? "page" : undefined} className={pillClass(pathname === "/compare")}>Compare the Drives</a>
        </div>
      </nav>
    </header>
  );
}
