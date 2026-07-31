/** Stats keyed by GeoJSON `Propinsi` field. */

import { entityCount, getEntities } from "@/data/province-entities";
import { PHASE_A_BY_GEO, PHASE_A_META } from "@/data/phase-a-metrics";
import { choroplethColor as mapChoropleth } from "@/lib/map-colors";

export type CategoryKey =
  | "demografi"
  | "ekonomi"
  | "pertanian"
  | "transportasi"
  | "pariwisata"
  | "kesehatan"
  | "pendidikan";

export type MetricKey =
  | "population"
  | "area"
  | "density"
  | "growth"
  | "poverty"
  | "gdpPerCapita"
  | "hdi"
  | "unemployment"
  | "literacy"
  | "hospitals"
  | "riceProduction"
  | "farmland"
  | "livestock"
  | "fishery"
  | "motorcycles"
  | "cars"
  | "roadLength"
  | "touristArrivals"
  | "hotels"
  | "attractions"
  | "schools"
  | "universities"
  | "clinicCount"
  | "ump"
  | "inflation"
  | "gini"
  | "lifeExpectancy"
  | "apbdPerCapita";

export interface ProvinceStats {
  geoKey: string;
  name: string;
  capital: string;
  region:
    | "Sumatera"
    | "Jawa"
    | "Bali & Nusa Tenggara"
    | "Kalimantan"
    | "Sulawesi"
    | "Maluku"
    | "Papua";
  population: number;
  area: number;
  growth: number;
  poverty: number;
  gdpPerCapita: number;
  hdi: number;
  unemployment: number;
  literacy: number;
  hospitals: number;
  clinicCount: number;
  schools: number;
  universities: number;
  riceProduction: number;
  farmland: number;
  livestock: number;
  fishery: number;
  motorcycles: number;
  cars: number;
  roadLength: number;
  touristArrivals: number;
  hotels: number;
  attractions: number;
  ump: number;
  inflation: number;
  gini: number;
  lifeExpectancy: number;
  apbdPerCapita: number;
}

export type MetricDef = {
  key: MetricKey;
  label: string;
  short: string;
  unit: string;
  description: string;
  higherIsBetter: boolean;
  format: (v: number) => string;
};

export type DataSource = {
  id: string;
  name: string;
  shortName: string;
  url: string;
  fields: MetricKey[];
  year: string;
  reliability: "official" | "derived" | "secondary" | "estimated";
  citation: string;
};

