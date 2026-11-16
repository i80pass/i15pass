import { SITE } from "@/lib/site-config";

export default function manifest() {
  return {
    name: `${SITE.name}.com: I-15 Las Vegas Corridor Conditions`,
    short_name: SITE.name,
    description: "Live I-15 road conditions, cameras, and posted restrictions for Las Vegas, Primm, Mountain Pass, Mesquite, and the Virgin River Gorge.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9fb",
    theme_color: "#003a63",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
