/**
 * Equal-interval choropleth classes + tooltip/rank helpers.
 */
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

export function classIndexForValue(value: number, metric: MetricKey): number {
  const range = metricRange(metric);
  const t = normalize(value, range.min, range.max);
  return classIndexFromT(t);
}

export function classBounds(metric: MetricKey, index: number): ClassBounds {
  const i = Math.max(0, Math.min(LEGEND_CLASS_COUNT - 1, index));
  const range = metricRange(metric);
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
): string {
  const b = classBounds(metric, index);
  const mid = (b.valueMin + b.valueMax) / 2;
  return mapColorForValue(mid, metric, palette);
}

/** Count provinces whose normalized value falls in class index. */
export function classProvinceCount(metric: MetricKey, index: number): number {
  return PROVINCES.filter(
    (p) => classIndexForValue(getMetricValue(p, metric), metric) === index,
  ).length;
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

/** Leaflet tooltip HTML — values only from our data/formatters. */
export function buildTooltipHtml(
  stats: ProvinceStats,
  metric: MetricKey,
): string {
  const m = METRIC_BY_KEY[metric];
  const value = getMetricValue(stats, metric);
  const { rank, total, higherIsBetter } = provinceRank(stats.geoKey, metric);
  const kind = scaleKindForMetric(metric);
  const mean = metricMean(metric);
  const vsMean =
    kind === "diverging"
      ? value >= mean
        ? `<div class="map-tooltip-note">≥ rata-rata nasional (${escapeHtml(m.format(mean))})</div>`
        : `<div class="map-tooltip-note">&lt; rata-rata nasional (${escapeHtml(m.format(mean))})</div>`
      : "";
  const rankNote = higherIsBetter
    ? ""
    : `<div class="map-tooltip-note">Nilai lebih rendah lebih baik</div>`;
  const unit = m.unit ? ` ${escapeHtml(m.unit)}` : "";
  return [
    `<div class="map-tooltip-title">${escapeHtml(stats.name)}</div>`,
    `<div class="map-tooltip-metric"><span class="map-tooltip-label">${escapeHtml(m.short)}</span> <strong>${escapeHtml(m.format(value))}</strong>${unit}</div>`,
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
): PreviewStats {
  const m = METRIC_BY_KEY[metric];
  const value = getMetricValue(stats, metric);
  const { rank, total, higherIsBetter } = provinceRank(stats.geoKey, metric);
  const kind = scaleKindForMetric(metric);
  let vsMeanLabel: string | null = null;
  if (kind === "diverging") {
    const mean = metricMean(metric);
    vsMeanLabel =
      value >= mean
        ? `≥ rata-rata (${m.format(mean)})`
        : `< rata-rata (${m.format(mean)})`;
  }
  return {
    name: stats.name,
    valueLabel: m.format(value),
    unit: m.unit,
    metricShort: m.short,
    rank,
    total,
    higherIsBetter,
    vsMeanLabel,
  };
}

/** Short text summary for screen readers / live region. */
export function buildMetricSummary(metric: MetricKey): string {
  const m = METRIC_BY_KEY[metric];
  const range = metricRange(metric);
  const kind = scaleKindForMetric(metric);
  const mean = metricMean(metric);
  const vals = PROVINCES.map((p) => getMetricValue(p, metric)).sort(
    (a, b) => a - b,
  );
  const median = vals[Math.floor(vals.length / 2)] ?? mean;
  const base = `Peta choropleth ${m.label} untuk ${PROVINCES.length} provinsi. Rentang ${m.format(range.min)} sampai ${m.format(range.max)}. Median ${m.format(median)}.`;
  if (kind === "diverging") {
    return `${base} Skala diverging: titik tengah rata-rata nasional ${m.format(mean)}. ${m.higherIsBetter ? "Nilai lebih tinggi umumnya lebih baik." : "Nilai lebih rendah umumnya lebih baik."}`;
  }
  return `${base} Skala sequential dari rendah ke tinggi. ${m.higherIsBetter ? "Nilai lebih tinggi umumnya lebih baik." : "Nilai lebih rendah umumnya lebih baik."}`;
}
