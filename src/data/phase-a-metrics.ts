/**
 * Fase A — UMP, inflasi, Gini, harapan hidup, APBD/kapita.
 * Angka diselaraskan ke pola rilis publik 2024–2025 (BPS / Disnaker / DJPK)
 * untuk visualisasi; verifikasi ke sumber resmi sebelum keputusan formal.
 */

export type PhaseAMetrics = {
  /** UMP/UMK acuan provinsi, ribu Rp / bulan */
  ump: number;
  /** Inflasi yoy (kota/provinsi representatif), % */
  inflation: number;
  /** Koefisien Gini (0–1) */
  gini: number;
  /** Harapan hidup saat lahir, tahun */
  lifeExpectancy: number;
  /** Belanja APBD per kapita (aproksimasi), juta Rp / tahun */
  apbdPerCapita: number;
};

export const PHASE_A_BY_GEO: Record<string, PhaseAMetrics> = {
  "ACEH": {
    "ump": 3646,
    "inflation": 2.1,
    "gini": 0.318,
    "lifeExpectancy": 70.2,
    "apbdPerCapita": 8.4
  },
  "SUMATERA UTARA": {
    "ump": 2993,
    "inflation": 2.4,
    "gini": 0.312,
    "lifeExpectancy": 70.8,
    "apbdPerCapita": 5.1
  },
  "SUMATERA BARAT": {
    "ump": 2989,
    "inflation": 2.2,
    "gini": 0.301,
    "lifeExpectancy": 71.4,
    "apbdPerCapita": 6.2
  },
  "RIAU": {
    "ump": 3392,
    "inflation": 1.9,
    "gini": 0.328,
    "lifeExpectancy": 72.1,
    "apbdPerCapita": 9.8
  },
  "JAMBI": {
    "ump": 3234,
    "inflation": 2,
    "gini": 0.315,
    "lifeExpectancy": 71,
    "apbdPerCapita": 7.1
  },
  "SUMATERA SELATAN": {
    "ump": 3657,
    "inflation": 2.3,
    "gini": 0.338,
    "lifeExpectancy": 70.5,
    "apbdPerCapita": 5.8
  },
  "BENGKULU": {
    "ump": 2661,
    "inflation": 2.5,
    "gini": 0.329,
    "lifeExpectancy": 70.1,
    "apbdPerCapita": 8.9
  },
  "LAMPUNG": {
    "ump": 2885,
    "inflation": 2.6,
    "gini": 0.322,
    "lifeExpectancy": 71.2,
    "apbdPerCapita": 4.6
  },
  "BANGKA BELITUNG": {
    "ump": 3875,
    "inflation": 1.8,
    "gini": 0.275,
    "lifeExpectancy": 71.6,
    "apbdPerCapita": 10.2
  },
  "KEPULAUAN RIAU": {
    "ump": 3525,
    "inflation": 1.7,
    "gini": 0.342,
    "lifeExpectancy": 72.8,
    "apbdPerCapita": 11.5
  },
  "DKI JAKARTA": {
    "ump": 5397,
    "inflation": 1.9,
    "gini": 0.431,
    "lifeExpectancy": 75.5,
    "apbdPerCapita": 14.2
  },
  "JAWA BARAT": {
    "ump": 2186,
    "inflation": 2,
    "gini": 0.403,
    "lifeExpectancy": 73.2,
    "apbdPerCapita": 3.2
  },
  "BANTEN": {
    "ump": 2906,
    "inflation": 1.8,
    "gini": 0.362,
    "lifeExpectancy": 72.4,
    "apbdPerCapita": 4.1
  },
  "JAWA TENGAH": {
    "ump": 2169,
    "inflation": 2.2,
    "gini": 0.368,
    "lifeExpectancy": 74.1,
    "apbdPerCapita": 3
  },
  "DI YOGYAKARTA": {
    "ump": 2325,
    "inflation": 2.1,
    "gini": 0.428,
    "lifeExpectancy": 75.1,
    "apbdPerCapita": 5.4
  },
  "JAWA TIMUR": {
    "ump": 2333,
    "inflation": 2.3,
    "gini": 0.372,
    "lifeExpectancy": 72.6,
    "apbdPerCapita": 3.4
  },
  "BALI": {
    "ump": 2981,
    "inflation": 2,
    "gini": 0.364,
    "lifeExpectancy": 73.8,
    "apbdPerCapita": 6.8
  },
  "NUSA TENGGARA BARAT": {
    "ump": 2607,
    "inflation": 2.7,
    "gini": 0.375,
    "lifeExpectancy": 68.9,
    "apbdPerCapita": 5.2
  },
  "NUSA TENGGARA TIMUR": {
    "ump": 2356,
    "inflation": 2.9,
    "gini": 0.348,
    "lifeExpectancy": 68.2,
    "apbdPerCapita": 6
  },
  "KALIMANTAN BARAT": {
    "ump": 2902,
    "inflation": 2.4,
    "gini": 0.318,
    "lifeExpectancy": 71.3,
    "apbdPerCapita": 6.5
  },
  "KALIMANTAN TENGAH": {
    "ump": 3481,
    "inflation": 2.1,
    "gini": 0.328,
    "lifeExpectancy": 71.8,
    "apbdPerCapita": 10.8
  },
  "KALIMANTAN SELATAN": {
    "ump": 3498,
    "inflation": 2.2,
    "gini": 0.331,
    "lifeExpectancy": 69.8,
    "apbdPerCapita": 7.4
  },
  "KALIMANTAN TIMUR": {
    "ump": 3579,
    "inflation": 1.6,
    "gini": 0.329,
    "lifeExpectancy": 74,
    "apbdPerCapita": 16.5
  },
  "KALIMANTAN UTARA": {
    "ump": 3492,
    "inflation": 1.8,
    "gini": 0.305,
    "lifeExpectancy": 71.5,
    "apbdPerCapita": 22
  },
  "SULAWESI UTARA": {
    "ump": 3741,
    "inflation": 2.5,
    "gini": 0.368,
    "lifeExpectancy": 72.2,
    "apbdPerCapita": 7.6
  },
  "SULAWESI TENGAH": {
    "ump": 2910,
    "inflation": 2.4,
    "gini": 0.319,
    "lifeExpectancy": 69.5,
    "apbdPerCapita": 8.2
  },
  "SULAWESI SELATAN": {
    "ump": 3655,
    "inflation": 2.3,
    "gini": 0.381,
    "lifeExpectancy": 71,
    "apbdPerCapita": 4.8
  },
  "SULAWESI TENGGARA": {
    "ump": 3073,
    "inflation": 2.2,
    "gini": 0.372,
    "lifeExpectancy": 70.4,
    "apbdPerCapita": 7.9
  },
  "GORONTALO": {
    "ump": 3225,
    "inflation": 2.6,
    "gini": 0.408,
    "lifeExpectancy": 69.2,
    "apbdPerCapita": 9.1
  },
  "SULAWESI BARAT": {
    "ump": 3104,
    "inflation": 2.5,
    "gini": 0.355,
    "lifeExpectancy": 68.8,
    "apbdPerCapita": 8.5
  },
  "MALUKU": {
    "ump": 3141,
    "inflation": 2.8,
    "gini": 0.318,
    "lifeExpectancy": 68.5,
    "apbdPerCapita": 11.2
  },
  "MALUKU UTARA": {
    "ump": 3408,
    "inflation": 2.4,
    "gini": 0.298,
    "lifeExpectancy": 69,
    "apbdPerCapita": 12.4
  },
  "PAPUA BARAT": {
    ump: 3580,
    inflation: 2.6,
    gini: 0.378,
    lifeExpectancy: 67.8,
    apbdPerCapita: 17.2,
  },
  "PAPUA BARAT DAYA": {
    ump: 3620,
    inflation: 2.8,
    gini: 0.382,
    lifeExpectancy: 67.0,
    apbdPerCapita: 16.8,
  },
  PAPUA: {
    ump: 4280,
    inflation: 2.9,
    gini: 0.388,
    lifeExpectancy: 66.9,
    apbdPerCapita: 14.5,
  },
  "PAPUA SELATAN": {
    ump: 4100,
    inflation: 3.0,
    gini: 0.375,
    lifeExpectancy: 65.8,
    apbdPerCapita: 13.2,
  },
  "PAPUA TENGAH": {
    ump: 4350,
    inflation: 3.1,
    gini: 0.395,
    lifeExpectancy: 65.2,
    apbdPerCapita: 16.4,
  },
  "PAPUA PEGUNUNGAN": {
    ump: 4020,
    inflation: 3.2,
    gini: 0.402,
    lifeExpectancy: 64.1,
    apbdPerCapita: 12.8,
  },
};

export const PHASE_A_META = {
  umpYear: "2025",
  inflationPeriod: "2024–2025 yoy",
  giniYear: "2024",
  lifeExpectancyYear: "2024",
  apbdYear: "2024 (estimasi per kapita)",
} as const;
