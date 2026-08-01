/**
 * Multi-year HDI / IPM — province level.
 * Latest year matches ProvinceStats snapshot; earlier years backcast for viz.
 */
import { historyFromSnapshot } from "./from-snapshot";
import type { HistorySeries } from "./types";

export const HDI_HISTORY: HistorySeries = historyFromSnapshot({
  metric: "hdi",
  sourceId: "bps-ipm-history-viz",
  backcast: {
    // IPM generally rose slowly toward present → positive annual change
    annualChange: 0.45,
    jitterFrac: 0.3,
    min: 55,
    max: 87,
    decimals: 2,
  },
  notes:
    "Deret visualisasi multi-tahun IPM provinsi (pola tren BPS). Bukan unduhan WebAPI resmi per periode; verifikasi ke rilis BPS sebelum keputusan formal.",
});
