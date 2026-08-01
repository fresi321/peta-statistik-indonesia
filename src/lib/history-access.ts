/**
 * Public accessors for multi-year map history (F0+).
 * UI layers should import only from here, not raw series files.
 */
import {
  getHistorySeries,
  HISTORY_BY_METRIC,
  REGENCY_HISTORY_BY_METRIC,
  type HistoryDomain,
  type HistorySeries,
  type AdminLevel,
} from "@/data/history";
import type { MetricKey } from "@/data/province-stats";

export type { HistoryDomain, HistorySeries, AdminLevel };

export function hasHistory(
  metric: MetricKey,
  level: AdminLevel = "province",
): boolean {
  return getHistorySeries(metric, level) != null;
}

export function listHistoryMetrics(
  level: AdminLevel = "province",
): MetricKey[] {
  const reg =
    level === "regency"
      ? REGENCY_HISTORY_BY_METRIC
      : level === "district"
        ? {}
        : HISTORY_BY_METRIC;
  return Object.keys(reg) as MetricKey[];
}

export function getHistory(
  metric: MetricKey,
  level: AdminLevel = "province",
): HistorySeries | null {
  return getHistorySeries(metric, level);
}

export function getHistoryYears(
  metric: MetricKey,
  level: AdminLevel = "province",
): number[] | null {
  const s = getHistorySeries(metric, level);
  return s ? [...s.years] : null;
}

export function getHistoryLatestYear(
  metric: MetricKey,
  level: AdminLevel = "province",
): number | null {
  const s = getHistorySeries(metric, level);
  if (!s || s.years.length === 0) return null;
  return s.years[s.years.length - 1]!;
}

export function getHistoryDomain(
  metric: MetricKey,
  level: AdminLevel = "province",
): HistoryDomain | null {
  return getHistorySeries(metric, level)?.domain ?? null;
}

export function yearIndex(series: HistorySeries, year: number): number {
  return series.years.indexOf(year);
}

export function getHistoryValue(
  geoKey: string,
  metric: MetricKey,
  year: number,
  level: AdminLevel = "province",
): number | null {
  const s = getHistorySeries(metric, level);
  if (!s) return null;
  const i = yearIndex(s, year);
  if (i < 0) return null;
  const row = s.values[geoKey];
  if (!row) return null;
  const v = row[i];
  return v == null ? null : v;
}

/** Mean of non-null values for one year (diverging midpoint for a frame). */
export function historyMeanForYear(
  metric: MetricKey,
  year: number,
  level: AdminLevel = "province",
): number | null {
  const s = getHistorySeries(metric, level);
  if (!s) return null;
  const i = yearIndex(s, year);
  if (i < 0) return null;
  let sum = 0;
  let n = 0;
  for (const row of Object.values(s.values)) {
    const v = row[i];
    if (v == null || Number.isNaN(v)) continue;
    sum += v;
    n += 1;
  }
  return n === 0 ? null : sum / n;
}

export type HistoryPoint = { year: number; value: number | null };

/** Year/value points for one unit (sparkline / charts). */
export function getHistoryPoints(
  geoKey: string,
  metric: MetricKey,
  level: AdminLevel = "province",
): HistoryPoint[] | null {
  const s = getHistorySeries(metric, level);
  if (!s) return null;
  const row = s.values[geoKey];
  if (!row) return null;
  return s.years.map((year, i) => ({
    year,
    value: row[i] ?? null,
  }));
}

/**
 * Long-format rows for export: one row per (geoKey, year).
 * Only non-null values are included when `skipNull` is true (default).
 */
export function buildHistoryLongRows(
  metric: MetricKey,
  geoKeys?: string[],
  opts?: { skipNull?: boolean; level?: AdminLevel },
): {
  geoKey: string;
  year: number;
  value: number;
}[] {
  const level = opts?.level ?? "province";
  const s = getHistorySeries(metric, level);
  if (!s) return [];
  const skipNull = opts?.skipNull !== false;
  const keys = geoKeys ?? Object.keys(s.values);
  const out: { geoKey: string; year: number; value: number }[] = [];
  for (const geoKey of keys) {
    const row = s.values[geoKey];
    if (!row) continue;
    for (let i = 0; i < s.years.length; i++) {
      const v = row[i];
      if (v == null || Number.isNaN(v)) {
        if (!skipNull) {
          /* skip */
        }
        continue;
      }
      out.push({ geoKey, year: s.years[i]!, value: v });
    }
  }
  return out;
}
