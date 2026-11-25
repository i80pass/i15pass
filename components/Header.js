"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site-config";
import CorridorNav from "@/components/CorridorNav";

// Header in the i80pass master build (Nov 15, 2026 network template
// audit). This site was the network outlier: a dark navy bar with a
// small logo and the site name repeated as text. It now matches the
// master and the sister clones exactly: fixed, h-28, light
// translucent surface with backdrop blur, the vault logo large at
// master size (the logo carries the wordmark, so no site name text
// sits beside it), a search icon link on mobile, and the section nav
// on desktop with the master active state: the current section
// primary and bold, the rest fading on hover. The corridor pill bar
// stays in CorridorNav, rendered under the brand row inside this
// fixed header element, as before.
const LINKS = [
  { href: "/las-vegas-strip-camera-tour", label: "Strip Tour" },
  { href: SITE.lawPath, label: "Chain Rules" },
  { href: "/live-feed", label: "Live Feed" },
  { href: "/alerts", label: "Alerts" },
  { href: "/status-history", label: "Status History" },
];

export default function Header() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop h-28 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <Link href="/" className="flex items-center shrink-0" aria-label={`${SITE.name} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.logoPath} alt={SITE.name} className="h-24 w-auto md:h-[6.75rem] object-contain" />
        </Link>

        {/* Mobile: one icon link, in the master position. The search
            glyph is verified present in the local icon subset. */}
        <Link
          href="/live-feed"
          aria-label="Search cameras"
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container active:scale-95 transition-all text-secondary"
        >
          <span className="material-symbols-outlined text-[24px]">search</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-label-md text-secondary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "text-primary font-bold" : "hover:opacity-80 transition-opacity"}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <CorridorNav />
    </header>
  );
}
