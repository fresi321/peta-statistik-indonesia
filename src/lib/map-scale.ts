/**
 * Metric → color scale mapping (sequential vs diverging around national mean).
 * Keeps map-colors pure (no data imports) and avoids cycles with province-stats.
 */
import {
  METRIC_BY_KEY,
  PROVINCES,
  getMetricValue,
  metricRange,
  normalize,
  type MetricKey,
} from "@/data/province-stats";
import {
  choroplethColor,
  type PaletteMode,
  type ScaleKind,
} from "@/lib/map-colors";

/**
 * Rate / inequality metrics: diverging around national mean highlights
 * above vs below average. Absolute levels stay sequential.
 */
const DIVERGING_METRICS = new Set<MetricKey>([
  "inflation",
  "unemployment",
  "poverty",
  "gini",
  "growth",
  "density",
  "stunting",
  "voterTurnout",
]);

export function scaleKindForMetric(metric: MetricKey): ScaleKind {
  return DIVERGING_METRICS.has(metric) ? "diverging" : "sequential";
}

/** Arithmetic mean across 34 provinces (diverging midpoint). */
export function metricMean(metric: MetricKey): number {
  const vals = PROVINCES.map((p) => getMetricValue(p, metric));
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/**
 * Map a raw value to legend position t∈[0,1].
 * Sequential: min→max. Diverging: min→mean→max with mean at 0.5.
 */
export function valueToColorT(value: number, metric: MetricKey): number {
  const kind = scaleKindForMetric(metric);
  const range = metricRange(metric);

  if (kind === "sequential") {
    return normalize(value, range.min, range.max);
  }

  const mid = metricMean(metric);
  if (value <= mid) {
    const span = mid - range.min;
    if (span <= 0) return 0.5;
    return 0.5 * ((value - range.min) / span);
  }
  const span = range.max - mid;
  if (span <= 0) return 0.5;
  return 0.5 + 0.5 * ((value - mid) / span);
}

export function mapColorForValue(
  value: number,
  metric: MetricKey,
  palette: PaletteMode = "default",
): string {
  const m = METRIC_BY_KEY[metric];
  const t = valueToColorT(value, metric);
  return choroplethColor(t, m.higherIsBetter, {
    kind: scaleKindForMetric(metric),
    palette,
  });
}

export function mapColorOptions(metric: MetricKey, palette: PaletteMode) {
  return {
    kind: scaleKindForMetric(metric),
    palette,
  } as const;
}

export function scaleCaption(metric: MetricKey): string {
  if (scaleKindForMetric(metric) === "diverging") {
    return "Diverging: biru/ungu = di bawah rata-rata · oranye/merah = di atas";
  }
  return "Sequential: kiri rendah · kanan tinggi";
}
