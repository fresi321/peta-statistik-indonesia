import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  REGENCY_BY_GEO,
  type RegencyUnit,
} from "@/data/admin/regency-index";
import {
  getMetricValue,
  metricRange,
  normalize,
  PROVINCE_BY_GEO,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import {
  MAP_INTERACTION,
  MAP_NO_DATA,
  type PaletteMode,
} from "@/lib/map-colors";
import {
  getHistoryDomain,
  getHistoryValue,
  hasHistory,
  historyMeanForYear,
  type AdminLevel,
} from "@/lib/history-access";
import { classIndexFromT } from "@/lib/map-legend";
import { mapColorForValue } from "@/lib/map-scale";
import {
  prefetchProvinceGeoJson,
  prefetchRegencyGeoJson,
} from "@/lib/prefetch-geo";

export type MapSelectPayload =
  | { level: "province"; geoKey: string; province: ProvinceStats | null }
  | { level: "regency"; geoKey: string; regency: RegencyUnit | null };

export type IndonesiaMapProps = {
  metric: MetricKey;
  selectedKey: string | null;
  legendClass: number | null;
  legendHoverClass?: number | null;
  palette?: PaletteMode;
  historyYear?: number | null;
  adminLevel?: AdminLevel;
  /** When set at regency level, dim units outside this province. */
  parentFilter?: string | null;
  onSelect: (payload: MapSelectPayload | null) => void;
  onHoverProvince: (stats: ProvinceStats | null) => void;
  onHoverRegency?: (unit: RegencyUnit | null) => void;
  onRegencyLoadingChange?: (loading: boolean) => void;
};

const DIM_FILL_OPACITY = 0.14;
const DIM_STROKE = "#cbd5e1";
const OUTSIDE_FILTER_OPACITY = 0.08;

const TILE_OPTS = {
  subdomains: "abcd" as const,
  maxZoom: 19,
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 1,
};

type StyleCtx = {
  metric: MetricKey;
  selectedKey: string | null;
  legendFilter: number | null;
  palette: PaletteMode;
  historyYear: number | null;
  adminLevel: AdminLevel;
  parentFilter: string | null;
};

function featureGeoKey(
  feature: GeoJSON.Feature | undefined,
  level: AdminLevel,
): string {
  if (!feature?.properties) return "";
  const p = feature.properties as Record<string, unknown>;
  if (level === "regency") {
    return String(p.geoKey ?? p.Kabupaten ?? p.shapeName ?? "");
  }
  return String(p.Propinsi ?? "");
}

function featureParent(feature: GeoJSON.Feature | undefined): string {
  const p = feature?.properties as Record<string, unknown> | undefined;
  return String(p?.parentProvinceKey ?? p?.Propinsi ?? "");
}

export function IndonesiaMap({
  metric,
  selectedKey,
  legendClass,
  legendHoverClass = null,
  palette = "default",
  historyYear = null,
  adminLevel = "province",
  parentFilter = null,
  onSelect,
  onHoverProvince,
  onHoverRegency,
  onRegencyLoadingChange,
}: IndonesiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const levelRef = useRef(adminLevel);
  const metricRef = useRef(metric);
  const selectedRef = useRef(selectedKey);
  const legendClassRef = useRef(legendClass);
  const legendHoverClassRef = useRef(legendHoverClass);
  const paletteRef = useRef(palette);
  const historyYearRef = useRef(historyYear);
  const parentFilterRef = useRef(parentFilter);
  const onSelectRef = useRef(onSelect);
  const onHoverProvinceRef = useRef(onHoverProvince);
  const onHoverRegencyRef = useRef(onHoverRegency);

  metricRef.current = metric;
  selectedRef.current = selectedKey;
  legendClassRef.current = legendClass;
  legendHoverClassRef.current = legendHoverClass;
  paletteRef.current = palette;
  historyYearRef.current = historyYear;
  parentFilterRef.current = parentFilter;
  levelRef.current = adminLevel;
  onSelectRef.current = onSelect;
  onHoverProvinceRef.current = onHoverProvince;
  onHoverRegencyRef.current = onHoverRegency;

  // Init basemap once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-2.5, 118],
      zoom: 5,
      minZoom: 4,
      maxZoom: 11,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      fadeAnimation: false,
      zoomAnimation: true,
      markerZoomAnimation: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      {
        ...TILE_OPTS,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      },
    ).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
      {
        ...TILE_OPTS,
        opacity: 0.85,
        pane: "overlayPane",
      },
    ).addTo(map);

    mapRef.current = map;

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            map.invalidateSize({ animate: false });
          })
        : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    requestAnimationFrame(() => map.invalidateSize({ animate: false }));

    return () => {
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Load / swap choropleth layer when admin level changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    (async () => {
      if (adminLevel === "regency") {
        onRegencyLoadingChange?.(true);
      }
      try {
        const geojson =
          adminLevel === "regency"
            ? await prefetchRegencyGeoJson()
            : await prefetchProvinceGeoJson();
        if (cancelled || !mapRef.current) return;

        if (layerRef.current) {
          map.removeLayer(layerRef.current);
          layerRef.current = null;
        }

        const layer = L.geoJSON(geojson, {
          style: (feature) =>
            styleForFeature(feature, {
              metric: metricRef.current,
              selectedKey: selectedRef.current,
              legendFilter: effectiveFilter(
                legendClassRef.current,
                legendHoverClassRef.current,
              ),
              palette: paletteRef.current,
              historyYear: historyYearRef.current,
              adminLevel: levelRef.current,
              parentFilter: parentFilterRef.current,
            }),
          onEachFeature: (feature, featureLayer) => {
            featureLayer.on({
              mouseover: (e) => {
                const target = e.target as L.Path;
                target.setStyle({
                  weight: MAP_INTERACTION.hoverWeight,
                  color: MAP_INTERACTION.hoverStroke,
                  fillOpacity: MAP_INTERACTION.hoverFillOpacity,
                });
                target.bringToFront();
                const key = featureGeoKey(feature, levelRef.current);
                if (levelRef.current === "regency") {
                  onHoverRegencyRef.current?.(REGENCY_BY_GEO[key] ?? null);
                  onHoverProvinceRef.current(null);
                } else {
                  onHoverProvinceRef.current(PROVINCE_BY_GEO[key] ?? null);
                  onHoverRegencyRef.current?.(null);
                }
              },
              mouseout: (e) => {
                const target = e.target as L.Path;
                target.setStyle(
                  styleForFeature(feature, {
                    metric: metricRef.current,
                    selectedKey: selectedRef.current,
                    legendFilter: effectiveFilter(
                      legendClassRef.current,
                      legendHoverClassRef.current,
                    ),
                    palette: paletteRef.current,
                    historyYear: historyYearRef.current,
                    adminLevel: levelRef.current,
                    parentFilter: parentFilterRef.current,
                  }),
                );
                onHoverProvinceRef.current(null);
                onHoverRegencyRef.current?.(null);
              },
              click: () => {
                const key = featureGeoKey(feature, levelRef.current);
                if (levelRef.current === "regency") {
                  onSelectRef.current({
                    level: "regency",
                    geoKey: key,
                    regency: REGENCY_BY_GEO[key] ?? null,
                  });
                } else {
                  onSelectRef.current({
                    level: "province",
                    geoKey: key,
                    province: PROVINCE_BY_GEO[key] ?? null,
                  });
                }
              },
            });

            const key = featureGeoKey(feature, levelRef.current);
            featureLayer.bindTooltip(
              buildMapTooltip(
                key,
                levelRef.current,
                metricRef.current,
                historyYearRef.current,
              ),
              { sticky: true, className: "map-tooltip", opacity: 1 },
            );
          },
        });

        layer.addTo(map);
        layerRef.current = layer;

        fitLayer(map, layer, parentFilterRef.current, adminLevel);
      } catch {
        /* leave basemap */
      } finally {
        if (!cancelled) onRegencyLoadingChange?.(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminLevel, onRegencyLoadingChange]);

  // Restyle on data props
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const filter = effectiveFilter(legendClass, legendHoverClass);
    const ctx: StyleCtx = {
      metric,
      selectedKey,
      legendFilter: filter,
      palette,
      historyYear,
      adminLevel,
      parentFilter,
    };
    layer.eachLayer((fl) => {
      const path = fl as L.Path & { feature?: GeoJSON.Feature };
      const feature = path.feature;
      if (!feature) return;
      path.setStyle(styleForFeature(feature, ctx));
      const key = featureGeoKey(feature, adminLevel);
      path.setTooltipContent(
        buildMapTooltip(key, adminLevel, metric, historyYear),
      );
      if (selectedKey === key) path.bringToFront();
    });
  }, [
    metric,
    selectedKey,
    legendClass,
    legendHoverClass,
    palette,
    historyYear,
    adminLevel,
    parentFilter,
  ]);

  // Fit when parent filter changes (same level)
  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map || adminLevel !== "regency") return;
    fitLayer(map, layer, parentFilter, adminLevel);
  }, [parentFilter, adminLevel]);

  // Focus selection
  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map || !selectedKey) return;
    layer.eachLayer((fl) => {
      const path = fl as L.Polygon & { feature?: GeoJSON.Feature };
      const key = featureGeoKey(path.feature, adminLevel);
      if (key !== selectedKey) return;
      try {
        const b = path.getBounds();
        if (b.isValid()) {
          map.flyToBounds(b, {
            padding: [48, 48],
            maxZoom: adminLevel === "regency" ? 8 : 7,
            duration: 0.55,
          });
        }
      } catch {
        /* ignore */
      }
    });
  }, [selectedKey, adminLevel]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label={
        adminLevel === "regency"
          ? "Peta interaktif kabupaten/kota Indonesia"
          : "Peta interaktif provinsi Indonesia"
      }
    />
  );
}

