/**
 * Build province-level history from current PROVINCES snapshot so the latest
 * year always matches getMetricValue(p, metric).
 */
import {
  PROVINCES,
  getMetricValue,
  type MetricKey,
} from "@/data/province-stats";
import {
  buildHistorySeries,
  seriesFromCurrent,
  type BackcastOptions,
} from "./build-series";
import type { HistorySeries } from "./types";

export const HISTORY_YEARS = [
  2019, 2020, 2021, 2022, 2023, 2024, 2025,
] as const;

const PAPUA_SPLIT_KEYS = new Set([
  "PAPUA SELATAN",
  "PAPUA TENGAH",
  "PAPUA PEGUNUNGAN",
  "PAPUA BARAT DAYA",
]);

export type SnapshotHistoryOptions = {
  metric: MetricKey;
  sourceId: string;
  backcast: BackcastOptions;
  notes?: string;
};

/**
 * One series for all 38 province geoKeys.
 * Pre-2023 values for Papua split units are backcast from their current
 * snapshot (proxy for visualization — not official pre-pemekaran series).
 */
export function historyFromSnapshot(
  opts: SnapshotHistoryOptions,
): HistorySeries {
  const years = [...HISTORY_YEARS];
  const n = years.length;
  const values: Record<string, (number | null)[]> = {};

  for (const p of PROVINCES) {
    const current = getMetricValue(p, opts.metric);
    values[p.geoKey] = seriesFromCurrent(
      current,
      n,
      p.geoKey,
      opts.backcast,
    );
  }

  const papuaNote =
    "Unit Papua pasca-2022 (selatan/tengah/pegunungan/barat daya): nilai pra-2023 di-backcast dari snapshot unit saat ini untuk menghindari celah visual — bukan deret resmi pra-pemekaran.";

  return buildHistorySeries({
    metric: opts.metric,
    level: "province",
    years,
    values,
    sourceId: opts.sourceId,
    notes: [opts.notes, papuaNote].filter(Boolean).join(" "),
  });
}

export function isPapuaSplitKey(geoKey: string): boolean {
  return PAPUA_SPLIT_KEYS.has(geoKey);
}
