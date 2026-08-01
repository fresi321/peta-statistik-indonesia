/**
 * Multi-year poverty rate (% penduduk miskin) — province level.
 * Latest year matches ProvinceStats snapshot; earlier years backcast for viz.
 */
import { historyFromSnapshot } from "./from-snapshot";
import type { HistorySeries } from "./types";

export const POVERTY_HISTORY: HistorySeries = historyFromSnapshot({
  metric: "poverty",
  sourceId: "bps-poverty-history-viz",
  backcast: {
    // Poverty generally declined slowly toward present → negative annual change
    annualChange: -0.28,
    jitterFrac: 0.35,
    min: 1.5,
    max: 42,
    decimals: 1,
  },
  notes:
    "Deret visualisasi multi-tahun tingkat kemiskinan provinsi (pola tren BPS). Bukan unduhan WebAPI resmi per periode; verifikasi ke rilis BPS sebelum keputusan formal.",
});