export const DATA_SOURCES = {
  updatedAt: "2026-07-31",
  publisher: "Badan Pusat Statistik (BPS) dan model internal Peta Statistik Indonesia",
  provinceCount: 34,
  coverageNote:
    "Peta menampilkan 34 provinsi (termasuk Kepri, Kaltara, Sulbar). Pemekaran Papua 2022 (menjadi 6 wilayah / total 38 provinsi nasional) belum dipisah di layer batas — data Papua digabung ke unit Papua & Papua Barat.",
  requiredAttribution:
    "Sumber: Badan Pusat Statistik (BPS) — www.bps.go.id. Data diolah untuk visualisasi Peta Statistik Indonesia.",
  sources: [
    {
      id: "bps-ipm-2025",
      name: "BPS — Indeks Pembangunan Manusia menurut provinsi 2025",
      shortName: "BPS IPM 2025",
      url: "https://www.bps.go.id/",
      fields: ["hdi"] as MetricKey[],
      year: "2025",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Indeks Pembangunan Manusia Menurut Provinsi, 2025. https://www.bps.go.id/",
    },
    {
      id: "bps-pop-midyear",
      name: "BPS — Jumlah/proyeksi penduduk pertengahan tahun",
      shortName: "BPS Penduduk",
      url: "https://www.bps.go.id/",
      fields: ["population", "growth", "density"] as MetricKey[],
      year: "2024–2025",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Jumlah Penduduk Pertengahan Tahun; laju pertumbuhan penduduk. https://www.bps.go.id/",
    },
    {
      id: "bps-area",
      name: "BPS — Luas daerah menurut provinsi",
      shortName: "BPS Luas",
      url: "https://www.bps.go.id/",
      fields: ["area"] as MetricKey[],
      year: "2023–2025",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Luas Daerah dan Jumlah Pulau Menurut Provinsi. https://www.bps.go.id/",
    },
    {
      id: "bps-pdrb",
      name: "BPS — PDRB ADHB (PDRB per kapita dihitung)",
      shortName: "BPS PDRB",
      url: "https://www.bps.go.id/",
      fields: ["gdpPerCapita"] as MetricKey[],
      year: "2024",
      reliability: "derived" as const,
      citation:
        "Badan Pusat Statistik. Produk Domestik Regional Bruto (ADHB); PDRB per kapita dihitung dari PDRB/penduduk. https://www.bps.go.id/",
    },
    {
      id: "bps-poverty",
      name: "BPS — Persentase penduduk miskin (P0) menurut provinsi",
      shortName: "BPS Kemiskinan",
      url: "https://www.bps.go.id/",
      fields: ["poverty"] as MetricKey[],
      year: "2024–2025",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Persentase Penduduk Miskin (P0) Menurut Provinsi. https://www.bps.go.id/",
    },
    {
      id: "bps-tpt",
      name: "BPS — Tingkat Pengangguran Terbuka (TPT) menurut provinsi",
      shortName: "BPS TPT",
      url: "https://www.bps.go.id/",
      fields: ["unemployment"] as MetricKey[],
      year: "2024–2025",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Tingkat Pengangguran Terbuka menurut provinsi. https://www.bps.go.id/",
    },
    {
      id: "bps-padi-2024",
      name: "BPS — Produksi padi (GKG) menurut provinsi 2024",
      shortName: "BPS Padi 2024",
      url: "https://www.bps.go.id/",
      fields: ["riceProduction"] as MetricKey[],
      year: "2024",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Produksi Padi dan Beras Menurut Provinsi, 2024. https://www.bps.go.id/",
    },
    {
      id: "disnaker-ump",
      name: "UMP/UMK menurut provinsi",
      shortName: "UMP 2025",
      url: "https://www.kemnaker.go.id/",
      fields: ["ump"] as MetricKey[],
      year: "2025",
      reliability: "secondary" as const,
      citation:
        "Upah Minimum Provinsi (UMP) 2025 — pola rilis Disnaker/Kepmenaker. Verifikasi ke SK Gubernur resmi.",
    },
    {
      id: "bps-inflasi",
      name: "BPS — Inflasi yoy (kota/provinsi representatif)",
      shortName: "BPS Inflasi",
      url: "https://www.bps.go.id/",
      fields: ["inflation"] as MetricKey[],
      year: "2024–2025",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Inflasi year-on-year (agregat kota representatif per provinsi untuk visualisasi).",
    },
    {
      id: "bps-gini",
      name: "BPS — Koefisien Gini menurut provinsi",
      shortName: "BPS Gini",
      url: "https://www.bps.go.id/",
      fields: ["gini"] as MetricKey[],
      year: "2024",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Koefisien Gini menurut provinsi.",
    },
    {
      id: "bps-ahh",
      name: "BPS — Angka Harapan Hidup (AHH)",
      shortName: "BPS AHH",
      url: "https://www.bps.go.id/",
      fields: ["lifeExpectancy"] as MetricKey[],
      year: "2024",
      reliability: "official" as const,
      citation:
        "Badan Pusat Statistik. Angka Harapan Hidup saat lahir menurut provinsi (komponen IPM).",
    },
    {
      id: "djpk-apbd",
      name: "DJPK Kemenkeu — APBD (per kapita dihitung)",
      shortName: "DJPK APBD",
      url: "https://djpk.kemenkeu.go.id/",
      fields: ["apbdPerCapita"] as MetricKey[],
      year: "2024",
      reliability: "derived" as const,
      citation:
        "Direktorat Jenderal Perimbangan Keuangan. Belanja APBD diaproksimasi per kapita untuk perbandingan antarprovinsi.",
    },
    {
      id: "pddikti-catalog",
      name: "Katalog nama perguruan tinggi (kurasi publik)",
      shortName: "Katalog PT",
      url: "https://pddikti.kemdiktisaintek.go.id/",
      fields: ["universities", "schools"] as MetricKey[],
      year: "kurasi 2024–2026",
      reliability: "secondary" as const,
      citation:
        "Daftar nama PT per provinsi dikurasi dari pengetahuan publik. Bukan unduhan resmi penuh PDDikti.",
    },
    {
      id: "rs-catalog",
      name: "Katalog rumah sakit utama (kurasi publik)",
      shortName: "Katalog RS",
      url: "https://sirs.kemkes.go.id/",
      fields: ["hospitals", "clinicCount"] as MetricKey[],
      year: "kurasi 2024–2026",
      reliability: "secondary" as const,
      citation:
        "Nama RS rujukan/utama per provinsi (kurasi). Verifikasi di SIRS Kemenkes untuk data resmi.",
    },
    {
      id: "wisata-catalog",
      name: "Katalog destinasi wisata unggulan",
      shortName: "Katalog wisata",
      url: "https://www.indonesia.travel/",
      fields: ["attractions", "touristArrivals", "hotels"] as MetricKey[],
      year: "kurasi 2024–2026",
      reliability: "secondary" as const,
      citation:
        "Destinasi unggulan per provinsi (kurasi). Bukan inventaris resmi lengkap.",
    },
    {
      id: "sector-model",
      name: "Estimasi sektor (kendaraan, fasilitas, dll.)",
      shortName: "Estimasi model",
      url: "https://www.bps.go.id/",
      fields: [
        "motorcycles",
        "cars",
        "roadLength",
        "livestock",
        "fishery",
        "farmland",
        "literacy",
        "clinicCount",
        "schools",
      ] as MetricKey[],
      year: "model 2024–2025",
      reliability: "estimated" as const,
      citation:
        "Estimasi internal berdasarkan populasi, PDRB, IPM, dan pola sebaran nasional.",
    },
  ] satisfies DataSource[],
  disclaimer:
    "Sumber utama: Badan Pusat Statistik (BPS). Layer peta = 34 provinsi. Indonesia resmi 38 provinsi (pasca-pemekaran Papua 2022); unit baru Papua belum dipisah di peta ini. Indikator sektor tertentu diestimasi untuk visualisasi.",
} as const;

