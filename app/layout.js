import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

// SUBSETTED icon font from the i80pass master (about 17KB). Do NOT replace
// with the full Material Symbols file; it alone wrecks mobile LCP. Same
// warning and workflow as the master layout.
const materialSymbols = localFont({
  src: "./fonts/material-symbols-outlined.woff2",
  variable: "--font-material-symbols",
  weight: "100 700",
  display: "block",
  preload: true,
});

export function generateMetadata() {
  const title = `${SITE.name}.com | Live I-15 Road Conditions, Las Vegas to Barstow and St. George`;
  const description = "Live I-15 conditions, cameras, and posted restrictions for Las Vegas, Primm and the state line, Mountain Pass, Mesquite, and the Virgin River Gorge, from Nevada 511.";
  const meta = {
    title,
    description,
    icons: { icon: "/apple-touch-icon.png", apple: "/apple-touch-icon.png" },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "default", title: "i15pass" },
    other: { "apple-mobile-web-app-capable": "yes" },
    openGraph: { title, description, siteName: SITE.name, type: "website", images: ["/og-image.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
  if (SITE.baseUrl) {
    meta.metadataBase = new URL(SITE.baseUrl);
    meta.alternates = { canonical: SITE.baseUrl };
  }
  return meta;
}

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#003a63" };

export default function RootLayout({ children }) {
  const gaId = SITE.gaId;
  // AdSense (approved Nov 15, 2026): the loader renders only when the
  // publisher ID is set at build time, same conditional pattern as GA
  // above. Unset means no script tag at all, so the site is unchanged
  // until activation. The ad units themselves live in
  // components/AdSlot.js under the same gate.
  const adsenseId = SITE.adsenseId;
  return (
    <html lang="en" className={`${inter.variable} ${materialSymbols.variable}`}>
      <body className="bg-surface text-on-surface antialiased overflow-x-hidden">
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
            <Script id="ga-init" strategy="lazyOnload">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        )}
        {adsenseId && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          <Header />
          {/* Top padding matches the fixed header exactly: the
              master h-28 brand row (112px) plus the corridor bar
              with the master pills and its padding (50px), at
              every width. */}
          <div className="pt-[162px] flex-1">{children}</div>
          <Footer />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
