import { SITE } from "@/lib/site-config";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/embed/", "/api/"] }],
    sitemap: `${SITE.baseUrl}/sitemap.xml`,
  };
}
