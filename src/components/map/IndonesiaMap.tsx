import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  buildTooltipHtml,
  classIndexFromT,
} from "@/lib/map-legend";
import { mapColorForValue } from "@/lib/map-scale";
import { prefetchProvinceGeoJson } from "@/lib/prefetch-geo";

export type IndonesiaMapProps = {
  metric: MetricKey;
  selectedKey: string | null;
  legendClass: number | null;
  legendHoverClass?: number | null;
  palette?: PaletteMode;
  onSelect: (geoKey: string | null, stats: ProvinceStats | null) => void;
  onHover: (stats: ProvinceStats | null) => void;
};

const DIM_FILL_OPACITY = 0.14;
const DIM_STROKE = "#cbd5e1";

const TILE_OPTS = {
  subdomains: "abcd" as const,
  maxZoom: 19,
  /** Load tiles when pan ends — cheaper on mobile / weak networks */
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 1,
};

export function IndonesiaMap({
  metric,
  selectedKey,
  legendClass,
  legendHoverClass = null,
  palette = "default",
  onSelect,
  onHover,
}: IndonesiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const metricRef = useRef(metric);
  const selectedRef = useRef(selectedKey);
  const legendClassRef = useRef(legendClass);
  const legendHoverClassRef = useRef(legendHoverClass);
  const paletteRef = useRef(palette);
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);

  metricRef.current = metric;
  selectedRef.current = selectedKey;
  legendClassRef.current = legendClass;
  legendHoverClassRef.current = legendHoverClass;
  paletteRef.current = palette;
  onSelectRef.current = onSelect;
  onHoverRef.current = onHover;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-2.5, 118],
      zoom: 5,
      minZoom: 4,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: true,
      // Canvas paths: fewer SVG DOM nodes (research + Leaflet preferCanvas)
      preferCanvas: true,
      // Slightly snappier feel; tiles still updateWhenIdle
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

    let cancelled = false;

    (async () => {
      try {
        const geojson = await prefetchProvinceGeoJson();
        if (cancelled || !mapRef.current) return;

        const layer = L.geoJSON(geojson, {
          style: (feature) =>
            styleForFeature(
              feature,
              metricRef.current,
              selectedRef.current,
              effectiveFilter(
                legendClassRef.current,
                legendHoverClassRef.current,
              ),
              paletteRef.current,
            ),
          onEachFeature: (feature, featureLayer) => {
            const key = String(feature.properties?.Propinsi ?? "");
            const stats = PROVINCE_BY_GEO[key] ?? null;

            featureLayer.on({
              mouseover: (e) => {
                const target = e.target as L.Path;
                target.setStyle({
                  weight: MAP_INTERACTION.hoverWeight,
                  color: MAP_INTERACTION.hoverStroke,
                  fillOpacity: MAP_INTERACTION.hoverFillOpacity,
                });
                target.bringToFront();
                onHoverRef.current(stats);
              },
              mouseout: (e) => {
                const target = e.target as L.Path;
                const style = styleForFeature(
                  feature,
                  metricRef.current,
                  selectedRef.current,
                  effectiveFilter(
                    legendClassRef.current,
                    legendHoverClassRef.current,
                  ),
                  paletteRef.current,
                );
                target.setStyle(style);
                onHoverRef.current(null);
              },
              click: () => {
                onSelectRef.current(key, stats);
              },
            });

            if (stats) {
              featureLayer.bindTooltip(
                buildTooltipHtml(stats, metricRef.current),
                { sticky: true, className: "map-tooltip", opacity: 1 },
              );
            }
          },
        });

        layer.addTo(map);
        layerRef.current = layer;

        try {
          const b = layer.getBounds();
          if (b.isValid()) {
            map.fitBounds(b, { padding: [24, 24], maxZoom: 6 });
          }
        } catch {
          /* ignore */
        }
      } catch {
        /* fetch failed — leave basemap only */
      }
    })();

    // Fix layout if container size was 0 at init (flex shells)
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            map.invalidateSize({ animate: false });
          })
        : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    // one-shot after paint
    requestAnimationFrame(() => map.invalidateSize({ animate: false }));

    return () => {
      cancelled = true;
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const filter = effectiveFilter(legendClass, legendHoverClass);
    layer.eachLayer((fl) => {
      const path = fl as L.Path & { feature?: GeoJSON.Feature };
      const feature = path.feature;
      if (!feature) return;
      path.setStyle(
        styleForFeature(feature, metric, selectedKey, filter, palette),
      );
      const key = String(feature.properties?.Propinsi ?? "");
      const stats = PROVINCE_BY_GEO[key];
      if (stats) {
        path.setTooltipContent(buildTooltipHtml(stats, metric));
      }
      if (selectedKey === key) {
        path.bringToFront();
      }
    });
  }, [metric, selectedKey, legendClass, legendHoverClass, palette]);

  // Smooth focus when selection changes (not on metric/palette restyle)
  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map || !selectedKey) return;
    layer.eachLayer((fl) => {
      const path = fl as L.Polygon & { feature?: GeoJSON.Feature };
      const key = String(path.feature?.properties?.Propinsi ?? "");
      if (key !== selectedKey) return;
      try {
        const b = path.getBounds();
        if (b.isValid()) {
          map.flyToBounds(b, {
            padding: [48, 48],
            maxZoom: 7,
            duration: 0.55,
          });
        }
      } catch {
        /* ignore */
      }
    });
  }, [selectedKey]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label="Peta interaktif provinsi Indonesia"
    />
  );
}

function effectiveFilter(
  legendClass: number | null,
  legendHoverClass: number | null | undefined,
): number | null {
  if (legendHoverClass != null) return legendHoverClass;
  return legendClass;
}

function styleForFeature(
  feature: GeoJSON.Feature | undefined,
  metric: MetricKey,
  selectedKey: string | null,
  legendFilter: number | null,
  palette: PaletteMode,
): L.PathOptions {
  const key = String(feature?.properties?.Propinsi ?? "");
  const stats = PROVINCE_BY_GEO[key];
  if (!stats) {
    return {
      fillColor: MAP_NO_DATA.fill,
      color: MAP_NO_DATA.stroke,
      weight: MAP_INTERACTION.defaultWeight,
      fillOpacity: MAP_NO_DATA.fillOpacity,
    };
  }

  const value = getMetricValue(stats, metric);
  const range = metricRange(metric);
  const tSeq = normalize(value, range.min, range.max);
  const classIndex = classIndexFromT(tSeq);
  const fillColor = mapColorForValue(value, metric, palette);
  const isSelected = selectedKey === key;
  const isDimmed =
    legendFilter != null && classIndex !== legendFilter && !isSelected;

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
    weight: MAP_INTERACTION.defaultWeight,
    fillOpacity: MAP_INTERACTION.defaultFillOpacity,
    className: "province-path",
  };
}

export default IndonesiaMap;