export function getSourcesForMetric(key: MetricKey): DataSource[] {
  return DATA_SOURCES.sources.filter((s) =>
    (s.fields as readonly MetricKey[]).includes(key),
  ) as DataSource[];
}

export function primarySourceForMetric(key: MetricKey): DataSource {
  const list = getSourcesForMetric(key);
  return (
    list.find((s) => s.reliability === "official") ||
    list.find((s) => s.reliability === "derived") ||
    list.find((s) => s.reliability === "secondary") ||
    list[0] ||
    (DATA_SOURCES.sources[DATA_SOURCES.sources.length - 1] as DataSource)
  );
}

export function reliabilityLabel(r: DataSource["reliability"]): string {
  switch (r) {
    case "official":
      return "Resmi BPS";
    case "derived":
      return "Dihitung dari BPS";
    case "secondary":
      return "Sekunder (merujuk BPS)";
    default:
      return "Estimasi";
  }
}

export function shortAttribution(key: MetricKey): string {
  const s = primarySourceForMetric(key);
  return `${s.shortName} · ${s.year}`;
}

export function fullCitationBlock(): string {
  return [
    DATA_SOURCES.requiredAttribution,
    "",
    ...DATA_SOURCES.sources.map(
      (s) => `- ${s.citation} [${s.year}; ${s.reliability}]`,
    ),
    "",
    DATA_SOURCES.disclaimer,
    `Diperbarui: ${DATA_SOURCES.updatedAt}`,
  ].join("\n");
}

