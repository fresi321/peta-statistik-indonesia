/**
 * Map + product color tokens — light chrome, blue→red choropleth.
 *
 * Scale: low = blue, high = red (sequential multi-hue).
 * Magnitude is encoded left→right as blue→red on legends.
 * higherIsBetter only documents interpretation; color always follows value rank.
 */

/** Sequential choropleth: low (blue) → high (red) */
export const CHOROPLETH_STOPS: readonly (readonly [number, number, number])[] =
  [
    [37, 99, 235], // blue-600
    [59, 130, 246], // blue-500
    [125, 180, 220], // soft blue mid
    [251, 191, 120], // warm amber mid
    [249, 115, 80], // orange-red
    [220, 38, 38], // red-600
  ] as const;

/** Map raw value rank t∈[0,1] to RGB. Always low→blue, high→red. */
export function choroplethRgb(
  t: number,
  _higherIsBetter: boolean,
): [number, number, number] {
  const x = Math.max(0, Math.min(1, t));
  const g = Math.pow(x, 0.95);
  const stops = CHOROPLETH_STOPS;
  const n = stops.length - 1;
  const i = Math.min(n - 1, Math.floor(g * n));
  const f = g * n - i;
  const a = stops[i];
  const b = stops[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

export function choroplethColor(t: number, higherIsBetter: boolean): string {
  const [r, g, b] = choroplethRgb(t, higherIsBetter);
  return `rgb(${r},${g},${b})`;
}

/** Legend always left=low (blue) → right=high (red). */
export function choroplethLegendGradient(_higherIsBetter: boolean): string {
  const steps = 6;
  const parts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    parts.push(choroplethColor(t, true));
  }
  return `linear-gradient(90deg, ${parts.join(", ")})`;
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
