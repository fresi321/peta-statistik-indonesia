import {
  CATEGORIES,
  DATA_SOURCES,
  METRIC_BY_KEY,
  METRICS,
  fullCitationBlock,
  getMetricValue,
  primarySourceForMetric,
  type CategoryKey,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import { getEntities } from "@/data/province-entities";

export type ExportScope = "filtered" | "all";
export type ExportFormat = "csv" | "json";
export type ExportMode = "category" | "full" | "metric";

function escapeCsv(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

export function buildExportRows(
  provinces: ProvinceStats[],
  metricKeys: MetricKey[],
): Record<string, string | number>[] {
  return provinces.map((p, i) => {
    const row: Record<string, string | number> = {
      peringkat: i + 1,
      provinsi: p.name,
      ibu_kota: p.capital,
      wilayah: p.region,
      geo_key: p.geoKey,
    };
    for (const key of metricKeys) {
      const raw = getMetricValue(p, key);
      row[key] =
        typeof raw === "number" && !Number.isInteger(raw)
          ? Math.round(raw * 1000) / 1000
          : raw;
    }
    const ent = getEntities(p.geoKey);
    if (ent) {
      row.perguruan_tinggi_nama = ent.universities.items
        .map((x) => x.name)
        .join("; ");
      row.rumah_sakit_nama = ent.hospitals.items.map((x) => x.name).join("; ");
      row.destinasi_nama = ent.attractions.items.map((x) => x.name).join("; ");
      row.komoditas_nama = ent.commodities.items.map((x) => x.name).join("; ");
    }
    return row;
  });
}

export function toCsv(
  rows: Record<string, string | number>[],
  metricKeys: MetricKey[],
): string {
  if (rows.length === 0) return "";
  const meta = ["peringkat", "provinsi", "ibu_kota", "wilayah", "geo_key"];
  const nameCols = [
    "perguruan_tinggi_nama",
    "rumah_sakit_nama",
    "destinasi_nama",
    "komoditas_nama",
  ];
  const extra = Object.keys(rows[0]).filter(
    (k) => !meta.includes(k) && !nameCols.includes(k),
  );
  const headers = [
    ...meta,
    ...extra,
    ...nameCols.filter((c) => c in rows[0]),
  ];

  const sourceLines = metricKeys.map((k) => {
    const s = primarySourceForMetric(k);
    return `# sumber_${k}: ${s.citation}`;
  });

  const preamble = [
    `# ${DATA_SOURCES.requiredAttribution}`,
    `# diperbarui: ${DATA_SOURCES.updatedAt}`,
    `# ${DATA_SOURCES.disclaimer}`,
    `# kolom *_nama berisi daftar entitas terkurasi per provinsi`,
    ...sourceLines,
  ];

  const lines = [
    ...preamble,
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => headers.map((h) => escapeCsv(r[h] ?? "")).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export function toJson(
  provinces: ProvinceStats[],
  metricKeys: MetricKey[],
  meta: { category?: string; metric?: string; note: string },
): string {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: "Peta Statistik Indonesia",
    dataUpdatedAt: DATA_SOURCES.updatedAt,
    requiredAttribution: DATA_SOURCES.requiredAttribution,
    citationBlock: fullCitationBlock(),
    attribution: DATA_SOURCES.sources.map((s) => ({
      name: s.name,
      shortName: s.shortName,
      url: s.url,
      year: s.year,
      reliability: s.reliability,
      citation: s.citation,
      fields: s.fields,
    })),
    metricSources: metricKeys.map((k) => {
      const s = primarySourceForMetric(k);
      return {
        metric: k,
        label: METRIC_BY_KEY[k].label,
        source: s.shortName,
        citation: s.citation,
        year: s.year,
        reliability: s.reliability,
        url: s.url,
      };
    }),
    note: meta.note,
    category: meta.category ?? null,
    metric: meta.metric ?? null,
    count: provinces.length,
    metrics: metricKeys.map((k) => ({
      key: k,
      label: METRIC_BY_KEY[k].label,
      unit: METRIC_BY_KEY[k].unit,
    })),
    data: provinces.map((p) => {
      const values: Record<string, number> = {};
      for (const key of metricKeys) {
        values[key] = getMetricValue(p, key);
      }
      const ent = getEntities(p.geoKey);
      return {
        name: p.name,
        capital: p.capital,
        region: p.region,
        geoKey: p.geoKey,
        values,
        entities: ent
          ? {
              universities: ent.universities,
              hospitals: ent.hospitals,
              attractions: ent.attractions,
              commodities: ent.commodities,
            }
          : null,
      };
    }),
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportData(opts: {
  provinces: ProvinceStats[];
  mode: ExportMode;
  format: ExportFormat;
  category?: CategoryKey;
  metric?: MetricKey;
}) {
  const { provinces, mode, format, category, metric } = opts;
  if (provinces.length === 0) return { ok: false as const, reason: "empty" };

  let metricKeys: MetricKey[];
  let namePart: string;

  if (mode === "metric" && metric) {
    metricKeys = [metric];
    namePart = slug(METRIC_BY_KEY[metric].short);
  } else if (mode === "category" && category) {
    const cat = CATEGORIES.find((c) => c.key === category)!;
    metricKeys = cat.metrics;
    namePart = slug(cat.short);
  } else {
    metricKeys = METRICS.map((m) => m.key);
    namePart = "semua-indikator";
  }

  const sorted = [...provinces].sort(
    (a, b) =>
      getMetricValue(b, metricKeys[0]) - getMetricValue(a, metricKeys[0]),
  );

  const note = DATA_SOURCES.disclaimer;
  const base = `peta-statistik-${namePart}-${stamp()}`;

  if (format === "csv") {
    const rows = buildExportRows(sorted, metricKeys);
    downloadBlob(toCsv(rows, metricKeys), `${base}.csv`, "text/csv;charset=utf-8");
  } else {
    const json = toJson(sorted, metricKeys, {
      category: category
        ? CATEGORIES.find((c) => c.key === category)?.label
        : undefined,
      metric: metric ? METRIC_BY_KEY[metric].label : undefined,
      note,
    });
    downloadBlob(json, `${base}.json`, "application/json;charset=utf-8");
  }

  return { ok: true as const, count: sorted.length, filename: `${base}.${format}` };
}
