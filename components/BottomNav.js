"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site-config";

// Mobile bottom nav in the i80pass master treatment (Nov 15, 2026
// network template audit): fixed, h-20, translucent surface with
// backdrop blur, rounded top corners, icons above labels, and a
// working active state: the current section in primary, bold and
// scaled, with its icon filled. Same five links and labels as
// before. Three glyphs change to names that exist in the shared
// subset font: the old photo_camera, sensors, and warning names are
// not in the font and printed as raw words on phones.
const LINKS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/live-feed", label: "Live", icon: "videocam" },
  { href: "/alerts", label: "Alerts", icon: "notifications" },
  { href: SITE.lawPath, label: "Rules", icon: "ac_unit" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe h-20 bg-surface/60 backdrop-blur-xl border-t border-outline-variant/30 rounded-t-xl shadow-[0_-10px_40px_rgba(0,82,136,0.05)]">
      {LINKS.map((l) => {
        const active =
          l.href === "/" ? pathname === "/" : pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center justify-center ${
              active ? "text-primary font-bold scale-110" : "text-secondary opacity-70"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {l.icon}
            </span>
            <span className="text-label-sm mt-1">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
