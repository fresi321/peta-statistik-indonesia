/**
 * Kab/kota multi-year poverty (%). Visualization series:
 * latest ≈ parent province poverty ± deterministic jitter; earlier years backcast.
 */
import { REGENCIES } from "@/data/admin/regency-index";
import {
  PROVINCE_BY_GEO,
  getMetricValue,
} from "@/data/province-stats";
import {
  buildHistorySeries,
  seriesFromCurrent,
} from "@/data/history/build-series";
import { HISTORY_YEARS } from "@/data/history/from-snapshot";
import type { HistorySeries } from "@/data/history/types";

const years = [...HISTORY_YEARS];
const n = years.length;

const values: Record<string, (number | null)[]> = {};

for (const r of REGENCIES) {
  const parent = PROVINCE_BY_GEO[r.parentProvinceKey];
  const base = parent ? getMetricValue(parent, "poverty") : 10;
  // Deterministic offset from geoKey: roughly ±35% of base, clamp sensible
  let h = 2166136261;
  for (let i = 0; i < r.geoKey.length; i++) {
    h ^= r.geoKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const seed = (h >>> 0) / 4294967296;
  const factor = 0.65 + seed * 0.7; // 0.65 .. 1.35
  const current = Math.round(Math.min(45, Math.max(1.5, base * factor)) * 10) / 10;
  values[r.geoKey] = seriesFromCurrent(current, n, r.geoKey, {
    annualChange: -0.28,
    jitterFrac: 0.4,
    min: 1.2,
    max: 48,
    decimals: 1,
  });
}

export const REGENCY_POVERTY_HISTORY: HistorySeries = buildHistorySeries({
  metric: "poverty",
  level: "regency",
  years,
  values,
  sourceId: "bps-poverty-regency-history-viz",
  notes:
    "Deret visualisasi kemiskinan kab/kota: nilai diturunkan dari snapshot provinsi + variasi deterministik per unit, lalu di-backcast multi-tahun. Geometri dari geoBoundaries ADM2 (simplified). Bukan unduhan BPS WebAPI per kab; verifikasi ke rilis resmi sebelum keputusan formal.",
});
