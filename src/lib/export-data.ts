import {
  CATEGORIES,
  DATA_SOURCES,
  METRIC_BY_KEY,
  METRICS,
  dualCreditLine,
  fullCitationBlock,
  fullMetricCitation,
  getMetricValue,
  primarySourceForMetric,
  type CategoryKey,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import { getEntities } from "@/data/province-entities";
import {
  buildHistoryLongRows,
  getHistory,
  getHistoryValue,
  hasHistory,
} from "@/lib/history-access";

export type ExportScope = "filtered" | "all";
export type ExportFormat = "csv" | "json";
export type ExportMode = "category" | "full" | "metric";
/** snapshot = one year (or current); long = multi-year rows for one metric */
export type HistoryExportShape = "snapshot" | "long";

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

function roundMetric(raw: number): number {
  return typeof raw === "number" && !Number.isInteger(raw)
    ? Math.round(raw * 1000) / 1000
    : raw;
}

function valueForExport(
  p: ProvinceStats,
  key: MetricKey,
  historyYear?: number | null,
): number {
  if (historyYear != null && hasHistory(key)) {
    const v = getHistoryValue(p.geoKey, key, historyYear);
    if (v != null) return roundMetric(v);
  }
  return roundMetric(getMetricValue(p, key));
}

export function buildExportRows(
  provinces: ProvinceStats[],
  metricKeys: MetricKey[],
  historyYear?: number | null,
): Record<string, string | number>[] {
  return provinces.map((p, i) => {
    const row: Record<string, string | number> = {
      peringkat: i + 1,
      provinsi: p.name,
      ibu_kota: p.capital,
      wilayah: p.region,
      geo_key: p.geoKey,
    };
    if (historyYear != null) {
      row.tahun = historyYear;
    }
    for (const key of metricKeys) {
      row[key] = valueForExport(p, key, historyYear);
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

/** Long-format multi-year export for one metric. */
export function buildHistoryLongExportRows(
  provinces: ProvinceStats[],
  metric: MetricKey,
): Record<string, string | number>[] {
  const byKey = Object.fromEntries(provinces.map((p) => [p.geoKey, p]));
  const long = buildHistoryLongRows(
    metric,
    provinces.map((p) => p.geoKey),
  );
  return long.map((r, i) => {
    const p = byKey[r.geoKey];
    return {
      peringkat: i + 1,
      provinsi: p?.name ?? r.geoKey,
      ibu_kota: p?.capital ?? "",
      wilayah: p?.region ?? "",
      geo_key: r.geoKey,
      tahun: r.year,
      [metric]: roundMetric(r.value),
      metrik: metric,
      metrik_label: METRIC_BY_KEY[metric].label,
    };
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
    return [
      `# dual_credit_${k}: ${dualCreditLine(k)}`,
      `# sumber_${k}: ${s.citation}`,
      `# pemrosesan_${k}: ${s.processingNote}`,
      `# cadence_${k}: ${s.updateCadence}`,
    ].join("\n");
  });

  const preamble = [
    `# ${DATA_SOURCES.requiredAttribution}`,
    `# ${DATA_SOURCES.dualCreditNote}`,
    `# processor: ${DATA_SOURCES.processorName}`,
    `# license: ${DATA_SOURCES.licenseName} ${DATA_SOURCES.licenseUrl}`,
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
  meta: {
    category?: string;
    metric?: string;
    note: string;
    historyYear?: number | null;
    historyShape?: HistoryExportShape;
    historyMetricKey?: MetricKey | null;
  },
): string {
  const historyYear = meta.historyYear ?? null;
  const historyShape = meta.historyShape ?? "snapshot";
  const historyMetricKey = meta.historyMetricKey ?? null;

  const payload = {
    exportedAt: new Date().toISOString(),
    source: DATA_SOURCES.processorName,
    dataUpdatedAt: DATA_SOURCES.updatedAt,
    requiredAttribution: DATA_SOURCES.requiredAttribution,
    dualCreditNote: DATA_SOURCES.dualCreditNote,
    license: {
      name: DATA_SOURCES.licenseName,
      url: DATA_SOURCES.licenseUrl,
    },
    citationBlock: fullCitationBlock(),
    attribution: DATA_SOURCES.sources.map((s) => ({
      name: s.name,
      shortName: s.shortName,
      url: s.url,
      year: s.year,
      reliability: s.reliability,
      citation: s.citation,
      processingNote: s.processingNote,
      updateCadence: s.updateCadence,
      lastIngestedAt: s.lastIngestedAt,
      fields: s.fields,
    })),
    metricSources: metricKeys.map((k) => {
      const s = primarySourceForMetric(k);
      return {
        metric: k,
        label: METRIC_BY_KEY[k].label,
        source: s.shortName,
        citation: s.citation,
        dualCredit: dualCreditLine(k),
        fullCitation: fullMetricCitation(k),
        year: s.year,
        reliability: s.reliability,
        processingNote: s.processingNote,
        updateCadence: s.updateCadence,
        url: s.url,
      };
    }),
    note: meta.note,
    category: meta.category ?? null,
    metric: meta.metric ?? null,
    historyYear,
    historyShape,
    historyYears:
      historyShape === "long" && historyMetricKey
        ? (getHistory(historyMetricKey)?.years ?? null)
        : null,
    count: provinces.length,
    metrics: metricKeys.map((k) => ({
      key: k,
      label: METRIC_BY_KEY[k].label,
      unit: METRIC_BY_KEY[k].unit,
    })),
    data:
      historyShape === "long" && historyMetricKey
        ? buildHistoryLongExportRows(provinces, historyMetricKey)
        : provinces.map((p) => {
            const values: Record<string, number> = {};
            for (const key of metricKeys) {
              values[key] = valueForExport(p, key, historyYear);
            }
            const ent = getEntities(p.geoKey);
            return {
              name: p.name,
              capital: p.capital,
              region: p.region,
              geoKey: p.geoKey,
              ...(historyYear != null ? { year: historyYear } : {}),
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
  if (historyShape === "long" && Array.isArray(payload.data)) {
    (payload as { count: number }).count = payload.data.length;
  }
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
  /** Active history year for snapshot export (metric mode). */
  historyYear?: number | null;
  /** long = multi-year rows for the active metric when it has history. */
  historyShape?: HistoryExportShape;
}) {
  const {
    provinces,
    mode,
    format,
    category,
    metric,
    historyYear = null,
    historyShape = "snapshot",
  } = opts;
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

  const useLong =
    historyShape === "long" &&
    mode === "metric" &&
    metric != null &&
    hasHistory(metric);

  const sortKey = metricKeys[0]!;
  const sorted = [...provinces].sort(
    (a, b) =>
      valueForExport(b, sortKey, useLong ? null : historyYear) -
      valueForExport(a, sortKey, useLong ? null : historyYear),
  );

  const note = DATA_SOURCES.disclaimer;
  const yearPart =
    useLong && metric
      ? `history-${slug(METRIC_BY_KEY[metric].short)}`
      : historyYear != null
        ? String(historyYear)
        : null;
  const base = yearPart
    ? `peta-statistik-${namePart}-${yearPart}-${stamp()}`
    : `peta-statistik-${namePart}-${stamp()}`;

  if (format === "csv") {
    const rows = useLong && metric
      ? buildHistoryLongExportRows(sorted, metric)
      : buildExportRows(sorted, metricKeys, historyYear);
    const keysForCsv = useLong && metric ? [metric] : metricKeys;
    downloadBlob(
      toCsv(rows, keysForCsv),
      `${base}.csv`,
      "text/csv;charset=utf-8",
    );
    return {
      ok: true as const,
      count: useLong ? rows.length : sorted.length,
      filename: `${base}.csv`,
    };
  }

  const json = toJson(sorted, metricKeys, {
    category: category
      ? CATEGORIES.find((c) => c.key === category)?.label
      : undefined,
    metric: metric ? METRIC_BY_KEY[metric].label : undefined,
    note,
    historyYear: useLong ? null : historyYear,
    historyShape: useLong ? "long" : "snapshot",
    historyMetricKey: useLong && metric ? metric : null,
  });
  downloadBlob(json, `${base}.json`, "application/json;charset=utf-8");
  const count = useLong && metric
    ? buildHistoryLongExportRows(sorted, metric).length
    : sorted.length;
  return { ok: true as const, count, filename: `${base}.json` };
}
