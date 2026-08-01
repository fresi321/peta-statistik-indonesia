import type { MetricKey } from "@/data/province-stats";
import { HDI_HISTORY } from "./hdi";
import { POVERTY_HISTORY } from "./poverty";
import { REGENCY_POVERTY_HISTORY } from "./regency/poverty";
import type { AdminLevel, HistorySeries } from "./types";

export type { AdminLevel, HistoryDomain, HistorySeries } from "./types";
export { HISTORY_YEARS } from "./from-snapshot";
export { buildHistorySeries, computeDomain } from "./build-series";

/** Metrics that ship a multi-year series at province level. */
export const HISTORY_BY_METRIC: Partial<Record<MetricKey, HistorySeries>> = {
  poverty: POVERTY_HISTORY,
  hdi: HDI_HISTORY,
};

/** Metrics that ship a multi-year series at regency (kab/kota) level. */
export const REGENCY_HISTORY_BY_METRIC: Partial<
  Record<MetricKey, HistorySeries>
> = {
  poverty: REGENCY_POVERTY_HISTORY,
};

export function getHistorySeries(
  metric: MetricKey,
  level: AdminLevel = "province",
): HistorySeries | null {
  if (level === "regency") {
    return REGENCY_HISTORY_BY_METRIC[metric] ?? null;
  }
  if (level === "district") return null;
  return HISTORY_BY_METRIC[metric] ?? null;
}
