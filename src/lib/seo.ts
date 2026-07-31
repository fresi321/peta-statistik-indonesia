import { CATEGORIES, DATA_SOURCES, PROVINCES, METRICS } from "@/data/province-stats";

export const SITE_URL = (
  typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL
    ? String(import.meta.env.VITE_SITE_URL)
    : "https://peta-statistik-indonesia.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Peta Statistik Indonesia";

export const SEO = {
  title:
    "Peta Statistik Indonesia — Stunting, UMP, Pemilu, Bencana & Data Provinsi",
  titleTemplate: "%s | Peta Statistik Indonesia",
  description:
    "Peta interaktif 38 provinsi: stunting SSGI, bencana BNPB, partisipasi pemilu KPU, TKDD, UMP, inflasi, Gini, APBD, IPM, PDRB, dan demografi. Sumber BPS & rujukan resmi non-BPS, dengan atribusi.",
  keywords: [
    "peta statistik indonesia",
    "stunting per provinsi",
    "data bencana BNPB",
    "partisipasi pemilu KPU",
    "TKDD per kapita",
    "UMP per provinsi",
    "inflasi provinsi",
    "APBD per kapita",
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
      "Atribusi multi-sumber (BPS & non-BPS)",
    ],
    keywords: SEO.keywords,
    screenshot: absoluteUrl(SEO.ogImagePath),
    image: absoluteUrl(SEO.ogImagePath),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    creditText: `${DATA_SOURCES.requiredAttribution} ${DATA_SOURCES.dualCreditNote}`,
    license: DATA_SOURCES.licenseUrl,
  };
}

export function buildDatasetJsonLd() {
  const officialSources = DATA_SOURCES.sources.filter(
    (s) => s.reliability === "official" || s.reliability === "derived",
  );
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Statistik Provinsi Indonesia",
    description:
      "Indikator multi-kategori per 38 provinsi (termasuk pemekaran Papua 2022): stunting, bencana, pemilu, TKDD, UMP, inflasi, Gini, AHH, APBD/kapita, demografi, ekonomi, pertanian. Diproses oleh Peta Statistik Indonesia dari BPS, DJPK, Kemenkes, BNPB, KPU, dan rujukan resmi; unduh CSV/JSON tersedia di UI. Batas unit Papua diaproksimasi untuk visualisasi. Ketentuan data asli tetap berlaku.",
    url: absoluteUrl("/"),
    license: DATA_SOURCES.licenseUrl,
    creator: {
      "@type": "Organization",
      name: DATA_SOURCES.processorName,
      url: absoluteUrl("/"),
    },
    contributor: {
      "@type": "Organization",
      name: "Badan Pusat Statistik",
      url: "https://www.bps.go.id/",
    },
    provider: {
      "@type": "Organization",
      name: "Badan Pusat Statistik",
      url: "https://www.bps.go.id/",
    },
    citation: DATA_SOURCES.sources
      .filter((s) => s.reliability !== "estimated")
      .map((s) => s.citation),
    creditText: `${DATA_SOURCES.requiredAttribution} ${DATA_SOURCES.dualCreditNote}`,
    spatialCoverage: {
      "@type": "Place",
      name: "Indonesia",
      description: `${DATA_SOURCES.provinceCount} unit provinsi pada layer peta (nasional 38, termasuk 6 unit Papua pasca-2022; batas unit Papua diaproksimasi).`,
      geo: {
        "@type": "GeoCoordinates",
        latitude: -2.5,
        longitude: 118,
      },
      containedInPlace: {
        "@type": "Place",
        name: "Asia Tenggara",
      },
    },
    temporalCoverage: "2023/2026",
    variableMeasured: METRICS.map((m) => ({
      "@type": "PropertyValue",
      name: m.label,
      unitText: m.unit || undefined,
      description: m.description,
    })),
    keywords: SEO.keywords.split(", "),
    measurementTechnique:
      "Agregasi choropleth per kunci GeoJSON provinsi; beberapa indikator diturunkan (per kapita) atau diestimasi untuk visualisasi.",
    isBasedOn: officialSources.map((s) => ({
      "@type": "CreativeWork",
      name: s.name,
      url: s.url,
      datePublished: s.year,
      creditText: s.citation,
      description: s.processingNote,
    })),
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/geo+json",
        contentUrl: absoluteUrl("/geo/indonesia-provinces.json"),
        name: "Batas administratif provinsi (GeoJSON)",
        description: "Geometri 38 provinsi untuk peta choropleth (Papua diaproksimasi)",
      },
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: absoluteUrl("/data/indicators-meta.json"),
        name: "Metadata indikator & sumber (JSON)",
        description:
          "Daftar metrik, sumber, cadence, dan catatan pemrosesan — bukan matriks nilai penuh (CSV/JSON penuh diunduh dari UI)",
      },
    ],
    sameAs: ["https://www.bps.go.id/"],
    isAccessibleForFree: true,
    inLanguage: "id-ID",
    dateModified: DATA_SOURCES.updatedAt,
  };
}

export function buildWebPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SEO.title,
    url: absoluteUrl("/"),
    description: SEO.description,
    inLanguage: "id-ID",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Dataset",
      name: "Statistik Provinsi Indonesia",
      url: absoluteUrl("/"),
    },
    creditText: `${DATA_SOURCES.requiredAttribution} ${DATA_SOURCES.dualCreditNote}`,
    license: DATA_SOURCES.licenseUrl,
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
          text: "Peta interaktif multi-kategori yang menampilkan statistik per provinsi termasuk stunting, bencana, partisipasi pemilu, TKDD, UMP, inflasi, Gini, dan indikator BPS lainnya.",
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
          text: "Indikator inti diselaraskan ke rilis BPS dan rujukan resmi non-BPS (SSGI/Kemenkes, BNPB, KPU, DJPK, Kemdiktisaintek, BMKG, UMP). Beberapa indikator diestimasi untuk visualisasi. Rujuk tabel resmi untuk keputusan formal.",
        },
      },
      {
        "@type": "Question",
        name: "Bagaimana cara mengutip data ini?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${DATA_SOURCES.requiredAttribution} ${DATA_SOURCES.dualCreditNote} Sertakan sumber asli indikator dan Peta Statistik Indonesia sebagai pengolah. Sitasi dapat disalin dari panel detail provinsi.`,
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
