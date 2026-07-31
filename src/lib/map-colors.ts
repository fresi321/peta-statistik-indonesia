/**
 * Map + product color tokens.
 *
 * Sequential: low → high (default multi-hue blue→red, or colorblind YlGnBu).
 * Diverging: below midpoint → above (default blue↔red, colorblind PuOr).
 * Magnitude always follows value; higherIsBetter is interpretation only.
 */

export type PaletteMode = "default" | "colorblind";

export type ScaleKind = "sequential" | "diverging";

export const PALETTE_STORAGE_KEY = "psi_palette_mode_v1";

/** Sequential default: low (blue) → high (red) */
const SEQ_DEFAULT: readonly (readonly [number, number, number])[] = [
  [37, 99, 235],
  [59, 130, 246],
  [125, 180, 220],
  [251, 191, 120],
  [249, 115, 80],
  [220, 38, 38],
] as const;

/**
 * Sequential colorblind-safe — ColorBrewer YlGnBu-inspired
 * (safe for deuteranopia / protanopia).
 */
const SEQ_COLORBLIND: readonly (readonly [number, number, number])[] = [
  [255, 255, 217], // pale yellow
  [237, 248, 177],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132], // deep blue
] as const;

/** Diverging default: low blue → mid neutral → high red */
const DIV_DEFAULT: readonly (readonly [number, number, number])[] = [
  [33, 102, 172], // blue
  [103, 169, 207],
  [209, 229, 240],
  [247, 247, 247], // mid
  [253, 219, 199],
  [239, 138, 98],
  [178, 24, 43], // red
] as const;

/**
 * Diverging colorblind-safe — ColorBrewer PuOr-inspired
 * (purple ↔ orange, mid light).
 */
const DIV_COLORBLIND: readonly (readonly [number, number, number])[] = [
  [45, 0, 75], // deep purple
  [84, 39, 136],
  [153, 142, 195],
  [216, 218, 235],
  [247, 247, 247], // mid
  [254, 224, 182],
  [253, 184, 99],
  [224, 130, 20],
  [127, 59, 8], // deep orange
] as const;

function interpolateStops(
  t: number,
  stops: readonly (readonly [number, number, number])[],
): [number, number, number] {
  const x = Math.max(0, Math.min(1, t));
  const n = stops.length - 1;
  const i = Math.min(n - 1, Math.floor(x * n));
  const f = x * n - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

/** t∈[0,1] along the legend axis (low→high or low→mid→high). */
export function choroplethRgb(
  t: number,
  options: {
    kind?: ScaleKind;
    palette?: PaletteMode;
    /** mild gamma for sequential only */
    gamma?: number;
  } = {},
): [number, number, number] {
  const kind = options.kind ?? "sequential";
  const palette = options.palette ?? "default";
  const x = Math.max(0, Math.min(1, t));

  if (kind === "diverging") {
    const stops = palette === "colorblind" ? DIV_COLORBLIND : DIV_DEFAULT;
    return interpolateStops(x, stops);
  }

  const stops = palette === "colorblind" ? SEQ_COLORBLIND : SEQ_DEFAULT;
  const g = Math.pow(x, options.gamma ?? 0.95);
  return interpolateStops(g, stops);
}

export function choroplethColor(
  t: number,
  higherIsBetter: boolean = true,
  options: { kind?: ScaleKind; palette?: PaletteMode } = {},
): string {
  // higherIsBetter reserved for future reverse scales; color follows value rank
  void higherIsBetter;
  const [r, g, b] = choroplethRgb(t, options);
  return `rgb(${r},${g},${b})`;
}

/** CSS gradient for legends along t=0→1. */
export function choroplethLegendGradient(
  _higherIsBetter: boolean = true,
  options: { kind?: ScaleKind; palette?: PaletteMode } = {},
): string {
  const steps = 7;
  const parts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    parts.push(choroplethColor(t, true, options));
  }
  return `linear-gradient(90deg, ${parts.join(", ")})`;
}

export function paletteLabel(mode: PaletteMode): string {
  return mode === "colorblind" ? "Aman buta warna" : "Standar";
}

export const MAP_NO_DATA = {
  fill: "#e2e8f0",
  stroke: "#94a3b8",
  fillOpacity: 0.7,
} as const;

export const MAP_INTERACTION = {
  defaultStroke: "#ffffff",
  defaultWeight: 1,
  defaultFillOpacity: 0.82,
  hoverStroke: "#0f172a",
  hoverWeight: 2.2,
  hoverFillOpacity: 0.92,
  selectedStroke: "#0f172a",
  selectedWeight: 2.6,
  selectedFillOpacity: 0.94,
} as const;

export const CHART_COLORS = {
  grid: "#e2e8f0",
  tick: "#64748b",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e2e8f0",
  tooltipText: "#0f172a",
  barSelf: "#2563eb",
  barPeer: "#cbd5e1",
  cursor: "rgba(15,23,42,0.04)",
} as const;

export const UI_ACCENT = "#2563eb";

/** @deprecated Use choropleth with options; kept for any old imports */
export const CHOROPLETH_STOPS = SEQ_DEFAULT;
