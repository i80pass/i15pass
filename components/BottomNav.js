import Link from "next/link";

const ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/cameras", label: "Cameras", icon: "photo_camera" },
  { href: "/live-feed", label: "Live", icon: "sensors" },
  { href: "/alerts", label: "Alerts", icon: "warning" },
  { href: "/nevada-chain-law", label: "Rules", icon: "ac_unit" },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-outline-variant/40 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5">
        {ITEMS.map((it) => (
          <Link key={it.href} href={it.href} className="flex flex-col items-center py-2 text-[11px] font-semibold text-secondary">
            <span className="material-symbols-outlined text-[22px] leading-none">{it.icon}</span>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
