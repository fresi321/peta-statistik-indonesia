import type { MetricKey } from "@/data/province-stats";

/** Administrative resolution of a history series. */
export type AdminLevel = "province" | "regency" | "district";

/**
 * Multi-year values for one metric at one admin level.
 * `values[geoKey][i]` aligns with `years[i]`; null = unavailable that year.
 */
export type HistorySeries = {
  metric: MetricKey;
  level: AdminLevel;
  /** Calendar years ascending, e.g. [2019, …, 2025] */
  years: number[];
  /** Shared legend domain across the full series (nulls ignored). */
  domain: { min: number; max: number };
  /**
   * geoKey (GeoJSON Propinsi / unit key) → parallel array length === years.length
   */
  values: Record<string, (number | null)[]>;
  sourceId: string;
  notes?: string;
};

export type HistoryDomain = HistorySeries["domain"];
