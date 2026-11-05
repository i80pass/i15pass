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
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/i15pass-logo.png", sizes: "587x422", type: "image/png" },
    ],
  };
}
