import { CATEGORIES, DATA_SOURCES, PROVINCES, METRICS } from "@/data/province-stats";

export const SITE_URL = (
  typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL
    ? String(import.meta.env.VITE_SITE_URL)
    : "https://peta-statistik-indonesia.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Peta Statistik Indonesia";

export const SEO = {
  title:
    "Peta Statistik Indonesia — UMP, Inflasi, IPM, APBD & Data Provinsi",
  titleTemplate: "%s | Peta Statistik Indonesia",
  description:
    "Peta interaktif statistik 34 provinsi: UMP, inflasi, Gini, harapan hidup, APBD per kapita, IPM, PDRB, demografi, pertanian, wisata. Sumber BPS & rujukan resmi, dengan atribusi.",
  keywords: [
    "peta statistik indonesia",
    "UMP per provinsi",
    "inflasi provinsi",
    "koefisien gini",
    "APBD per kapita",
    "harapan hidup provinsi",
    "IPM per provinsi",
    "data BPS",
  ].join(", "),
  locale: "id_ID",
  language: "id",
  ogImagePath: "/og-image.svg",
  twitterHandle: "",
  themeColor: "#f4f6fa",
  author: "Peta Statistik Indonesia",
  category: "Education, Government Data, Maps",
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildWebAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    alternateName: [
      "Peta Interaktif Statistik Indonesia",
      "Indonesia Province Statistics Map",
    ],
    url: absoluteUrl("/"),
    description: SEO.description,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Data Visualization",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Modern browser recommended.",
    inLanguage: "id-ID",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    featureList: [
      ...CATEGORIES.map((c) => c.label),
      ...METRICS.map((m) => m.label),
      "Atribusi sumber BPS",
    ],
    keywords: SEO.keywords,
    screenshot: absoluteUrl(SEO.ogImagePath),
    image: absoluteUrl(SEO.ogImagePath),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    creditText: DATA_SOURCES.requiredAttribution,
  };
}

export function buildDatasetJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Statistik Provinsi Indonesia",
    description:
      "Indikator multi-kategori per provinsi termasuk UMP, inflasi, Gini, AHH, APBD/kapita, demografi, ekonomi, pertanian.",
    url: absoluteUrl("/"),
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    contributor: {
      "@type": "Organization",
      name: "Badan Pusat Statistik",
      url: "https://www.bps.go.id/",
    },
    citation: DATA_SOURCES.sources
      .filter((s) => s.reliability !== "estimated")
      .map((s) => s.citation),
    creditText: DATA_SOURCES.requiredAttribution,
    spatialCoverage: {
      "@type": "Place",
      name: "Indonesia",
      geo: {
        "@type": "GeoCoordinates",
        latitude: -2.5,
        longitude: 118,
      },
    },
    temporalCoverage: "2024/2026",
    variableMeasured: METRICS.map((m) => m.label),
    keywords: SEO.keywords.split(", "),
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: absoluteUrl("/geo/indonesia-provinces.json"),
        name: "Batas administratif provinsi (GeoJSON)",
      },
    ],
    isAccessibleForFree: true,
    inLanguage: "id-ID",
    dateModified: DATA_SOURCES.updatedAt,
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Apa itu Peta Statistik Indonesia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Peta interaktif multi-kategori yang menampilkan statistik per provinsi termasuk UMP, inflasi, Gini, dan indikator BPS lainnya.",
        },
      },
      {
        "@type": "Question",
        name: "Dari mana sumber datanya?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${DATA_SOURCES.requiredAttribution} ${DATA_SOURCES.disclaimer}`,
        },
      },
      {
        "@type": "Question",
        name: "Apakah data ini resmi dari BPS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Indikator inti diselaraskan ke rilis BPS dan rujukan resmi (UMP, APBD). Beberapa indikator diestimasi untuk visualisasi. Rujuk tabel resmi untuk keputusan formal.",
        },
      },
      {
        "@type": "Question",
        name: "Bagaimana cara mengutip data ini?",
        acceptedAnswer: {
          "@type": "Answer",
          text: DATA_SOURCES.requiredAttribution,
        },
      },
      {
        "@type": "Question",
        name: "Kategori apa saja yang tersedia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Kategori: ${CATEGORIES.map((c) => c.label).join(", ")}.`,
        },
      },
    ],
  };
}

export function buildBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Peta Statistik Provinsi",
        item: absoluteUrl("/"),
      },
    ],
  };
}

export function buildProvinceItemListJsonLd() {
  const byPop = [...PROVINCES].sort((a, b) => b.population - a.population);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Daftar Provinsi Indonesia dengan Statistik",
    numberOfItems: byPop.length,
    itemListElement: byPop.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      description: `${p.name} — ibu kota ${p.capital}. Populasi ${p.population.toLocaleString("id-ID")} jiwa, IPM ${p.hdi.toFixed(2)}, UMP Rp ${Math.round(p.ump).toLocaleString("id-ID")} ribu. Sumber: BPS & rujukan resmi.`,
    })),
  };
}

export function jsonLdScript(data: unknown) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify(data),
  };
}

export const defaultMeta = () =>
  [
    { charSet: "utf-8" },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1, viewport-fit=cover",
    },
    { title: SEO.title },
    { name: "description", content: SEO.description },
    { name: "keywords", content: SEO.keywords },
    { name: "author", content: SEO.author },
    { name: "creator", content: SEO.author },
    { name: "publisher", content: SEO.author },
    { name: "category", content: SEO.category },
    {
      name: "robots",
      content:
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { name: "language", content: SEO.language },
    { name: "geo.region", content: "ID" },
    { name: "geo.placename", content: "Indonesia" },
    { name: "theme-color", content: SEO.themeColor },
    { name: "color-scheme", content: "light" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: SEO.locale },
    { property: "og:title", content: SEO.title },
    { property: "og:description", content: SEO.description },
    { property: "og:url", content: absoluteUrl("/") },
    { property: "og:image", content: absoluteUrl(SEO.ogImagePath) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: SEO.title },
    { name: "twitter:description", content: SEO.description },
    { name: "twitter:image", content: absoluteUrl(SEO.ogImagePath) },
  ] as const;
