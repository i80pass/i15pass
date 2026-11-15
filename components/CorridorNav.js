"use client";

import { usePathname } from "next/navigation";
import { CORRIDORS } from "@/lib/corridors";

// Corridor pill bar, split out of Header per the tap target spec
// (Nov 15, 2026), copying the grapevinepass CorridorNav mechanics:
// a client component that reads the current path so it can mark the
// active pill, plain anchors so a tap is a native browser navigation
// that works before hydration and on a weak signal, one horizontal
// sliding row at every width, and a 48px minimum tap target on every
// pill. Same hrefs, same order, and same labels as the inline bar it
// replaces, so no internal link changes. Active rule: a corridor
// pill is active on its own page and on its camera strip page
// (href plus "-cameras"), the first corridor pill is active on the
// homepage, and the Closures and Compare pills are active only on
// an exact path match. At most one pill is active on any path.
export default function CorridorNav() {
  const pathname = usePathname();
  const entries = [
    ...CORRIDORS.map((c) => ({
      href: `/${c.slug}`,
      label: `${c.routeLabel} ${c.shortName}`,
      corridor: true,
    })),
    { href: "/closures", label: "Closures", corridor: false },
    { href: "/compare", label: "Compare the Drives", corridor: false },
  ];
  return (
    <nav aria-label="Corridors" className="bg-[#0f172a] text-white border-b border-white/10">
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar px-container-padding-mobile md:px-container-padding-desktop py-2">
        {entries.map((e) => {
          const active =
            pathname === e.href ||
            (e.corridor && pathname === `${e.href}-cameras`) ||
            (pathname === "/" && e.href === `/${CORRIDORS[0].slug}`);
          return (
            <a
              key={e.href}
              href={e.href}
              aria-current={active ? "page" : undefined}
              className={`px-3.5 py-1.5 rounded-full text-label-md font-bold whitespace-nowrap shrink-0 transition-all ${
                active
                  ? "bg-white text-[#0f172a] shadow-sm"
                  : "text-white/70 border border-white/30 hover:border-white/60 hover:text-white"
              }`}
            >
              {e.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