const fmt = (v: number) => new Intl.NumberFormat("id-ID").format(v);
const fmt1 = (v: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(v);

export const METRICS: MetricDef[] = [
  { key: "population", label: "Populasi", short: "Penduduk", unit: "jiwa", description: "Jumlah penduduk (proyeksi/pertengahan tahun)", higherIsBetter: true, format: (v) => fmt(v) },
  { key: "area", label: "Luas wilayah", short: "Luas", unit: "km²", description: "Luas daratan provinsi", higherIsBetter: true, format: (v) => `${fmt(v)} km²` },
  { key: "density", label: "Kepadatan", short: "Kepadatan", unit: "jiwa/km²", description: "Kepadatan penduduk", higherIsBetter: false, format: (v) => `${fmt(Math.round(v))} /km²` },
  { key: "growth", label: "Pertumbuhan penduduk", short: "Pertumbuhan", unit: "%/th", description: "Laju pertumbuhan penduduk tahunan", higherIsBetter: true, format: (v) => `+${v.toFixed(1)}%/th` },
  { key: "poverty", label: "Kemiskinan", short: "Miskin", unit: "%", description: "Persentase penduduk miskin (P0)", higherIsBetter: false, format: (v) => `${v.toFixed(1)}%` },
  { key: "gdpPerCapita", label: "PDRB per kapita", short: "PDRB/kap", unit: "juta Rp", description: "PDRB ADHB per kapita (juta Rp)", higherIsBetter: true, format: (v) => `Rp ${fmt(v)} jt` },
  { key: "hdi", label: "IPM", short: "IPM", unit: "", description: "Indeks Pembangunan Manusia", higherIsBetter: true, format: (v) => v.toFixed(2) },
  { key: "unemployment", label: "Pengangguran", short: "TPT", unit: "%", description: "Tingkat pengangguran terbuka", higherIsBetter: false, format: (v) => `${v.toFixed(1)}%` },
  { key: "literacy", label: "Melek huruf", short: "Literasi", unit: "%", description: "Angka melek huruf", higherIsBetter: true, format: (v) => `${v.toFixed(1)}%` },
  { key: "hospitals", label: "Rumah sakit", short: "RS", unit: "unit", description: "Jumlah rumah sakit (katalog + estimasi)", higherIsBetter: true, format: (v) => fmt(v) },
  { key: "clinicCount", label: "Puskesmas & klinik", short: "Klinik", unit: "unit", description: "Estimasi puskesmas dan klinik", higherIsBetter: true, format: (v) => fmt(v) },
  { key: "schools", label: "Sekolah", short: "Sekolah", unit: "unit", description: "Estimasi jumlah sekolah (SD–SMA)", higherIsBetter: true, format: (v) => fmt(v) },
  { key: "universities", label: "Perguruan tinggi", short: "PT", unit: "unit", description: "Jumlah PT (katalog nama + total)", higherIsBetter: true, format: (v) => fmt(v) },
  { key: "riceProduction", label: "Produksi padi", short: "Padi", unit: "ribu ton GKG", description: "Produksi padi GKG (BPS 2024 / model)", higherIsBetter: true, format: (v) => `${fmt1(v)} rb ton` },
  { key: "farmland", label: "Lahan pertanian", short: "Lahan", unit: "ribu ha", description: "Estimasi luas lahan pertanian", higherIsBetter: true, format: (v) => `${fmt1(v)} rb ha` },
  { key: "livestock", label: "Ternak", short: "Ternak", unit: "ribu ekor", description: "Estimasi populasi ternak", higherIsBetter: true, format: (v) => `${fmt1(v)} rb ekor` },
  { key: "fishery", label: "Perikanan", short: "Ikan", unit: "ribu ton", description: "Estimasi produksi perikanan", higherIsBetter: true, format: (v) => `${fmt1(v)} rb ton` },
  { key: "motorcycles", label: "Sepeda motor", short: "Motor", unit: "ribu unit", description: "Estimasi kendaraan roda dua", higherIsBetter: true, format: (v) => `${fmt1(v)} rb` },
  { key: "cars", label: "Mobil", short: "Mobil", unit: "ribu unit", description: "Estimasi mobil penumpang & niaga", higherIsBetter: true, format: (v) => `${fmt1(v)} rb` },
  { key: "roadLength", label: "Panjang jalan", short: "Jalan", unit: "km", description: "Estimasi jalan nasional & provinsi", higherIsBetter: true, format: (v) => `${fmt(v)} km` },
  { key: "touristArrivals", label: "Kunjungan wisata", short: "Wisatawan", unit: "ribu/th", description: "Estimasi kunjungan wisatawan/tahun", higherIsBetter: true, format: (v) => `${fmt1(v)} rb/th` },
  { key: "hotels", label: "Hotel & akomodasi", short: "Hotel", unit: "unit", description: "Estimasi hotel dan akomodasi", higherIsBetter: true, format: (v) => fmt(v) },
  { key: "attractions", label: "Destinasi wisata", short: "Destinasi", unit: "lokasi", description: "Estimasi destinasi wisata tercatat", higherIsBetter: true, format: (v) => fmt(v) },
  { key: "ump", label: "Upah minimum (UMP)", short: "UMP", unit: "ribu Rp/bln", description: "UMP/UMK acuan provinsi (ribu Rp per bulan)", higherIsBetter: true, format: (v) => `Rp ${fmt(Math.round(v))} rb` },
  { key: "inflation", label: "Inflasi (yoy)", short: "Inflasi", unit: "%", description: "Inflasi year-on-year (kota/provinsi representatif)", higherIsBetter: false, format: (v) => `${v.toFixed(1)}%` },
  { key: "gini", label: "Koefisien Gini", short: "Gini", unit: "", description: "Ketimpangan distribusi pengeluaran (0–1)", higherIsBetter: false, format: (v) => v.toFixed(3) },
  { key: "lifeExpectancy", label: "Harapan hidup", short: "AHH", unit: "tahun", description: "Angka harapan hidup saat lahir", higherIsBetter: true, format: (v) => `${v.toFixed(1)} th` },
  { key: "apbdPerCapita", label: "APBD per kapita", short: "APBD/kap", unit: "juta Rp", description: "Belanja APBD per kapita (aproksimasi)", higherIsBetter: true, format: (v) => `Rp ${fmt1(v)} jt` },
];

export const METRIC_BY_KEY = Object.fromEntries(
  METRICS.map((m) => [m.key, m]),
) as Record<MetricKey, MetricDef>;

export type MapCategory = {
  key: CategoryKey;
  label: string;
  short: string;
  description: string;
  metrics: MetricKey[];
  defaultMetric: MetricKey;
};

export const CATEGORIES: MapCategory[] = [
  { key: "demografi", label: "Demografi", short: "Demografi", description: "Penduduk, kepadatan, kemiskinan, Gini", metrics: ["population", "density", "growth", "poverty", "gini", "area"], defaultMetric: "population" },
  { key: "ekonomi", label: "Ekonomi", short: "Ekonomi", description: "PDRB, UMP, inflasi, APBD, IPM", metrics: ["gdpPerCapita", "ump", "inflation", "apbdPerCapita", "hdi", "unemployment"], defaultMetric: "ump" },
  { key: "pertanian", label: "Pertanian", short: "Pertanian", description: "Padi, lahan, ternak, perikanan", metrics: ["riceProduction", "farmland", "livestock", "fishery"], defaultMetric: "riceProduction" },
  { key: "transportasi", label: "Kendaraan", short: "Kendaraan", description: "Motor, mobil, jalan", metrics: ["motorcycles", "cars", "roadLength"], defaultMetric: "motorcycles" },
  { key: "pariwisata", label: "Pariwisata", short: "Wisata", description: "Wisatawan, hotel, destinasi", metrics: ["touristArrivals", "hotels", "attractions"], defaultMetric: "touristArrivals" },
  { key: "kesehatan", label: "Kesehatan", short: "Kesehatan", description: "AHH, rumah sakit, klinik", metrics: ["lifeExpectancy", "hospitals", "clinicCount"], defaultMetric: "lifeExpectancy" },
  { key: "pendidikan", label: "Pendidikan", short: "Pendidikan", description: "Literasi, sekolah, perguruan tinggi", metrics: ["literacy", "schools", "universities"], defaultMetric: "literacy" },
];

export function getCategory(key: CategoryKey): MapCategory {
  return CATEGORIES.find((c) => c.key === key)!;
}

export function metricsForCategory(key: CategoryKey): MetricDef[] {
  return getCategory(key).metrics.map((k) => METRIC_BY_KEY[k]);
}

type Core = {
  geoKey: string;
  name: string;
  capital: string;
  region: ProvinceStats["region"];
  population: number;
  area: number;
  gdpPerCapita: number;
  hdi: number;
  unemployment: number;
  literacy: number;
  hospitals: number;
  growth: number;
  poverty: number;
  riceProduction?: number;
};

/** 34 provinces aligned to current map GeoJSON (incl. Kepri, Kaltara, Sulbar). */
const CORE: Core[] = [
  { geoKey: "ACEH", name: "Aceh", capital: "Banda Aceh", region: "Sumatera", population: 5554800, area: 56835, gdpPerCapita: 44, hdi: 76.23, unemployment: 5.9, literacy: 98.0, hospitals: 76, growth: 1.3, poverty: 14.0, riceProduction: 1850 },
  { geoKey: "SUMATERA UTARA", name: "Sumatera Utara", capital: "Medan", region: "Sumatera", population: 15588500, area: 72428, gdpPerCapita: 74, hdi: 76.47, unemployment: 5.4, literacy: 98.6, hospitals: 205, growth: 1.2, poverty: 7.8, riceProduction: 2100 },
  { geoKey: "SUMATERA BARAT", name: "Sumatera Barat", capital: "Padang", region: "Sumatera", population: 5835000, area: 42225, gdpPerCapita: 57, hdi: 77.27, unemployment: 5.8, literacy: 99.0, hospitals: 74, growth: 1.1, poverty: 5.8, riceProduction: 1450 },
  { geoKey: "RIAU", name: "Riau", capital: "Pekanbaru", region: "Sumatera", population: 7020000, area: 87844, gdpPerCapita: 158, hdi: 76.31, unemployment: 4.3, literacy: 98.7, hospitals: 90, growth: 1.5, poverty: 6.2, riceProduction: 380 },
  { geoKey: "JAMBI", name: "Jambi", capital: "Jambi", region: "Sumatera", population: 3785000, area: 45348, gdpPerCapita: 85, hdi: 75.13, unemployment: 4.6, literacy: 98.2, hospitals: 46, growth: 1.3, poverty: 7.2, riceProduction: 620 },
  { geoKey: "SUMATERA SELATAN", name: "Sumatera Selatan", capital: "Palembang", region: "Sumatera", population: 8920000, area: 91592, gdpPerCapita: 74, hdi: 74.76, unemployment: 4.4, literacy: 98.1, hospitals: 98, growth: 1.2, poverty: 11.5, riceProduction: 2800 },
  { geoKey: "BENGKULU", name: "Bengkulu", capital: "Bengkulu", region: "Sumatera", population: 2125000, area: 19795, gdpPerCapita: 49, hdi: 75.68, unemployment: 3.7, literacy: 97.8, hospitals: 29, growth: 1.3, poverty: 13.5, riceProduction: 520 },
  { geoKey: "LAMPUNG", name: "Lampung", capital: "Bandar Lampung", region: "Sumatera", population: 9380000, area: 34624, gdpPerCapita: 52, hdi: 73.98, unemployment: 4.2, literacy: 97.4, hospitals: 85, growth: 1.1, poverty: 10.8, riceProduction: 2650 },
  { geoKey: "BANGKA BELITUNG", name: "Kep. Bangka Belitung", capital: "Pangkal Pinang", region: "Sumatera", population: 1548000, area: 16424, gdpPerCapita: 69, hdi: 75.26, unemployment: 4.0, literacy: 98.3, hospitals: 23, growth: 1.4, poverty: 4.4, riceProduction: 85 },
  { geoKey: "KEPULAUAN RIAU", name: "Kepulauan Riau", capital: "Tanjung Pinang", region: "Sumatera", population: 2258000, area: 8202, gdpPerCapita: 142, hdi: 79.12, unemployment: 6.1, literacy: 98.9, hospitals: 32, growth: 2.0, poverty: 5.6, riceProduction: 12 },
  { geoKey: "DKI JAKARTA", name: "DKI Jakarta", capital: "Jakarta", region: "Jawa", population: 10680000, area: 664, gdpPerCapita: 344, hdi: 85.05, unemployment: 6.2, literacy: 99.6, hospitals: 192, growth: 0.5, poverty: 4.3, riceProduction: 8 },
  { geoKey: "JAWA BARAT", name: "Jawa Barat", capital: "Bandung", region: "Jawa", population: 51164000, area: 35378, gdpPerCapita: 55, hdi: 75.9, unemployment: 7.6, literacy: 98.5, hospitals: 335, growth: 1.1, poverty: 7.4, riceProduction: 8627 },
  { geoKey: "BANTEN", name: "Banten", capital: "Serang", region: "Jawa", population: 12890000, area: 9663, gdpPerCapita: 68, hdi: 77.25, unemployment: 7.8, literacy: 98.4, hospitals: 105, growth: 1.4, poverty: 6.0, riceProduction: 1850 },
  { geoKey: "JAWA TENGAH", name: "Jawa Tengah", capital: "Semarang", region: "Jawa", population: 37950000, area: 32801, gdpPerCapita: 48, hdi: 74.77, unemployment: 5.2, literacy: 93.8, hospitals: 275, growth: 0.7, poverty: 10.1, riceProduction: 8891 },
  { geoKey: "DI YOGYAKARTA", name: "DI Yogyakarta", capital: "Yogyakarta", region: "Jawa", population: 3768000, area: 3133, gdpPerCapita: 51, hdi: 82.48, unemployment: 3.5, literacy: 96.5, hospitals: 52, growth: 0.9, poverty: 10.8, riceProduction: 520 },
  { geoKey: "JAWA TIMUR", name: "Jawa Timur", capital: "Surabaya", region: "Jawa", population: 41580000, area: 47800, gdpPerCapita: 76, hdi: 76.13, unemployment: 4.7, literacy: 94.0, hospitals: 358, growth: 0.6, poverty: 9.9, riceProduction: 9270 },
  { geoKey: "BALI", name: "Bali", capital: "Denpasar", region: "Bali & Nusa Tenggara", population: 4430000, area: 5780, gdpPerCapita: 67, hdi: 79.37, unemployment: 2.3, literacy: 96.0, hospitals: 68, growth: 1.0, poverty: 4.0, riceProduction: 720 },
  { geoKey: "NUSA TENGGARA BARAT", name: "Nusa Tenggara Barat", capital: "Mataram", region: "Bali & Nusa Tenggara", population: 5665000, area: 18572, gdpPerCapita: 32, hdi: 73.97, unemployment: 3.1, literacy: 90.2, hospitals: 40, growth: 1.3, poverty: 12.9, riceProduction: 1450 },
  { geoKey: "NUSA TENGGARA TIMUR", name: "Nusa Tenggara Timur", capital: "Kupang", region: "Bali & Nusa Tenggara", population: 5650000, area: 48718, gdpPerCapita: 23, hdi: 69.89, unemployment: 3.0, literacy: 91.5, hospitals: 44, growth: 1.5, poverty: 18.6, riceProduction: 780 },
  { geoKey: "KALIMANTAN BARAT", name: "Kalimantan Barat", capital: "Pontianak", region: "Kalimantan", population: 5685000, area: 147307, gdpPerCapita: 53, hdi: 72.09, unemployment: 4.8, literacy: 94.5, hospitals: 50, growth: 1.4, poverty: 6.5, riceProduction: 980 },
  { geoKey: "KALIMANTAN TENGAH", name: "Kalimantan Tengah", capital: "Palangka Raya", region: "Kalimantan", population: 2835000, area: 153564, gdpPerCapita: 79, hdi: 74.86, unemployment: 3.9, literacy: 98.6, hospitals: 30, growth: 1.6, poverty: 4.9, riceProduction: 420 },
  { geoKey: "KALIMANTAN SELATAN", name: "Kalimantan Selatan", capital: "Banjarmasin", region: "Kalimantan", population: 4320000, area: 38744, gdpPerCapita: 66, hdi: 76.1, unemployment: 4.1, literacy: 98.1, hospitals: 54, growth: 1.3, poverty: 4.2, riceProduction: 1450 },
  { geoKey: "KALIMANTAN TIMUR", name: "Kalimantan Timur", capital: "Samarinda", region: "Kalimantan", population: 4020000, area: 127347, gdpPerCapita: 213, hdi: 79.39, unemployment: 5.5, literacy: 98.8, hospitals: 62, growth: 1.6, poverty: 5.8, riceProduction: 280 },
  { geoKey: "KALIMANTAN UTARA", name: "Kalimantan Utara", capital: "Tanjung Selor", region: "Kalimantan", population: 760000, area: 75468, gdpPerCapita: 168, hdi: 73.95, unemployment: 4.2, literacy: 97.2, hospitals: 14, growth: 2.4, poverty: 6.5, riceProduction: 45 },
  { geoKey: "SULAWESI UTARA", name: "Sulawesi Utara", capital: "Manado", region: "Sulawesi", population: 2705000, area: 13852, gdpPerCapita: 69, hdi: 76.32, unemployment: 6.0, literacy: 99.5, hospitals: 44, growth: 1.0, poverty: 6.9, riceProduction: 380 },
  { geoKey: "SULAWESI TENGAH", name: "Sulawesi Tengah", capital: "Palu", region: "Sulawesi", population: 3205000, area: 61841, gdpPerCapita: 118, hdi: 72.82, unemployment: 3.4, literacy: 97.6, hospitals: 38, growth: 1.4, poverty: 11.6, riceProduction: 762 },
  { geoKey: "SULAWESI SELATAN", name: "Sulawesi Selatan", capital: "Makassar", region: "Sulawesi", population: 9520000, area: 46717, gdpPerCapita: 73, hdi: 75.92, unemployment: 4.9, literacy: 91.2, hospitals: 118, growth: 1.1, poverty: 8.2, riceProduction: 4818 },
  { geoKey: "SULAWESI TENGGARA", name: "Sulawesi Tenggara", capital: "Kendari", region: "Sulawesi", population: 2845000, area: 38068, gdpPerCapita: 66, hdi: 74.25, unemployment: 3.5, literacy: 94.5, hospitals: 34, growth: 1.5, poverty: 10.6, riceProduction: 620 },
  { geoKey: "GORONTALO", name: "Gorontalo", capital: "Gorontalo", region: "Sulawesi", population: 1262000, area: 11257, gdpPerCapita: 43, hdi: 72.62, unemployment: 3.8, literacy: 98.1, hospitals: 19, growth: 1.4, poverty: 14.2, riceProduction: 280 },
  { geoKey: "SULAWESI BARAT", name: "Sulawesi Barat", capital: "Mamuju", region: "Sulawesi", population: 1515000, area: 16594, gdpPerCapita: 42, hdi: 70.48, unemployment: 2.9, literacy: 93.8, hospitals: 18, growth: 1.6, poverty: 10.8, riceProduction: 420 },
  { geoKey: "MALUKU", name: "Maluku", capital: "Ambon", region: "Maluku", population: 1945000, area: 46914, gdpPerCapita: 32, hdi: 74.09, unemployment: 6.3, literacy: 98.6, hospitals: 29, growth: 1.6, poverty: 15.5, riceProduction: 95 },
  { geoKey: "MALUKU UTARA", name: "Maluku Utara", capital: "Sofifi", region: "Maluku", population: 1410000, area: 31983, gdpPerCapita: 67, hdi: 72.52, unemployment: 4.4, literacy: 97.2, hospitals: 17, growth: 1.8, poverty: 6.2, riceProduction: 55 },
  { geoKey: "PAPUA BARAT", name: "Papua Barat", capital: "Manokwari", region: "Papua", population: 1225000, area: 99700, gdpPerCapita: 67, hdi: 68.48, unemployment: 5.7, literacy: 95.5, hospitals: 24, growth: 2.0, poverty: 20.2, riceProduction: 45 },
  { geoKey: "PAPUA", name: "Papua", capital: "Jayapura", region: "Papua", population: 4580000, area: 319036, gdpPerCapita: 72, hdi: 65.85, unemployment: 4.8, literacy: 90.0, hospitals: 48, growth: 2.1, poverty: 26.0, riceProduction: 95 },
];

function expand(c: Core): ProvinceStats {
  const popM = c.population / 1e6;
  const isJawa = c.region === "Jawa";
  const isBaliNT = c.region === "Bali & Nusa Tenggara";
  const isCoast =
    c.region === "Maluku" ||
    c.region === "Sulawesi" ||
    c.region === "Sumatera" ||
    c.name === "Bali" ||
    c.name.includes("Riau") ||
    c.name.includes("Kalimantan") ||
    c.name.includes("Bangka");

  const tourismBoost =
    c.name === "Bali"
      ? 5.5
      : c.name.includes("Jakarta")
        ? 3.2
        : c.name.includes("Yogyakarta")
          ? 2.6
          : c.name.includes("Kepulauan Riau")
            ? 2.4
            : c.name.includes("Jawa Barat") || c.name.includes("Jawa Timur")
              ? 1.7
              : isBaliNT
                ? 1.5
                : c.name.includes("Sulawesi Selatan") || c.name.includes("Sumatera Utara")
                  ? 1.3
                  : 1;

  const agriBoost =
    c.name.includes("Jawa Timur") ||
    c.name.includes("Jawa Tengah") ||
    c.name.includes("Jawa Barat") ||
    c.name.includes("Sulawesi Selatan") ||
    c.name.includes("Sumatera Selatan") ||
    c.name.includes("Lampung")
      ? 1.6
      : c.region === "Papua" || c.name.includes("Jakarta") || c.name.includes("Kepulauan Riau")
        ? 0.3
        : 1;

  const riceProduction =
    c.riceProduction ??
    Math.round(popM * 160 * agriBoost * (isJawa ? 1.3 : 1));

  const farmland =
    Math.round((c.area / 1000) * (isJawa ? 0.48 : 0.18) * agriBoost * 10) / 10;
  const livestock = Math.round(popM * 90 * agriBoost);
  const fishery = Math.round(
    popM *
      26 *
      (isCoast ? 1.9 : 0.55) *
      (c.name.includes("Maluku") ||
      c.name.includes("Sulawesi Utara") ||
      c.name.includes("Bali") ||
      c.name.includes("Kepulauan Riau")
        ? 1.6
        : 1),
  );

  const motorcycles = Math.round(popM * 410 * (isJawa ? 1.2 : 0.88));
  const cars = Math.round(
    popM * 42 * (c.gdpPerCapita / 65) * (c.name.includes("Jakarta") ? 2.4 : 1),
  );
  const roadLength = Math.round(Math.sqrt(c.area) * 36 + popM * 115);

  const touristArrivals = Math.round(
    popM * 90 * tourismBoost + (c.name === "Bali" ? 6800 : 0),
  );
  const hotels = Math.round(
    10 + popM * 16 * tourismBoost + (c.name === "Bali" ? 480 : 0),
  );
  const attractions = Math.round(
    6 + popM * 5.5 * tourismBoost + (c.name === "Bali" ? 100 : 0),
  );

  const clinicCount = Math.round(c.hospitals * 4.1 + popM * 7.5);
  const schools = Math.round(popM * 275 + c.area * 0.035);
  const universities = Math.max(
    1,
    Math.round(
      popM * 1.7 +
        (c.hdi - 65) * 0.35 +
        (c.name.includes("Jakarta") || c.name.includes("Yogyakarta") ? 20 : 0),
    ),
  );

  const { riceProduction: _r, ...rest } = c;
  const ent = getEntities(c.geoKey);
  const universitiesFinal = ent
    ? entityCount(ent, "universities")
    : universities;
  const hospitalsFinal = ent ? entityCount(ent, "hospitals") : c.hospitals;
  const attractionsFinal = ent
    ? entityCount(ent, "attractions")
    : attractions;
  const hospitalsOut = Math.max(hospitalsFinal, c.hospitals);

  const phase = PHASE_A_BY_GEO[c.geoKey] ?? {
    ump: Math.round(1800 + c.gdpPerCapita * 8 + c.hdi * 12),
    inflation: 2.2,
    gini: Math.min(0.45, Math.max(0.27, 0.28 + c.poverty * 0.004 + (c.gdpPerCapita > 100 ? 0.04 : 0))),
    lifeExpectancy: Math.round((62 + (c.hdi - 60) * 0.55) * 10) / 10,
    apbdPerCapita: Math.round((3 + c.gdpPerCapita * 0.04 + 2000 / Math.max(1, c.population / 1e6)) * 10) / 10,
  };

  return {
    ...rest,
    hospitals: hospitalsOut,
    riceProduction,
    farmland,
    livestock,
    fishery,
    motorcycles,
    cars,
    roadLength,
    touristArrivals,
    hotels,
    attractions: attractionsFinal,
    clinicCount,
    schools,
    universities: universitiesFinal,
    ump: phase.ump,
    inflation: phase.inflation,
    gini: phase.gini,
    lifeExpectancy: phase.lifeExpectancy,
    apbdPerCapita: phase.apbdPerCapita,
  };
}

export const PROVINCES: ProvinceStats[] = CORE.map(expand);

export const PROVINCE_BY_GEO = Object.fromEntries(
  PROVINCES.map((p) => [p.geoKey, p]),
) as Record<string, ProvinceStats>;

export function getMetricValue(p: ProvinceStats, key: MetricKey): number {
  if (key === "density") return p.population / p.area;
  return p[key] as number;
}

export function metricRange(key: MetricKey): { min: number; max: number } {
  const vals = PROVINCES.map((p) => getMetricValue(p, key));
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

export function choroplethColor(t: number, higherIsBetter: boolean): string {
  return mapChoropleth(t, higherIsBetter);
}

export { choroplethLegendGradient } from "@/lib/map-colors";

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

export const REGIONS = [
  "Sumatera",
  "Jawa",
  "Bali & Nusa Tenggara",
  "Kalimantan",
  "Sulawesi",
  "Maluku",
  "Papua",
] as const;

export { PHASE_A_META } from "@/data/phase-a-metrics";
