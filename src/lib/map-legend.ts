/**
 * Equal-interval choropleth classes + tooltip/rank helpers.
 */
import { REGENCIES } from "@/data/admin/regency-index";
import {
  METRIC_BY_KEY,
  PROVINCES,
  getMetricValue,
  metricRange,
  normalize,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import type { PaletteMode } from "@/lib/map-colors";
import {
  getHistoryValue,
  hasHistory,
  historyMeanForYear,
} from "@/lib/history-access";
import {
  mapColorForValue,
  metricMean,
  scaleKindForMetric,
} from "@/lib/map-scale";

export const LEGEND_CLASS_COUNT = 5;

export type ClassBounds = {
  index: number;
  t0: number;
  t1: number;
  valueMin: number;
  valueMax: number;
};

/** Equal-interval class on raw min–max (same for sequential & diverging). */
export function classIndexFromT(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  if (x >= 1) return LEGEND_CLASS_COUNT - 1;
  return Math.min(LEGEND_CLASS_COUNT - 1, Math.floor(x * LEGEND_CLASS_COUNT));
}

export type LegendDomain = { min: number; max: number };

export function classIndexForValue(
  value: number,
  metric: MetricKey,
  domain?: LegendDomain,
): number {
  const range = domain ?? metricRange(metric);
  const t = normalize(value, range.min, range.max);
  return classIndexFromT(t);
}

export function classBounds(
  metric: MetricKey,
  index: number,
  domain?: LegendDomain,
): ClassBounds {
  const i = Math.max(0, Math.min(LEGEND_CLASS_COUNT - 1, index));
  const range = domain ?? metricRange(metric);
  const t0 = i / LEGEND_CLASS_COUNT;
  const t1 = (i + 1) / LEGEND_CLASS_COUNT;
  const span = range.max - range.min;
  return {
    index: i,
    t0,
    t1,
    valueMin: range.min + span * t0,
    valueMax: range.min + span * t1,
  };
}

export function classColor(
  index: number,
  metric: MetricKey,
  palette: PaletteMode = "default",
  domain?: LegendDomain,
): string {
  const b = classBounds(metric, index, domain);
  const mid = (b.valueMin + b.valueMax) / 2;
  return mapColorForValue(mid, metric, palette, domain ? { domain } : undefined);
}

/** Count units whose normalized value falls in class index. */
export function classProvinceCount(
  metric: MetricKey,
  index: number,
  domain?: LegendDomain,
  historyYear?: number | null,
  opts?: {
    level?: "province" | "regency";
    parentFilter?: string | null;
  },
): number {
  const level = opts?.level ?? "province";
  if (level === "regency") {
    let list = REGENCIES;
    if (opts?.parentFilter) {
      list = list.filter((r) => r.parentProvinceKey === opts.parentFilter);
    }
    return list.filter((r) => {
      if (historyYear == null) return false;
      const value = getHistoryValue(
        r.geoKey,
        metric,
        historyYear,
        "regency",
      );
      if (value == null) return false;
      return classIndexForValue(value, metric, domain) === index;
    }).length;
  }
  return PROVINCES.filter((p) => {
    const value = resolveMetricValue(p, metric, historyYear);
    if (value == null) return false;
    return classIndexForValue(value, metric, domain) === index;
  }).length;
}

/** Snapshot or history-frame value for a province. */
export function resolveMetricValue(
  stats: ProvinceStats,
  metric: MetricKey,
  historyYear?: number | null,
): number | null {
  if (historyYear != null && hasHistory(metric)) {
    return getHistoryValue(stats.geoKey, metric, historyYear);
  }
  return getMetricValue(stats, metric);
}

export type ProvinceRank = {
  rank: number;
  total: number;
  higherIsBetter: boolean;
};

/**
 * Rank 1 = highest raw value among all provinces.
 */
export function provinceRank(
  geoKey: string,
  metric: MetricKey,
): ProvinceRank {
  const m = METRIC_BY_KEY[metric];
  const sorted = [...PROVINCES].sort(
    (a, b) => getMetricValue(b, metric) - getMetricValue(a, metric),
  );
  const idx = sorted.findIndex((p) => p.geoKey === geoKey);
  return {
    rank: idx >= 0 ? idx + 1 : sorted.length,
    total: sorted.length,
    higherIsBetter: m.higherIsBetter,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Rank for a history year (or snapshot when year is null).
 * Rank 1 = highest raw value among provinces with non-null values.
 */
export function provinceRankAtYear(
  geoKey: string,
  metric: MetricKey,
  historyYear?: number | null,
): ProvinceRank {
  const m = METRIC_BY_KEY[metric];
  const rows = PROVINCES.map((p) => ({
    geoKey: p.geoKey,
    value: resolveMetricValue(p, metric, historyYear),
  })).filter((r): r is { geoKey: string; value: number } => r.value != null);
  rows.sort((a, b) => b.value - a.value);
  const idx = rows.findIndex((r) => r.geoKey === geoKey);
  return {
    rank: idx >= 0 ? idx + 1 : rows.length,
    total: rows.length,
    higherIsBetter: m.higherIsBetter,
  };
}

/** Leaflet tooltip HTML — values only from our data/formatters. */
export function buildTooltipHtml(
  stats: ProvinceStats,
  metric: MetricKey,
  historyYear?: number | null,
): string {
  const m = METRIC_BY_KEY[metric];
  const value = resolveMetricValue(stats, metric, historyYear);
  if (value == null) {
    return [
      `<div class="map-tooltip-title">${escapeHtml(stats.name)}</div>`,
      `<div class="map-tooltip-metric"><span class="map-tooltip-label">${escapeHtml(m.short)}</span> <strong>—</strong></div>`,
      historyYear != null
        ? `<div class="map-tooltip-note">Tidak tersedia (${historyYear})</div>`
        : "",
    ]
      .filter(Boolean)
      .join("");
  }
  const { rank, total, higherIsBetter } = provinceRankAtYear(
    stats.geoKey,
    metric,
    historyYear,
  );
  const kind = scaleKindForMetric(metric);
  const mean =
    historyYear != null && hasHistory(metric)
      ? (historyMeanForYear(metric, historyYear) ?? metricMean(metric))
      : metricMean(metric);
  const vsMean =
    kind === "diverging"
      ? value >= mean
        ? `<div class="map-tooltip-note">≥ rata-rata nasional (${escapeHtml(m.format(mean))})</div>`
        : `<div class="map-tooltip-note">&lt; rata-rata nasional (${escapeHtml(m.format(mean))})</div>`
      : "";
  const rankNote = higherIsBetter
    ? ""
    : `<div class="map-tooltip-note">Nilai lebih rendah lebih baik</div>`;
  const yearNote =
    historyYear != null
      ? `<div class="map-tooltip-note">Tahun ${historyYear}</div>`
      : "";
  const unit = m.unit ? ` ${escapeHtml(m.unit)}` : "";
  return [
    `<div class="map-tooltip-title">${escapeHtml(stats.name)}</div>`,
    `<div class="map-tooltip-metric"><span class="map-tooltip-label">${escapeHtml(m.short)}</span> <strong>${escapeHtml(m.format(value))}</strong>${unit}</div>`,
    yearNote,
    `<div class="map-tooltip-rank">Peringkat ${rank}/${total} (nilai tertinggi = #1)</div>`,
    vsMean,
    rankNote,
  ]
    .filter(Boolean)
    .join("");
}

export type PreviewStats = {
  name: string;
  valueLabel: string;
  unit: string;
  metricShort: string;
  rank: number;
  total: number;
  higherIsBetter: boolean;
  vsMeanLabel: string | null;
};

export function buildPreviewStats(
  stats: ProvinceStats,
  metric: MetricKey,
  historyYear?: number | null,
): PreviewStats {
  const m = METRIC_BY_KEY[metric];
  const value = resolveMetricValue(stats, metric, historyYear);
  const { rank, total, higherIsBetter } = provinceRankAtYear(
    stats.geoKey,
    metric,
    historyYear,
  );
  const kind = scaleKindForMetric(metric);
  let vsMeanLabel: string | null = null;
  if (kind === "diverging" && value != null) {
    const mean =
      historyYear != null && hasHistory(metric)
        ? (historyMeanForYear(metric, historyYear) ?? metricMean(metric))
        : metricMean(metric);
    vsMeanLabel =
      value >= mean
        ? `≥ rata-rata (${m.format(mean)})`
        : `< rata-rata (${m.format(mean)})`;
  }
  return {
    name: stats.name,
    valueLabel: value == null ? "—" : m.format(value),
    unit: m.unit,
    metricShort:
      historyYear != null ? `${m.short} · ${historyYear}` : m.short,
    rank,
    total,
    higherIsBetter,
    vsMeanLabel,
  };
}

/** Short text summary for screen readers / live region. */
export function buildMetricSummary(
  metric: MetricKey,
  historyYear?: number | null,
  domain?: LegendDomain | null,
): string {
  const m = METRIC_BY_KEY[metric];
  const range = domain ?? metricRange(metric);
  const kind = scaleKindForMetric(metric);
  const mean =
    historyYear != null && hasHistory(metric)
      ? (historyMeanForYear(metric, historyYear) ?? metricMean(metric))
      : metricMean(metric);
  const vals = PROVINCES.map((p) =>
    resolveMetricValue(p, metric, historyYear),
  )
    .filter((v): v is number => v != null)
    .sort((a, b) => a - b);
  const median = vals[Math.floor(vals.length / 2)] ?? mean;
  const yearBit =
    historyYear != null ? ` Tahun frame ${historyYear}.` : "";
  const base = `Peta choropleth ${m.label} untuk ${PROVINCES.length} provinsi.${yearBit} Rentang ${m.format(range.min)} sampai ${m.format(range.max)}. Median ${m.format(median)}.`;
  if (kind === "diverging") {
    return `${base} Skala diverging: titik tengah rata-rata nasional ${m.format(mean)}. ${m.higherIsBetter ? "Nilai lebih tinggi umumnya lebih baik." : "Nilai lebih rendah umumnya lebih baik."}`;
  }
  return `${base} Skala sequential dari rendah ke tinggi. ${m.higherIsBetter ? "Nilai lebih tinggi umumnya lebih baik." : "Nilai lebih rendah umumnya lebih baik."}`;
}
