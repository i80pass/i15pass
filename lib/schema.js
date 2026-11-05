// JSON-LD builders, following the i80pass master pattern: one WebPage
// graph per page with SpeakableSpecification on the answer first sentence,
// RoadCondition for the corridor, FAQPage where FAQs render, ItemList for
// camera sets with ImageObject entries, and Place for towns. Canonical
// URLs come from site config, so nothing here hardcodes a domain.

import { SITE, siteUrl } from "./site-config";

export function webPageSchema({ path, title, description, speakableSelectors = [".answer-first"], dateModified }) {
  const out = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: siteUrl(path),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: speakableSelectors,
    },
    publisher: { "@type": "Organization", name: SITE.parentName },
  };
  if (dateModified) out.dateModified = dateModified;
  return out;
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: siteUrl("/"),
    publisher: {
      "@type": "Organization",
      name: SITE.parentName,
      url: "https://brightreddesign.com",
    },
  };
}

export function roadConditionSchema(corridor, status) {
  return {
    "@type": "RoadCondition",
    name: `${corridor.routeLabel} ${corridor.name}`,
    roadCondition: status?.closed ? "RoadClosed" : "RoadOpen",
  };
}

export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (faqs || []).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function cameraListSchema(cameras, corridorName) {
  return {
    "@type": "ItemList",
    name: `${corridorName} cameras`,
    itemListElement: (cameras || []).flatMap((cam, i) =>
      cam.views.map((v, j) => ({
        "@type": "ListItem",
        position: i + j + 1,
        item: {
          "@type": "ImageObject",
          name: cam.location || `Camera ${v.id}`,
          contentUrl: v.url,
          url: siteUrl(`/camera/${v.id}`),
          ...(cam.lat !== null && cam.lat !== undefined
            ? { contentLocation: { "@type": "Place", geo: { "@type": "GeoCoordinates", latitude: cam.lat, longitude: cam.lon } } }
            : {}),
        },
      }))
    ),
  };
}

export function placeSchema(town) {
  return {
    "@type": "Place",
    name: town.name,
    geo: { "@type": "GeoCoordinates", latitude: town.lat, longitude: town.lon },
    address: { "@type": "PostalAddress", addressLocality: town.name, addressRegion: town.state || "NV", addressCountry: "US" },
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: siteUrl(it.path),
    })),
  };
}