function fitLayer(
  map: L.Map,
  layer: L.GeoJSON,
  parentFilter: string | null,
  adminLevel: AdminLevel,
) {
  try {
    if (adminLevel === "regency" && parentFilter) {
      const parts: L.LatLngBoundsExpression[] = [];
      layer.eachLayer((fl) => {
        const path = fl as L.Polygon & { feature?: GeoJSON.Feature };
        if (featureParent(path.feature) !== parentFilter) return;
        const b = path.getBounds();
        if (b.isValid()) parts.push(b);
      });
      if (parts.length) {
        const bounds = L.latLngBounds([]);
        for (const p of parts) bounds.extend(p as L.LatLngBounds);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [28, 28], maxZoom: 8 });
          return;
        }
      }
    }
    const b = layer.getBounds();
    if (b.isValid()) {
      map.fitBounds(b, {
        padding: [24, 24],
        maxZoom: adminLevel === "regency" ? 6 : 6,
      });
    }
  } catch {
    /* ignore */
  }
}

function effectiveFilter(
  legendClass: number | null,
  legendHoverClass: number | null | undefined,
): number | null {
  if (legendHoverClass != null) return legendHoverClass;
  return legendClass;
}

function resolveValue(
  geoKey: string,
  metric: MetricKey,
  historyYear: number | null,
  level: AdminLevel,
): number | null {
  if (historyYear != null && hasHistory(metric, level)) {
    return getHistoryValue(geoKey, metric, historyYear, level);
  }
  if (level === "province") {
    const stats = PROVINCE_BY_GEO[geoKey];
    if (!stats) return null;
    return getMetricValue(stats, metric);
  }
  // regency without history for this metric
  return null;
}

