import type { MetricKey } from "@/data/province-stats";
import type { AdminLevel, HistoryDomain, HistorySeries } from "./types";

/** Min/max over all non-null samples in a values map. */
export function computeDomain(
  values: Record<string, (number | null)[]>,
): HistoryDomain {
  let min = Infinity;
  let max = -Infinity;
  for (const row of Object.values(values)) {
    for (const v of row) {
      if (v == null || Number.isNaN(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 };
  }
  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.05;
    return { min: min - pad, max: max + pad };
  }
  return { min, max };
}

export type BuildHistorySeriesInput = {
  metric: MetricKey;
  level?: AdminLevel;
  years: number[];
  values: Record<string, (number | null)[]>;
  sourceId: string;
  notes?: string;
  /** If omitted, computed from values. */
  domain?: HistoryDomain;
};

/** Validate shape lightly and attach domain. */
export function buildHistorySeries(input: BuildHistorySeriesInput): HistorySeries {
  const { metric, years, values, sourceId, notes } = input;
  const level = input.level ?? "province";
  const n = years.length;
  if (n < 2) {
    throw new Error(`HistorySeries ${metric}: need ≥2 years`);
  }
  for (let i = 1; i < n; i++) {
    if (years[i]! <= years[i - 1]!) {
      throw new Error(`HistorySeries ${metric}: years must be strictly ascending`);
    }
  }
  for (const [key, row] of Object.entries(values)) {
    if (row.length !== n) {
      throw new Error(
        `HistorySeries ${metric}: ${key} has length ${row.length}, expected ${n}`,
      );
    }
  }
  return {
    metric,
    level,
    years: [...years],
    domain: input.domain ?? computeDomain(values),
    values,
    sourceId,
    notes,
  };
}

/** Stable 0..1 seed from string (no Math.random — deterministic builds). */
export function seed01(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export type BackcastOptions = {
  /**
   * Signed change per year toward the present.
   * poverty: negative (falls over time); hdi: positive (rises over time).
   */
  annualChange: number;
  /** Extra ± variation multiplier from geoKey seed (fraction of |annualChange|). */
  jitterFrac?: number;
  min?: number;
  max?: number;
  decimals?: number;
};

/**
 * Build a full series of length `yearCount` ending at `current` (last index).
 * Walks backward: value[i] ≈ value[i+1] - annualChange (± jitter).
 */
export function seriesFromCurrent(
  current: number,
  yearCount: number,
  geoKey: string,
  opts: BackcastOptions,
): number[] {
  const decimals = opts.decimals ?? 2;
  const jitterFrac = opts.jitterFrac ?? 0.25;
  const seed = seed01(geoKey);
  // Per-province annual pace: annualChange * (0.75 .. 1.25) roughly
  const pace =
    opts.annualChange * (1 + (seed - 0.5) * 2 * jitterFrac);
  const out = new Array<number>(yearCount);
  out[yearCount - 1] = roundTo(current, decimals);
  for (let i = yearCount - 2; i >= 0; i--) {
    let v = out[i + 1]! - pace;
    // Tiny year-specific wiggle for non-linear look (still deterministic)
    const wiggle =
      (seed01(`${geoKey}:${i}`) - 0.5) * Math.abs(opts.annualChange) * 0.35;
    v += wiggle;
    if (opts.min != null) v = Math.max(opts.min, v);
    if (opts.max != null) v = Math.min(opts.max, v);
    out[i] = roundTo(v, decimals);
  }
  // Re-assert exact current (no float drift)
  out[yearCount - 1] = roundTo(current, decimals);
  return out;
}