function styleForFeature(
  feature: GeoJSON.Feature | undefined,
  ctx: StyleCtx,
): L.PathOptions {
  const key = featureGeoKey(feature, ctx.adminLevel);
  const parent = featureParent(feature);

  if (ctx.adminLevel === "regency" && ctx.parentFilter && parent !== ctx.parentFilter) {
    return {
      fillColor: MAP_NO_DATA.fill,
      color: DIM_STROKE,
      weight: 0.4,
      fillOpacity: OUTSIDE_FILTER_OPACITY,
      className: "province-path",
    };
  }

  const value = resolveValue(
    key,
    ctx.metric,
    ctx.historyYear,
    ctx.adminLevel,
  );
  if (value == null) {
    return {
      fillColor: MAP_NO_DATA.fill,
      color: MAP_NO_DATA.stroke,
      weight: MAP_INTERACTION.defaultWeight,
      fillOpacity: MAP_NO_DATA.fillOpacity,
      className: "province-path",
    };
  }

  const useHistory =
    ctx.historyYear != null && hasHistory(ctx.metric, ctx.adminLevel);
  const domain = useHistory
    ? (getHistoryDomain(ctx.metric, ctx.adminLevel) ?? metricRange(ctx.metric))
    : metricRange(ctx.metric);
  const mid =
    useHistory && ctx.historyYear != null
      ? (historyMeanForYear(ctx.metric, ctx.historyYear, ctx.adminLevel) ??
        undefined)
      : undefined;

  const tSeq = normalize(value, domain.min, domain.max);
  const classIndex = classIndexFromT(tSeq);
  const fillColor = mapColorForValue(value, ctx.metric, ctx.palette, {
    domain,
    mid,
  });
  const isSelected = ctx.selectedKey === key;
  const isDimmed =
    ctx.legendFilter != null &&
    classIndex !== ctx.legendFilter &&
    !isSelected;

  if (isSelected) {
    return {
      fillColor,
      color: MAP_INTERACTION.selectedStroke,
      weight: MAP_INTERACTION.selectedWeight,
      fillOpacity: MAP_INTERACTION.selectedFillOpacity,
      className: "province-path",
    };
  }

  if (isDimmed) {
    return {
      fillColor,
      color: DIM_STROKE,
      weight: MAP_INTERACTION.defaultWeight,
      fillOpacity: DIM_FILL_OPACITY,
      className: "province-path",
    };
  }

  return {
    fillColor,
    color: MAP_INTERACTION.defaultStroke,
    weight: ctx.adminLevel === "regency" ? 0.6 : MAP_INTERACTION.defaultWeight,
    fillOpacity: MAP_INTERACTION.defaultFillOpacity,
    className: "province-path",
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMapTooltip(
  geoKey: string,
  level: AdminLevel,
  metric: MetricKey,
  historyYear: number | null,
): string {
  const mLabel = metric;
  const value = resolveValue(geoKey, metric, historyYear, level);
  const yearBit =
    historyYear != null ? `<div class="map-tooltip-note">Tahun ${historyYear}</div>` : "";

  if (level === "regency") {
    const r = REGENCY_BY_GEO[geoKey];
    const name = r?.name ?? geoKey;
    const parent = r?.provinceName ?? r?.parentProvinceKey ?? "";
    const valStr =
      value == null ? "—" : value.toFixed(1) + (metric === "poverty" ? "%" : "");
    return [
      `<div class="map-tooltip-title">${escapeHtml(name)}</div>`,
      parent
        ? `<div class="map-tooltip-note">${escapeHtml(parent)}</div>`
        : "",
      `<div class="map-tooltip-metric"><span class="map-tooltip-label">${escapeHtml(mLabel)}</span> <strong>${escapeHtml(valStr)}</strong></div>`,
      yearBit,
    ]
      .filter(Boolean)
      .join("");
  }

  const p = PROVINCE_BY_GEO[geoKey];
  const name = p?.name ?? geoKey;
  // Prefer existing rich tooltip path via dynamic import avoided — keep simple
  const valStr =
    value == null
      ? "—"
      : metric === "poverty" || metric === "unemployment" || metric === "inflation"
        ? `${value.toFixed(1)}%`
        : String(value);
  return [
    `<div class="map-tooltip-title">${escapeHtml(name)}</div>`,
    `<div class="map-tooltip-metric"><span class="map-tooltip-label">${escapeHtml(mLabel)}</span> <strong>${escapeHtml(valStr)}</strong></div>`,
    yearBit,
  ]
    .filter(Boolean)
    .join("");
}

export default IndonesiaMap;
